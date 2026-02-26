import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenResponseDto {
	@ApiProperty({ type: String, description: "The new access token" })
	newAccessToken: string;
}
