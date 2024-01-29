import { Module } from "@nestjs/common";
import { IntelligenceController } from "./intelligence.controller";
import { IntelligenceService } from "./intelligence.service";
import { LangchainModule } from "src/langchain/langchain.module";

@Module({
	imports: [LangchainModule],
	controllers: [IntelligenceController],
	providers: [IntelligenceService],
})
export class IntelligenceModule {}
