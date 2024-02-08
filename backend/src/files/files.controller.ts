import { Body, Controller, HttpRedirectResponse, Param, Post, Redirect, Req } from "@nestjs/common";
import { FilesService } from "./files.service";
import { ApiResponse, ApiOperation, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { CreateUploadPresignedUrlResponse } from "./types/create-upload-url-response.type";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { CreateUploadPresignedUrlDto } from "./dto/create-upload-url.dto";
import { Public } from "src/utils/decorators/auth.decorator";

@ApiBearerAuth()
@Controller("files")
export class FilesController {
	constructor(private filesService: FilesService) {}

	@Post("")
	@ApiOperation({
		summary: "Create Presigned URL for Upload",
		description: "Create rresigned URL for upload",
	})
	@ApiBody({ type: CreateUploadPresignedUrlDto })
	@ApiResponse({ type: CreateUploadPresignedUrlResponse })
	async createUploadPresignedUrl(
		@Req() req: AuthroizedRequest,
		@Body() createUploadPresignedUrlDto: CreateUploadPresignedUrlDto
	): Promise<CreateUploadPresignedUrlResponse> {
		return {
			url: await this.filesService.createUploadPresignedUrl(
				req.user.id,
				createUploadPresignedUrlDto.workspaceId
			),
		};
	}

	@Public()
	@Post(":file_name")
	@Redirect()
	@ApiOperation({
		summary: "Create Presigned URL for Download",
		description: "Create rresigned URL for download",
	})
	async createDownloadPresignedUrl(
		@Param("file_name") fileKey: string
	): Promise<HttpRedirectResponse> {
		return {
			url: await this.filesService.createDownloadPresignedUrl(fileKey),
			statusCode: 302,
		};
	}
}
