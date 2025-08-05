import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, ArrayNotEmpty } from "class-validator";

export class ReorderWorkspacesDto {
	@ApiProperty({ type: [String], description: "Ordered list of workspace IDs" })
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	workspaceIds: string[];
}
