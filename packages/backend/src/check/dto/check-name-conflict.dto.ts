import { ApiProperty } from "@nestjs/swagger";

export class CheckNameConflictDto {
	@ApiProperty({ type: String, description: "Name to check conflict" })
	name: string;
}
