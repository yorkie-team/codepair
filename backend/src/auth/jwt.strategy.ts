import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy as PassportJwtStrategy } from "passport-jwt";
import { JwtPayload } from "src/utils/types/jwt.type";
import { AuthorizedUser } from "src/utils/types/req.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy, "jwt") {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
		});
	}

	async validate(payload: JwtPayload): Promise<AuthorizedUser> {
		return { id: payload.sub, nickname: payload.nickname };
	}
}
