import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateLastWorkspaceSlugDto {
	@ApiProperty({ type: String, description: "Workspace slug to set as last accessed" })
	@IsString()
	workspaceSlug: string;
}
