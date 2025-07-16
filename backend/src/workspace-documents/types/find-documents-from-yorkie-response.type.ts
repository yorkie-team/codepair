class YorkieDocument {
	id: string;
	key: string;
	root?: string;
	presences?: any;
	createdAt: string;
	updatedAt: string;
	accessedAt: string;
}

export class FindDocumentsFromYorkieResponse {
	documents: Array<YorkieDocument>;
}
