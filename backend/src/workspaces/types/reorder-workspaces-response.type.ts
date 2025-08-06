import { ApiProperty } from "@nestjs/swagger";

export class ReorderWorkspacesResponse {
	@ApiProperty({ type: String, description: "Success message" })
	message: string;
}
