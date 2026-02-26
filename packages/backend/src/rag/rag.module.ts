import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "src/db/prisma.service";
import { EmbeddingService } from "./embedding/embedding.service";
import { ContentSanitizer } from "./sanitization/sanitizer.service";
import { MarkdownChunker } from "./chunking/markdown-chunker.service";
import { IndexingService } from "./indexing/indexing.service";
import { IndexingQueueService } from "./indexing/indexing-queue.service";
import { VectorSearchService } from "./search/vector-search.service";
import { RagAnswerService } from "./answer/rag-answer.service";
import { RagController } from "./rag.controller";
import { YorkieModule } from "src/yorkie/yorkie.module";
import { LangchainModule } from "src/langchain/langchain.module";
import { QdrantService } from "./qdrant/qdrant.service";

@Module({
	imports: [ConfigModule, forwardRef(() => YorkieModule), LangchainModule],
	controllers: [RagController],
	providers: [
		PrismaService,
		EmbeddingService,
		ContentSanitizer,
		MarkdownChunker,
		QdrantService,
		IndexingService,
		IndexingQueueService,
		VectorSearchService,
		RagAnswerService,
	],
	exports: [
		QdrantService,
		IndexingService,
		IndexingQueueService,
		VectorSearchService,
		RagAnswerService,
	],
})
export class RagModule {}
