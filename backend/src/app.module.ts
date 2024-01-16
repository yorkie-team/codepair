import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthController } from "./user/auth.controller";
import { AuthService } from "./user/auth.service";
import { PrismaService } from "./db/prisma.service";

@Module({
	imports: [],
	controllers: [AppController, AuthController],
	providers: [AppService, PrismaService, AuthService],
})
export class AppModule {}
