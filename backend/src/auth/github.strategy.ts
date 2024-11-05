import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-github";
import { LoginUserInfo } from "./types/login-request.type";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
	constructor(configService: ConfigService) {
		super({
			clientID: configService.get<string>("GITHUB_CLIENT_ID"),
			clientSecret: configService.get<string>("GITHUB_CLIENT_SECRET"),
			callbackURL: configService.get<string>("GITHUB_CALLBACK_URL"),
			authorizationURL: configService.get<string>("GITHUB_AUTHORIZATION_URL"),
			tokenURL: configService.get<string>("GITHUB_TOKEN_URL"),
			userProfileURL: configService.get<string>("GITHUB_USER_PROFILE_URL"),
			scope: ["public_profile"],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile
	): Promise<LoginUserInfo> {
		return {
			socialProvider: "github",
			socialUid: profile.id,
			nickname: profile.username,
		};
	}
}
