import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaService } from "src/db/prisma.service";
import { UsersController } from "./users.controller";
import { CheckService } from "src/check/check.service";

@Module({
	providers: [UsersService, PrismaService, CheckService],
	exports: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {}
