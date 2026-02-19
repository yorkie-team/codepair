import * as yorkie from "@yorkie-js/sdk";
import { YorkieDocType, YorkiePresenceType } from "./plugins/yorkie/yorkieSync";

export type CodePairDocType = yorkie.Document<YorkieDocType, YorkiePresenceType>;

// Re-export CodeKeyType from the shared package
export { CodeKeyType } from "@codepair/ui";
