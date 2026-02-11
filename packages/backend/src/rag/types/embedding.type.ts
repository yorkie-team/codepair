export interface EmbeddingConfig {
	model: string;
	dimensions: number;
	version: string;
}

export const EMBEDDING_VERSION = "v1";

export const EMBEDDING_CONFIGS: Record<string, EmbeddingConfig> = {
	production: {
		model: "text-embedding-3-small",
		dimensions: 1536,
		version: EMBEDDING_VERSION,
	},
	development: {
		model: "text-embedding-3-small", // OpenAI for now
		dimensions: 1536,
		version: EMBEDDING_VERSION,
	},
};
