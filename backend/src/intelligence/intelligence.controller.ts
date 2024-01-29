import { Controller, Get, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { IntelligenceService } from "./intelligence.service";
import { AuthroizedRequest } from "src/utils/types/req.type";

@ApiTags("Intelligences")
@ApiBearerAuth()
@Controller("intelligence")
export class IntelligenceController {
	constructor(private intelligenceService: IntelligenceService) {}

	@Get(":feature")
	@ApiOperation({
		summary: "Run the Yorkie Intelligence Feature",
		description: "Run the selected yorkie intelligence",
	})
	@ApiParam({
		name: "feature",
		description: "Feature of intelligence to run",
	})
	@ApiOkResponse({ type: String })
	async runFeature(@Req() req: AuthroizedRequest): Promise<string> {
		return "Test";
	}
}
