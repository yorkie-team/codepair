import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("/login")
	async login(@Body() loginDto: LoginDto) {
		return this.authService.findOrCreateUser(loginDto.idToken, loginDto.nickname);
	}
}
