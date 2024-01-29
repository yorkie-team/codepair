import { Controller, Post, Query } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Public } from "src/utils/decorators/auth.decorator";
import { ApiOkResponse, ApiQuery } from "@nestjs/swagger";

@Controller("admin")
export class AdminController {
	constructor(private adminService: AdminService) {}

	@Public()
	@Post("migrate")
	@ApiQuery({
		type: String,
		name: "last_document_id",
		description: "The last document ID of previous API Call",
		required: false,
	})
	@ApiQuery({
		type: String,
		name: "workspace_slug",
		description: "The slug of workspace to migrate",
	})
	async migrate(
		@Query("last_document_id") lastDocumentId: string,
		@Query("workspace_slug") workspaceSlug: string
	) {
		this.adminService.migrateData(workspaceSlug, lastDocumentId);
	}
}
