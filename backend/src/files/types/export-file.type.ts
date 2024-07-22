import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class ExportFileRequestBody {
	@ApiProperty({ type: String, description: "export file type" })
	@IsIn(["pdf", "html", "markdown"])
	exportType: string;

	@ApiProperty({ type: String, description: "markdown string" })
	content: string;

	@ApiProperty({ type: String, description: "File name" })
	fileName: string;
}

export class ExportFileResponse {
	@ApiProperty({ type: Buffer, description: "File content" })
	fileContent: Buffer;

	@ApiProperty({ type: String, description: "File mime type" })
	mimeType: string;

	@ApiProperty({ type: String, description: "File name" })
	fileName: string;
}
