import { Module } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

const chatModelFactory = {
	provide: "ChatModel",
	useFactory: () => {
		let modelList: string[] = [
			"lamma3.1",
			"gemma2",
			"gemma2:2b",
			"phi3",
			"mistral",
			"neural-chat",
			"starling-lm",
			"solar",
		];
		const modelType = process.env.YORKIE_INTELLIGENCE;
		if (modelType in modelList) {
			return new ChatOllama({
				model: modelType,
				baseUrl: process.env.OLLAMA_HOST_PORT,
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
