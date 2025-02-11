import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { alexsFavoriteCity, favoriteCityNodeName } from "./favoriteCity.node";
import { State, StateAnnotation } from "./state";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { foodRecommendationTool } from "./foodRecommendation.tool";

const prompt = `
You are an agent specialized in finding information about a human's favorite city.
Ask the human what their favorite city is and provide them with some information about it. 
The information you need to provide are:
- The name of the city
- The average flight cost to the city from the human's location. If you don't know the human's location, ask them for the location.
- Some tourist attractions in the city
- Some food recommendations from the get_food_recommendation tool

System time: {systemTime}
`;

// Define the tools that the agent will use
const tools = [
    new GoogleCustomSearch(), // https://js.langchain.com/docs/integrations/platforms/google#google-search
    foodRecommendationTool,
];
const toolNode = new ToolNode(tools);

const llm = new ChatOpenAI({ model: 'gpt-4o-mini' }).bindTools(tools);
async function agentNode(state: State): Promise<Partial<State>> {
    // Create a system prompt for the agent
    const systemPrompt = SystemMessagePromptTemplate.fromTemplate(prompt);

    // Format messages into an array of system and ai / human message
    const messages = await ChatPromptTemplate.fromMessages([
        systemPrompt,
        new MessagesPlaceholder('messages'),
    ]).partial({
        systemTime: new Date().toDateString(),
    });

    // Create a chain that will pipe the list of messages into our llm
    const chain = messages.pipe(llm);

    // Invoke the chain to get a response
    const response = await chain.invoke({ messages: state.messages});

    // Update our messages state with the response
    return { messages: [response] };
}

const graphBuilder = new StateGraph(StateAnnotation)
  .addNode('agent', agentNode)
  .addNode('tools', toolNode)
  .addNode('favorite-city-retriever', alexsFavoriteCity)
  .addEdge(START, 'favorite-city-retriever')
  .addEdge('favorite-city-retriever', 'agent')
  .addEdge('agent', END)
  .addEdge('tools', 'agent')
  .addConditionalEdges('agent', toolsCondition, ['tools', END]);

const checkpointer = new MemorySaver();
export const agent = graphBuilder.compile({ checkpointer });