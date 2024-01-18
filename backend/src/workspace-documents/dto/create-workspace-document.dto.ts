import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkspaceDocumentDto {
	@ApiProperty({ description: "Title of document to create", type: String })
	title: string;
}
