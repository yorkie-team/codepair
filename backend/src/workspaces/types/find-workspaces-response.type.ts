import { ApiProperty } from "@nestjs/swagger";
import { WorkspaceDomain } from "./workspace-domain.type";

export class FindWorkspacesResponse {
	@ApiProperty({ type: [WorkspaceDomain], description: "List of found workspaces" })
	workspaces: Array<WorkspaceDomain>;

	@ApiProperty({ type: String, description: "The ID of last workspace" })
	cursor: string | null;
}
