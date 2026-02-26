import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import { JwtInject } from "src/utils/constants/jwt-inject";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GithubStrategy } from "./github.strategy";
import { JwtRefreshStrategy } from "./jwt-refresh.strategy";
import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [UsersModule],
	providers: [
		AuthService,
		GithubStrategy,
		JwtStrategy,
		JwtRefreshStrategy,
		{
			provide: JwtInject.ACCESS,
			useFactory: async (configService: ConfigService) => {
				return new JwtService({
					secret: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
					signOptions: {
						expiresIn: `${configService.get("JWT_ACCESS_TOKEN_EXPIRATION_TIME")}s`,
					},
				});
			},
			inject: [ConfigService],
		},
		{
			provide: JwtInject.REFRESH,
			useFactory: async (configService: ConfigService) => {
				return new JwtService({
					secret: configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
					signOptions: {
						expiresIn: `${configService.get("JWT_REFRESH_TOKEN_EXPIRATION_TIME")}s`,
					},
				});
			},
			inject: [ConfigService],
		},
	],
	exports: [JwtInject.ACCESS, JwtInject.REFRESH],
	controllers: [AuthController],
})
export class AuthModule {}
