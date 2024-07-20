import { ApiProperty } from "@nestjs/swagger";

export class ExportFileRequestBody {
	@ApiProperty({ type: String, description: "export_type" })
	exportType: "pdf" | "html" | "markdown";

	@ApiProperty({ type: String, description: "markdown string" })
	content: string;

	@ApiProperty({ type: String, description: "File name" })
	fileName: string;
}

export interface ExportFileResponseDto {
	fileContent: Buffer;
	mimeType: string;
	fileName: string;
}
