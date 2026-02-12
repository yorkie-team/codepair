import { ApiProperty } from "@nestjs/swagger";

export class CheckYorkieResponse {
	@ApiProperty({
		type: Boolean,
		description: "Whether the given token is authorized for this document.",
	})
	allowed: boolean;
	@ApiProperty({ type: String, description: "Reason for this response" })
	reason?: string;
}
