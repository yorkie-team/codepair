import { ShareRoleEnum } from "../constants/share-role";

export class SharingPayload {
	documentId: string;
	role: ShareRoleEnum;
}
