import { ApiProperty } from "@nestjs/swagger";
import { WorkspaceUserDomain } from "./workspace-user.domain";

export class FindWorkspaceUsersResponse {
	@ApiProperty({ type: [WorkspaceUserDomain], description: "List of found workspace users" })
	workspaceUsers: Array<WorkspaceUserDomain>;

	@ApiProperty({ type: String, description: "The ID of last workspace user" })
	cursor: string | null;

	@ApiProperty({ type: Number, description: "The number of total workspace users" })
	totalLength: number;
}
