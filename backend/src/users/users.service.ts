import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindUserResponse } from "./types/find-user-response.type";

@Injectable()
export class UsersService {
	constructor(private prismaService: PrismaService) {}

	async findOne(userId: string): Promise<FindUserResponse> {
		return await this.prismaService.user.findUnique({
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
	}

	async findOrCreate(
		socialProvider: string,
		socialUid: string,
		nickname: string
	): Promise<User | null> {
		return this.prismaService.user.upsert({
			where: {
				socialProvider,
				socialUid,
			},
			update: {},
			create: {
				socialProvider,
				socialUid,
				nickname,
			},
		});
	}
}
