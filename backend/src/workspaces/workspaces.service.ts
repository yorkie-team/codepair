import { Injectable, NotFoundException } from "@nestjs/common";
import { Workspace } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";

@Injectable()
export class WorkspacesService {
	constructor(private prismaService: PrismaService) {}

	async create(userId: string, title: string): Promise<Workspace> {
		const workspace = await this.prismaService.workspace.create({
			data: {
				title,
			},
		});

		await this.prismaService.userWorkspace.create({
			data: {
				workspaceId: workspace.id,
				userId,
				role: "OWNER",
			},
		});

		return workspace;
	}

	async findOne(userId: string, workspaceId: string) {
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

		return this.prismaService.workspace.findUnique({
			where: {
				id: workspaceId,
			},
		});
	}
}
