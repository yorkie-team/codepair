import { Inject, Injectable } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

@Injectable()
export class IntelligenceService {
	constructor(@Inject("ChatModel") private chatModel: BaseChatModel) {}
}
