
import { GoogleGenAI } from "@google/genai";
import { CompanionType } from "../types";

export const generateRecommendationReason = async (
  placeName: string,
  overview: string,
  companion: CompanionType
): Promise<string> => {
  // process.env 접근 시 발생할 수 있는 ReferenceError 방지를 위해 호출 시점에 초기화
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "AI 추천 이유를 생성하려면 API_KEY 설정이 필요합니다.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    장소 이름: ${placeName}
    장소 설명: ${overview}
    동행인 유형: ${companion}

    위 정보를 바탕으로, 해당 동행인(가족, 커플, 친구, 나홀로 등)과 함께 이 장소를 방문해야 하는 특별한 이유를 2~3문장 내외로 친근하고 설득력 있게 작성해주세요. 
    전문 가이드처럼 말하되, 너무 딱딱하지 않게 한국어로 작성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "이 장소의 매력을 직접 방문하여 느껴보세요!";
  } catch (error) {
    console.error("Gemini AI Reason Generation Error:", error);
    return "당신에게 어울리는 특별한 매력을 가진 장소입니다.";
  }
};
