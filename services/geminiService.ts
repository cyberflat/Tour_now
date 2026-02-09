
import { GoogleGenAI } from "@google/genai";
import { CompanionType } from "../types";

// Always use the API key directly from process.env.API_KEY and use named parameters for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecommendationReason = async (
  placeName: string,
  overview: string,
  companion: CompanionType
): Promise<string> => {
  // Use gemini-3-flash-preview for basic text tasks as recommended.
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    장소 이름: ${placeName}
    장소 설명: ${overview}
    동행인 유형: ${companion}

    위 정보를 바탕으로, 해당 동행인(가족, 커플, 친구, 나홀로 등)과 함께 이 장소를 방문해야 하는 특별한 이유를 2~3문장 내외로 친근하고 설득력 있게 작성해주세요. 
    전문 가이드처럼 말하되, 너무 딱딱하지 않게 한국어로 작성해주세요.
  `;

  try {
    // Correct usage of generateContent passing model and contents directly.
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // Extract text output using the .text property (not a method call).
    return response.text || "이 장소의 매력을 직접 방문하여 느껴보세요!";
  } catch (error) {
    console.error("Gemini AI Reason Generation Error:", error);
    return "당신에게 어울리는 특별한 매력을 가진 장소입니다.";
  }
};
