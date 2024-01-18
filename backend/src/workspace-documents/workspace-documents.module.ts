import { Module } from "@nestjs/common";
import { WorkspaceDocumentsService } from "./workspace-documents.service";
import { WorkspaceDocumentsController } from "./workspace-documents.controller";
import { PrismaService } from "src/db/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					secret: configService.get<string>("JWT_SHARING_SECRET"),
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [WorkspaceDocumentsService, PrismaService],
	controllers: [WorkspaceDocumentsController],
})
export class WorkspaceDocumentsModule {}
