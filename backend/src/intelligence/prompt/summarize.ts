import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from "@langchain/core/prompts";

const examplePrompt = ChatPromptTemplate.fromTemplate("Original: {original}\nSummary: {summary}");

const examples = [
	{
		original:
			"Yesterday I went to the grocery store and bought some fruits and vegetables including apples, bananas, carrots, lettuce, and tomatoes. I also picked up some bread, milk, and eggs because I was running low at home. The store was quite crowded because there was a sale on many items, so I had to wait in line for about fifteen minutes to check out.",
		summary:
			"Went grocery shopping for fruits, vegetables, and essentials despite the store being crowded due to a sale.",
	},
	{
		original:
			"우리 회사는 작년에 새로운 제품을 출시했고 매출이 30% 증가했습니다. 하지만 경쟁사들도 비슷한 제품을 출시하면서 시장 점유율 경쟁이 심화되고 있습니다. 이에 대응하기 위해 우리는 마케팅 전략을 수정하고 제품의 품질을 더욱 향상시키는 방안을 고려하고 있습니다.",
		summary:
			"우리 회사는 신제품으로 매출이 증가했으나, 경쟁 심화로 마케팅 전략 수정과 품질 향상을 고려 중입니다.",
	},
	{
		original:
			"The latest artificial intelligence models have shown remarkable capabilities in natural language processing, being able to generate coherent text, translate between languages, and even write creative content. However, these models still face challenges with factual accuracy, reasoning, and understanding context in the same way humans do.",
		summary:
			"Modern AI excels at language tasks but struggles with factual accuracy, reasoning, and human-like context understanding.",
	},
	{
		original:
			"코로나19 팬데믹 이후 재택근무와 온라인 회의가 일상화되면서 디지털 협업 도구의 중요성이 커졌습니다. 많은 기업들이 클라우드 기반 서비스를 도입하고 있으며, 이는 업무 방식의 근본적인 변화를 가져오고 있습니다. 하지만 이러한 변화는 디지털 격차와 보안 문제라는 새로운 과제도 함께 제시하고 있습니다.",
		summary:
			"코로나19 이후 디지털 협업 도구와 클라우드 서비스 도입이 증가했으나, 디지털 격차와 보안 문제가 과제로 남아있습니다.",
	},
	{
		original:
			"During the meeting, we discussed several important topics including the quarterly financial results, the upcoming product launch scheduled for next month, and the new marketing strategy that will be implemented in the third quarter. We also addressed some concerns about employee retention and agreed to form a committee to explore ways to improve company culture and work-life balance.",
		summary:
			"Meeting covered quarterly finances, upcoming product launch, new marketing strategy, and plans to improve employee retention through better company culture.",
	},
];

export const summarizePromptTemplate = new FewShotChatMessagePromptTemplate({
	prefix: `You are a multilingual content summarizer. Your task is to create concise summaries of any text while preserving the key information.

Guidelines:

Maintain the original language of the input (support all languages including English and Korean)
Preserve essential facts, names, numbers, dates, locations, and key details
Remove unnecessary information, repetitions, and filler content
Keep the summary concise (about 30-50% of the original length)
Maintain the original tone and perspective when appropriate
Retain technical terms, jargon, and specialized vocabulary if present
Adapt summary length based on input length - provide minimal summarization for very short inputs
Ensure the summary can stand alone and convey the main points of the original text
For content with multiple distinct topics, include all major themes in the summary
Summarize the following text - only output the summary itself—do not include any preamble, explanation, or introductory sentence`,
	suffix: "Please summarize the following text:\n\n{content}.",
	examplePrompt,
	examples,
	inputVariables: ["content"],
});
