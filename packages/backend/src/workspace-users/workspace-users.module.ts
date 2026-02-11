import { Module } from "@nestjs/common";
import { WorkspaceUsersController } from "./workspace-users.controller";
import { WorkspaceUsersService } from "./workspace-users.service";
import { PrismaService } from "src/db/prisma.service";

@Module({
	controllers: [WorkspaceUsersController],
	providers: [WorkspaceUsersService, PrismaService],
})
export class WorkspaceUsersModule {}
