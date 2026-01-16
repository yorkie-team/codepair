import { Prisma } from "@prisma/client";

export interface Chunk {
	content: string;
	type: "text" | "code";
	language?: string;
	section?: string;
	metadata?: Prisma.JsonValue;
}

export interface ChunkMetadata {
	maxTokens?: number;
}
