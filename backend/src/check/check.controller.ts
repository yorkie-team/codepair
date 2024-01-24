import { Controller, Post } from "@nestjs/common";
import { CheckService } from "./check.service";
import { CheckNameConflictDto } from "./dto/check-name-conflict.dto";
import { CheckNameConflicReponse } from "./types/check-name-conflict-response.type";
import { Public } from "src/utils/decorators/auth.decorator";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Check")
@Controller("check")
export class CheckController {
	constructor(private checkService: CheckService) {}

	@Public()
	@Post("name-conflicts")
	@ApiOperation({
		summary: "Check Whether The Name Conflicts with Username or Title of Workspace.",
		description: "If the name is conflict, it returns true.",
	})
	@ApiBody({ type: CheckNameConflictDto })
	@ApiOkResponse({ type: CheckNameConflicReponse })
	async checkNameConflict(
		checkNameConflictDto: CheckNameConflictDto
	): Promise<CheckNameConflicReponse> {
		return this.checkService.checkNameConflict(checkNameConflictDto.name);
	}
}
