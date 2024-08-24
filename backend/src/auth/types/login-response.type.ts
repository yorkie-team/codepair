import { ApiProperty } from "@nestjs/swagger";

export class LoginResponse {
	@ApiProperty({ type: String, description: "Access token for CodePair" })
	accessToken: string;
	refreshToken: string;
}
