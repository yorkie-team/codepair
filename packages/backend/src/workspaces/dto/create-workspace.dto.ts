import { ApiProperty } from "@nestjs/swagger";
import { Length } from "class-validator";

export class CreateWorkspaceDto {
	@ApiProperty({
		description: "Title of project to create",
		type: String,
		minLength: 2,
		maxLength: 120,
	})
	@Length(2, 120)
	title: string;
}
