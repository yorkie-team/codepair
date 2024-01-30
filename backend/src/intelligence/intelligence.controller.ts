import { Body, Controller, Param, Post, Req, Res } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";
import { IntelligenceService } from "./intelligence.service";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { Feature } from "./types/feature.type";
import { RunFeatureDto } from "./dto/run-feature.dto";
import { Response } from "express";
import { RunFollowUpDto } from "./dto/run-followup.dto";

@ApiTags("Intelligences")
@ApiBearerAuth()
@Controller("intelligence")
export class IntelligenceController {
	constructor(private intelligenceService: IntelligenceService) {}

	@Post("")
	@ApiOperation({
		summary: "Run the Follow Up Yorkie Intelligence after Feature Running",
		description: "Run the follow up requests",
	})
	@ApiBody({
		type: RunFollowUpDto,
	})
	@ApiOkResponse({ type: String })
	async runFollowUp(
		@Req() req: AuthroizedRequest,
		@Res() res: Response,
		@Body() runFollowUpDto: RunFollowUpDto
	): Promise<void> {
		await this.intelligenceService.runFollowUp(req.user.id, runFollowUpDto, (chunk) =>
			res.write(chunk)
		);

		res.end();
	}

	@Post(":feature")
	@ApiOperation({
		summary: "Run the Yorkie Intelligence Feature",
		description: "Run the selected yorkie intelligence",
	})
	@ApiParam({
		name: "feature",
		description: "Feature of intelligence to run",
		enum: Feature,
	})
	@ApiOkResponse({ type: String })
	async runFeature(
		@Req() req: AuthroizedRequest,
		@Res() res: Response,
		@Param("feature") feature: Feature,
		@Body() runFeatureDto: RunFeatureDto
	): Promise<void> {
		await this.intelligenceService.runFeature(req.user.id, feature, runFeatureDto, (chunk) =>
			res.write(chunk)
		);

		res.end();
	}
}
