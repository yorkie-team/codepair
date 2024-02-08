import { ApiProperty } from "@nestjs/swagger";

export class CreateUploadPresignedUrlDto {
	@ApiProperty({ type: String, description: "ID of workspace to create file" })
	workspaceId: string;

	@ApiProperty({ type: Number, description: "Length of content to upload" })
	contentLength: number;

	@ApiProperty({ type: String, description: "Type of file" })
	contentType: string;
}
