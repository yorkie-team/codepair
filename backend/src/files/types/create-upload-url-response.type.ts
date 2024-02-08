import { ApiProperty } from "@nestjs/swagger";

export class CreateUploadPresignedUrlResponse {
	@ApiProperty({ type: String, description: "Presigned URL for upload" })
	url: string;

	@ApiProperty({ type: String, description: "Key of file" })
	fileKey: string;
}
