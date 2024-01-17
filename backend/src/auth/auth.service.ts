import { Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService) {}

	async issueJwtToken(socialProvider: string, socialUid: string, nickname: string) {
		const user = await this.usersService.findOrCreate(socialProvider, socialUid, nickname);

		if (user) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { socialProvider: _socaialProvider, socialUid: _social, ...result } = user;

			return result;
		}

		return null;
	}
}
