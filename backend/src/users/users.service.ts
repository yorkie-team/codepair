import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindUserResponse } from "./types/find-user-response.type";

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
}
