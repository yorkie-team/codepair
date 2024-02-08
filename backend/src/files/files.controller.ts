import {
	Body,
	Controller,
	Get,
	HttpRedirectResponse,
	Param,
	Post,
	Redirect,
	Req,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import { ApiResponse, ApiOperation, ApiBody } from "@nestjs/swagger";
import { CreateUploadPresignedUrlResponse } from "./types/create-upload-url-response.type";
import { CreateUploadPresignedUrlDto } from "./dto/create-upload-url.dto";
import { Public } from "src/utils/decorators/auth.decorator";

@Controller("files")
export class FilesController {
	constructor(private filesService: FilesService) {}

	@Public()
	@Post("")
	@ApiOperation({
		summary: "Create Presigned URL for Upload",
		description: "Create rresigned URL for upload",
	})
	@ApiBody({ type: CreateUploadPresignedUrlDto })
	@ApiResponse({ type: CreateUploadPresignedUrlResponse })
	async createUploadPresignedUrl(
		@Body() createUploadPresignedUrlDto: CreateUploadPresignedUrlDto
	): Promise<CreateUploadPresignedUrlResponse> {
		return this.filesService.createUploadPresignedUrl(
			createUploadPresignedUrlDto.workspaceId,
			createUploadPresignedUrlDto.contentLength,
			createUploadPresignedUrlDto.contentType
		);
	}

	@Public()
	@Get(":file_name")
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
