import { ApiProperty } from "@nestjs/swagger";
import { MinLength } from "class-validator";

export class CreateWorkspaceDto {
	@ApiProperty({ description: "Title of project to create", type: String, minLength: 2 })
	@MinLength(2)
	title: string;
}
