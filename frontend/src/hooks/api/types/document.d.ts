export class Document {
	id: string;
	yorkieDocumentId: string;
	title: string;
	slug: string;
	content?: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetDocumentResponse extends Document {}
