import { ApiProperty } from "@nestjs/swagger";

export class RunFollowUpDto {
	@ApiProperty({ type: String, description: "ID of document" })
	documentId: string;

	@ApiProperty({ type: String, description: "Key of chat history" })
	memoryKey: string;

	@ApiProperty({ type: String, description: "Content to run feature" })
	content: string;
}
