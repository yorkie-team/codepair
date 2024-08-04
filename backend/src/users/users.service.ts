import { ConflictException, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { CheckService } from "src/check/check.service";
import { PrismaService } from "src/db/prisma.service";
import { WorkspaceRoleConstants } from "src/utils/constants/auth-role";
import { FindUserResponse } from "./types/find-user-response.type";

@Injectable()
export class UsersService {
	constructor(
		private prismaService: PrismaService,
		private checkService: CheckService
	) {}

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
			lastWorkspaceSlug: foundUserWorkspace?.workspace?.slug,
		};
	}

	async findOrCreate(socialProvider: string, socialUid: string): Promise<User | null> {
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
			},
		});

		return user;
	}

	async changeNickname(userId: string, nickname: string): Promise<void> {
		const { conflict } = await this.checkService.checkNameConflict(nickname);

		if (conflict) {
			throw new ConflictException("The nickname conflicts.");
		}

		await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				nickname,
			},
		});

		const userWorkspaceList = await this.prismaService.userWorkspace.findMany({
			select: {
				id: true,
			},
			where: {
				userId,
			},
		});

		const encodedText = encodeURI(nickname);

		if (!userWorkspaceList.length) {
			const { id: workspaceId } = await this.prismaService.workspace.create({
				select: {
					id: true,
				},
				data: {
					title: nickname,
					slug: encodedText,
				},
			});

			await this.prismaService.userWorkspace.create({
				data: {
					workspaceId,
					userId,
					role: WorkspaceRoleConstants.OWNER,
				},
			});
		}
	}
}
