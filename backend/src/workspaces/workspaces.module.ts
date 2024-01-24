import { Module } from "@nestjs/common";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { PrismaService } from "src/db/prisma.service";
import { CheckService } from "src/check/check.service";

@Module({
	imports: [],
	controllers: [WorkspacesController],
	providers: [WorkspacesService, PrismaService, CheckService],
})
export class WorkspacesModule {}
