import { API_BASE_URL, RECOMMEND_FOOD_API_PATH } from "../constants/api";
import { ERROR_MESSAGES } from "../constants/messages";
import type { Recommendation } from "../hooks/useFoodRecommendation";

export const callFoodRecommendationAPI = async (
  prompt: string
): Promise<Recommendation | null> => {
  const url = `${API_BASE_URL}${RECOMMEND_FOOD_API_PATH}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.AI_REQUEST_FAILED());
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    console.error("AI 서버 요청 실패:", err);
    alert(ERROR_MESSAGES.AI_REQUEST_FAILED(err));
    return null;
  }
};
