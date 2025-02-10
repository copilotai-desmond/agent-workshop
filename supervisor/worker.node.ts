import { CompiledStateGraph } from "@langchain/langgraph";
import { WorkerState } from "./state";
import { State } from "../agents/desmond/state";
import { ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { defaultLlm } from "./utils";
import { z } from "zod";

const responseFormat = z.object({
    recommendedBy: z.string().describe('The person who recommended the destination. Use proper capitalization for names.'),
    cityName: z.string().describe('The name of the city.'),
    flightCosts: z.string().describe('The cost of a flight to the city.'),
    attractions: z.string().describe('The attractions in the city.'),
    foodRecommendations: z.string().describe('The food recommendations for the city.'),
})

/**
 * Generate worker nodes to help gather possible destinations
 * @param nodeName 
 * @param node 
 * @returns 
 */
export function generateWorkerNode(nodeName: string, node: CompiledStateGraph<State, WorkerState>) {
    return async function workerNode(state: WorkerState) {
        const { currentLocation } = state;
        const { messages } = await node.invoke({
            messages: [new HumanMessage(`Current location: ${currentLocation}`)]
        });
    
        const formatterPrompt = SystemMessagePromptTemplate.fromTemplate(`You are an agent responsible for getting details out of a message regarding a destination recommended by ${nodeName.replace('node-', '')}. Use only information provided in the conversation`);
        const formatterMessages = ChatPromptTemplate.fromMessages([
            formatterPrompt,
            new MessagesPlaceholder('messages'),
        ]);
        const formatter = defaultLlm.withStructuredOutput(responseFormat);
        const chain = formatterMessages.pipe(formatter);
        const formattedResponse = await chain.invoke({
            messages: messages,
        });
        
        return { possibleDestinations: [JSON.stringify(formattedResponse)] };
    }    
}