// 'use server';

/**
 * @fileOverview An AI agent for crop recommendation search in Senegal.
 *
 * - cropRecommendationSearch - A function that handles the crop recommendation search process.
 * - CropRecommendationSearchInput - The input type for the cropRecommendationSearch function.
 * - CropRecommendationSearchOutput - The return type for the cropRecommendationSearch function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropRecommendationSearchInputSchema = z.object({
  region: z.string().describe('The region in Senegal where the farmer is located.'),
  soilType: z.string().describe('The type of soil available (e.g., sandy, clay, loam).'),
  weatherConditions: z.string().describe('The current weather conditions in the region.'),
  preferences: z
    .string()
    .optional()
    .describe('Any specific preferences or constraints the farmer has (e.g., drought resistance, market demand).'),
});

export type CropRecommendationSearchInput = z.infer<typeof CropRecommendationSearchInputSchema>;

const CropRecommendationSearchOutputSchema = z.object({
  crops: z
    .array(z.string())
    .describe('A list of recommended crops based on the input criteria.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the crop recommendations, explaining why each crop is suitable.'),
});

export type CropRecommendationSearchOutput = z.infer<typeof CropRecommendationSearchOutputSchema>;

export async function cropRecommendationSearch(
  input: CropRecommendationSearchInput
): Promise<CropRecommendationSearchOutput> {
  return cropRecommendationSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationSearchPrompt',
  input: {schema: CropRecommendationSearchInputSchema},
  output: {schema: CropRecommendationSearchOutputSchema},
  prompt: `You are an expert agricultural advisor for farmers in Senegal.

  Based on the farmer's region, soil type, weather conditions, and preferences, you will recommend a list of crops that are best suited for their needs.
  You will also provide a reasoning for each crop recommendation, explaining why it is a good choice.

  Region: {{{region}}}
  Soil Type: {{{soilType}}}
  Weather Conditions: {{{weatherConditions}}}
  Preferences: {{{preferences}}}
  `,
});

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === retries - 1) throw err;
      console.warn(`Retry attempt ${attempt + 1} failed: ${err.message}`);
      await new Promise(res => setTimeout(res, delay));
      attempt++;
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error('Retry attempts exhausted');
}

/**
 * Crop Recommendation Search Flow.
 */
export const cropRecommendationSearchFlow = ai.defineFlow(
  {
    name: 'cropRecommendationSearchFlow',
    inputSchema: CropRecommendationSearchInputSchema,
    outputSchema: CropRecommendationSearchOutputSchema,
  },
  async input => {
    const { output } = await withRetry(() => prompt(input));
    return output!;
  }
);
