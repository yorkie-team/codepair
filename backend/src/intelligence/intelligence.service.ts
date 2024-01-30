import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Feature } from "./types/feature.type";
import { githubIssuePromptTemplate } from "./prompt/github-issue";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { githubPrPromptTemplate } from "./prompt/github-pr";

@Injectable()
export class IntelligenceService {
	constructor(@Inject("ChatModel") private chatModel: BaseChatModel) {}

	private selectPromptTemplate(feature: Feature) {
		const promptTemplates = {
			[Feature.GITHUB_ISSUE]: githubIssuePromptTemplate,
			[Feature.GITHUB_PR]: githubPrPromptTemplate,
		};
		const selectedPrompt = promptTemplates[feature];

		if (!selectedPrompt) throw new NotFoundException();

		return selectedPrompt;
	}

	async runFeature(userId: string, feature: Feature, content: string) {
		const promptTemplate = this.selectPromptTemplate(feature);
		const prompt = await promptTemplate.format({
			content,
		});
		const parser = new StringOutputParser();

		return this.chatModel.pipe(parser).stream(prompt, {
			tags: [feature, userId],
		});
	}
}
