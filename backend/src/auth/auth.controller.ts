import {
	Body,
	Controller,
	Get,
	HttpRedirectResponse,
	Post,
	Redirect,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "src/utils/decorators/auth.decorator";
import { AuthService } from "./auth.service";
import { RefreshTokenRequestDto } from "./dto/refresh-token-request.dto";
import { RefreshTokenResponseDto } from "./dto/refresh-token-response.dto";
import { LoginRequest } from "./types/login-request.type";
import { LoginResponse } from "./types/login-response.type";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private configService: ConfigService
	) {}

	@Public()
	@Get("login/github")
	@Get("callback/github")
	@Redirect()
	@UseGuards(AuthGuard("github"))
	@ApiOperation({
		summary: "SignUp/LogIn with GitHub",
		description: "SignUp/Login with GitHub social login",
	})
	@ApiResponse({ type: LoginResponse })
	async login(@Req() req: LoginRequest): Promise<HttpRedirectResponse> {
		const { accessToken, refreshToken } = await this.authService.loginWithSocialProvider(req);

		return {
			url: `${this.configService.get("FRONTEND_BASE_URL")}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
			statusCode: 302,
		};
	}

	@Public()
	@Post("refresh")
	@UseGuards(AuthGuard("refresh"))
	@ApiOperation({
		summary: "Refresh Access Token",
		description: "Generates a new Access Token using the user's Refresh Token.",
	})
	@ApiBody({ type: RefreshTokenRequestDto })
	@ApiResponse({ type: RefreshTokenResponseDto })
	async refresh(@Body() body: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
		return await this.authService.getNewAccessToken(body.refreshToken);
	}
}
