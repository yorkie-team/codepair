import { Module } from "@nestjs/common";
import { WorkspaceDocumentsService } from "./workspace-documents.service";
import { WorkspaceDocumentsController } from "./workspace-documents.controller";
import { PrismaService } from "src/db/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Module({
	imports: [
		HttpModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					headers: {
						Authorization: configService.get<string>("YORKIE_PROJECT_SECRET_KEY"),
					},
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [WorkspaceDocumentsService, PrismaService],
	controllers: [WorkspaceDocumentsController],
})
export class WorkspaceDocumentsModule {}
