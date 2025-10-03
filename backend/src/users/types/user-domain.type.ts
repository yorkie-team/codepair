import { ApiProperty } from "@nestjs/swagger";

export class UserDomain {
	@ApiProperty({ type: String, description: "ID of user" })
	id: string;
	@ApiProperty({ type: String, description: "Nickname of user", required: false })
	nickname?: string;
	@ApiProperty({ type: Date, description: "Created date of user" })
	createdAt: Date;
	@ApiProperty({ type: Date, description: "Updated date of user" })
	updatedAt: Date;
}
