export class YorkieDocument {
	id: string;
	key: string;
	createdAt: string;
	accessedAt: string;
	updatedAt: string;
}

export class ListDocuments {
	documents: Array<YorkieDocument>;
}
