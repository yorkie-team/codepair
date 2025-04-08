from langchain_core.prompts import (
    PromptTemplate,
    FewShotPromptTemplate,
    ChatPromptTemplate,
    MessagesPlaceholder,
)

example_prompt = PromptTemplate.from_template(
    "<Start of Example>\n## Title\n{title}\n## Issue Type\n{issueType}\n## Content\n{content}\n<End of Example>"
)

examples = [
    {
        "title": "Error with `qemu` when launching `yorkie` project using `yorkieteam/yorkie` image on Apple M1",
        "issueType": "bug 🐞",
        "content": """<!-- Please use this template while reporting a bug and provide as much info as possible. Not doing so may result in your bug not being addressed in a timely manner. Thanks!-->
        
**What happened**:
When launch \`yorkie\` project using \`yorkieteam/yorkie\` image. got error about \`qemu\` like below.

\`\`\`sh
yorkie  | qemu: uncaught target signal 11 (Segmentation fault) - core dumped
\`\`\`

this is known issue on \`QEMU\` and I can not find how to resolve. but I attached related urls.

**What you expected to happen**:
\`yorkie\` work properly.

**How to reproduce it (as minimally and precisely as possible)**:
referenced [this issue](https://gitlab.com/qemu-project/qemu/-/issues/340) which gitlab, \`QEMU\`'s original repository.  
**Rechardson Dx** said try to edit \`dockerfile\` and \`docker-compose\`. I do not tested.

**Anything else we need to know?**:
I attached related urls below

    - [QEMU issue](https://gitlab.com/qemu-project/qemu/-/issues/340)
    - [stackoverflow answer about qemu](https://stackoverflow.com/questions/68862313/qemu-uncaught-target-signal-11-segmentation-fault-core-dumped-in-docker-con)

**Environment**:
- Operating system: OSX Big Sur 11.5.2 apple m1
- Browser and version: chrome, safari
- Yorkie version (use \`yorkie version\`): 0.1.6 
- Yorkie JS SDK version: 0.1.6 
        """,
    },
    {
        "title": "Introduce broadcast API for event sharing",
        "issueType": "enhancement 🌟",
        "content": """<!-- Please only use this template for submitting enhancement requests -->
**What would you like to be added**:
Yorkie presently relies on the Publish-Subscribe model for sharing document and presence events (refer to: [pub-sub.md](https://github.com/yorkie-team/yorkie/blob/main/design/pub-sub.md)).
However, this lacks the capability to extend its scope to encompass additional event types, notably notifications for end users  concerning new document updates or comments.
To address this limitation, the introduction of a "broadcast" feature is recommended.
This feature would enable users to define and share a wider range of general events beyond the existing document and presence events.
It's also related to #442, which extracts \`Room\` from \`Document\` and moves \`Presence\` from \`Client\` to \`Room\`.
**Why is this needed**:
Provide a more comprehensive event-sharing mechanism that satisfies various use cases.""",
    },
    {
        "title": "Enhance Tree.Edit to manage Merge and Split scenarios",
        "issueType": "common issue 🐾",
        "content": """<!-- Please only use this template for submitting common issues -->

**Description**:

Move \`Client.Watch\` inside \`Client.Attach\` and hide it from the external interface.

Go SDK is just used in integration tests of servers without other SDK installations. So it was OK to expose \`Client.Watch\` to the external interface. But by adding more and more features to the SDK, it is quite difficult to keep simple tests.

Let's move Client.Watch inside Client.Attach and hide it from the external interface to maintain consistency with other SDKs and simplify testing.

**Why**:

Keep the product simple""",
    },
]

issue_template_prompt = FewShotPromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
    prefix="I want you to act as a GitHub Issue writer. I will provide brief information about the GitHub issue I want to create, and you should write the GitHub issue. "
    "The types of issues you can write are bug 🐞 or enhancement 🌟. Please ensure that you follow the template used in each type of issue example provided. Do not provide the example as it is. Please write your responses in English. "
    "If there is insufficient information to create the issue, request additional information.",
    suffix="Brief information about the GitHub issue: {content}",
    input_variables=["content"],
)

chat_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "I would like you to function like an AI intelligence for a Markdown editor similar to Notion. I will provide you with a conversation log between the user and the AI intelligence, and you just need to respond to the user's latest question.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{content}"),
    ]
)
