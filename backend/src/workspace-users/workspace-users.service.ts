import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindWorkspaceUsersResponse } from "./types/find-workspace-users-response.type";

@Injectable()
export class WorkspaceUsersService {
	constructor(private prismaService: PrismaService) {}

	async findMany(
		userId: string,
		workspaceId: string,
		pageSize: number,
		cursor?: string
	): Promise<FindWorkspaceUsersResponse> {
		try {
			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId,
				},
			});
		} catch (e) {
			throw new NotFoundException(
				"The workspace does not exist, or the user lacks the appropriate permissions."
			);
		}

		const additionalOptions: Prisma.UserFindManyArgs = {};

		if (cursor) {
			additionalOptions.cursor = { id: cursor };
		}

		const workspaceUserList = await this.prismaService.user.findMany({
			take: pageSize + 1,
			select: {
				id: true,
				nickname: true,
				updatedAt: true,
				createdAt: true,
			},
			where: {
				userWorkspaceList: {
					some: {
						workspaceId: {
							equals: workspaceId,
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
			workspaceUsers: workspaceUserList.slice(0, pageSize),
			cursor: workspaceUserList.length > pageSize ? workspaceUserList[pageSize].id : null,
		};
	}
}
