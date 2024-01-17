export type AuthorizedUser = {
	id: string;
	nickname: string;
};

export type AuthroizedRequest = Request & { user: AuthorizedUser };
