import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as moment from "moment";
import { PrismaService } from "src/db/prisma.service";
import { JwtPayload } from "src/utils/types/jwt.type";
import { CheckYorkieDto, YorkieMethod } from "./dto/check-yorkie.dto";
import { CheckNameConflicReponse } from "./types/check-name-conflict-response.type";
import { CheckYorkieResponse } from "./types/check-yorkie-response.type";

@Injectable()
export class CheckService {
	constructor(
		private prismaService: PrismaService,
		private jwtService: JwtService
	) {}

	async checkNameConflict(name: string): Promise<CheckNameConflicReponse> {
		const encodedText = encodeURI(name);
		const conflictUserList = await this.prismaService.user.findMany({
			where: {
				OR: [{ nickname: name }, { nickname: encodedText }],
			},
		});
		const conflictWorkspaceList = await this.prismaService.workspace.findMany({
			where: {
				OR: [{ title: name }, { title: encodedText }],
			},
		});

		return {
			conflict: Boolean(conflictUserList.length + conflictWorkspaceList.length),
		};
	}

	async checkYorkie(checkYorkieDto: CheckYorkieDto): Promise<CheckYorkieResponse> {
		let reason = "";
		let allowed = false;
		const [type, token] = checkYorkieDto.token.split(":");

		if (
			[YorkieMethod.ActivateClient, YorkieMethod.DeactivateClient].includes(
				checkYorkieDto.method
			)
		) {
			allowed = true;
			reason = `Pass ${checkYorkieDto.method}`;
		} else {
			const { key: yorkieDocumentId } = checkYorkieDto.attributes?.[0];
			if (type === "default") {
				const { sub } = this.jwtService.verify<JwtPayload>(token);

				const res = await this.prismaService.document.findFirst({
					select: {
						id: true,
					},
					where: {
						yorkieDocumentId,
						workspace: {
							userWorkspaceList: {
								every: {
									userId: sub,
								},
							},
						},
					},
				});

				allowed = Boolean(res);
			} else if (type === "share") {
				const documentSharingToken =
					await this.prismaService.documentSharingToken.findFirst({
						where: {
							token,
							document: {
								yorkieDocumentId,
							},
						},
					});

				allowed = Boolean(documentSharingToken);

				if (
					documentSharingToken?.expiredAt &&
					moment().isAfter(documentSharingToken?.expiredAt)
				) {
					allowed = false;
				}
			}
		}

		return {
			allowed,
			reason,
		};
	}
}
