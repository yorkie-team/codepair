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
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { HttpExceptionResponse } from "src/utils/types/http-exception-response.type";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { CreateInvitationTokenDto } from "./dto/create-invitation-token.dto";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { JoinWorkspaceDto } from "./dto/join-workspace.dto";
import { CreateInvitationTokenResponse } from "./types/create-inviation-token-response.type";
import { CreateWorkspaceResponse } from "./types/create-workspace-response.type";
import { FindWorkspaceResponse } from "./types/find-workspace-response.type";
import { FindWorkspacesResponse } from "./types/find-workspaces-response.type";
import { JoinWorkspaceResponse } from "./types/join-workspace-response.type";
import { WorkspacesService } from "./workspaces.service";

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

	@Get(":workspace_slug")
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
		@Param("workspace_slug") workspaceSlug: string
	): Promise<FindWorkspaceResponse> {
		return this.workspacesService.findOneBySlug(req.user.id, encodeURI(workspaceSlug));
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
		@Param("workspace_id") workspaceId: string,
		@Body() createInvitationTokenDto: CreateInvitationTokenDto
	): Promise<CreateInvitationTokenResponse> {
		return this.workspacesService.createInvitationToken(
			req.user.id,
			workspaceId,
			createInvitationTokenDto.expiredAt
		);
	}

	@Post("join")
	@ApiOperation({
		summary: "Join to the Workspace",
		description: "Join to the workspace using JWT invitation token.",
	})
	@ApiOkResponse({
		type: JoinWorkspaceResponse,
	})
	@ApiUnauthorizedResponse({
		type: HttpExceptionResponse,
		description: "Invitation token is invalid or expired.",
	})
	@ApiNotFoundResponse({
		description: "The workspace does not exist.",
		type: HttpExceptionResponse,
	})
	async join(
		@Req() req: AuthroizedRequest,
		@Body() joinWorkspaceDto: JoinWorkspaceDto
	): Promise<JoinWorkspaceResponse> {
		return this.workspacesService.join(req.user.id, joinWorkspaceDto.invitationToken);
	}
}
