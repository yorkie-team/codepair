import { Injectable, Logger } from "@nestjs/common";
import { EmbeddingService } from "../embedding/embedding.service";
import { QdrantService } from "../qdrant/qdrant.service";

export interface DocumentChunk {
	id: string;
	documentId: string;
	workspaceId: string;
	chunkIndex: number;
	content: string;
	chunkType: string;
	language?: string;
	section?: string;
}

export interface SearchResult {
	chunk: DocumentChunk;
	score: number;
}

@Injectable()
export class VectorSearchService {
	private readonly logger = new Logger(VectorSearchService.name);

	constructor(
		private embeddingService: EmbeddingService,
		private qdrantService: QdrantService
	) {}

	/**
	 * Search for relevant chunks using Qdrant vector similarity
	 */
	async searchChunks(
		userId: string,
		workspaceId: string,
		query: string,
		limit: number = 10
	): Promise<SearchResult[]> {
		try {
			// 1. Generate query embedding
			const queryEmbedding = await this.embeddingService.embedQuery(query);

			// 2. Search in Qdrant
			const results = await this.qdrantService.search(queryEmbedding, workspaceId, limit);

			// Warn if no results found
			if (results.length === 0) {
				this.logger.warn(
					`No search results found - workspaceId: ${workspaceId}, query: "${query.substring(0, 50)}..."`
				);
			}

			// 3. Transform to SearchResult format
			return results.map((r) => ({
				chunk: {
					id: r.id,
					documentId: r.payload.documentId,
					workspaceId: r.payload.workspaceId,
					chunkIndex: r.payload.chunkIndex,
					content: r.payload.content,
					chunkType: r.payload.chunkType,
					language: r.payload.language,
					section: r.payload.section,
				},
				score: r.score,
			}));
		} catch (error) {
			this.logger.error(
				`Vector search failed - workspaceId: ${workspaceId}, error: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}
}
