import { Test, TestingModule } from "@nestjs/testing";
import { DocumentsService } from "./documents.service";
import { PrismaService } from "src/db/prisma.service";
import { Document, Workspace } from "@prisma/client";
import { UnauthorizedException } from "@nestjs/common";
import * as moment from "moment";
import { ShareRoleEnum } from "src/utils/constants/share-role";

describe("DocumentsService", () => {
	let documentsService: DocumentsService;
	let prismaService: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DocumentsService, PrismaService],
		}).compile();

		documentsService = module.get<DocumentsService>(DocumentsService);
		prismaService = module.get<PrismaService>(PrismaService);
	});

	afterEach(async () => {
		const deleteWorksapces = prismaService.workspace.deleteMany();
		const deleteDocuments = prismaService.document.deleteMany();
		const deleteDocumentSharingTokens = prismaService.documentSharingToken.deleteMany();

		await prismaService.$transaction([
			deleteWorksapces,
			deleteDocuments,
			deleteDocumentSharingTokens,
		]);
	});

	it("should be defined", async () => {
		prismaService;

		expect(documentsService).toBeDefined();
	});

	describe("findDocumentFromSharingToken", () => {
		let workspace: Workspace;
		let document: Document;

		beforeEach(async () => {
			workspace = await prismaService.workspace.create({
				data: {
					title: "test-workspace",
					slug: "test-workspace",
				},
			});
			document = await prismaService.document.create({
				data: {
					title: "test-document",
					workspaceId: workspace.id,
					yorkieDocumentId: "test-document",
				},
			});
		});

		it("should reject not existing sharing token", async () => {
			await expect(
				documentsService.findDocumentFromSharingToken("not-existing-tokens")
			).rejects.toThrow(UnauthorizedException);
		});

		it("should reject expired sharing token", async () => {
			const token = "test-tokens";
			await prismaService.documentSharingToken.create({
				data: {
					documentId: document.id,
					token,
					expiredAt: moment().subtract(30, "minutes").toDate(),
					role: ShareRoleEnum.READ,
				},
			});

			await expect(documentsService.findDocumentFromSharingToken(token)).rejects.toThrow(
				UnauthorizedException
			);
		});

		it.each([
			{
				role: ShareRoleEnum.READ,
			},
			{
				role: ShareRoleEnum.EDIT,
			},
		])("should provide document and role with valid sharing token", async ({ role }) => {
			const token = "test-tokens";
			await prismaService.documentSharingToken.create({
				data: {
					documentId: document.id,
					token,
					expiredAt: moment().add(30, "minutes").toDate(),
					role,
				},
			});
			const foundDocument = documentsService.findDocumentFromSharingToken(token);

			expect(foundDocument).toEqual({ ...document, role });
		});
	});
});
