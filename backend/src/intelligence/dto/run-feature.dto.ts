import { ApiProperty } from "@nestjs/swagger";

export class RunFeatureDto {
	@ApiProperty({ type: String, description: "ID of Document" })
	documentId: string;

	@ApiProperty({ type: String, description: "Content to run feature" })
	content: string;
}
