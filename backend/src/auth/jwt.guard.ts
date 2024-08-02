import {
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_PATH } from "src/utils/decorators/auth.decorator";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(
		private reflector: Reflector,
		private configService: ConfigService
	) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_PATH, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}

		try {
			const request = context.switchToHttp().getRequest();
			const token = request.headers.authorization?.split(" ")[1];
			if (!token) {
				throw new UnauthorizedException("Unauthorized", {
					cause: new Error(),
					description: "Token not found",
				});
			}

			const secretKey = this.configService.get<string>("JWT_AUTH_SECRET");
			const decoded = jwt.verify(token, secretKey);
			request.user = decoded;
			return super.canActivate(context);
		} catch (e) {
			if (e.name === "TokenExpiredError") {
				throw new UnauthorizedException("Unauthorized", {
					cause: new Error(),
					description: "Token has expired.",
				});
			} else if (e.name === "JsonWebTokenError") {
				throw new UnauthorizedException("Unauthorized", {
					cause: new Error(),
					description: "Invalid token",
				});
			} else {
				throw new ForbiddenException("Forbidden", {
					cause: new Error(),
					description: "Access denied",
				});
			}
		}
	}
}
