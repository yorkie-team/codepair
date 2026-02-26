import { ApiProperty } from "@nestjs/swagger";

export class LoginResponse {
	@ApiProperty({ type: String, description: "Access token for CodePair" })
	accessToken: string;

	@ApiProperty({ type: String, description: "Refresh token to get a new access token" })
	refreshToken: string;
}
