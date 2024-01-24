import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { CheckNameConflicReponse } from "./types/check-name-conflict-response.type";
import slugify from "slugify";

@Injectable()
export class CheckService {
	constructor(private prismaService: PrismaService) {}

	async checkNameConflict(name: string): Promise<CheckNameConflicReponse> {
		const slug = slugify(name, { lower: true });
		const conflictUserList = await this.prismaService.user.findMany({
			where: {
				OR: [{ nickname: name }, { nickname: slug }],
			},
		});
		const conflictWorkspaceList = await this.prismaService.workspace.findMany({
			where: {
				OR: [{ title: name }, { title: slug }],
			},
		});

		return {
			conflict: Boolean(conflictUserList.length + conflictWorkspaceList.length),
		};
	}
}
