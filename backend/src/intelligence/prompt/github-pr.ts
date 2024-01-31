import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from "@langchain/core/prompts";

const examplePrompt = ChatPromptTemplate.fromTemplate("## Title\n{title}\n## Content\n{content}");

const examples = [
	{
		title: "Change 'Documents' from plural to singular in DocEvent",
		content: `<!--  Thanks for sending a pull request! -->

#### What this PR does / why we need it?

Change "documents" to "document" in DocEvent 

#### Any background context you want to provide?

There were previous proto changes in the js-sdk, so I have set the target branch to "concurrent-case-handling."

#### What are the relevant tickets?
<!--
*Automatically closes linked issue when PR is merged.
Usage: \`Fixes #<issue number>\`, or \`Fixes (paste link of issue)\`.
-->
Related https://github.com/yorkie-team/yorkie/issues/612

### Checklist
- [x] Added relevant tests or not required
- [x] Didn't break anything
		`,
	},
	{
		title: "Add `presence.get()` to get presence value in `doc.update()`",
		content: `<!--  Thanks for sending a pull request! -->

#### What this PR does / why we need it?

The presence value can be obtained using the \`presence.get()\` function within the \`doc.update\` function

\`\`\`js
client.attach(doc, {{
	initialPresence: {{ counter: 0 }},
}});

// as-is
doc.update((root, p) => {{
	const counter = doc.getMyPresence().counter;
	p.set({{ counter: counter + 1 }});
}});

// to-be
doc.update((root, p) => {{
	const counter = p.get('counter');
	p.set({{ counter: counter + 1 }});
}});
\`\`\`


#### Any background context you want to provide?


#### What are the relevant tickets?
<!--
*Automatically closes linked issue when PR is merged.
Usage: \`Fixes #<issue number>\`, or \`Fixes (paste link of issue)\`.
-->
Fixes #

### Checklist
- [x] Added relevant tests or not required
- [x] Didn't break anything
		`,
	},
	{
		title: "Support concurrent insertion and splitting in Tree",
		content: `<!--  Thanks for sending a pull request! -->

#### What this PR does / why we need it?
This PR introduces support for concurrent insertion and splitting in the Tree by utilizing \`leftNode.parent\` as the \`parent\` node.

#### Any background context you want to provide?
Currently, the \`parentID\` and \`leftSiblingID\` in \`CRDTTreePos\` represent positions in the Tree. In other words, they help derive the \`parentNode\` and \`leftSiblingNode\` in the Tree.

When splitting an element node, the split node receives a new nodeID (#707). This complicates concurrent editing, particularly when a remote operation, unaware of the node's split, refers to child nodes that were previously in the original node but are now in the split node. In such cases, the local cannot locate the target node because the original node no longer contains those child nodes.

Fortunately, the \`leftNode.parent\` represents the exact parent node in the current tree. Therefore, using this as a \`parent\` effectively addresses the  above problem.

In summary, the \`parentNodeID\` in \`CRDTTreePos\` is now solely used to determine whether the given position is the leftmost. Instead, substantial tree operations utilize \`leftNode.parent\` as the \`parent\`.

#### What are the relevant tickets?
<!--
*Automatically closes linked issue when PR is merged.
Usage: \`Fixes #<issue number>\`, or \`Fixes (paste link of issue)\`.
-->
Fixes #

### Checklist
- [x] Added relevant tests or not required
- [x] Didn't break anything
		`,
	},
];

export const githubPrPromptTemplate = new FewShotChatMessagePromptTemplate({
	prefix: `I want you to act as a GitHub PR Writer for me. I'll provide you with brief notes about GitHub PR, and you just need to write the PR using the examples I've provided.
Make sure to adhere to the template that we commonly follow in Example.
If the information is not provided by the user, please refrain from attaching document links found elsewhere. Please respond in English.
Please refer to the example for guidance, but generate results based on the information provided in the Brief Information section.`,
	suffix: "Brief information about the GitHub PR: {content}",
	examplePrompt,
	examples,
	inputVariables: ["content"],
});
