import { Module } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

type ModelList = {
	[key: string]: string[];
};

const modelList: ModelList = {
	ollama: [
		"lamma3.1",
		"gemma2",
		"gemma2:2b",
		"phi3",
		"mistral",
		"neural-chat",
		"starling-lm",
		"solar",
	],
	openai: ["gpt-3.5-turbo", "gpt-4o-mini"],
};

const chatModelFactory = {
	provide: "ChatModel",
	useFactory: () => {
		const modelType = process.env.YORKIE_INTELLIGENCE;
		try {
			// Split the modelType string into provider and model
			// ex) "ollama:gemma2:2b" => ["ollama", "gemma2:2b"]
			const [provider, model] = modelType.split(/:(.+)/);
			let chatModel: BaseChatModel | ChatOllama;

			if (modelList[provider]?.includes(model)) {
				if (provider === "ollama") {
					chatModel = new ChatOllama({
						model: model,
						baseUrl: process.env.OLLAMA_HOST_URL,
						checkOrPullModel: true,
						streaming: true,
					});
				} else if (provider === "openai") {
					chatModel = new ChatOpenAI({ modelName: model });
				}
			}

			if (!chatModel) throw new Error();

			return chatModel;
		} catch {
			throw new Error(`${modelType} is not found. Please check your model name`);
		}
	},
};

@Module({
	providers: [chatModelFactory],
	exports: [chatModelFactory],
})
export class LangchainModule {}
