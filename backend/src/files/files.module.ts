import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { PrismaService } from "src/db/prisma.service";

@Module({
	controllers: [FilesController],
	providers: [FilesService, PrismaService],
})
export class FilesModule {}
