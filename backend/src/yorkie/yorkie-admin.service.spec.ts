import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { YorkieAdminService } from "./yorkie-admin.service";

describe("YorkieAdminService", () => {
	let service: YorkieAdminService;
	let configService: ConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				YorkieAdminService,
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key: string) => {
							const config = {
								YORKIE_API_ADDR: "https://api.yorkie.dev",
								YORKIE_PROJECT_SECRET_KEY: "test-secret-key",
							};
							return config[key];
						}),
					},
				},
			],
		}).compile();

		service = module.get<YorkieAdminService>(YorkieAdminService);
		configService = module.get<ConfigService>(ConfigService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("extractContent", () => {
		it("should extract string content from root.content", () => {
			const yorkieDoc = {
				id: "test-id",
				key: "test-doc",
				root: JSON.stringify({ content: "Hello World" }),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				accessedAt: new Date().toISOString(),
			};

			const content = service.extractContent(yorkieDoc);
			expect(content).toBe("Hello World");
		});

		it("should extract content from array structure", () => {
			const yorkieDoc = {
				id: "test-id",
				key: "test-doc",
				root: JSON.stringify({
					content: [{ value: "Hello " }, { value: "World" }],
				}),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				accessedAt: new Date().toISOString(),
			};

			const content = service.extractContent(yorkieDoc);
			expect(content).toBe("Hello World");
		});

		it("should return empty string for document without root", () => {
			const yorkieDoc = {
				id: "test-id",
				key: "test-doc",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				accessedAt: new Date().toISOString(),
			};

			const content = service.extractContent(yorkieDoc);
			expect(content).toBe("");
		});

		it("should handle object root field", () => {
			const yorkieDoc = {
				id: "test-id",
				key: "test-doc",
				root: { content: "Direct object content" },
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				accessedAt: new Date().toISOString(),
			};

			const content = service.extractContent(yorkieDoc);
			expect(content).toBe("Direct object content");
		});
	});

	describe("getDocument", () => {
		it("should throw error when YORKIE_API_ADDR is not configured", async () => {
			jest.spyOn(configService, "get").mockReturnValue(undefined);

			await expect(service.getDocument("test-doc")).rejects.toThrow(
				"YORKIE_API_ADDR or YORKIE_PROJECT_SECRET_KEY not configured"
			);
		});
	});
});
