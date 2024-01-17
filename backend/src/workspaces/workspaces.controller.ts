import { Body, Controller, Post, Req } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./dto/CreateWorkspace.dto";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { CreateWorkspaceResponse } from "./types/create-workspace-response.type";

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
}
