import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { PrismaService } from "src/db/prisma.service";

@Module({
	controllers: [AdminController],
	providers: [AdminService, PrismaService],
})
export class AdminModule {}
