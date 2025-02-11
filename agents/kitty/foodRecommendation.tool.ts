import { tool } from "@langchain/core/tools";
import { z } from "zod";

const paramSchema = z.object({
    city: z.string().describe('The city for which to get food recommendations.')
});

type FoodRecommendations = "Suspiciously good pizza" | "The best tacos in town" | "A hidden gem for sushi";

async function getFoodRecommendations({
    city
}: z.infer<typeof paramSchema>): Promise<FoodRecommendations[]> {
    // Implement food recommendation retrieval logic
    throw new Error('Not implemented');
}

export const foodRecommendationTool = tool(
    getFoodRecommendations,
    {
        name: 'get_food_recommendation',
        description: 'Get food recommendations for a city.',
        schema: paramSchema
    });