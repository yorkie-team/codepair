class YorkieDocument {
	id: string;
	key: string;
	root?: string;
	presences?: { [clientId: string]: { data: { [key: string]: string } } };
	createdAt: string;
	updatedAt: string;
	accessedAt: string;
}

export class FindDocumentsFromYorkieResponse {
	documents: Array<YorkieDocument>;
}
