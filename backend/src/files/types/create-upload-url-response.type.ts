import { ApiProperty } from "@nestjs/swagger";

export class CreateUploadPresignedUrlResponse {
	@ApiProperty({ type: String, description: "Presigned URL for upload" })
	url: string;
}
