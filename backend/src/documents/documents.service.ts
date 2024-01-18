import { Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Document } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { SharingPayload } from "src/utils/types/sharing.type";

@Injectable()
export class DocumentsService {
	constructor(
		private prismaService: PrismaService,
		private jwtService: JwtService
	) {}

	async findDocumentFromSharingToken(sharingToken: string) {
		const { documentId, role } = this.jwtService.verify<SharingPayload>(sharingToken);

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
