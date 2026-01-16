import { ApiProperty } from "@nestjs/swagger";

export class DocumentDomain {
	@ApiProperty({ type: String, description: "ID of the document" })
	id: string;
	@ApiProperty({ type: String, description: "Yorkie Document ID of the document" })
	yorkieDocumentId: string;
	@ApiProperty({ type: String, description: "Title of the document" })
	title: string;
	@ApiProperty({ type: Date, description: "Created date of the document" })
	createdAt: Date;
	@ApiProperty({ type: Date, description: "Updated date of the document" })
	updatedAt: Date;
	@ApiProperty({ type: String, description: "ID of the workspace that includes the document" })
	workspaceId: string;
}
