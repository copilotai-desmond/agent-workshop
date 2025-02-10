import { z } from 'zod';
import { GraphState } from './state';
import { defaultLlm } from './utils';
import { ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { AIMessage } from '@langchain/core/messages';

const synthesizerPrompt = `
You are an agent specialized in finding a destination for a human to vacation in from a list of possible destinations.

You will be provided information about a list of possible destinations.
From only the provided list of possible destinations below, choose the best destination according to the human's requirements.
If nothing matches the human's requirements, say so and give a possible alternative from the list.

Give the following details as part of the response:
- The name of the city
- The average flight cost to the city from the human's location. If you don't know the human's location, ask them for the location.
- Some tourist attractions in the city
- Some food recommendations
- The person it was recommended by.

Possible Destinations:
{possibleDestinations}
`;

export const synthesizerNodeName = 'synthesizer-node';

/**
 * Takes state from the results of all our workers to recommend a destination for the human
 * @param state 
 * @returns 
 */
export async function syncthesizerNode(state: GraphState): Promise<Partial<GraphState>> {
    // Get all of the possible destinations from state
    const { possibleDestinations } = state;

    // Create our llm interface with a structured output
    const llm = defaultLlm.withStructuredOutput(z.object({
        winningDestination: z.string().describe('The best destination according to the human\'s requirements.'),
        details: z.string().describe('The details of the winning destination.'),
        recommendedBy: z.string().describe('The person who recommended the destination.'),
    }));

    // Build our chat prompt messages
    const systemPrompt = SystemMessagePromptTemplate.fromTemplate(synthesizerPrompt);
    const messages = ChatPromptTemplate.fromMessages([
        systemPrompt,
        new MessagesPlaceholder('messages'),
    ]);
    const chain = messages.pipe(llm);

    // Invoke the chain with the current state of our conversation and the possible destinations
    const response = await chain.invoke({
        messages: state.messages,
        possibleDestinations: possibleDestinations.join('\n---------------------'),
    });

    // Generate a message for us to send to the human
    const resultingMessage = new AIMessage(`The best destination for you is ${response.winningDestination} recommended by ${response.recommendedBy}.\n${response.details}`);

    // Update our state by appending the resulting message
    return { messages: [resultingMessage]}
}