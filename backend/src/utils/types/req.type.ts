export type AuthorizedUser = {
	id: string;
	nickname: string;
};

export type AuthorizedRequest = Request & { user: AuthorizedUser };
