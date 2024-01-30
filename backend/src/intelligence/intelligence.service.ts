import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Feature } from "./types/feature.type";
import { githubIssuePromptTemplate } from "./prompt/github-issue";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { githubPrPromptTemplate } from "./prompt/github-pr";
import { generateRandomKey } from "src/utils/functions/random-string";
import { PrismaService } from "src/db/prisma.service";
import { RunFeatureDto } from "./dto/run-feature.dto";

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
		};
		const selectedPrompt = promptTemplates[feature];

		if (!selectedPrompt) throw new NotFoundException();

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
		const stream = await this.chatModel.pipe(new StringOutputParser()).stream(prompt, {
			tags: [feature, `user_id: ${userId}`, `document_id: ${runFeatureDto.documentId}`],
		});
		const memoryKey = generateRandomKey();
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
}
