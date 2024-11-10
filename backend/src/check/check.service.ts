import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
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
		const [type, token] = checkYorkieDto.token.split(":");

		// In `ActivateClient`, `DeactivateClient` methods, the `checkYorkieDto.attributes` is empty.
		if (
			[YorkieMethod.ActivateClient, YorkieMethod.DeactivateClient].includes(
				checkYorkieDto.method
			)
		) {
			return {
				allowed: true,
				reason: `Pass ${checkYorkieDto.method} method`,
			};
		}

		const { key: yorkieDocumentId } = checkYorkieDto.attributes?.[0];
		if (type == "default") {
			await this.checkDefaultAccessToken(yorkieDocumentId, token);
		} else if (type == "share") {
			await this.checkSharingAccessToken(yorkieDocumentId, token);
		} else {
			throw new ForbiddenException({ allowed: false, reason: "Invalid token type" });
		}

		return {
			allowed: true,
			reason: "Valid token",
		};
	}

	private async checkDefaultAccessToken(
		yorkieDocumentId: string,
		accessToken: string
	): Promise<string> {
		let sub = "";
		try {
			sub = this.jwtService.verify<JwtPayload>(accessToken).sub;
		} catch {
			throw new UnauthorizedException({
				allowed: false,
				reason: "Token is expired or invalid",
			});
		}

		const document = await this.prismaService.document.findFirst({
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

		if (!document) {
			throw new ForbiddenException({
				allowed: false,
				reason: "User does not have access to the document",
			});
		}

		return sub;
	}

	private async checkSharingAccessToken(yorkieDocumentId: string, accessToken: string) {
		const documentSharingToken = await this.prismaService.documentSharingToken.findFirst({
			where: {
				token: accessToken,
				document: {
					yorkieDocumentId,
				},
			},
		});

		if (!documentSharingToken) {
			throw new ForbiddenException({ allowed: false, reason: "Sharing token is invalid" });
		}

		if (documentSharingToken?.expiredAt && moment().isAfter(documentSharingToken?.expiredAt)) {
			throw new ForbiddenException({ allowed: false, reason: "Sharing token is expired" });
		}
	}
}
