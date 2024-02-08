import { Module } from "@nestjs/common";
import { PrismaService } from "./db/prisma.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core/constants";
import { JwtAuthGuard } from "./auth/jwt.guard";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { WorkspaceUsersModule } from "./workspace-users/workspace-users.module";
import { WorkspaceDocumentsModule } from "./workspace-documents/workspace-documents.module";
import { DocumentsModule } from "./documents/documents.module";
import { CheckModule } from "./check/check.module";
import { IntelligenceModule } from "./intelligence/intelligence.module";
import { LangchainModule } from "./langchain/langchain.module";
import { FilesModule } from "./files/files.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
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
