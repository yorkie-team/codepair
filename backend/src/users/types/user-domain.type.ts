import { ApiProperty } from "@nestjs/swagger";

export class UserDomain {
	@ApiProperty({ type: String, description: "ID of user" })
	id: string;
	@ApiProperty({ type: String, description: "Nickname of user" })
	nickname: string;
	@ApiProperty({ type: String, description: "Last worksace slug of user" })
	lastWorkspaceSlug: string;
	@ApiProperty({ type: Date, description: "Created date of user" })
	createdAt: Date;
	@ApiProperty({ type: Date, description: "Updated date of user" })
	updatedAt: Date;
}
