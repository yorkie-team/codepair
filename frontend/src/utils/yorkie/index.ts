import { YRange } from "./y-range.js";
import { ySync, ySyncFacet, YSyncConfig } from "./y-sync.js";
import { yRemoteSelections, yRemoteSelectionsTheme } from "./y-remote-selections.js";
import { yUndoManagerKeymap } from "./y-undomanager.js";
import * as yorkie from "yorkie-js-sdk";

export {
	YRange,
	yRemoteSelections,
	yRemoteSelectionsTheme,
	ySync,
	ySyncFacet,
	YSyncConfig,
	yUndoManagerKeymap,
};

export function yorkieCodeMirror<T, P extends yorkie.Indexable>(
	doc: yorkie.Document<T, P>,
	awareness
) {
	const ySyncConfig = new YSyncConfig(doc, awareness);
	const plugins = [ySyncFacet.of(ySyncConfig), ySync];

	if (awareness) {
		plugins.push(yRemoteSelectionsTheme, yRemoteSelections);
	}

	return plugins;
}
