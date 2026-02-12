import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, Req } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiFoundResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";
import { FindWorkspaceUsersResponse } from "./types/find-workspace-users-response.type";
import { AuthorizedRequest } from "src/utils/types/req.type";
import { WorkspaceUsersService } from "./workspace-users.service";
import { HttpExceptionResponse } from "src/utils/types/http-exception-response.type";

@ApiTags("Workspace.Users")
@ApiBearerAuth()
@Controller("workspaces/:workspace_id/users")
export class WorkspaceUsersController {
	constructor(private workspaceUsersService: WorkspaceUsersService) {}

	@Get("")
	@ApiOperation({
		summary: "Retrieve the Users in Workspace",
		description: "Return the users in the workspace. This API supports KeySet pagination.",
	})
	@ApiFoundResponse({ type: FindWorkspaceUsersResponse })
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description: "The workspace does not exist, or the user lacks the appropriate permissions.",
	})
	@ApiQuery({
		name: "page_size",
		type: Number,
		description: "Page size to fetch (Default to 10)",
		required: false,
	})
	@ApiQuery({
		name: "cursor",
		type: String,
		description:
			"API returns a limited set of results after a given cursor. If no value is provided, it returns the first page.",
		required: false,
	})
	async findMany(
		@Req() req: AuthorizedRequest,
		@Param("workspace_id") workspaceId: string,
		@Query("page_size", new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
		@Query("cursor", new DefaultValuePipe(undefined)) cursor?: string
	): Promise<FindWorkspaceUsersResponse> {
		return this.workspaceUsersService.findMany(req.user.id, workspaceId, pageSize, cursor);
	}
}
