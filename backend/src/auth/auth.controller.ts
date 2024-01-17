import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { LoginRequest } from "./interfaces/LoginRequest";
import { JwtService } from "@nestjs/jwt";
import { LoginResponse } from "./interfaces/LoginResponse";
import { UsersService } from "src/users/users.service";
import { Public } from "src/utils/decorators/auth.decorator";

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
