import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, ArrayNotEmpty, ArrayUnique } from "class-validator";

export class SetWorkspaceOrderDto {
	@ApiProperty({ type: [String], description: "Ordered list of workspace IDs" })
	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique()
	@IsString({ each: true })
	workspaceIds: string[];
}
