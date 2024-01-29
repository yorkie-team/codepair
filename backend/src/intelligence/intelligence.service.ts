import { Inject, Injectable } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Feature } from "./types/feature.type";

@Injectable()
export class IntelligenceService {
	constructor(@Inject("ChatModel") private chatModel: BaseChatModel) {}

	async runFeature(feature: Feature, content: string) {
		console.log(feature, content);
	}
}
