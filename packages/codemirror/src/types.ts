import * as yorkie from "@yorkie-js/sdk";
import { YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType } from "./plugins/yorkie/yorkieSync";

export type CodePairDocType = yorkie.Document<
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType
>;

export enum CodeKeyType {
	DEFAULT = "default",
	VIM = "vim",
}
