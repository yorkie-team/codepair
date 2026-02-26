import { createContext, useContext, ReactNode } from "react";
import * as yorkie from "@yorkie-js/sdk";
import type { CodePairDocType } from "@codepair/codemirror";

interface CollaborationContextValue {
	doc: CodePairDocType | null;
	client: yorkie.Client | null;
}

const CollaborationContext = createContext<CollaborationContextValue>({
	doc: null,
	client: null,
});

export function useCollaboration() {
	return useContext(CollaborationContext);
}

interface CollaborationProviderProps {
	doc: CodePairDocType | null;
	client: yorkie.Client | null;
	children: ReactNode;
}

export function CollaborationProvider({ doc, client, children }: CollaborationProviderProps) {
	return (
		<CollaborationContext.Provider value={{ doc, client }}>
			{children}
		</CollaborationContext.Provider>
	);
}
