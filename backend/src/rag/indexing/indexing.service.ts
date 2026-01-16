import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "src/db/prisma.service";
import { EmbeddingService } from "../embedding/embedding.service";
import { ContentSanitizer } from "../sanitization/sanitizer.service";
import { MarkdownChunker } from "../chunking/markdown-chunker.service";

@Injectable()
export class IndexingService {
	constructor(
		private prismaService: PrismaService,
		private embeddingService: EmbeddingService,
		private sanitizer: ContentSanitizer,
		private chunker: MarkdownChunker
	) {}

	/**
	 * Index a document for RAG search
	 */
	async indexDocument(documentId: string, workspaceId: string): Promise<void> {
		// 1. Get document content
		const document = await this.prismaService.document.findUnique({
			where: { id: documentId },
			select: {
				id: true,
				workspaceId: true,
				content: true,
			},
		});

		if (!document) {
			throw new Error(`Document ${documentId} not found`);
		}

		if (!document.content) {
			// Empty document, skip indexing
			return;
		}

		// 2. Sanitize content
		const sanitizedContent = this.sanitizer.sanitize(document.content);

		// 3. Chunk the content
		const chunks = this.chunker.chunk(sanitizedContent, {
			documentId,
			workspaceId,
			maxTokens: 512,
		});

		if (chunks.length === 0) {
			// No chunks to index
			return;
		}

		// 4. Generate embeddings (batch processing)
		const contents = chunks.map((chunk) => chunk.content);
		const embeddings = await this.embeddingService.embedDocuments(contents);

		// 5. Delete existing chunks for this document
		await this.prismaService.documentChunk.deleteMany({
			where: { documentId },
		});

		// 6. Save chunks to MongoDB
		const embeddingModel = this.embeddingService.getEmbeddingModel();
		const embeddingVersion = this.embeddingService.getEmbeddingVersion();

		await this.prismaService.documentChunk.createMany({
			data: chunks.map((chunk, index) => ({
				documentId,
				workspaceId,
				chunkIndex: index,
				content: chunk.content,
				contentHash: this.hashContent(chunk.content),
				embedding: embeddings[index],
				embeddingModel,
				embeddingVersion,
				chunkType: chunk.type,
				language: chunk.language || null,
				section: chunk.section || null,
				metadata: chunk.metadata || null,
				workspaceOnly: true,
				allowedUserIds: [],
				indexedAt: new Date(),
			})),
		});
	}

	/**
	 * Re-index a document (when content changes)
	 */
	async reindexDocument(documentId: string, workspaceId: string): Promise<void> {
		await this.indexDocument(documentId, workspaceId);
	}

	/**
	 * Delete document chunks (when document is deleted)
	 */
	async deleteDocumentChunks(documentId: string): Promise<void> {
		await this.prismaService.documentChunk.deleteMany({
			where: { documentId },
		});
	}

	/**
	 * Get indexing status for a document
	 */
	async getIndexingStatus(documentId: string) {
		const chunks = await this.prismaService.documentChunk.findMany({
			where: { documentId },
			select: {
				id: true,
				chunkIndex: true,
				chunkType: true,
				indexedAt: true,
			},
			orderBy: { chunkIndex: "asc" },
		});

		return {
			indexed: chunks.length > 0,
			chunkCount: chunks.length,
			lastIndexedAt: chunks.length > 0 ? chunks[0].indexedAt : null,
			chunks: chunks,
		};
	}

	/**
	 * Hash content for duplicate detection
	 */
	private hashContent(content: string): string {
		return crypto.createHash("sha256").update(content).digest("hex");
	}
}
