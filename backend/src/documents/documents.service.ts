import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Document } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindDocumentFromSharingTokenResponse } from "./types/find-document-from-sharing-token-response.type";
import { ShareRoleEnum } from "src/utils/constants/share-role";

@Injectable()
export class DocumentsService {
	constructor(private prismaService: PrismaService) {}

	async findDocumentFromSharingToken(
		sharingToken: string
	): Promise<FindDocumentFromSharingTokenResponse> {
		let documentId: string, role: ShareRoleEnum;

		try {
			const documentSharingToken =
				await this.prismaService.documentSharingToken.findFirstOrThrow({
					where: {
						token: sharingToken,
					},
				});
			documentId = documentSharingToken.documentId;
			role = documentSharingToken.role as ShareRoleEnum;
		} catch (e) {
			throw new UnauthorizedException("Invalid sharing token");
		}

		let document: Document;

		try {
			document = await this.prismaService.document.findUniqueOrThrow({
				where: {
					id: documentId,
				},
			});
		} catch (e) {
			throw new NotFoundException();
		}

		return {
			...document,
			role,
		};
	}
}
