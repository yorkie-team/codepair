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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "src/utils/decorators/auth.decorator";
import { AuthService } from "./auth.service";
import { LoginRequest } from "./types/login-request.type";
import { LoginResponse } from "./types/login-response.type";
import { RefreshTokenRequest } from "./types/refresh-token-request.type";

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
		const { accessToken, refreshToken } = await this.authService.loginWithGithub(req);

		return {
			url: `${this.configService.get("FRONTEND_BASE_URL")}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
			statusCode: 302,
		};
	}

	@Public()
	@Post("refresh")
	@UseGuards(AuthGuard("refresh"))
	@ApiOperation({ summary: "Refresh Access Token" })
	@ApiResponse({ type: LoginResponse })
	async refresh(@Body() body: RefreshTokenRequest): Promise<{ accessToken: string }> {
		const accessToken = await this.authService.getNewAccessToken(body.refreshToken);
		return { accessToken };
	}
}
