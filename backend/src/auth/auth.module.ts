import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GithubStrategy } from "./github.strategy";
import { JwtRefreshStrategy } from "./jwt-refresh.strategy";
import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		UsersModule,
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					global: true,
					signOptions: {
						expiresIn: `${configService.get("JWT_ACCESS_TOKEN_EXPIRATION_TIME")}s`,
					},
					secret: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [AuthService, GithubStrategy, JwtStrategy, JwtRefreshStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
