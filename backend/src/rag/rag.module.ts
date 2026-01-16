import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "src/db/prisma.service";
import { EmbeddingService } from "./embedding/embedding.service";
import { ContentSanitizer } from "./sanitization/sanitizer.service";
import { MarkdownChunker } from "./chunking/markdown-chunker.service";
import { IndexingService } from "./indexing/indexing.service";
import { VectorSearchService } from "./search/vector-search.service";
import { RagController } from "./rag.controller";

@Module({
	imports: [ConfigModule],
	controllers: [RagController],
	providers: [
		PrismaService,
		EmbeddingService,
		ContentSanitizer,
		MarkdownChunker,
		IndexingService,
		VectorSearchService,
	],
	exports: [IndexingService, VectorSearchService],
})
export class RagModule {}
