import { API_BASE_URL, RECOMMEND_FOOD_API_PATH } from "../constants/api";
import { ERROR_MESSAGES } from "../constants/messages";
import type { Recommendation } from "../hooks/useFoodRecommendation";

export const callFoodRecommendationAPI = async (
  prompt: string
): Promise<Recommendation | null> => {
  const url = `${API_BASE_URL}${RECOMMEND_FOOD_API_PATH}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error || ERROR_MESSAGES.AI_REQUEST_FAILED();
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
};
