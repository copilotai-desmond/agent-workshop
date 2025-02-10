import { z } from "zod";
import { defaultLlm } from "./utils";
import { GraphState } from "./state";
import { ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/messages";

const orchestratorPrompt = `
You are an agent specialized in identifying the current location of a human based on the current conversation for the purpose of finding recommended cities to travel to.

If the human has not provided their current location, ask them for it.
`;

export const orchestratorNodeName = 'orchestrator-node';

const llm = defaultLlm.withStructuredOutput(z.object({
    messageToSend: z.string().describe('The message to send to the human.'),
    currentLocation: z.string().optional().describe('The current location of the human.'),
}));

function buildChatPromptMessages() {
    const systemPrompt = SystemMessagePromptTemplate.fromTemplate(orchestratorPrompt);
    return ChatPromptTemplate.fromMessages([
        systemPrompt,
        new MessagesPlaceholder('messages'),
    ]);
}

/**
 * Entry node to help gather data for us to orchestrate the travel recommendation
 * @param state 
 * @returns 
 */
export async function orchestratorNode(state: GraphState): Promise<Partial<GraphState>> {
    // Create system prompt and message to send to our llm
    const messages = buildChatPromptMessages();

    // Create a chain that will take input, format it to our message prompt, and then feed to LLM
    const chain = messages.pipe(llm);
    // Invoke the chain with the current state of our conversation
    const response = await chain.invoke({ messages: state.messages });

    // Retrieve the structured response from the LLM 
    const { messageToSend, currentLocation } = response;

    // Update our state
    if (currentLocation) {
        return { messages: [], currentLocation };
    } else {
        return { messages: [new AIMessage(messageToSend)], currentLocation: undefined };
    }
}