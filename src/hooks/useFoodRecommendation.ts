import { ref } from "vue";
import { getWeather } from "../services/weatherAPI";
import { getAirQualityData } from "../services/airQualityAPI";
import { getAddressFromCoords } from "../services/locationAPI";
import { callFoodRecommendationAPI } from "../services/recommendationAPI";
import { buildPrompt } from "../utils/prompt";
import { ERROR_MESSAGES, UI_MESSAGES } from "../constants/messages";

export interface Restaurant {
  name: string;
  address: string;
}

export interface Recommendation {
  foodName: string;
  reason: string;
  averagePrice: number;
  calories: number;
  restaurants: Restaurant[];
}

export function useFoodRecommendation() {
  const weatherData = ref<any>(null);
  const airQualityData = ref<any>(null);
  const locationAddress = ref<string>("");
  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const recommendationResult = ref<Recommendation | null>(null);
  const selectedMoods = ref<string[]>([]);
  const recommendedFoodHistory = ref<string[]>([]);

  const fetchInitialData = async (lat: number, lon: number) => {
    isLoading.value = true;
    try {
      const [w, a, addr] = await Promise.all([
        getWeather(lat, lon),
        getAirQualityData(lat, lon),
        getAddressFromCoords(lat, lon),
      ]);
      weatherData.value = w;
      airQualityData.value = a;
      locationAddress.value = addr;
    } catch (error) {
      console.error(ERROR_MESSAGES.GET_DATA_FAILED, error);
      alert(ERROR_MESSAGES.DATA_FETCH_FAILED);
    } finally {
      isLoading.value = false;
    }
  };

  const getRecommendation = async (isReRecommendation: boolean = false) => {
    if (selectedMoods.value.length === 0) {
      alert(UI_MESSAGES.SELECT_MOOD_PROMPT);
      return;
    }

    isSubmitting.value = true;
    recommendationResult.value = null;

    const prompt = buildPrompt({
      locationAddress: locationAddress.value,
      weatherData: weatherData.value,
      airQualityData: airQualityData.value,
      selectedMoods: selectedMoods.value,
      isReRecommendation,
      excludedFoods: recommendedFoodHistory.value,
    });

    const result = await callFoodRecommendationAPI(prompt);
    if (result && result.foodName) {
      recommendedFoodHistory.value.push(result.foodName);
    }
    recommendationResult.value = result;

    isSubmitting.value = false;
  };

  const toggleMood = (mood: string) => {
    const index = selectedMoods.value.indexOf(mood);
    if (index > -1) {
      selectedMoods.value.splice(index, 1);
      return;
    }
    selectedMoods.value.push(mood);
  };

  const reset = () => {
    recommendationResult.value = null;
    selectedMoods.value = [];
    recommendedFoodHistory.value = [];
  };

  return {
    weatherData,
    airQualityData,
    isLoading,
    isSubmitting,
    recommendationResult,
    selectedMoods,
    recommendedFoodHistory,
    fetchInitialData,
    getRecommendation,
    toggleMood,
    reset,
  };
}
