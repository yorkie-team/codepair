import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./dto/CreateWorkspace.dto";
import {
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiFoundResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { CreateWorkspaceResponse } from "./types/create-workspace-response.type";
import { FindWorkspaceResponse } from "./types/find-workspace-response.type";
import { HttpExceptionResponse } from "src/utils/types/http-exception-response.type";

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
		description: "The Workspace does not exist, or the user lacks the appropriate permissions.",
	})
	async findOne(@Req() req: AuthroizedRequest, @Param("id") workspaceId: string) {
		return this.workspacesService.findOne(req.user.id, workspaceId);
	}
}
