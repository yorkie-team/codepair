import { ApiProperty } from "@nestjs/swagger";
import { WorkspaceDomain } from "./workspace-domain.type";

export class DeleteWorkspaceResponse {
	@ApiProperty({ type: WorkspaceDomain, description: "Delete of found workspace" })
	deleteWorkspace: WorkspaceDomain;
	@ApiProperty({ type: String, description: "Last worksace slug of user", required: false })
	lastWorkspaceSlug?: string;
}
