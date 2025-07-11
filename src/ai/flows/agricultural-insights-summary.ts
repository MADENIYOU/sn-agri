'use server';

/**
 * @fileOverview A flow that summarizes relevant agricultural news articles and market reports specific to Senegal.
 *
 * - summarizeAgriculturalInsights - A function that handles the summarization process.
 * - AgriculturalInsightsSummaryInput - The input type for the summarizeAgriculturalInsights function.
 * - AgriculturalInsightsSummaryOutput - The return type for the summarizeAgriculturalInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgriculturalInsightsSummaryInputSchema = z.object({
  articles: z.array(z.string()).describe('An array of news articles and market reports related to agriculture in Senegal.'),
});

export type AgriculturalInsightsSummaryInput = z.infer<typeof AgriculturalInsightsSummaryInputSchema>;

const AgriculturalInsightsSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided agricultural news articles and market reports, highlighting key trends and challenges in the Senegalese agricultural sector.'),
});

export type AgriculturalInsightsSummaryOutput = z.infer<typeof AgriculturalInsightsSummaryOutputSchema>;

export async function summarizeAgriculturalInsights(input: AgriculturalInsightsSummaryInput): Promise<AgriculturalInsightsSummaryOutput> {
  return agriculturalInsightsSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'agriculturalInsightsSummaryPrompt',
  input: {schema: AgriculturalInsightsSummaryInputSchema},
  output: {schema: AgriculturalInsightsSummaryOutputSchema},
  prompt: `You are an expert in the agricultural sector of Senegal.
  Your task is to summarize the following news articles and market reports to provide a concise overview of the current trends and challenges.

  Articles and Reports:
  {{#each articles}}
  - {{{this}}}
  {{/each}}

  Provide a summary that highlights the key trends, challenges, and opportunities in the Senegalese agricultural sector based on the provided information.
`,
});

const agriculturalInsightsSummaryFlow = ai.defineFlow(
  {
    name: 'agriculturalInsightsSummaryFlow',
    inputSchema: AgriculturalInsightsSummaryInputSchema,
    outputSchema: AgriculturalInsightsSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
