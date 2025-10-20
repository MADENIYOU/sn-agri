'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type CropRecommendationSearchInput, type CropRecommendationSearchOutput } from './schemas';


export async function cropRecommendationSearch(input: CropRecommendationSearchInput): Promise<CropRecommendationSearchOutput> {
    const prompt = `
En tant que conseiller agricole pour le Sénégal, recommandez les meilleures cultures en fonction des conditions agricoles suivantes.
Fournissez une liste de 2-3 cultures appropriées et un raisonnement clair pour vos choix dans un format JSON valide comme celui-ci: {"crops": ["Culture1", "Culture2"], "reasoning": "Votre raisonnement ici."}. La réponse doit être en français.

Conditions de la ferme:
- Région au Sénégal: ${input.region}
- Type de sol: ${input.soilType}
- Conditions météorologiques actuelles: ${input.weatherConditions}
- Préférences de l'agriculteur (facultatif): ${input.preferences || 'Aucune'}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // The AI sometimes wraps the JSON in a markdown code block, so we strip it.
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = match ? match[1] : text;

    // The AI is asked to return a JSON string, so we parse it.
    try {
      const parsedResponse = JSON.parse(jsonString);
      return parsedResponse;
    } catch (e) {
        console.error("Failed to parse AI response as JSON:", text);
        // Handle cases where the AI doesn't return valid JSON
        return {
            crops: ["Erreur"],
            reasoning: "La réponse de l'IA n'a pas pu être interprétée. Réponse brute : " + text,
        };
    }
}
