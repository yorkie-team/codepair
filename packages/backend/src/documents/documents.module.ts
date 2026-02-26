import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { PrismaService } from "src/db/prisma.service";

@Module({
	imports: [],
	controllers: [DocumentsController],
	providers: [DocumentsService, PrismaService],
})
export class DocumentsModule {}
