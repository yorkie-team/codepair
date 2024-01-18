import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";

@Injectable()
export class WorkspaceDocumentsService {
	constructor(private prismaService: PrismaService) {}

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

		return this.prismaService.document.create({
			data: {
				title,
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
}
