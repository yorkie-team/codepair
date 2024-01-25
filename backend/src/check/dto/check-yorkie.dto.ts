import { ApiProperty } from "@nestjs/swagger";

enum Verb {
	"r" = "r",
	"rw" = "rw",
}

export enum YorkieMethod {
	"ActivateClient" = "ActivateClient",
	"DeactivateClient" = "DeactivateClient",
	"AttachDocument" = "AttachDocument",
	"DetachDocument" = "DetachDocument",
	"WatchDocuments" = "WatchDocuments",
	"PushPull" = "PushPull",
}

class DocumentAttribute {
	@ApiProperty({ type: String, description: "Key of document" })
	key: string;

	@ApiProperty({ enum: Verb, description: "Verb of attribute" })
	verb: Verb;
}

export class CheckYorkieDto {
	@ApiProperty({ type: String, description: "Token from client" })
	token: string;

	@ApiProperty({ enum: YorkieMethod, description: "Method of Yorkie to invoke" })
	method: YorkieMethod;

	@ApiProperty({ type: Array<DocumentAttribute>, description: "Attribute to check auth" })
	attributes: Array<DocumentAttribute> | null;
}
