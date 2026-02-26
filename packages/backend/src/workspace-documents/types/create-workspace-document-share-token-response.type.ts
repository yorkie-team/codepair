import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkspaceDocumentShareTokenResponse {
	@ApiProperty({
		type: String,
		description: "Sharing token",
	})
	sharingToken: string;
}
