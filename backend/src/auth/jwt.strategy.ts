import { ExtractJwt, Strategy as PassportJwtStrategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { JwtPayload } from "src/utils/types/jwt.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy) {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_SECRET"),
		});
	}

	async validate(payload: JwtPayload) {
		return { id: payload.sub, nickname: payload.nickname };
	}
}
