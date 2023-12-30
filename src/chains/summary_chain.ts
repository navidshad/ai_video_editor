import { LLMChain } from "langchain/chains";
import { OpenAIChat } from "langchain/llms/openai";
import { ChatPromptTemplate } from "langchain/prompts";

const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
		You are a video director who can edit videos based transcripts, by choosing best sentences and combining them.
		Instructions:
			1. Read the transcript which include time stamp.
			2. Choose different parts based user expectation.
			4. Combine them and keep same format as transcript.
			5. return the new transcript with keeping time data, without any extra description.
	`,
  ],
  [
    "user",
    `
    This is user expectation:
    {userExpectation}

		This is the transcript:
		{transcript}

		Summary:
	`,
  ],
]);

const model = new OpenAIChat({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4-1106-preview",
});

export const summaryChain = new LLMChain({
  llm: model,
  prompt: chatPromptTemplate,
});
