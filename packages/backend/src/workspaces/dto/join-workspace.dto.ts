import { ApiProperty } from "@nestjs/swagger";

export class JoinWorkspaceDto {
	@ApiProperty({ description: "Invitation token of workspace to join", type: String })
	invitationToken: string;
}
