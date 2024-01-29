import { Inject, Injectable } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

@Injectable()
export class IntelligenceService {
	constructor(@Inject("BaseChatModel") private chatModel: BaseChatModel) {}
}
