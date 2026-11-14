import { SocialProvider } from "src/utils/types/auth.type";

export interface LoginUserInfo {
	socialProvider: SocialProvider;
	socialUid: string;
	nickname: string;
	profileIcon: string | null;
}

export type LoginRequest = Request & { user: LoginUserInfo };
