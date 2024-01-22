import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindUserResponse } from "./types/find-user-response.type";
import { WorkspaceRoleConstants } from "src/utils/constants/auth-role";
import slugify from "slugify";

@Injectable()
export class UsersService {
	constructor(private prismaService: PrismaService) {}

	async findOne(userId: string): Promise<FindUserResponse> {
		const foundUserWorkspace = await this.prismaService.userWorkspace.findFirst({
			select: {
				workspace: {
					select: {
						slug: true,
					},
				},
			},
			where: {
				userId,
			},
			orderBy: {
				id: "desc",
			},
		});

		const foundUser = await this.prismaService.user.findUnique({
			select: {
				id: true,
				nickname: true,
				createdAt: true,
				updatedAt: true,
			},
			where: {
				id: userId,
			},
		});

		return {
			...foundUser,
			lastWorkspaceSlug: foundUserWorkspace.workspace.slug,
		};
	}

	async findOrCreate(
		socialProvider: string,
		socialUid: string,
		nickname: string
	): Promise<User | null> {
		const foundUser = await this.prismaService.user.findFirst({
			where: {
				socialProvider,
				socialUid,
			},
		});

		if (foundUser) {
			return foundUser;
		}

		const user = await this.prismaService.user.create({
			data: {
				socialProvider,
				socialUid,
				nickname,
			},
		});

		const title = `${user.nickname}'s Workspace`;
		let slug = slugify(title);

		const duplicatedWorkspaceList = await this.prismaService.workspace.findMany({
			where: {
				slug: {
					startsWith: slug,
				},
			},
		});

		if (duplicatedWorkspaceList.length) {
			slug += `-${duplicatedWorkspaceList.length + 1}`;
		}

		const workspace = await this.prismaService.workspace.create({
			data: {
				title,
				slug,
			},
		});

		await this.prismaService.userWorkspace.create({
			data: {
				userId: user.id,
				workspaceId: workspace.id,
				role: WorkspaceRoleConstants.OWNER,
			},
		});

		return user;
	}
}
