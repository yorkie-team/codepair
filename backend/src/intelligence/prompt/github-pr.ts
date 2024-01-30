import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from "langchain/prompts";

const examplePrompt = ChatPromptTemplate.fromTemplate("## Title\n{title}\n## Content\n{content}");

const examples = [
	{
		title: "Introduce MongoDB sharding rules to Project-wide and Document-wide collections",
		content: `<!--  Thanks for sending a pull request! -->

**What this PR does / why we need it**:
This PR introduces MongoDB sharding rules to Project-wide and Document-wide collections.

There are three types of collections:
1. Cluster-wide: \`users\`, \`projects\` (expected data count: less than \`10,000\`)
4. Project-wide: \`documents\`, \`clients\` (expected data count: more than \`1\` million)
7. Document-wide: \`changes\`, \`snapshots\`, \`syncedseqs\` (expected data count: more than \`100\` million)

We determine whether a collection is required to be sharded based on the expected data count of its types.
1. Cluster-wide: not sharded
2. Project-wide, Document-wide: sharded 

Project-wide collections contain range queries using a \`project_id\` filter, and document-wide collections usually contain them using a \`doc_id\` filter.
We choose the shard key based on the query pattern of each collection: 
1. Project-wide: \`project_id\`
2. Document-wide: \`doc_id\`

This involves changes in reference keys of collections:
1. \`documents\`: \`_id\` -> \`(project_id, _id)\`
2. \`clients\`: \`_id\` -> \`(project_id, _id)\`
4. \`changes\`: \`_id\` -> \`(project_id, doc_id, server_seq)\`
5. \`snapshots\`: \`_id\` -> \`(project_id, doc_id, server_seq)\`
6. \`syncedseqs\`: \`_id\` -> \`(project_id, doc_id, client_id)\`

Therefore, if we have an existing MongoDB instance, data migration is mandatory before using the MongoDB sharded cluster.
After connecting to the MongoDB through \`mongosh\`, declare the following function and execute it.

\`\`\`ts
function addProjectIDFrom(id = 0, limit = 20000, dbname='yorkie-meta-prev') {{
	const previousID = ObjectId(id);
	const docs = db.getSiblingDB(dbname).documents.find({{_id:{{$gte:previousID}}}}).sort({{_id: 1}}).limit(limit);
	while (docs.hasNext()) {{
		const doc = docs.next();
		const docID = doc._id;
		const projectID = doc.project_id;
	
		console.log("doc", docID.toString(), "start");
		db.getSiblingDB(dbname).changes.updateMany(
			{{doc_id:{{$eq:docID}}}},
			{{$set: {{project_id: projectID}}}});
		db.getSiblingDB(dbname).snapshots.updateMany(
			{{doc_id:{{$eq:docID}}}},
			{{$set: {{project_id: projectID}}}});
		db.getSiblingDB(dbname).syncedseqs.updateMany(
			{{doc_id:{{$eq:docID}}}},
			{{$set: {{project_id: projectID}}}});
		console.log("doc", docID.toString(), "end");
	}}
}}

addProjectIDFrom(0, 20000, <db-name>)
\`\`\`


**Which issue(s) this PR fixes**:
<!--
*Automatically closes linked issue when PR is merged.
Usage: \`Fixes #<issue number>\`, or \`Fixes (paste link of issue)\`.
-->
Fixes #673

**Special notes for your reviewer**:

**Does this PR introduce a user-facing change?**:
<!--
If no, just write "NONE" in the release-note block below.
If yes, a release note is required:
Enter your extended release note in the block below. If the PR requires additional action from users switching to the new release, include the string "action required".
-->
\`\`\`release-note

\`\`\`

**Additional documentation**:

<!--
This section can be blank if this pull request does not require a release note.

Please use the following format for linking documentation:
- [Usage]: <link>
- [Other doc]: <link>
-->
\`\`\`docs

\`\`\`

**Checklist**:
- [x] Added relevant tests or not required
- [x] Didn't break anything
		`,
	},
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
If the information is not provided by the user, please refrain from attaching document links found elsewhere. Please respond in English.`,
	suffix: "Brief information about the GitHub PR: {content}",
	examplePrompt,
	examples,
	inputVariables: ["content"],
});
