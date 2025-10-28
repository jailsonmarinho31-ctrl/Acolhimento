import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Person, Stage, Journey } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function getDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function generateNextBestAction(
    person: Person,
    stage: Stage,
    journey: Journey,
    lastTouchpointDate?: string
): Promise<string> {
    
    const daysSinceCreation = getDaysSince(person.created_at);
    const daysSinceLastTouch = lastTouchpointDate ? getDaysSince(lastTouchpointDate) : daysSinceCreation;

    const prompt = `
        Você é um assistente pastoral experiente. Baseado nos dados de uma pessoa em acompanhamento na igreja, 
        sugira a "próxima melhor ação" de forma concisa, clara e direta.

        Dados da Pessoa:
        - Nome: ${person.name}
        - Jornada Atual: "${journey.name}"
        - Estágio Atual: "${stage.name}"
        - Urgência: ${person.urgency}
        - Dias desde a decisão: ${daysSinceCreation}
        - Dias desde o último contato: ${daysSinceLastTouch}
        - Prazo para 1ª visita: ${person.first_visit_due ? new Date(person.first_visit_due).toLocaleDateString('pt-BR') : 'N/A'}

        Responda APENAS com a ação sugerida. Exemplos: 
        "Realizar o 1º contato (Prazo de 48h expirando!)"
        "Agendar 1ª visita até ${person.first_visit_due ? new Date(person.first_visit_due).toLocaleDateString('pt-BR') : 'a data limite'}"
        "Acompanhar andamento do Bloco 2 do Discipulado"
        "Marcar entrevista pastoral (Discipulado concluído)"
        "Realizar visita de reconciliação"
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Erro ao sugerir ação. Verifique a API Key e a conexão.";
    }
}