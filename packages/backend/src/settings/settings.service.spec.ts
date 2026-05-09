import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
	let service: SettingsService;
	let configService: {
		get: jest.Mock;
	};

	beforeEach(async () => {
		configService = {
			get: jest.fn((key: string) => {
				const config: Record<string, string> = {
					YORKIE_INTELLIGENCE: "true",
					YORKIE_DOCUMENT_SYNC: "true",
					FILE_UPLOAD: "s3",
				};

				return config[key];
			}),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SettingsService,
				{
					provide: ConfigService,
					useValue: configService,
				},
			],
		}).compile();

		service = module.get<SettingsService>(SettingsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should expose document sync settings", async () => {
		await expect(service.getSettings()).resolves.toMatchObject({
			yorkieIntelligence: {
				enable: true,
			},
			documentSync: {
				enable: true,
			},
			fileUpload: {
				enable: true,
			},
		});
	});

	it("should disable document sync when YORKIE_DOCUMENT_SYNC is not set", async () => {
		configService.get.mockImplementation((key: string) => {
			const config: Record<string, string> = {
				YORKIE_INTELLIGENCE: "true",
				FILE_UPLOAD: "s3",
			};

			return config[key];
		});

		await expect(service.getSettings()).resolves.toMatchObject({
			documentSync: {
				enable: false,
			},
		});
	});
});
