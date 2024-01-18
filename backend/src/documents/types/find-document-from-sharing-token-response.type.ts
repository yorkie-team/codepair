import { ShareRoleEnum } from "src/utils/constants/share-role";
import { DocumentDomain } from "./document-domain.type";
import { ApiProperty } from "@nestjs/swagger";

export class FindDocumentFromSharingTokenResponse extends DocumentDomain {
	@ApiProperty({ enum: ShareRoleEnum, description: "Role of share token" })
	role: ShareRoleEnum;
}
