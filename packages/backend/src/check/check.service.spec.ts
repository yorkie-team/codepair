import { ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/db/prisma.service";
import { CheckService } from "./check.service";
import { CheckYorkieDto, Verb, YorkieMethod } from "./dto/check-yorkie.dto";

describe("CheckService", () => {
	let service: CheckService;

	const prismaService = {
		document: { findFirst: jest.fn() },
		documentSharingToken: { findFirst: jest.fn() },
	};
	const jwtService = { verify: jest.fn() };

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CheckService,
				{ provide: PrismaService, useValue: prismaService },
				{ provide: JwtService, useValue: jwtService },
			],
		}).compile();

		service = module.get<CheckService>(CheckService);
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("checkYorkie", () => {
		// Yorkie's unified `Watch` RPC verifies access before subscribing to any
		// resource, so it carries no document attribute. It must pass through
		// instead of crashing while reading a document key.
		it.each([YorkieMethod.ActivateClient, YorkieMethod.DeactivateClient, YorkieMethod.Watch])(
			"passes through %s without a document attribute",
			async (method) => {
				const dto: CheckYorkieDto = {
					token: "default:token",
					method,
					attributes: [],
				};

				await expect(service.checkYorkie(dto)).resolves.toEqual({
					allowed: true,
					reason: `Pass ${method} method`,
				});
			}
		);

		it("rejects a document-scoped method without an attribute instead of throwing", async () => {
			const dto: CheckYorkieDto = {
				token: "default:token",
				method: YorkieMethod.AttachDocument,
				attributes: [],
			};

			await expect(service.checkYorkie(dto)).rejects.toBeInstanceOf(ForbiddenException);
		});

		it("does not crash when the token is missing", async () => {
			const dto = {
				method: YorkieMethod.AttachDocument,
				attributes: [{ key: "doc-1", verb: Verb.rw }],
			} as unknown as CheckYorkieDto;

			await expect(service.checkYorkie(dto)).rejects.toBeInstanceOf(ForbiddenException);
		});

		it("allows a default token that owns the document", async () => {
			jwtService.verify.mockReturnValue({ sub: "user-1" });
			prismaService.document.findFirst.mockResolvedValue({ id: "doc-object-id" });

			const dto: CheckYorkieDto = {
				token: "default:jwt",
				method: YorkieMethod.AttachDocument,
				attributes: [{ key: "doc-1", verb: Verb.rw }],
			};

			await expect(service.checkYorkie(dto)).resolves.toEqual({
				allowed: true,
				reason: "Valid token",
			});
		});
	});
});
