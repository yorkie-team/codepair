import { Controller, Post, Body, Get, Param, Delete, UseGuards, Request } from "@nestjs/common";
import { IndexingService } from "./indexing/indexing.service";
import { VectorSearchService } from "./search/vector-search.service";
import { IndexDocumentDto } from "./dto/index-document.dto";
import { SearchDto } from "./dto/search.dto";
import { JwtAuthGuard } from "src/auth/jwt.guard";

@Controller("rag")
@UseGuards(JwtAuthGuard)
export class RagController {
	constructor(
		private indexingService: IndexingService,
		private vectorSearchService: VectorSearchService
	) {}

	/**
	 * Index a document for RAG search
	 */
	@Post("index")
	async indexDocument(@Body() dto: IndexDocumentDto) {
		await this.indexingService.indexDocument(dto.documentId, dto.workspaceId);

		return {
			success: true,
			message: "Document indexed successfully",
		};
	}

	/**
	 * Re-index a document
	 */
	@Post("reindex/:documentId")
	async reindexDocument(
		@Param("documentId") documentId: string,
		@Body("workspaceId") workspaceId: string
	) {
		await this.indexingService.reindexDocument(documentId, workspaceId);

		return {
			success: true,
			message: "Document re-indexed successfully",
		};
	}

	/**
	 * Get indexing status for a document
	 */
	@Get("index/status/:documentId")
	async getIndexingStatus(@Param("documentId") documentId: string) {
		const status = await this.indexingService.getIndexingStatus(documentId);

		return {
			success: true,
			data: status,
		};
	}

	/**
	 * Delete document chunks
	 */
	@Delete("index/:documentId")
	async deleteDocumentChunks(@Param("documentId") documentId: string) {
		await this.indexingService.deleteDocumentChunks(documentId);

		return {
			success: true,
			message: "Document chunks deleted successfully",
		};
	}

	/**
	 * Search for relevant chunks
	 */
	@Post("search")
	async search(@Body() dto: SearchDto, @Request() req) {
		const userId = req.user.userId;

		const results = await this.vectorSearchService.searchChunks(
			userId,
			dto.workspaceId,
			dto.query,
			dto.limit
		);

		return {
			success: true,
			data: {
				query: dto.query,
				resultCount: results.length,
				results: results.map((result) => ({
					documentId: result.chunk.documentId,
					content: result.chunk.content,
					score: result.score,
					chunkType: result.chunk.chunkType,
					language: result.chunk.language,
					section: result.chunk.section,
				})),
			},
		};
	}
}
