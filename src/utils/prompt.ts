import { getWeatherCondition } from "/src/services/weatherAPI";
import { getPm10Grade } from "/src/services/airQualityAPI";
import { getFormattedTime } from "/src/utils/time";

interface PromptData {
  locationAddress: string;
  weatherData: any;
  airQualityData: any;
  selectedMoods: string[];
  isReRecommendation: boolean;
}

export const buildPrompt = (data: PromptData): string => {
  const {
    locationAddress,
    weatherData,
    airQualityData,
    selectedMoods,
    isReRecommendation,
  } = data;

  let weatherText = "알 수 없음";
  if (weatherData) {
    weatherText = getWeatherCondition(weatherData.pty, weatherData.sky);
  }

  const temperature = weatherData?.temp ?? "알 수 없음";
  const feelsLikeTemp = weatherData?.feelsLikeTemp ?? "알 수 없음";
  const pm10Grade = airQualityData
    ? getPm10Grade(airQualityData.pm10Value)
    : "알 수 없음";
  const moodText = selectedMoods.join(", ");
  const formattedTime = getFormattedTime();

  let prompt = `
      내 현재 위치는 '${locationAddress}' 근처야.
      현재 시간은 ${formattedTime}이고,
      오늘 날씨는 ${weatherText}, 기온은 ${temperature}도인데 체감 온도는 ${feelsLikeTemp}도야.
      미세먼지 수준은 '${pm10Grade}'이고, 내 기분은 '${moodText}'인데,
      이런 날씨와 기분에 딱 맞는 음식을 추천해주고, 내 현재 위치 근처의 맛집 3곳도 함께 알려줘.
    `;

  if (isReRecommendation) {
    prompt += "\n\n이전에 추천해준 것과는 다른 새로운 음식을 추천해줘.";
  }
  prompt += `\n<!-- cache_buster: ${Date.now()} -->`;
  return prompt;
};
