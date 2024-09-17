import { Module } from "@nestjs/common";
import { CheckService } from "src/check/check.service";
import { PrismaService } from "src/db/prisma.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
	providers: [UsersService, PrismaService, CheckService],
	exports: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {}
