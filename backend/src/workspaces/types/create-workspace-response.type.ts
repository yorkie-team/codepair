import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkspaceResponse {
	@ApiProperty({ type: String, description: "ID of new workspace" })
	id: string;
	@ApiProperty({ type: String, description: "Title of new workspace" })
	title: string;
	@ApiProperty({ type: Date, description: "Created date of new workspace" })
	createdAt: Date;
	@ApiProperty({ type: Date, description: "Updated date of new workspace" })
	updatedAt: Date;
}
