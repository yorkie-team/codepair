import { Injectable } from "@nestjs/common";
import * as MarkdownIt from "markdown-it";
import { Chunk, ChunkMetadata } from "../types/chunk.type";

@Injectable()
export class MarkdownChunker {
	private md: MarkdownIt;

	constructor() {
		this.md = new MarkdownIt();
	}

	/**
	 * Chunk markdown content into smaller pieces
	 */
	chunk(content: string, metadata: ChunkMetadata): Chunk[] {
		const tokens = this.md.parse(content, {});
		const chunks: Chunk[] = [];

		let currentChunk = "";
		let currentSection = "";

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

			// Handle headings - start new section
			if (token.type === "heading_open") {
				// Save previous chunk if exists
				if (currentChunk.trim()) {
					chunks.push({
						content: currentChunk.trim(),
						type: "text",
						section: currentSection,
					});
					currentChunk = "";
				}

				// Extract heading text
				const headingLevel = parseInt(token.tag.substring(1)); // h1 -> 1, h2 -> 2, etc.
				const headingText = tokens[i + 1]?.content || "";

				// Update section based on heading level
				if (headingLevel <= 3) {
					// Only use h1, h2, h3 for sections
					currentSection = headingText;
				}

				// Add heading to current chunk
				currentChunk += `${"#".repeat(headingLevel)} ${headingText}\n\n`;

				// Skip the inline and closing tokens
				i += 2;
				continue;
			}

			// Handle code fences - separate chunk for code blocks
			if (token.type === "fence") {
				// Save previous text chunk if exists
				if (currentChunk.trim()) {
					chunks.push({
						content: currentChunk.trim(),
						type: "text",
						section: currentSection,
					});
					currentChunk = "";
				}

				// Create code chunk
				chunks.push({
					content: token.content.trim(),
					type: "code",
					language: token.info || "plaintext",
					section: currentSection,
				});
				continue;
			}

			// Handle inline code blocks
			if (token.type === "code_block") {
				// Save previous text chunk if exists
				if (currentChunk.trim()) {
					chunks.push({
						content: currentChunk.trim(),
						type: "text",
						section: currentSection,
					});
					currentChunk = "";
				}

				chunks.push({
					content: token.content.trim(),
					type: "code",
					language: "plaintext",
					section: currentSection,
				});
				continue;
			}

			// Accumulate text content
			if (token.type === "inline") {
				currentChunk += token.content;
			} else if (token.type === "paragraph_open") {
				// Start paragraph
			} else if (token.type === "paragraph_close") {
				currentChunk += "\n\n";
			} else if (token.type === "list_item_open") {
				currentChunk += "- ";
			} else if (token.type === "list_item_close") {
				currentChunk += "\n";
			}

			// Check token limit
			if (this.estimateTokenCount(currentChunk) > metadata.maxTokens) {
				chunks.push({
					content: currentChunk.trim(),
					type: "text",
					section: currentSection,
				});
				currentChunk = "";
			}
		}

		// Add remaining content
		if (currentChunk.trim()) {
			chunks.push({
				content: currentChunk.trim(),
				type: "text",
				section: currentSection,
			});
		}

		// Filter out very small chunks (less than 20 characters)
		return chunks.filter((chunk) => chunk.content.length >= 20);
	}

	/**
	 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
	 */
	private estimateTokenCount(text: string): number {
		return Math.ceil(text.length / 4);
	}
}
