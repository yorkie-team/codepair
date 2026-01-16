// MongoDB Vector Search result types
export interface MongoVectorSearchResult {
	cursor: {
		firstBatch: MongoChunkResult[];
	};
}

export interface MongoChunkResult {
	_id: string;
	document_id: string;
	workspace_id: string;
	content: string;
	chunk_type: string;
	language?: string;
	section?: string;
	chunk_index: number;
	score: number;
}
