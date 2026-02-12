import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateInvitationTokenDto {
	@ApiProperty({ description: "Expiration date of invitation token", type: Date })
	@Type(() => Date)
	expiredAt: Date;
}
