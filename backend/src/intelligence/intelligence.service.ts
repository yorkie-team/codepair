import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BufferMemory } from "langchain/memory";
import { Feature } from "./types/feature.type";
import { githubIssuePromptTemplate } from "./prompt/github-issue";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { githubPrPromptTemplate } from "./prompt/github-pr";
import { generateRandomKey } from "src/utils/functions/random-string";
import { PrismaService } from "src/db/prisma.service";
import { RunFeatureDto } from "./dto/run-feature.dto";
import { RunFollowUpDto } from "./dto/run-followup.dto";
import { followUpPromptTemplate } from "./prompt/followup";
import { documentWritingPromptTemplate } from "./prompt/document";

@Injectable()
export class IntelligenceService {
	constructor(
		@Inject("ChatModel") private chatModel: BaseChatModel,
		private prismaService: PrismaService
	) {}

	private selectPromptTemplate(feature: Feature) {
		const promptTemplates = {
			[Feature.GITHUB_ISSUE]: githubIssuePromptTemplate,
			[Feature.GITHUB_PR]: githubPrPromptTemplate,
			[Feature.DOCUMENT_WRITING]: documentWritingPromptTemplate,
		};
		const selectedPrompt = promptTemplates[feature];

		if (!selectedPrompt) throw new NotFoundException("Feature not found");

		return selectedPrompt;
	}

	async runFeature(
		userId: string,
		feature: Feature,
		runFeatureDto: RunFeatureDto,
		handleChunk: (token: string) => void
	) {
		const promptTemplate = this.selectPromptTemplate(feature);
		const prompt = await promptTemplate.format({
			content: runFeatureDto.content,
		});
		const memoryKey = generateRandomKey();
		const stream = await this.chatModel.pipe(new StringOutputParser()).stream(prompt, {
			tags: [
				feature,
				`user_id: ${userId}`,
				`document_id: ${runFeatureDto.documentId}`,
				`memory_key: ${memoryKey}`,
			],
		});

		let result = "";
		handleChunk(`${memoryKey}\n`);
		for await (const chunk of stream) {
			result += chunk;
			handleChunk(chunk);
		}

		await this.prismaService.intelligenceLog.create({
			data: {
				memoryKey,
				question: prompt,
				answer: result,
				userId,
				documentId: runFeatureDto.documentId,
			},
		});
	}

	async runFollowUp(
		userId: string,
		runFollowUpDto: RunFollowUpDto,
		handleChunk: (token: string) => void
	) {
		const chatPromptMemory = new BufferMemory({
			memoryKey: "chat_history",
			returnMessages: true,
		});
		const intelligenceLogList = await this.prismaService.intelligenceLog.findMany({
			where: {
				memoryKey: runFollowUpDto.memoryKey,
				documentId: runFollowUpDto.documentId,
			},
		});

		for (const intelligenceLog of intelligenceLogList) {
			await chatPromptMemory.chatHistory.addUserMessage(intelligenceLog.question);
			await chatPromptMemory.chatHistory.addAIChatMessage(intelligenceLog.answer);
		}

		const prompt = await followUpPromptTemplate.format({
			content: runFollowUpDto.content,
			chat_history: (await chatPromptMemory.loadMemoryVariables({})).chat_history,
		});

		const stream = await this.chatModel.pipe(new StringOutputParser()).stream(prompt, {
			tags: [
				"follow-up",
				`user_id: ${userId}`,
				`document_id: ${runFollowUpDto.documentId}`,
				`memory_key: ${runFollowUpDto.memoryKey}`,
			],
		});

		let result = "";
		for await (const chunk of stream) {
			result += chunk;
			handleChunk(chunk);
		}

		await this.prismaService.intelligenceLog.create({
			data: {
				userId,
				documentId: runFollowUpDto.documentId,
				memoryKey: runFollowUpDto.memoryKey,
				question: runFollowUpDto.content,
				answer: result,
			},
		});
	}
}
