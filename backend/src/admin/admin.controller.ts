import { Controller, Post, Query } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Public } from "src/utils/decorators/auth.decorator";
import { ApiQuery } from "@nestjs/swagger";

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
	async migrate(@Query("last_document_id") lastDocumentId: string) {
		this.adminService.migrateData("backup", lastDocumentId);
	}
}
