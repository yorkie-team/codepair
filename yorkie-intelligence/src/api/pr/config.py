from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate

example_prompt = PromptTemplate.from_template(
    "[Example]\n## Title\n{title}\n## Content\n{content}"
)

examples = [
    {
        "title": "Error with `qemu` when launching `yorkie` project using `yorkieteam/yorkie` image on Apple M1",
        "content": """<!--  Thanks for sending a pull request! -->
        
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
        """,
    },
    {
        "title": "Introduce broadcast API for event sharing",
        "content": """<!--  Thanks for sending a pull request! -->

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
- [x] Didn't break anything""",
    },
    {
        "title": "Enhance Tree.Edit to manage Merge and Split scenarios",
        "content": """<!--  Thanks for sending a pull request! -->

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
- [x] Didn't break anything""",
    },
]

issue_template_prompt = FewShotPromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
    prefix="I want you to act as a GitHub PR Writer for me. I'll provide you with brief notes about GitHub PR, and you just need to write the PR. "
    "Please ensure that you follow the template used in example provided. Do not provide the example as it is. Please write your responses in English. "
    "If there is insufficient information to create the PR, request additional information",
    suffix="Brief information about the GitHub PR: {content}",
    input_variables=["content"],
)
