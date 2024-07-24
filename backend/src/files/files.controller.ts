import { Body, Controller, Get, HttpRedirectResponse, Param, Post, Redirect } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "src/utils/decorators/auth.decorator";
import { CreateUploadPresignedUrlDto } from "./dto/create-upload-url.dto";
import { FilesService } from "./files.service";
import { CreateUploadPresignedUrlResponse } from "./types/create-upload-url-response.type";

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
		description: "Create Presigned URL for download",
	})
	async createDownloadPresignedUrl(
		@Param("file_name") fileKey: string
	): Promise<HttpRedirectResponse> {
		return {
			url: await this.filesService.createDownloadPresignedUrl(fileKey),
			statusCode: 302,
		};
	}

	// @Public()
	// @Post("export-markdown")
	// @ApiOperation({
	// 	summary: "Export Markdown",
	// 	description: "Export Markdown to various formats",
	// })
	// @ApiBody({ type: ExportFileRequestBody })
	// @ApiOkResponse({ type: ExportFileResponse })
	// async exportMarkdown(
	// 	@Body() exportFileRequestBody: ExportFileRequestBody
	// ): Promise<StreamableFile> {
	// 	const { fileContent, mimeType, fileName } =
	// 		await this.filesService.exportMarkdown(exportFileRequestBody);

	// 	return new StreamableFile(fileContent, {
	// 		type: mimeType,
	// 		disposition: `attachment; filename="${fileName}"`,
	// 	});
	// }
}
