import { Controller, Get, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { FindUserResponse } from "./types/find-user-response.type";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get("")
	@ApiOperation({
		summary: "Retrieve the Users Information (Myself)",
		description: "Return the user information",
	})
	@ApiOkResponse({ type: FindUserResponse })
	async findOne(@Req() req: AuthroizedRequest): Promise<FindUserResponse> {
		return this.usersService.findOne(req.user.id);
	}
}
