import { Injectable, NotFoundException } from "@nestjs/common";
import { Document, Prisma } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindWorkspaceDocumentsResponse } from "./types/find-workspace-documents-response.type";
import { JwtService } from "@nestjs/jwt";
import { CreateWorkspaceDocumentShareTokenResponse } from "./types/create-workspace-document-share-token-response.type";
import { ShareRole } from "src/utils/types/share-role.type";
import slugify from "slugify";

@Injectable()
export class WorkspaceDocumentsService {
	constructor(
		private prismaService: PrismaService,
		private jwtService: JwtService
	) {}

	async create(userId: string, workspaceId: string, title: string) {
		try {
			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId,
				},
			});
		} catch (e) {
			throw new NotFoundException();
		}

		let slug = slugify(title);

		const duplicatedDocumentList = await this.prismaService.document.findMany({
			where: {
				slug,
			},
		});

		if (duplicatedDocumentList.length) {
			slug += `-${duplicatedDocumentList.length + 1}`;
		}

		return this.prismaService.document.create({
			data: {
				title,
				slug,
				workspaceId,
				yorkieDocumentId: Math.random().toString(36).substring(7),
			},
		});
	}

	async findOne(userId: string, workspaceId: string, documentId: string) {
		try {
			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId,
				},
			});

			return this.prismaService.document.findUniqueOrThrow({
				where: {
					id: documentId,
				},
			});
		} catch (e) {
			throw new NotFoundException();
		}
	}

	async findMany(
		userId: string,
		workspaceId: string,
		pageSize: number,
		cursor?: string
	): Promise<FindWorkspaceDocumentsResponse> {
		try {
			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId,
				},
			});
		} catch (e) {
			throw new NotFoundException();
		}

		const additionalOptions: Prisma.DocumentFindManyArgs = {};

		if (cursor) {
			additionalOptions.cursor = { id: cursor };
		}

		const documentList = await this.prismaService.document.findMany({
			take: pageSize + 1,
			where: {
				workspaceId,
			},
			orderBy: {
				id: "desc",
			},
			...additionalOptions,
		});

		return {
			documents: documentList.slice(0, pageSize),
			cursor: documentList.length > pageSize ? documentList[pageSize].id : null,
		};
	}

	async createSharingToken(
		userId: string,
		workspaceId: string,
		documentId: string,
		role: ShareRole,
		expirationDate: Date
	): Promise<CreateWorkspaceDocumentShareTokenResponse> {
		let document: Document;

		try {
			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId,
				},
			});

			document = await this.prismaService.document.findUniqueOrThrow({
				where: {
					id: documentId,
					workspaceId,
				},
			});
		} catch (e) {
			throw new NotFoundException();
		}

		const sharingToken = this.jwtService.sign(
			{
				documentId: document.id,
				role,
			},
			{
				expiresIn: expirationDate.getTime() - Date.now(),
			}
		);

		return {
			sharingToken,
		};
	}
}
