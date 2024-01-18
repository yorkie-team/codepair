import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Document } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { SharingPayload } from "src/utils/types/sharing.type";
import { FindDocumentFromSharingTokenResponse } from "./types/find-document-from-sharing-token-response.type";
import { ShareRoleEnum } from "src/utils/constants/share-role";

@Injectable()
export class DocumentsService {
	constructor(
		private prismaService: PrismaService,
		private jwtService: JwtService
	) {}

	async findDocumentFromSharingToken(
		sharingToken: string
	): Promise<FindDocumentFromSharingTokenResponse> {
		let documentId: string, role: ShareRoleEnum;

		try {
			const payload = this.jwtService.verify<SharingPayload>(sharingToken);
			documentId = payload.documentId;
			role = payload.role;
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
