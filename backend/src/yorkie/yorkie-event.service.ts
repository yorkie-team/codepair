import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { IndexingQueueService } from "src/rag/indexing/indexing-queue.service";
import { QdrantService } from "src/rag/qdrant/qdrant.service";
import { DocumentEventDto, DocumentEventType } from "./dto/document-event.dto";

// Debounce time constants (in milliseconds)
const DEFAULT_DEBOUNCE_MS = 30000; // 30 seconds
const LONG_DEBOUNCE_MS = 120000; // 2 minutes
const MANUAL_DEBOUNCE_MS = 5000; // 5 seconds
const RECENT_INDEX_THRESHOLD_MINUTES = 10; // 10 minutes

@Injectable()
export class YorkieEventService {
	private readonly logger = new Logger(YorkieEventService.name);

	constructor(
		private prismaService: PrismaService,
		private indexingQueueService: IndexingQueueService,
		private qdrantService: QdrantService
	) {}

	/**
	 * Handle document event from Yorkie webhook
	 * @param eventDto - Document event from Yorkie
	 */
	async handleDocumentEvent(eventDto: DocumentEventDto): Promise<void> {
		this.logger.log(
			`Received document event: ${eventDto.type} for document key: ${eventDto.attributes.key}`
		);

		switch (eventDto.type) {
			case DocumentEventType.DocumentRootChanged:
				await this.handleDocumentChanged(eventDto.attributes.key);
				break;
			default:
				this.logger.warn(`Unknown event type: ${eventDto.type}`);
		}
	}

	/**
	 * Handle document changed event - queue it for indexing
	 * @param yorkieDocumentKey - Yorkie document key
	 */
	private async handleDocumentChanged(yorkieDocumentKey: string): Promise<void> {
		try {
			// Find CodePair document by Yorkie document ID
			const document = await this.prismaService.document.findFirst({
				where: {
					yorkieDocumentId: yorkieDocumentKey,
				},
				select: {
					id: true,
					workspaceId: true,
					yorkieDocumentId: true,
					updatedAt: true,
				},
			});

			if (!document) {
				this.logger.warn(`No CodePair document found for Yorkie key: ${yorkieDocumentKey}`);
				return;
			}

			this.logger.log(`Found CodePair document ${document.id} to queue for indexing`);

			// Queue document for indexing with appropriate debounce
			const debounceMs = await this.calculateDebounceTime(document.id);

			this.indexingQueueService.scheduleIndexing(
				document.id,
				document.workspaceId,
				debounceMs
			);
		} catch (error) {
			this.logger.error(
				`Error handling document changed event: ${error.message}`,
				error.stack
			);
			throw error;
		}
	}

	/**
	 * Calculate appropriate debounce time based on last indexing time
	 * - If indexed within last 10 minutes: 2 minutes debounce
	 * - Otherwise: 30 seconds debounce
	 * @param documentId - Document ID
	 * @returns Debounce time in milliseconds
	 */
	private async calculateDebounceTime(documentId: string): Promise<number> {
		try {
			// Get document chunks from Qdrant
			const points = await this.qdrantService.getDocumentPoints(documentId);

			if (points.length === 0) {
				// Never indexed before - use shorter debounce
				return DEFAULT_DEBOUNCE_MS;
			}

			// Find the most recent indexedAt time
			const mostRecentPoint = points.reduce((latest, point) => {
				const currentTime = new Date(point.payload.indexedAt).getTime();
				const latestTime = new Date(latest.payload.indexedAt).getTime();
				return currentTime > latestTime ? point : latest;
			});

			const lastIndexedAt = new Date(mostRecentPoint.payload.indexedAt);
			const minutesSinceIndexing = (Date.now() - lastIndexedAt.getTime()) / 60000;

			if (minutesSinceIndexing < RECENT_INDEX_THRESHOLD_MINUTES) {
				return LONG_DEBOUNCE_MS;
			}

			// Not recently indexed - use shorter debounce
			return DEFAULT_DEBOUNCE_MS;
		} catch (error) {
			this.logger.error(
				`Error calculating debounce time for document ${documentId}: ${error.message}`
			);
			// Default to 30 seconds on error
			return DEFAULT_DEBOUNCE_MS;
		}
	}

	/**
	 * Manually trigger indexing for specific documents (for testing or manual operations)
	 * @param documentIds - Array of document IDs
	 */
	async queueDocumentsForIndexing(documentIds: string[]): Promise<void> {
		const documents = await this.prismaService.document.findMany({
			where: {
				id: { in: documentIds },
			},
			select: {
				id: true,
				workspaceId: true,
			},
		});

		for (const doc of documents) {
			this.indexingQueueService.scheduleIndexing(doc.id, doc.workspaceId, MANUAL_DEBOUNCE_MS);
		}

		this.logger.log(`Manually queued ${documents.length} document(s) for indexing`);
	}
}
