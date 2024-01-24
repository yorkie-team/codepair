import { Module } from "@nestjs/common";
import { CheckService } from "./check.service";
import { CheckController } from "./check.controller";
import { PrismaService } from "src/db/prisma.service";

@Module({
	providers: [CheckService, PrismaService],
	controllers: [CheckController],
})
export class CheckModule {}
