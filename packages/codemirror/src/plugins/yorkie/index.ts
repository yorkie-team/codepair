import {
	yorkieSync,
	yorkieSyncFacet,
	YorkieSyncConfig,
	YorkiePresenceType,
	YorkieDocType,
} from "./yorkieSync";
import { yorkieRemoteSelections, yorkieRemoteSelectionsTheme } from "./remoteSelection";
import * as yorkie from "@yorkie-js/sdk";

export { yorkieSync, yorkieSyncFacet, YorkieSyncConfig };

export function yorkieCodeMirror<T extends YorkieDocType, P extends YorkiePresenceType>(
	doc: yorkie.Document<T, P>,
	client: yorkie.Client
) {
	const yorkieSyncConfig = new YorkieSyncConfig(doc, client);
	const plugins = [yorkieSyncFacet.of(yorkieSyncConfig), yorkieSync];

	if (client) {
		plugins.push(yorkieRemoteSelectionsTheme, yorkieRemoteSelections);
	}

	return plugins;
}
