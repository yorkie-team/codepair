import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { GithubStrategy } from "./github.strategy";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		UsersModule,
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					global: true,
					signOptions: { expiresIn: "24h" },
					secret: configService.get<string>("JWT_AUTH_SECRET"),
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [AuthService, GithubStrategy, JwtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
