import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "src/db/prisma.service";
import { EmbeddingService } from "../embedding/embedding.service";
import { ContentSanitizer } from "../sanitization/sanitizer.service";
import { MarkdownChunker } from "../chunking/markdown-chunker.service";
import { YorkieAdminService } from "src/yorkie/yorkie-admin.service";
import { QdrantService } from "../qdrant/qdrant.service";

@Injectable()
export class IndexingService {
	private readonly logger = new Logger(IndexingService.name);

	constructor(
		private prismaService: PrismaService,
		private embeddingService: EmbeddingService,
		private sanitizer: ContentSanitizer,
		private chunker: MarkdownChunker,
		private yorkieAdminService: YorkieAdminService,
		private qdrantService: QdrantService
	) {}

	/**
	 * Index a document for RAG search
	 */
	async indexDocument(documentId: string, workspaceId: string): Promise<void> {
		try {
			// 1. Get document metadata and validate workspace
			const document = await this.prismaService.document.findUnique({
				where: { id: documentId },
				select: {
					id: true,
					workspaceId: true,
					yorkieDocumentId: true,
				},
			});

			if (!document) {
				throw new Error(`Document ${documentId} not found`);
			}

			// Validate that the provided workspaceId matches the document's actual workspace
			if (document.workspaceId !== workspaceId) {
				throw new Error(
					`Workspace mismatch: Document ${documentId} belongs to workspace ${document.workspaceId}.`
				);
			}

			// 2. Get content from Yorkie
			const yorkieDoc = await this.yorkieAdminService.getDocument(document.yorkieDocumentId);
			const content = this.yorkieAdminService.extractContent(yorkieDoc);

			if (!content) {
				this.logger.warn(`No content to index - documentId: ${documentId}`);
				return;
			}

			// 3. Sanitize content
			const sanitizedContent = this.sanitizer.sanitize(content);

			// 4. Chunk the content
			const chunks = this.chunker.chunk(sanitizedContent, {
				maxTokens: 512,
			});

			if (chunks.length === 0) {
				this.logger.warn(`No chunks generated - documentId: ${documentId}`);
				return;
			}

			// 5. Generate embeddings (batch processing)
			const contents = chunks.map((chunk) => chunk.content);
			const embeddings = await this.embeddingService.embedDocuments(contents);

			// 6. Delete existing chunks for this document from Qdrant
			await this.qdrantService.deleteDocumentPoints(documentId);

			// 7. Save chunks to Qdrant
			const embeddingModel = this.embeddingService.getEmbeddingModel();
			const embeddingVersion = this.embeddingService.getEmbeddingVersion();
			const now = new Date().toISOString();

			const points = chunks.map((chunk, index) => {
				// Generate deterministic UUID from documentId and chunkIndex
				const idSeed = `${documentId}:${index}`;
				const hash = crypto.createHash("sha256").update(idSeed).digest("hex");
				const uuid = [
					hash.slice(0, 8),
					hash.slice(8, 12),
					hash.slice(12, 16),
					hash.slice(16, 20),
					hash.slice(20, 32),
				].join("-");

				// Build payload, excluding undefined values
				const payload = {
					documentId,
					workspaceId: document.workspaceId,
					chunkIndex: index,
					content: chunk.content,
					contentHash: this.hashContent(chunk.content),
					embeddingModel,
					embeddingVersion,
					chunkType: chunk.type,
					workspaceOnly: true,
					indexedAt: now,
					...(chunk.language !== undefined && { language: chunk.language }),
					...(chunk.section !== undefined && { section: chunk.section }),
					...(chunk.metadata !== undefined && { metadata: chunk.metadata }),
				};

				return {
					id: uuid,
					vector: embeddings[index],
					payload,
				};
			});

			await this.qdrantService.upsertPoints(points);

			this.logger.log(
				`Document indexed successfully - documentId: ${documentId}, chunks: ${chunks.length}`
			);
		} catch (error) {
			this.logger.error(
				`Indexing failed - documentId: ${documentId}, error: ${error.message}`,
				error.stack
			);
			throw error;
		}
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
		await this.qdrantService.deleteDocumentPoints(documentId);
	}

	/**
	 * Get indexing status for a document
	 */
	async getIndexingStatus(documentId: string) {
		const points = await this.qdrantService.getDocumentPoints(documentId);

		// Sort by chunkIndex
		const sortedPoints = points.sort((a, b) => a.payload.chunkIndex - b.payload.chunkIndex);

		return {
			indexed: points.length > 0,
			chunkCount: points.length,
			lastIndexedAt: points.length > 0 ? sortedPoints[0].payload.indexedAt : null,
			chunks: sortedPoints.map((p) => ({
				id: p.id,
				chunkIndex: p.payload.chunkIndex,
				chunkType: p.payload.chunkType,
				indexedAt: p.payload.indexedAt,
			})),
		};
	}

	/**
	 * Hash content for duplicate detection
	 */
	private hashContent(content: string): string {
		return crypto.createHash("sha256").update(content).digest("hex");
	}
}
