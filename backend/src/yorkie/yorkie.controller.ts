import { Body, Controller, HttpCode, HttpStatus, Post, Get } from "@nestjs/common";
import { YorkieEventService } from "./yorkie-event.service";
import { DocumentEventDto } from "./dto/document-event.dto";
import { Public } from "src/utils/decorators/auth.decorator";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IndexingQueueService } from "src/rag/indexing/indexing-queue.service";

@ApiTags("Yorkie")
@Controller("yorkie")
export class YorkieController {
	constructor(
		private yorkieEventService: YorkieEventService,
		private indexingQueueService: IndexingQueueService
	) {}

	@Public()
	@Post("document-events")
	@ApiOperation({
		summary: "Handle Document Events from Yorkie Webhook",
		description:
			"Receives document change events from Yorkie and queues documents for RAG indexing",
	})
	@ApiBody({ type: DocumentEventDto })
	@ApiOkResponse({
		description: "Event processed successfully",
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean", example: true },
				message: { type: "string", example: "Event processed successfully" },
			},
		},
	})
	@HttpCode(HttpStatus.OK)
	async handleDocumentEvents(@Body() eventDto: DocumentEventDto) {
		await this.yorkieEventService.handleDocumentEvent(eventDto);

		return {
			success: true,
			message: "Event processed successfully",
		};
	}

	@Get("indexing-queue/status")
	@ApiOperation({
		summary: "Get Indexing Queue Status",
		description: "Returns the current status of the document indexing queue",
	})
	@ApiOkResponse({
		description: "Queue status retrieved successfully",
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean", example: true },
				data: {
					type: "object",
					properties: {
						size: { type: "number", example: 3 },
						documents: {
							type: "array",
							items: {
								type: "object",
								properties: {
									documentId: { type: "string" },
									scheduledAt: { type: "string", format: "date-time" },
									retryCount: { type: "number" },
								},
							},
						},
					},
				},
			},
		},
	})
	getIndexingQueueStatus() {
		const status = this.indexingQueueService.getQueueStatus();

		return {
			success: true,
			data: status,
		};
	}
}
