import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QdrantClient } from "@qdrant/qdrant-js";

export interface QdrantPoint {
	id: string; // documentId:chunkIndex
	vector: number[];
	payload: {
		documentId: string;
		workspaceId: string;
		chunkIndex: number;
		content: string;
		contentHash: string;
		embeddingModel: string;
		embeddingVersion: string;
		chunkType: string;
		language?: string;
		section?: string;
		metadata?: unknown;
		workspaceOnly: boolean;
		indexedAt: string; // ISO string
	};
}

export interface QdrantSearchResult {
	id: string;
	score: number;
	payload: QdrantPoint["payload"];
}

@Injectable()
export class QdrantService implements OnModuleInit {
	private readonly logger = new Logger(QdrantService.name);
	private client: QdrantClient;
	private collectionName: string;
	private vectorSize: number;

	constructor(private configService: ConfigService) {
		// Qdrant connection settings
		const qdrantUrl = this.configService.get<string>("QDRANT_URL", "http://localhost:6333");

		// Collection configuration
		this.collectionName = this.configService.get<string>(
			"QDRANT_COLLECTION_NAME",
			"document_chunks"
		);
		// Ensure vectorSize is a number (env vars are strings by default)
		const vectorSizeRaw = this.configService.get<string>("QDRANT_VECTOR_SIZE", "768");
		this.vectorSize = parseInt(vectorSizeRaw, 10);

		// Initialize Qdrant client
		const clientConfig: ConstructorParameters<typeof QdrantClient>[0] = {
			url: qdrantUrl,
		};

		this.client = new QdrantClient(clientConfig);
	}

	async onModuleInit() {
		await this.ensureCollection();
	}

	/**
	 * Ensure the collection exists, create if it doesn't
	 */
	private async ensureCollection() {
		try {
			const { collections } = await this.client.getCollections();
			const exists = collections.some((c) => c.name === this.collectionName);

			if (!exists) {
				this.logger.log(`Creating Qdrant collection: ${this.collectionName}`);
				await this.client.createCollection(this.collectionName, {
					vectors: {
						size: this.vectorSize,
						distance: "Cosine",
					},
				});
				this.logger.log(`Qdrant collection created: ${this.collectionName}`);
			}
		} catch (error) {
			this.logger.error(`Failed to ensure Qdrant collection: ${error.message}`, error.stack);
			throw error;
		}
	}

	/**
	 * Upsert points (chunks) into Qdrant
	 */
	async upsertPoints(points: QdrantPoint[]): Promise<void> {
		if (points.length === 0) return;

		await this.client.upsert(this.collectionName, {
			wait: true,
			points: points.map((p) => ({
				id: p.id,
				vector: p.vector,
				payload: p.payload,
			})),
		});
	}

	/**
	 * Delete all points for a document
	 */
	async deleteDocumentPoints(documentId: string): Promise<void> {
		await this.client.delete(this.collectionName, {
			wait: true,
			filter: {
				must: [{ key: "documentId", match: { value: documentId } }],
			},
		});
	}

	/**
	 * Search similar vectors in workspace
	 */
	async search(
		queryVector: number[],
		workspaceId: string,
		limit: number
	): Promise<QdrantSearchResult[]> {
		const response = await this.client.search(this.collectionName, {
			vector: queryVector,
			limit,
			filter: {
				must: [
					{ key: "workspaceId", match: { value: workspaceId } },
					{ key: "workspaceOnly", match: { value: true } },
				],
			},
			with_payload: true,
			score_threshold: 0.5, // Minimum similarity threshold
		});

		return response.map((r) => ({
			id: String(r.id),
			score: r.score,
			payload: r.payload as QdrantPoint["payload"],
		}));
	}

	/**
	 * Get indexing status for a document
	 */
	async getDocumentPoints(documentId: string): Promise<QdrantSearchResult[]> {
		const response = await this.client.scroll(this.collectionName, {
			filter: {
				must: [{ key: "documentId", match: { value: documentId } }],
			},
			limit: 1000,
			with_payload: true,
		});

		return response.points.map((p) => ({
			id: String(p.id),
			score: 1, // No score in scroll
			payload: p.payload as QdrantPoint["payload"],
		}));
	}
}
