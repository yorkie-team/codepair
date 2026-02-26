import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class UpdateDocumentTitleDto {
	@ApiProperty({
		description: "The new title of the document",
		example: "Updated Document Title",
		type: String,
	})
	@IsString()
	@IsNotEmpty()
	title: string;
}
