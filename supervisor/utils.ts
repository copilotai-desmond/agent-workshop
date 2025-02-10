import { ChatOpenAI } from "@langchain/openai";

export const defaultLlm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0.2 });