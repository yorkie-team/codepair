import { ApiProperty } from "@nestjs/swagger";

export class WorkspaceUserDomain {
	@ApiProperty({ type: String, description: "ID of the user" })
	id: string;
	@ApiProperty({ type: String, description: "Nickname of the user" })
	nickname: string;
	@ApiProperty({ type: String, description: "Profile icon of the user", required: false })
	profileIcon?: string;
	@ApiProperty({ type: Date, description: "Created date of the user" })
	createdAt: Date;
	@ApiProperty({ type: Date, description: "Updated date of the user" })
	updatedAt: Date;
}
