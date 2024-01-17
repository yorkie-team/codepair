import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { LoginRequest } from "./types/login-request.type";
import { JwtService } from "@nestjs/jwt";
import { LoginResponse } from "./types/login-response.type";
import { UsersService } from "src/users/users.service";
import { Public } from "src/utils/decorators/auth.decorator";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(
		private jwtService: JwtService,
		private usersService: UsersService
	) {}

	@Public()
	@Get("login/github")
	@Get("callback/github")
	@UseGuards(AuthGuard("github"))
	@ApiOperation({
		summary: "SignUp/LogIn with GitHub",
		description: "SignUp/Login with GitHub social login",
	})
	@ApiResponse({ type: LoginResponse })
	async login(@Req() req: LoginRequest): Promise<LoginResponse> {
		const user = await this.usersService.findOrCreate(
			req.user.socialProvider,
			req.user.socialUid,
			req.user.nickname
		);

		const accessToken = this.jwtService.sign({ sub: user.id, nickname: user.nickname });

		return { accessToken };
	}
}
