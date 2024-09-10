import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { JwtInject } from "src/utils/constants/jwt-inject";
import { RefreshTokenResponseDto } from "./dto/refresh-token-response.dto";
import { LoginRequest } from "./types/login-request.type";
import { LoginResponse } from "./types/login-response.type";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		@Inject(JwtInject.ACCESS) private readonly jwtAccessService: JwtService,
		@Inject(JwtInject.REFRESH) private readonly jwtRefreshService: JwtService
	) {}

	async loginWithSocialProvider(req: LoginRequest): Promise<LoginResponse> {
		const user = await this.usersService.findOrCreate(
			req.user.socialProvider,
			req.user.socialUid
		);

		const accessToken = this.jwtAccessService.sign({ sub: user.id, nickname: user.nickname });
		const refreshToken = this.jwtRefreshService.sign({ sub: user.id });

		return { accessToken, refreshToken };
	}

	async getNewAccessToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
		const payload = this.jwtRefreshService.verify(refreshToken);

		const newAccessToken = this.jwtAccessService.sign({
			sub: payload.sub,
			nickname: payload.nickname,
		});

		return { newAccessToken };
	}
}
