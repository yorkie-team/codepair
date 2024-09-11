import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenRequestDto {
	@ApiProperty({ type: String, description: "The refresh token to request a new access token" })
	refreshToken: string;
}
