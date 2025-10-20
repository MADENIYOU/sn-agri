import * as z from 'zod';

// Schemas for insights
export const agriculturalInsightsSummaryOutputSchema = z.object({
  summary: z.string(),
});
export type AgriculturalInsightsSummaryOutput = z.infer<typeof agriculturalInsightsSummaryOutputSchema>;


// Schemas for search
export const cropRecommendationSearchInputSchema = z.object({
  region: z.string(),
  soilType: z.string(),
  weatherConditions: z.string(),
  preferences: z.string().optional(),
});
export type CropRecommendationSearchInput = z.infer<typeof cropRecommendationSearchInputSchema>;

export const cropRecommendationSearchOutputSchema = z.object({
  crops: z.array(z.string()),
  reasoning: z.string(),
});
export type CropRecommendationSearchOutput = z.infer<typeof cropRecommendationSearchOutputSchema>;
