import { Module } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

const chatModelFactory = {
	provide: "ChatModel",
	useFactory: () => {
		const modelType = process.env.YORKIE_INTELLIGENCE;
		if (modelType === "gemma2:2b") {
			return new ChatOllama({
				model: modelType,
				checkOrPullModel: true,
				streaming: true,
			});
		} else if (modelType === "openai") {
			return new ChatOpenAI({ modelName: "gpt-4o-mini" }) as BaseChatModel;
		}
	},
};

@Module({
	providers: [chatModelFactory],
	exports: [chatModelFactory],
})
export class LangchainModule {}
