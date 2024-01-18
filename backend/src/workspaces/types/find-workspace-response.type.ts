import { ApiProperty } from "@nestjs/swagger";

export class FindWorkspaceResponse {
	@ApiProperty({ type: String, description: "ID of found workspace" })
	id: string;
	@ApiProperty({ type: String, description: "Title of found workspace" })
	title: string;
	@ApiProperty({ type: Date, description: "Created date of found workspace" })
	createdAt: Date;
	@ApiProperty({ type: Date, description: "Updated date of found workspace" })
	updatedAt: Date;
}
