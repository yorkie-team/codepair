import { IsString } from "class-validator";

export class RefreshTokenRequest {
	@IsString()
	refreshToken: string;
}
