import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface RagAnswerResponse {
	success: boolean;
	data: {
		answer: string;
		sources: Array<{
			documentId: string;
			documentTitle: string;
			content: string;
			score: number;
			chunkType: string;
			section?: string;
		}>;
		timings: {
			embeddingLatencyMs: number;
			vectorSearchLatencyMs: number;
			llmLatencyMs: number;
			totalLatencyMs: number;
		};
	};
}

export const useRagAnswerMutation = () => {
	return useMutation<
		RagAnswerResponse,
		Error,
		{ workspaceId: string; query: string; limit?: number }
	>({
		mutationFn: async ({ workspaceId, query, limit = 5 }) => {
			const res = await axios.post<RagAnswerResponse>("/rag/answer", {
				workspaceId,
				query,
				limit,
			});
			return res.data;
		},
	});
};

interface Source {
	documentId: string;
	documentTitle: string;
	content: string;
	score: number;
	chunkType: string;
	section?: string;
}

interface Timings {
	embeddingLatencyMs: number;
	vectorSearchLatencyMs: number;
	llmLatencyMs: number;
	totalLatencyMs: number;
}

type RagStreamChunkData =
	| { type: "sources"; data: Source[] }
	| { type: "chunk"; data: string }
	| { type: "done"; data: { timings: Timings } }
	| { type: "error"; data: string };

export type RagStreamChunk = RagStreamChunkData;

export const streamRagAnswer = async (
	workspaceId: string,
	query: string,
	onChunk: (chunk: RagStreamChunk) => void,
	limit: number = 5
): Promise<void> => {
	const response = await fetch(`${import.meta.env.VITE_API_ADDR}/rag/answer/stream`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: axios.defaults.headers.common["Authorization"] as string,
		},
		body: JSON.stringify({
			workspaceId,
			query,
			limit,
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error("Response body is not readable");
	}

	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (done) break;

			// Decode and append to buffer
			buffer += decoder.decode(value, { stream: true });

			// Process complete lines
			const lines = buffer.split("\n");
			buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

			for (const line of lines) {
				if (line.trim()) {
					try {
						const chunk = JSON.parse(line) as RagStreamChunk;
						onChunk(chunk);
					} catch (error) {
						console.error("Failed to parse chunk:", error, line);
					}
				}
			}
		}

		// Process any remaining data in buffer
		if (buffer.trim()) {
			try {
				const chunk = JSON.parse(buffer) as RagStreamChunk;
				onChunk(chunk);
			} catch (error) {
				console.error("Failed to parse final chunk:", error, buffer);
			}
		}
	} finally {
		reader.releaseLock();
	}
};
