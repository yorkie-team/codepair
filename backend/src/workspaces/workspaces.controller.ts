import {
	Body,
	Controller,
	DefaultValuePipe,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
	Req,
} from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./dto/CreateWorkspace.dto";
import {
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiFoundResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { CreateWorkspaceResponse } from "./types/create-workspace-response.type";
import { FindWorkspaceResponse } from "./types/find-workspace-response.type";
import { HttpExceptionResponse } from "src/utils/types/http-exception-response.type";
import { FindWorkspacesResponse } from "./types/find-workspaces-response.type";
import { CreateInvitationTokenResponse } from "./types/create-inviation-token-response.type";

@ApiTags("Workspaces")
@ApiBearerAuth()
@Controller("workspaces")
export class WorkspacesController {
	constructor(private workspacesService: WorkspacesService) {}

	@Post()
	@ApiOperation({
		summary: "Create a Workspace",
		description: "Create a workspace with the title.",
	})
	@ApiBody({ type: CreateWorkspaceDto })
	@ApiCreatedResponse({ type: CreateWorkspaceResponse })
	async create(
		@Req() req: AuthroizedRequest,
		@Body() createWorkspaceDto: CreateWorkspaceDto
	): Promise<CreateWorkspaceResponse> {
		return this.workspacesService.create(req.user.id, createWorkspaceDto.title);
	}

	@Get(":id")
	@ApiOperation({
		summary: "Retrieve a Workspace",
		description: "If the user has the access permissions, return a workspace.",
	})
	@ApiFoundResponse({ type: FindWorkspaceResponse })
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description: "The workspace does not exist, or the user lacks the appropriate permissions.",
	})
	async findOne(
		@Req() req: AuthroizedRequest,
		@Param("id") workspaceId: string
	): Promise<FindWorkspaceResponse> {
		return this.workspacesService.findOne(req.user.id, workspaceId);
	}

	@Get("")
	@ApiOperation({
		summary: "Retrieve the Workspaces",
		description: "Return the user's workspaces. This API supports KeySet pagination.",
	})
	@ApiFoundResponse({ type: FindWorkspacesResponse })
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
		@Req() req: AuthroizedRequest,
		@Query("page_size", new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
		@Query("cursor", new DefaultValuePipe(undefined)) cursor?: string
	): Promise<FindWorkspacesResponse> {
		return this.workspacesService.findMany(req.user.id, pageSize, cursor);
	}

	@Post(":workspace_id/invite-token")
	@ApiOperation({
		summary: "Create a Invitation Token",
		description: "Create a inviation token using JWT.",
	})
	@ApiParam({
		name: "workspace_id",
		description: "ID of workspace to create invitation token",
	})
	@ApiOkResponse({
		type: CreateInvitationTokenResponse,
	})
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description: "The workspace does not exist, or the user lacks the appropriate permissions.",
	})
	async createInvitationToken(
		@Req() req: AuthroizedRequest,
		@Param("workspace_id") workspaceId: string
	): Promise<CreateInvitationTokenResponse> {
		return this.workspacesService.createInvitationToken(req.user.id, workspaceId);
	}
}
