import { ApiProperty } from "@nestjs/swagger";

export class WorkspaceDomain {
	@ApiProperty({ type: String, description: "ID of the workspace" })
	id: string;
	@ApiProperty({ type: String, description: "Title of the workspace" })
	title: string;
	@ApiProperty({ type: String, description: "Slug of the workspace" })
	slug: string;
	@ApiProperty({ type: Date, description: "Created date of the workspace" })
	createdAt: Date;
	@ApiProperty({ type: Date, description: "Updated date of the workspace" })
	updatedAt: Date;
}
