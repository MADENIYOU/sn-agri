'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type AgriculturalInsightsSummaryOutput } from './schemas';


export async function summarizeAgriculturalInsights(input: { articles: string[] }): Promise<AgriculturalInsightsSummaryOutput> {
    const prompt = `Résumez les articles/rapports agricoles suivants. Concentrez-vous sur les tendances clés, les défis et les opportunités. Fournissez un résumé concis en français.\n\nArticles:\n${input.articles.join('\n\n')}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { summary: text };
}
