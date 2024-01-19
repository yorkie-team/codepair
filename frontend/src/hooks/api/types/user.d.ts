export interface User {
	id: string;
	nickname: string;
	createdAt: Date;
	updatedAt: Date;
}

export class GetUserResponse extends User {}
