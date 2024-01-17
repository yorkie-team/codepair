import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";

@Injectable()
export class UsersService {
	constructor(private prismaService: PrismaService) {}

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
