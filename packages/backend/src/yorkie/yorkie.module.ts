import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { YorkieAdminService } from "./yorkie-admin.service";
import { YorkieEventService } from "./yorkie-event.service";
import { YorkieController } from "./yorkie.controller";
import { PrismaService } from "src/db/prisma.service";
import { RagModule } from "src/rag/rag.module";

@Module({
	imports: [ConfigModule, forwardRef(() => RagModule)],
	controllers: [YorkieController],
	providers: [PrismaService, YorkieAdminService, YorkieEventService],
	exports: [YorkieAdminService, YorkieEventService],
})
export class YorkieModule {}
