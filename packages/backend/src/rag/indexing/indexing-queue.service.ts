import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { IndexingService } from "./indexing.service";

interface QueuedIndexing {
	documentId: string;
	workspaceId: string;
	scheduledAt: Date;
	timer: NodeJS.Timeout;
	retryCount: number;
}

@Injectable()
export class IndexingQueueService {
	private readonly logger = new Logger(IndexingQueueService.name);
	private queue = new Map<string, QueuedIndexing>();
	private readonly DEFAULT_DEBOUNCE_MS = 30000; // 30 seconds
	private readonly MAX_RETRY_COUNT = 3;

	constructor(
		private prismaService: PrismaService,
		private indexingService: IndexingService
	) {}

	/**
	 * Schedule document indexing with debouncing
	 * If the same document is scheduled multiple times, the timer is reset
	 * @param documentId - Document ID to index
	 * @param workspaceId - Workspace ID
	 * @param debounceMs - Debounce time in milliseconds (default: 30 seconds)
	 */
	scheduleIndexing(documentId: string, workspaceId: string, debounceMs?: number): void {
		const existing = this.queue.get(documentId);

		// Cancel existing timer if present
		if (existing) {
			clearTimeout(existing.timer);
		}

		const delay = debounceMs ?? this.DEFAULT_DEBOUNCE_MS;

		// Schedule new timer
		const timer = setTimeout(() => {
			this.executeIndexing(documentId);
		}, delay);

		this.queue.set(documentId, {
			documentId,
			workspaceId,
			scheduledAt: new Date(), // Set a new token on each schedule
			timer,
			retryCount: existing?.retryCount ?? 0,
		});

		this.logger.log(
			`Indexing scheduled for document ${documentId} in ${delay / 1000} seconds (queue size: ${
				this.queue.size
			})`
		);
	}

	/**
	 * Execute indexing for a document
	 * @param documentId - Document ID to index
	 */
	private async executeIndexing(documentId: string): Promise<void> {
		const queued = this.queue.get(documentId);

		if (!queued) {
			this.logger.warn(`Document ${documentId} not found in queue`);
			return;
		}

		// Capture the token to detect if the job is rescheduled while running
		const initialScheduledAt = queued.scheduledAt;

		try {
			this.logger.log(`Executing indexing for document ${documentId}`);
			await this.indexingService.reindexDocument(documentId, queued.workspaceId);

			// On success, only remove the entry if it hasn't been rescheduled
			const currentQueued = this.queue.get(documentId);
			if (currentQueued?.scheduledAt.getTime() === initialScheduledAt.getTime()) {
				this.queue.delete(documentId);
				this.logger.log(
					`Successfully indexed and removed document ${documentId} (queue size: ${this.queue.size})`
				);
			} else {
				this.logger.log(
					`Successfully indexed document ${documentId}, but not removing from queue as it has been rescheduled.`
				);
			}
		} catch (error) {
			this.logger.error(
				`Failed to index document ${documentId}: ${error.message}`,
				error.stack
			);

			// On failure, only retry or delete if the entry hasn't been rescheduled
			const currentQueued = this.queue.get(documentId);
			if (currentQueued?.scheduledAt.getTime() === initialScheduledAt.getTime()) {
				if (queued.retryCount < this.MAX_RETRY_COUNT) {
					this.scheduleRetry(documentId, queued.workspaceId, queued.retryCount + 1);
				} else {
					this.logger.error(
						`Max retry count reached for document ${documentId}, removing from queue`
					);
					this.queue.delete(documentId);
				}
			} else {
				this.logger.log(
					`Failed to index document ${documentId}, but not retrying as it has been rescheduled.`
				);
			}
		}
	}

	/**
	 * Schedule retry for failed indexing
	 * Uses exponential backoff: 1min, 2min, 4min
	 * @param documentId - Document ID to retry
	 * @param workspaceId - Workspace ID
	 * @param retryCount - Current retry count
	 */
	private scheduleRetry(documentId: string, workspaceId: string, retryCount: number): void {
		const delayMs = Math.pow(2, retryCount) * 60000; // Exponential backoff in minutes

		this.logger.warn(
			`Scheduling retry ${retryCount}/${this.MAX_RETRY_COUNT} for document ${documentId} in ${
				delayMs / 1000
			} seconds`
		);

		const timer = setTimeout(() => {
			this.executeIndexing(documentId);
		}, delayMs);

		this.queue.set(documentId, {
			documentId,
			workspaceId,
			scheduledAt: new Date(),
			timer,
			retryCount,
		});
	}

	/**
	 * Cancel indexing for a document
	 * @param documentId - Document ID to cancel
	 */
	cancelIndexing(documentId: string): boolean {
		const queued = this.queue.get(documentId);

		if (queued) {
			clearTimeout(queued.timer);
			this.queue.delete(documentId);
			this.logger.log(`Cancelled indexing for document ${documentId}`);
			return true;
		}

		return false;
	}

	/**
	 * Get queue status
	 */
	getQueueStatus(): {
		size: number;
		documents: Array<{ documentId: string; scheduledAt: Date; retryCount: number }>;
	} {
		return {
			size: this.queue.size,
			documents: Array.from(this.queue.values()).map((item) => ({
				documentId: item.documentId,
				scheduledAt: item.scheduledAt,
				retryCount: item.retryCount,
			})),
		};
	}

	/**
	 * Clear all pending indexing operations (for cleanup)
	 */
	clearAll(): void {
		this.queue.forEach((item) => {
			clearTimeout(item.timer);
		});
		this.queue.clear();
		this.logger.log("Cleared all pending indexing operations");
	}
}
