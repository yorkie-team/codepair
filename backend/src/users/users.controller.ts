import { Body, Controller, Get, Put, Req } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConflictResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { FindUserResponse } from "./types/find-user-response.type";
import { ChangeNicknameDto } from "./dto/change-nickname.dto";

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

	@Put("")
	@ApiOperation({
		summary: "Change the Nickname of the User",
		description: "Change the nickname of the user",
	})
	@ApiBody({
		type: ChangeNicknameDto,
	})
	@ApiOkResponse()
	@ApiConflictResponse({ description: "The nickname conflicts" })
	async changeNickname(
		@Req() req: AuthroizedRequest,
		@Body() changeNicknameDto: ChangeNicknameDto
	): Promise<void> {
		return this.usersService.changeNickname(req.user.id, changeNicknameDto.nickname);
	}
}
