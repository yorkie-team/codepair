import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Embeddings } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { EMBEDDING_CONFIGS } from "../types/embedding.type";

@Injectable()
export class EmbeddingService {
	private embeddings: Embeddings;
	private embeddingModel: string;
	private embeddingVersion: string;

	constructor(private configService: ConfigService) {
		const modelType = this.configService.get("YORKIE_INTELLIGENCE");
		const env = this.configService.get("NODE_ENV") || "development";

		if (modelType === "false") {
			throw new Error("YORKIE_INTELLIGENCE is disabled");
		}

		const config = EMBEDDING_CONFIGS[env] || EMBEDDING_CONFIGS.development;

		try {
			// Parse model type (e.g., "openai:gpt-4" or "ollama:gemma2:2b")
			const [provider] = modelType.split(/:(.+)/);

			if (provider === "ollama") {
				// For Ollama, use nomic-embed-text for embeddings
				this.embeddings = new OllamaEmbeddings({
					model: "nomic-embed-text",
					baseUrl: this.configService.get("OLLAMA_HOST_URL"),
				});
				this.embeddingModel = "nomic-embed-text";
			} else if (provider === "openai") {
				// For OpenAI, use text-embedding-3-small
				this.embeddings = new OpenAIEmbeddings({
					modelName: config.model,
				});
				this.embeddingModel = config.model;
			} else {
				throw new Error(`Unsupported provider: ${provider}`);
			}

			this.embeddingVersion = config.version;
		} catch (error) {
			throw new Error(`Failed to initialize embedding service: ${error.message}`);
		}
	}

	/**
	 * Generate embeddings for multiple documents (batch processing)
	 */
	async embedDocuments(texts: string[]): Promise<number[][]> {
		return await this.embeddings.embedDocuments(texts);
	}

	/**
	 * Generate embedding for a single query
	 */
	async embedQuery(text: string): Promise<number[]> {
		return await this.embeddings.embedQuery(text);
	}

	/**
	 * Get the current embedding model name
	 */
	getEmbeddingModel(): string {
		return this.embeddingModel;
	}

	/**
	 * Get the current embedding version
	 */
	getEmbeddingVersion(): string {
		return this.embeddingVersion;
	}
}
