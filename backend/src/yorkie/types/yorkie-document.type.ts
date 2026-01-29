export interface YorkieDocument {
	id: string;
	key: string;
	root?: string | object;
	presences?: { [clientId: string]: { data: { [key: string]: string } } };
	createdAt: string;
	updatedAt: string;
	accessedAt: string;
}
