import { Module } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { StorageModule } from "src/storage/storage.module";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

@Module({
	imports: [StorageModule],
	controllers: [FilesController],
	providers: [FilesService, PrismaService],
})
export class FilesModule {}
