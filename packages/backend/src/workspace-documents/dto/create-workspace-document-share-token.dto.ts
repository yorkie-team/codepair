import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ShareRoleEnum } from "src/utils/constants/share-role";

export class CreateWorkspaceDocumentShareTokenDto {
	@ApiProperty({ enum: ShareRoleEnum, description: "Role to share" })
	role: ShareRoleEnum;

	@ApiProperty({ type: Date, description: "Share link expiration date" })
	@Type(() => Date)
	expiredAt: Date;
}
