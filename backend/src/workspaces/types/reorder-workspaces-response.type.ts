import { ApiProperty } from "@nestjs/swagger";

export class SetWorkspaceOrderResponse {
	@ApiProperty({ type: String, description: "Success message" })
	message: string;
}
