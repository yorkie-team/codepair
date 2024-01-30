import { Module } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

const chatModelFactory = {
	provide: "ChatModel",
	useFactory: () => new ChatOpenAI({}) as BaseChatModel,
};

@Module({
	providers: [chatModelFactory],
	exports: [chatModelFactory],
})
export class LangchainModule {}
