
import { GoogleGenAI, Type } from "@google/genai";
import { Report } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is not configured. Please select your key in the settings.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMarketReport = async (): Promise<Report> => {
  const ai = getAIClient();
  const now = new Date();
  const krTime = now.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const nyTime = now.toLocaleString("en-US", { timeZone: "America/New_York" });

  const prompt = `
    현재 시간 (서울): ${krTime}
    현재 시간 (뉴욕): ${nyTime}

    당신은 여의도 증권가의 수석 애널리스트입니다.
    **반드시 Google Search 도구를 사용하여** 현재 한국 주식 시장(KOSPI, KOSDAQ)과 환율, 글로벌 경제 영향을 분석하세요.
    **모든 응답은 한국어(Korean)로 작성해야 합니다.**
    
    보고서 작성 요구사항 (JSON 포맷):
    1. reportTitle: "국내 증시 데일리 브리핑 - [YYYY년 MM월 DD일]"
    2. marketIndices: 5개 핵심 지표 (KOSPI, KOSDAQ, USD/KRW(원달러 환율), S&P500(참조), VIX).
    3. marketOverview: 코스피/코스닥 시황 요약 및 외국인/기관 수급 현황 (마크다운).
    4. gainers: 한국 시장 상승 상위 종목.
    5. losers: 하락 상위 종목.
    6. aiTrend: 국내 주도 테마 (반도체/2차전지/AI) 분석.
    7. economicContext: 환율, 유가 등이 한국 시장에 미치는 영향 (마크다운).
    8. conclusion: 내일 장 전망 및 전략 (마크다운).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportTitle: { type: Type.STRING },
            marketIndices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING },
                  isPositive: { type: Type.BOOLEAN }
                },
                required: ["name", "value", "change", "isPositive"]
              }
            },
            marketOverview: { type: Type.STRING },
            gainers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticker: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  change: { type: Type.STRING }
                },
                required: ["ticker", "name", "price", "change"]
              }
            },
            losers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticker: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  change: { type: Type.STRING }
                },
                required: ["ticker", "name", "price", "change"]
              }
            },
            aiTrend: {
              type: Type.OBJECT,
              properties: {
                rising: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      ticker: { type: Type.STRING },
                      name: { type: Type.STRING },
                      price: { type: Type.STRING },
                      change: { type: Type.STRING }
                    }
                  }
                },
                falling: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      ticker: { type: Type.STRING },
                      name: { type: Type.STRING },
                      price: { type: Type.STRING },
                      change: { type: Type.STRING }
                    }
                  }
                },
                summary: { type: Type.STRING }
              }
            },
            economicContext: { type: Type.STRING },
            conclusion: { type: Type.STRING }
          },
          required: ["reportTitle", "marketIndices", "marketOverview", "gainers", "losers", "aiTrend", "economicContext", "conclusion"]
        }
      },
    });

    const reportData = JSON.parse(response.text || "{}");
    // Extract grounding chunks from the response candidate metadata
    return {
      ...reportData,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

export const analyzeStockTrend = async (ticker: string, name: string): Promise<{ text: string, groundingChunks?: any[] }> => {
  const ai = getAIClient();
  const prompt = `종목: ${name} (${ticker}). Google Search를 사용하여 최근 1개월 흐름과 주요 뉴스를 한국어로 3줄 요약하세요.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return {
      text: response.text || "분석 정보를 가져올 수 없습니다.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Error analyzing stock:", error);
    return {
      text: "분석 중 오류가 발생했습니다.",
      groundingChunks: []
    };
  }
};
