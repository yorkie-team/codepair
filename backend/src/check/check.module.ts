import { Module } from "@nestjs/common";
import { CheckService } from "./check.service";
import { CheckController } from "./check.controller";
import { PrismaService } from "src/db/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
	imports: [
		JwtModule.registerAsync({
			global: true,
			useFactory: async (configService: ConfigService) => {
				return {
					signOptions: { expiresIn: "24h" },
					secret: configService.get<string>("JWT_AUTH_SECRET"),
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [CheckService, PrismaService],
	controllers: [CheckController],
})
export class CheckModule {}
