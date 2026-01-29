import { Controller, Post, Body, UseGuards, Request, Res } from "@nestjs/common";
import { Response } from "express";
import { VectorSearchService } from "./search/vector-search.service";
import { RagAnswerService } from "./answer/rag-answer.service";
import { SearchDto } from "./dto/search.dto";
import { AnswerDto } from "./dto/answer.dto";
import { JwtAuthGuard } from "src/auth/jwt.guard";

@Controller("rag")
@UseGuards(JwtAuthGuard)
export class RagController {
	constructor(
		private vectorSearchService: VectorSearchService,
		private ragAnswerService: RagAnswerService
	) {}

	/**
	 * Search for relevant chunks
	 */
	@Post("search")
	async search(@Body() dto: SearchDto, @Request() req) {
		const userId = req.user.id;

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

	/**
	 * Generate answer using RAG (non-streaming)
	 */
	@Post("answer")
	async answer(@Body() dto: AnswerDto, @Request() req) {
		const userId = req.user.id;

		const result = await this.ragAnswerService.generateAnswer(
			userId,
			dto.workspaceId,
			dto.query,
			dto.limit
		);

		return {
			success: true,
			data: result,
		};
	}

	/**
	 * Generate answer using RAG (streaming)
	 */
	@Post("answer/stream")
	async answerStream(@Body() dto: AnswerDto, @Request() req, @Res() res: Response) {
		const userId = req.user.id;

		// Set headers for streaming
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.setHeader("Transfer-Encoding", "chunked");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		try {
			const stream = this.ragAnswerService.generateAnswerStream(
				userId,
				dto.workspaceId,
				dto.query,
				dto.limit
			);

			for await (const chunk of stream) {
				res.write(chunk);
			}

			res.end();
		} catch (error) {
			res.write(
				JSON.stringify({
					type: "error",
					data: error.message,
				}) + "\n"
			);
			res.end();
		}
	}
}
