import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { CheckNameConflicReponse } from "./types/check-name-conflict-response.type";

@Injectable()
export class CheckService {
	constructor(private prismaService: PrismaService) {}

	async checkNameConflict(name: string): Promise<CheckNameConflicReponse> {
		const conflictUserList = await this.prismaService.user.findMany({
			where: {
				nickname: name,
			},
		});
		const conflictWorkspaceList = await this.prismaService.workspace.findMany({
			where: {
				title: name,
			},
		});

		return {
			conflict: Boolean(conflictUserList.length + conflictWorkspaceList.length),
		};
	}
}
