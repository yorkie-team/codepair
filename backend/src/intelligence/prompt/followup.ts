import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";

export const followUpPromptTemplate = ChatPromptTemplate.fromMessages([
	[
		"system",
		"I would like you to function like an AI intelligence for a Markdown editor similar to Notion. I will provide you with a conversation log between the user and the AI intelligence, and you just need to respond to the user's latest question.",
	],
	new MessagesPlaceholder("chat_history"),
	["human", "{content}\nAI: "],
]);
