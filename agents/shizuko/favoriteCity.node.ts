import { HumanMessage } from "@langchain/core/messages";
import type { State } from "./state";

function responseFormatter(name: string, favoriteCity: string): HumanMessage {
    return new HumanMessage(`My name is ${name} and my favorite city is ${favoriteCity}`);
}

export async function desmondsFavoriteCity(state: State): Promise<Partial<State>> {
    // Implment logic for node to retrieve favorite city
    return { messages: [responseFormatter("Shizuko", "London")] };
}

export const favoriteCityNodeName = 'favorite-city-retriever';