import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/db/prisma.service";
import { IndexingQueueService } from "src/rag/indexing/indexing-queue.service";
import { QdrantService } from "src/rag/qdrant/qdrant.service";
import { DocumentEventType } from "./dto/document-event.dto";
import { YorkieEventService } from "./yorkie-event.service";

describe("YorkieEventService", () => {
	let service: YorkieEventService;
	let prismaService: {
		document: {
			findFirst: jest.Mock;
			update: jest.Mock;
		};
	};
	let indexingQueueService: {
		scheduleIndexing: jest.Mock;
	};
	let qdrantService: {
		getDocumentPoints: jest.Mock;
	};
	let configService: {
		get: jest.Mock;
	};

	beforeEach(async () => {
		prismaService = {
			document: {
				findFirst: jest.fn(),
				update: jest.fn(),
			},
		};
		indexingQueueService = {
			scheduleIndexing: jest.fn(),
		};
		qdrantService = {
			getDocumentPoints: jest.fn(),
		};
		configService = {
			get: jest.fn((key: string) => {
				if (key === "YORKIE_DOCUMENT_SYNC") {
					return "true";
				}

				return undefined;
			}),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				YorkieEventService,
				{
					provide: PrismaService,
					useValue: prismaService,
				},
				{
					provide: IndexingQueueService,
					useValue: indexingQueueService,
				},
				{
					provide: QdrantService,
					useValue: qdrantService,
				},
				{
					provide: ConfigService,
					useValue: configService,
				},
			],
		}).compile();

		service = module.get<YorkieEventService>(YorkieEventService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should skip webhook processing when document sync is disabled", async () => {
		configService.get.mockImplementation((key: string) => {
			if (key === "YORKIE_DOCUMENT_SYNC") {
				return "false";
			}

			return undefined;
		});

		await service.handleDocumentEvent({
			type: DocumentEventType.DocumentRootChanged,
			attributes: {
				key: "doc-key",
				issuedAt: "2026-01-20T12:00:00.000Z",
			},
		});

		expect(prismaService.document.findFirst).not.toHaveBeenCalled();
		expect(prismaService.document.update).not.toHaveBeenCalled();
		expect(indexingQueueService.scheduleIndexing).not.toHaveBeenCalled();
	});

	it("should sync updatedAt and queue indexing when document sync is enabled", async () => {
		const updatedAt = new Date("2026-01-20T11:00:00.000Z");
		prismaService.document.findFirst.mockResolvedValue({
			id: "document-id",
			workspaceId: "workspace-id",
			yorkieDocumentId: "doc-key",
			updatedAt,
		});
		prismaService.document.update.mockResolvedValue({});
		qdrantService.getDocumentPoints.mockResolvedValue([]);

		await service.handleDocumentEvent({
			type: DocumentEventType.DocumentRootChanged,
			attributes: {
				key: "doc-key",
				issuedAt: "2026-01-20T12:00:00.000Z",
			},
		});

		expect(prismaService.document.findFirst).toHaveBeenCalledWith({
			where: {
				yorkieDocumentId: "doc-key",
			},
			select: {
				id: true,
				workspaceId: true,
				yorkieDocumentId: true,
				updatedAt: true,
			},
		});
		expect(prismaService.document.update).toHaveBeenCalledWith({
			where: {
				id: "document-id",
			},
			data: {
				updatedAt: new Date("2026-01-20T12:00:00.000Z"),
			},
		});
		expect(indexingQueueService.scheduleIndexing).toHaveBeenCalledWith(
			"document-id",
			"workspace-id",
			30000
		);
	});

	it("should not move updatedAt backwards for out-of-order webhook events", async () => {
		const updatedAt = new Date("2026-01-20T12:00:00.000Z");
		prismaService.document.findFirst.mockResolvedValue({
			id: "document-id",
			workspaceId: "workspace-id",
			yorkieDocumentId: "doc-key",
			updatedAt,
		});
		prismaService.document.update.mockResolvedValue({});
		qdrantService.getDocumentPoints.mockResolvedValue([]);

		await service.handleDocumentEvent({
			type: DocumentEventType.DocumentRootChanged,
			attributes: {
				key: "doc-key",
				issuedAt: "2026-01-20T11:00:00.000Z",
			},
		});

		expect(prismaService.document.update).not.toHaveBeenCalled();
		expect(indexingQueueService.scheduleIndexing).not.toHaveBeenCalled();
	});

	it("should keep updatedAt unchanged for invalid webhook timestamps", async () => {
		const updatedAt = new Date("2026-01-20T12:00:00.000Z");
		prismaService.document.findFirst.mockResolvedValue({
			id: "document-id",
			workspaceId: "workspace-id",
			yorkieDocumentId: "doc-key",
			updatedAt,
		});

		await service.handleDocumentEvent({
			type: DocumentEventType.DocumentRootChanged,
			attributes: {
				key: "doc-key",
				issuedAt: "not-a-date",
			},
		});

		expect(prismaService.document.update).not.toHaveBeenCalled();
		expect(indexingQueueService.scheduleIndexing).not.toHaveBeenCalled();
	});

	it("should skip indexing when the Yorkie document does not map to a CodePair document", async () => {
		prismaService.document.findFirst.mockResolvedValue(null);

		await service.handleDocumentEvent({
			type: DocumentEventType.DocumentRootChanged,
			attributes: {
				key: "missing-doc-key",
				issuedAt: "2026-01-20T12:00:00.000Z",
			},
		});

		expect(prismaService.document.update).not.toHaveBeenCalled();
		expect(indexingQueueService.scheduleIndexing).not.toHaveBeenCalled();
	});
});
