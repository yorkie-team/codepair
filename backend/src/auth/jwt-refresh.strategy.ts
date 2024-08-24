import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as PassportJwtStrategy } from "passport-jwt";
import { JwtPayload } from "src/utils/types/jwt.type";
import { AuthorizedUser } from "src/utils/types/req.type";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	PassportJwtStrategy, "refresh"
) {
	constructor(configService: ConfigService) {
		super({
      		jwtFromRequest: (req: Request) => {
				if (req && (req.body as any).refresh_token) {
					return (req.body as any).refresh_token;
				}
				return null;
			},
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
		});
	}

	async validate(payload: JwtPayload): Promise<AuthorizedUser> {
		return { id: payload.sub, nickname: payload.nickname };
	}
}
