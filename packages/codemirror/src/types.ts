import * as yorkie from "@yorkie-js/sdk";
import { YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType } from "./plugins/yorkie/yorkieSync";

export type CodePairDocType = yorkie.Document<
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType
>;

// Re-export CodeKeyType from the shared package
export { CodeKeyType } from "@codepair/ui";
