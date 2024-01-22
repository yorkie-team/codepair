import { User } from "./user";

export class GetWorkspaceUserListResponse {
	cursor: string | null;
	workspaceUsers: Array<User>;
}
