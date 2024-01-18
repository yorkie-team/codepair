import { Test, TestingModule } from "@nestjs/testing";
import { WorkspaceDocumentsService } from "./workspace-documents.service";

describe("WorkspaceDocumentsService", () => {
	let service: WorkspaceDocumentsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [WorkspaceDocumentsService],
		}).compile();

		service = module.get<WorkspaceDocumentsService>(WorkspaceDocumentsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
