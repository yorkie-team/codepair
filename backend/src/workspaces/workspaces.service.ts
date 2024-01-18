import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Workspace } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindWorkspacesResponse } from "./types/find-workspaces-response.type";

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

			return this.prismaService.workspace.findUniqueOrThrow({
				where: {
					id: workspaceId,
				},
			});
		} catch (e) {
			throw new NotFoundException();
		}
	}

	async findMany(
		userId: string,
		pageSize: number,
		cursor?: string
	): Promise<FindWorkspacesResponse> {
		const additionalOptions: Prisma.WorkspaceFindManyArgs = {};

		if (cursor) {
			additionalOptions.cursor = { id: cursor };
		}

		const workspaceList = await this.prismaService.workspace.findMany({
			take: pageSize + 1,
			where: {
				userWorkspaceList: {
					some: {
						userId: {
							equals: userId,
						},
					},
				},
			},
			orderBy: {
				id: "desc",
			},
			...additionalOptions,
		});

		return {
			workspaces: workspaceList.slice(0, pageSize),
			cursor: workspaceList.length > pageSize ? workspaceList[pageSize].id : null,
		};
	}
}
