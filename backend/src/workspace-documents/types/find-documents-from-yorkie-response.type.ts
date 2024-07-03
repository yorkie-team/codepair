class YorkieDocument {
	id: string;
	key: string;
	snapshot: string;
	createdAt: string;
	updatedAt: string;
	accessedAt: string;
}

export class FindDocumentsFromYorkieResponse {
	documents: Array<YorkieDocument>;
}
