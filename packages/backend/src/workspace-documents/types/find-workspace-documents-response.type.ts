import { ApiProperty } from "@nestjs/swagger";
import { WorkspaceDocumentDomain } from "./workspace-document-domain.type";

export class FindWorkspaceDocumentsResponse {
	@ApiProperty({
		type: [WorkspaceDocumentDomain],
		description: "List of found workspace documents",
	})
	documents: Array<WorkspaceDocumentDomain>;

	@ApiProperty({ type: String, description: "The ID of last document" })
	cursor: string | null;

	@ApiProperty({ type: Number, description: "The number of total documents" })
	totalLength: number;
}
