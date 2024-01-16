import { Injectable } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
	constructor(private prismaService: PrismaService) {}

	async findOrCreateUser(idToken: string, nickname: string): Promise<User | null> {
		const socialUid = idToken;
		return this.prismaService.user.upsert({
			where: {
				socialUid,
			},
			update: {},
			create: {
				socialUid,
				nickname,
			},
		});
	}
}
