import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkspaceDto {
	@ApiProperty({ description: "Title of project to create", type: String })
	title: string;
}
