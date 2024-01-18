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

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		UsersModule,
		AuthModule,
		WorkspacesModule,
		WorkspaceUsersModule,
		WorkspaceDocumentsModule,
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
