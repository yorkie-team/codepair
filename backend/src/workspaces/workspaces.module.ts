import { Module } from "@nestjs/common";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { PrismaService } from "src/db/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					signOptions: { expiresIn: "12h" },
					secret: configService.get<string>("JWT_INVITATION_SECRET"),
				};
			},
			inject: [ConfigService],
		}),
	],
	controllers: [WorkspacesController],
	providers: [WorkspacesService, PrismaService],
})
export class WorkspacesModule {}
