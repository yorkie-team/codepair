import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./db/prisma.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core/constants";
import { JwtAuthGuard } from "./auth/jwt.guard";

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, AuthModule],
	controllers: [AppController],
	providers: [
		AppService,
		PrismaService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
