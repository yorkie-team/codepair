import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { Public } from "src/utils/decorators/auth.decorator";
import {
	ApiFoundResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { FindDocumentFromSharingTokenResponse } from "./types/find-document-from-sharing-token-response.type";
import { HttpExceptionResponse } from "src/utils/types/http-exception-response.type";
import { FindDocumentResponse } from "./types/find-document-response.type";
import { AuthroizedRequest } from "src/utils/types/req.type";

@ApiTags("Documents")
@Controller("documents")
export class DocumentsController {
	constructor(private documentsService: DocumentsService) {}

	@Public()
	@Get("share")
	@ApiOperation({
		summary: "Retrieve a Shared Document using Sharing Token",
		description: "If the user has the access permissions, return a shared document.",
	})
	@ApiQuery({ type: String, name: "token", description: "Sharing Token" })
	@ApiOkResponse({ type: FindDocumentFromSharingTokenResponse })
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description: "The document does not exist.",
	})
	@ApiUnauthorizedResponse({
		type: HttpExceptionResponse,
		description: "The sharing token is expired or invalid.",
	})
	async findDocumentFromSharingToken(
		@Query("token") token: string
	): Promise<FindDocumentFromSharingTokenResponse> {
		return this.documentsService.findDocumentFromSharingToken(token);
	}

	@Get(":document_slug")
	@ApiOperation({
		summary: "Retrieve a Document in the Workspace",
		description: "If the user has the access permissions, return a document.",
	})
	@ApiFoundResponse({ type: FindDocumentResponse })
	@ApiNotFoundResponse({
		type: HttpExceptionResponse,
		description:
			"The workspace or document does not exist, or the user lacks the appropriate permissions.",
	})
	async findOne(
		@Req() req: AuthroizedRequest,
		@Param("document_slug") documentSlug: string
	): Promise<FindDocumentResponse> {
		return this.documentsService.findOneBySlug(req.user.id, documentSlug);
	}
}
