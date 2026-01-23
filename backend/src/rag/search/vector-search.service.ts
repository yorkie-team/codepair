import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "src/db/prisma.service";
import { EmbeddingService } from "../embedding/embedding.service";
import { DocumentChunk } from "@prisma/client";
import { MongoVectorSearchResult, MongoChunkResult } from "../types/mongo-search.type";

export interface SearchResult {
	chunk: DocumentChunk;
	score: number;
}

@Injectable()
export class VectorSearchService {
	constructor(
		private prismaService: PrismaService,
		private embeddingService: EmbeddingService
	) {}

	/**
	 * Search for relevant chunks using vector similarity
	 */
	async searchChunks(
		userId: string,
		workspaceId: string,
		query: string,
		limit: number = 10
	): Promise<SearchResult[]> {
		// 1. Generate query embedding
		const queryEmbedding = await this.embeddingService.embedQuery(query);

		// 2. For development: Use simple cosine similarity
		// In production with MongoDB Atlas M10+, use $vectorSearch
		const useVectorSearch = process.env.USE_MONGODB_VECTOR_SEARCH === "true";

		if (useVectorSearch) {
			return this.mongodbVectorSearch(workspaceId, userId, queryEmbedding, limit);
		} else {
			return this.fallbackCosineSimilaritySearch(workspaceId, userId, queryEmbedding, limit);
		}
	}

	/**
	 * MongoDB Vector Search (requires Atlas M10+)
	 */
	private async mongodbVectorSearch(
		workspaceId: string,
		userId: string,
		queryEmbedding: number[],
		limit: number
	): Promise<SearchResult[]> {
		// Note: This requires MongoDB Atlas Vector Search index to be created
		// See design document for index configuration

		try {
			const workspaceIdFilter = this.toMongoIdFilter(workspaceId);

			const results = await this.prismaService.$runCommandRaw({
				aggregate: "document_chunks",
				pipeline: [
					{
						$vectorSearch: {
							index: "vector_index",
							path: "embedding",
							queryVector: queryEmbedding,
							numCandidates: limit * 10,
							limit: limit,
							filter: {
								workspace_id: workspaceIdFilter,
								workspace_only: true,
							},
						},
					},
					{
						$project: {
							_id: 1,
							document_id: 1,
							workspace_id: 1,
							content: 1,
							chunk_type: 1,
							language: 1,
							section: 1,
							chunk_index: 1,
							score: { $meta: "vectorSearchScore" },
						},
					},
				],
				cursor: {},
			});

			// Transform results
			const searchResult = results as unknown as MongoVectorSearchResult;
			const chunks = searchResult.cursor.firstBatch;
			return chunks.map((chunk: MongoChunkResult) => ({
				chunk: this.transformMongoChunk(chunk),
				score: chunk.score,
			}));
		} catch (error) {
			console.error("MongoDB Vector Search failed:", error);
			// Fallback to cosine similarity
			return this.fallbackCosineSimilaritySearch(workspaceId, userId, queryEmbedding, limit);
		}
	}

	/**
	 * Fallback: In-memory cosine similarity search (for development)
	 */
	private async fallbackCosineSimilaritySearch(
		workspaceId: string,
		userId: string,
		queryEmbedding: number[],
		limit: number
	): Promise<SearchResult[]> {
		// Get all chunks for the workspace
		const chunks = await this.prismaService.documentChunk.findMany({
			where: { workspaceId, OR: [{ workspaceOnly: true }] },
		});

		// Calculate cosine similarity for each chunk
		const scored = chunks.map((chunk) => ({
			chunk,
			score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
		}));

		// Sort by score (descending) and return top N
		return scored
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.filter((result) => result.score > 0.5); // Minimum similarity threshold
	}

	/**
	 * Calculate cosine similarity between two vectors
	 */
	private cosineSimilarity(a: number[], b: number[]): number {
		if (a.length !== b.length) {
			throw new Error("Vectors must have the same length");
		}

		let dotProduct = 0;
		let magnitudeA = 0;
		let magnitudeB = 0;

		for (let i = 0; i < a.length; i++) {
			dotProduct += a[i] * b[i];
			magnitudeA += a[i] * a[i];
			magnitudeB += b[i] * b[i];
		}

		magnitudeA = Math.sqrt(magnitudeA);
		magnitudeB = Math.sqrt(magnitudeB);

		if (magnitudeA === 0 || magnitudeB === 0) {
			return 0;
		}

		return dotProduct / (magnitudeA * magnitudeB);
	}

	/**
	 * Transform MongoDB chunk to Prisma DocumentChunk
	 */
	private transformMongoChunk(mongoChunk: MongoChunkResult): DocumentChunk {
		return {
			id: this.normalizeMongoId(mongoChunk._id),
			documentId: this.normalizeMongoId(mongoChunk.document_id),
			workspaceId: this.normalizeMongoId(mongoChunk.workspace_id),
			content: mongoChunk.content,
			chunkType: mongoChunk.chunk_type,
			language: mongoChunk.language,
			section: mongoChunk.section,
			chunkIndex: mongoChunk.chunk_index,
			contentHash: "",
			embedding: [],
			embeddingModel: "",
			embeddingVersion: "",
			workspaceOnly: true,
			metadata: null,
			indexedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		} as DocumentChunk;
	}

	private toMongoIdFilter(id: string): string | { $oid: string } {
		// Prisma Mongo raw commands accept Extended JSON for ObjectId.
		// If it's a 24-hex string, treat as ObjectId, otherwise treat as string.
		if (/^[a-f0-9]{24}$/i.test(id)) {
			return { $oid: id };
		}
		return id;
	}

	private normalizeMongoId(value: unknown): string {
		// Prisma Mongo can return ObjectId values as Extended JSON: { $oid: "..." }.
		// Convert to the plain hex string so downstream Prisma queries work.
		if (typeof value === "string") {
			return value;
		}
		if (value && typeof value === "object") {
			const maybeOid = (value as { $oid?: unknown }).$oid;
			if (typeof maybeOid === "string") {
				return maybeOid;
			}
		}
		return String(value);
	}

	/**
	 * Generate hash for query (for audit logging)
	 */
	hashQuery(query: string): string {
		return crypto.createHash("sha256").update(query).digest("hex");
	}
}
