import { API_BASE_URL, RECOMMEND_FOOD_API_PATH } from "/src/constants/api";
import { ERROR_MESSAGES } from "/src/constants/messages";
import type { Recommendation } from "/src/composables/useFoodRecommendation";

export const callFoodRecommendationAPI = async (
  prompt: string
): Promise<Recommendation | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}${RECOMMEND_FOOD_API_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error: any) {
    console.error("AI 서버 요청 실패:", error);
    alert(ERROR_MESSAGES.AI_REQUEST_FAILED(error));
    return null;
  }
};
