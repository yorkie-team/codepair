import { ApiProperty } from "@nestjs/swagger";

export class CreateUploadPresignedUrlDto {
	@ApiProperty({ type: String, description: "ID of workspace to create file" })
	workspaceId: string;
}
