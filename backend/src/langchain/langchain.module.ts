import { Module } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ConfigModule, ConfigService } from "@nestjs/config";

const chatModelFactory = {
	provide: "ChatModel",
	useFactory: (configService: ConfigService) => {
		const modelType = configService.get("YORKIE_INTELLIGENCE");
		try {
			// Split the modelType string into provider and model
			// ex) "ollama:gemma2:2b" => ["ollama", "gemma2:2b"]
			const [provider, model] = modelType.split(/:(.+)/);
			let chatModel: BaseChatModel | ChatOllama;
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

			return chatModel;
		} catch {
			throw new Error(`${modelType} is not found. Please check your model name`);
		}
	},
	inject: [ConfigService],
};

@Module({
	providers: [chatModelFactory],
	exports: [chatModelFactory],
})
export class LangchainModule {}
