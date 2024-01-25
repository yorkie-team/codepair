import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CheckService } from "./check.service";
import { CheckNameConflictDto } from "./dto/check-name-conflict.dto";
import { CheckNameConflicReponse } from "./types/check-name-conflict-response.type";
import { Public } from "src/utils/decorators/auth.decorator";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CheckYorkieDto } from "./dto/check-yorkie.dto";
import { CheckYorkieResponse } from "./types/check-yorkie-response.type";

@ApiTags("Check")
@Controller("check")
export class CheckController {
	constructor(private checkService: CheckService) {}

	@Public()
	@Post("name-conflict")
	@ApiOperation({
		summary: "Check Whether The Name Conflicts with Username or Title of Workspace.",
		description: "If the name is conflict, it returns true.",
	})
	@ApiBody({ type: CheckNameConflictDto })
	@ApiOkResponse({ type: CheckNameConflicReponse })
	async checkNameConflict(
		@Body() checkNameConflictDto: CheckNameConflictDto
	): Promise<CheckNameConflicReponse> {
		return this.checkService.checkNameConflict(checkNameConflictDto.name);
	}

	@Public()
	@Post("yorkie")
	@ApiOperation({
		summary: "Check Whether The Access is Authorized",
		description: "If the user doesn't have the permission, reject the access",
	})
	@ApiBody({ type: CheckNameConflictDto })
	@ApiOkResponse({ type: CheckNameConflicReponse })
	@HttpCode(HttpStatus.OK)
	async checkYorkie(@Body() checkYorkieDto: CheckYorkieDto): Promise<CheckYorkieResponse> {
		return this.checkService.checkYorkie(checkYorkieDto);
	}
}
