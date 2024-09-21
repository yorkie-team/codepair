import {
	Body,
	Controller,
	DefaultValuePipe,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
} from "@nestjs/common";
import { WorkspaceDocumentsService } from "./workspace-documents.service";
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
import { CreateWorkspaceDocumentDto } from "./dto/create-workspace-document.dto";
import { CreateWorkspaceDocumentResponse } from "./types/create-workspace-document-response.type";
import { UpdateDocumentTitleDto } from "./dto/update-document-title.dto";
import { HttpExceptionResponse } from "src/utils/types/http-exception-response.type";
import { FindWorkspaceDocumentsResponse } from "./types/find-workspace-documents-response.type";
import { CreateWorkspaceDocumentShareTokenResponse } from "./types/create-workspace-document-share-token-response.type";
import { CreateWorkspaceDocumentShareTokenDto } from "./dto/create-workspace-document-share-token.dto";
import { FindWorkspaceDocumentResponse } from "./types/find-workspace-document-response.type";

@ApiTags("Workspace.Documents")
@ApiBearerAuth()
@Controller("workspaces/:workspace_id/documents")
export class WorkspaceDocumentsController {
	constructor(private workspaceDocumentsService: WorkspaceDocumentsService) {}

	@Put(":document_id")
	@ApiOperation({
		summary: "Update the title of a document in the workspace",
		description: "If the user has the access permissions, update the document's title.",
	})
	@ApiParam({
		name: "workspace_id",
		description: "ID of workspace",
	})
	@ApiParam({
		name: "document_id",
		description: "ID of document to change title",
	})
	@ApiOkResponse({
		description: "Document title updated successfully",
	})
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description:
			"The workspace or document does not exist, or the user lacks the appropriate permissions.",
	})
	@ApiBody({
		description: "The new title of the document",
		type: UpdateDocumentTitleDto,
	})
	async updateTitle(
		@Param("workspace_id") workspaceId: string,
		@Param("document_id") documentId: string,
		@Body() updateDocumentTitleDto: UpdateDocumentTitleDto,
		@Req() req: AuthroizedRequest
	): Promise<void> {
		await this.workspaceDocumentsService.updateTitle(
			req.user.id,
			workspaceId,
			documentId,
			updateDocumentTitleDto.title
		);
	}
	@Get("")
	@ApiOperation({
		summary: "Retrieve the Documents in Workspace",
		description: "Return the documents in the workspace. This API supports KeySet pagination.",
	})
	@ApiFoundResponse({ type: FindWorkspaceDocumentsResponse })
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
		@Req() req: AuthroizedRequest,
		@Param("workspace_id") workspaceId: string,
		@Query("page_size", new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
		@Query("cursor", new DefaultValuePipe(undefined)) cursor?: string
	): Promise<FindWorkspaceDocumentsResponse> {
		return this.workspaceDocumentsService.findMany(req.user.id, workspaceId, pageSize, cursor);
	}
	@Get(":document_id")
	@ApiOperation({
		summary: "Retrieve a Document in the Workspace",
		description: "If the user has the access permissions, return a document.",
	})
	@ApiFoundResponse({ type: FindWorkspaceDocumentResponse })
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description:
			"The workspace or document does not exist, or the user lacks the appropriate permissions.",
	})
	async findOne(
		@Req() req: AuthroizedRequest,
		@Param("workspace_id") workspaceId: string,
		@Param("document_id") documentId: string
	): Promise<FindWorkspaceDocumentResponse> {
		return this.workspaceDocumentsService.findOne(req.user.id, workspaceId, documentId);
	}
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
	@Post(":document_id/share-token")
	@ApiOperation({
		summary: "Retrieve a Share Token for the Document",
		description: "If the user has the access permissions, return a share token.",
	})
	@ApiBody({ type: CreateWorkspaceDocumentShareTokenDto })
	@ApiOkResponse({ type: CreateWorkspaceDocumentShareTokenResponse })
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description:
			"The workspace or document does not exist, or the user lacks the appropriate permissions.",
	})
	async createShareToken(
		@Req() req: AuthroizedRequest,
		@Param("workspace_id") workspaceId: string,
		@Param("document_id") documentId: string,
		@Body() createWorkspaceDocumentShareTokenDto: CreateWorkspaceDocumentShareTokenDto
	): Promise<CreateWorkspaceDocumentShareTokenResponse> {
		return this.workspaceDocumentsService.createSharingToken(
			req.user.id,
			workspaceId,
			documentId,
			createWorkspaceDocumentShareTokenDto.role,
			createWorkspaceDocumentShareTokenDto.expiredAt
		);
	}
}
