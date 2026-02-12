import {
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC_PATH } from "src/utils/decorators/auth.decorator";
import { AuthorizedUser } from "src/utils/types/req.type";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_PATH, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}
		return super.canActivate(context);
	}

	handleRequest<User = AuthorizedUser>(err: Error, user: User, info: Error): User {
		if (err || !user) {
			if (info?.name === "TokenExpiredError") {
				throw new UnauthorizedException("Token has expired.");
			} else if (info?.name === "JsonWebTokenError") {
				throw new UnauthorizedException("Invalid token");
			} else {
				throw err || new ForbiddenException("Access denied");
			}
		}
		return user;
	}
}
