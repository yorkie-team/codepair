import { ApiProperty } from "@nestjs/swagger";
import { MinLength } from "class-validator";

export class UpdateWorkspaceTitleDto {
	@ApiProperty({
		description: "New title of the workspace",
		type: String,
		minLength: 2,
		maxLength: 120,
	})
	@MinLength(2)
	title: string;
}
