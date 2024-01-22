import { Module } from "@nestjs/common";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { PrismaService } from "src/db/prisma.service";

@Module({
	imports: [],
	controllers: [WorkspacesController],
	providers: [WorkspacesService, PrismaService],
})
export class WorkspacesModule {}
