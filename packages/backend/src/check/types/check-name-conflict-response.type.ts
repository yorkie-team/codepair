import { ApiProperty } from "@nestjs/swagger";

export class CheckNameConflicReponse {
	@ApiProperty({ type: Boolean, description: "Whether the name is conflict" })
	conflict: boolean;
}
