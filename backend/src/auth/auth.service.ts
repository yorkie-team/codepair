import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { RefreshTokenResponseDto } from "./dto/refresh-token-response.dto";
import { LoginRequest } from "./types/login-request.type";
import { LoginResponse } from "./types/login-response.type";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async loginWithSocialProvider(req: LoginRequest): Promise<LoginResponse> {
		const user = await this.usersService.findOrCreate(
			req.user.socialProvider,
			req.user.socialUid
		);

		const accessToken = this.jwtService.sign(
			{ sub: user.id, nickname: user.nickname },
			{
				secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
				expiresIn: `${this.configService.get("JWT_ACCESS_TOKEN_EXPIRATION_TIME")}s`,
			}
		);

		const refreshToken = this.jwtService.sign(
			{ sub: user.id },
			{
				secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
				expiresIn: `${this.configService.get("JWT_REFRESH_TOKEN_EXPIRATION_TIME")}s`,
			}
		);

		return { accessToken, refreshToken };
	}

	async getNewAccessToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
		const payload = this.jwtService.verify(refreshToken);

		const newAccessToken = this.jwtService.sign(
			{ sub: payload.sub, nickname: payload.nickname },
			{ expiresIn: `${this.configService.get("JWT_ACCESS_TOKEN_EXPIRATION_TIME")}s` }
		);

		return { newAccessToken };
	}
}
