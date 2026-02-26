import { ApiProperty } from "@nestjs/swagger";

export class CreateInvitationTokenResponse {
	@ApiProperty({ type: String, description: "Token for invitation" })
	invitationToken: string;
}
