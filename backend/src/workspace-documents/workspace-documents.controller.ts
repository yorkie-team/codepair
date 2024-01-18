import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import { WorkspaceDocumentsService } from "./workspace-documents.service";
import {
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { CreateWorkspaceDocumentDto } from "./dto/create-workspace-document.dto";
import { CreateWorkspaceDocumentResponse } from "./types/create-workspace-document-response.type";
import { HttpExceptionResponse } from "src/utils/types/http-exception-response.type";

@ApiTags("Workspace.Documents")
@ApiBearerAuth()
@Controller("workspaces/:workspace_id/documents")
export class WorkspaceDocumentsController {
	constructor(private workspaceDocumentsService: WorkspaceDocumentsService) {}

	@Post()
	@ApiOperation({
		summary: "Create a Document in a Workspace",
		description: "Create a document with the title in a workspace",
	})
	@ApiBody({ type: CreateWorkspaceDocumentDto })
	@ApiCreatedResponse({ type: CreateWorkspaceDocumentResponse })
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description: "The workspace does not exist, or the user lacks the appropriate permissions.",
	})
	async create(
		@Req() req: AuthroizedRequest,
		@Param("workspace_id") workspaceId: string,
		@Body() createWorkspaceDocumentDto: CreateWorkspaceDocumentDto
	): Promise<CreateWorkspaceDocumentResponse> {
		return this.workspaceDocumentsService.create(
			req.user.id,
			workspaceId,
			createWorkspaceDocumentDto.title
		);
	}
}
