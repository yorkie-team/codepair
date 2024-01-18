import { Module } from "@nestjs/common";
import { WorkspaceDocumentsService } from "./workspace-documents.service";
import { WorkspaceDocumentsController } from "./workspace-documents.controller";
import { PrismaService } from "src/db/prisma.service";

@Module({
	providers: [WorkspaceDocumentsService, PrismaService],
	controllers: [WorkspaceDocumentsController],
})
export class WorkspaceDocumentsModule {}
