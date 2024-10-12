import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core/constants";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt.guard";
import { CheckModule } from "./check/check.module";
import { PrismaService } from "./db/prisma.service";
import { DocumentsModule } from "./documents/documents.module";
import { FilesModule } from "./files/files.module";
import { IntelligenceModule } from "./intelligence/intelligence.module";
import { LangchainModule } from "./langchain/langchain.module";
import { SettingsModule } from "./settings/settings.module";
import { StorageModule } from "./storage/storage.module";
import { UsersModule } from "./users/users.module";
import { WorkspaceDocumentsModule } from "./workspace-documents/workspace-documents.module";
import { WorkspaceUsersModule } from "./workspace-users/workspace-users.module";
import { WorkspacesModule } from "./workspaces/workspaces.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath:
				process.env.NODE_ENV === "production" ? ".env.production" : ".env.development",
		}),
		UsersModule,
		AuthModule,
		WorkspacesModule,
		WorkspaceUsersModule,
		WorkspaceDocumentsModule,
		DocumentsModule,
		CheckModule,
		IntelligenceModule,
		LangchainModule,
		FilesModule,
		ConfigModule,
		SettingsModule,
		StorageModule,
	],
	controllers: [],
	providers: [
		PrismaService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
