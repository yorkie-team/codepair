import { IsNotEmpty, IsString } from "class-validator";

export class IndexDocumentDto {
	@IsNotEmpty()
	@IsString()
	documentId: string;

	@IsNotEmpty()
	@IsString()
	workspaceId: string;
}
