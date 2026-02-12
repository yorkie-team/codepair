import { ApiProperty } from "@nestjs/swagger";
import { Length } from "class-validator";

export class UpdateWorkspaceTitleDto {
	@ApiProperty({
		description: "New title of the workspace",
		type: String,
		minLength: 2,
		maxLength: 120,
	})
	@Length(2, 120)
	title: string;
}
