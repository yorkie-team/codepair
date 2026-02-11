import { Module } from "@nestjs/common";
import { IntelligenceController } from "./intelligence.controller";
import { IntelligenceService } from "./intelligence.service";
import { LangchainModule } from "src/langchain/langchain.module";
import { PrismaService } from "src/db/prisma.service";

@Module({
	imports: [LangchainModule],
	controllers: [IntelligenceController],
	providers: [IntelligenceService, PrismaService],
})
export class IntelligenceModule {}
