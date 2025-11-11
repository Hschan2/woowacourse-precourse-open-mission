<template>
  <div class="grid grid-cols-1 grid-rows-1 min-h-screen pb-16 bg-white">
    <!-- Header -->
    <div class="col-start-1 row-start-1 pt-6 pl-6 place-self-start-start">
      <router-link
        to="/"
        class="text-xl font-bold text-neutral-800 cursor-pointer"
      >
        오늘의맛기온
      </router-link>
    </div>
    <div
      class="col-start-1 row-start-1 pt-6 pr-6 align-self-start justify-self-end"
    >
      <button
        class="px-4 py-1.5 bg-[#777] text-white text-sm rounded-lg hover:bg-[#666] transition cursor-pointer"
      >
        미니게임
      </button>
    </div>

    <!-- Main Content -->
    <div class="col-start-1 row-start-1 place-self-center w-full">
      <!-- 1. 로딩 중 화면 -->
      <div
        v-if="isSubmitting"
        class="flex flex-col items-center text-center"
      >
        <img src="/mat.svg" alt="로딩 중" class="w-24 h-24 animate-bounce" />
        <p class="mt-4 text-lg font-bold text-gray-700">
          AI가 음식을 추천하고 있어요...
        </p>
      </div>

      <!-- 2. AI 추천 결과 화면 -->
      <div
        v-else-if="recommendationResult"
        class="flex flex-col items-center text-center px-4"
      >
        <h2 class="text-2xl font-bold mb-2">AI의 추천 메뉴는...</h2>
        <h1 class="text-4xl font-extrabold text-blue-600 mb-6">
          {{ recommendationResult.foodName }}
        </h1>

        <div
          class="w-full max-w-md p-6 bg-gray-50 rounded-lg border border-gray-200"
        >
          <p class="text-lg font-medium text-gray-800 mb-4">
            "{{ recommendationResult.reason }}"
          </p>
          <div class="grid grid-cols-2 gap-4 text-left">
            <div class="font-semibold text-gray-600">평균 가격:</div>
            <div class="text-gray-800">
              {{ Number(recommendationResult.averagePrice).toLocaleString() }}원
            </div>
            <div class="font-semibold text-gray-600">평균 칼로리:</div>
            <div class="text-gray-800">
              {{ Number(recommendationResult.calories).toLocaleString() }} kcal
            </div>
          </div>
        </div>

        <button
          @click="resetRecommendation"
          class="mt-8 px-8 py-2 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700 transition cursor-pointer"
        >
          다른 음식 추천받기
        </button>
      </div>

      <!-- 3. 기분 선택 화면 -->
      <div v-else class="flex flex-col items-center w-full">
        <h1 class="text-2xl font-bold mt-16 mb-10">
          지금 당신의 기분이 어떤가요?
        </h1>

        <div v-if="isLoading" class="text-gray-600">
          날씨와 미세먼지 정보를 불러오는 중...
        </div>

        <div
          v-if="!isLoading && (weatherData || airQualityData)"
          class="grid grid-cols-3 gap-3 w-[80%] max-w-3xl"
        >
          <button
            v-for="(mood, idx) in moods"
            :key="idx"
            @click="toggleMood(mood)"
            class="flex items-center justify-center border border-gray-300 rounded-full py-3 px-6 transition text-sm cursor-pointer whitespace-nowrap"
            :class="[
              selectedMoods.includes(mood)
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100',
            ]"
          >
            {{ mood }}
          </button>
        </div>

        <div v-if="!isLoading" class="mt-12">
          <button
            @click="handleNextClick"
            class="px-8 py-2 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700 transition cursor-pointer disabled:bg-gray-400"
            :disabled="selectedMoods.length === 0"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getWeather, getWeatherCondition } from "../services/weatherAPI";
import { getAirQualityData, getPm10Grade } from "../services/airQualityAPI";

interface Recommendation {
  foodName: string;
  reason: string;
  averagePrice: number;
  calories: number;
}

const route = useRoute();
const router = useRouter();

const selectedMoods = ref<string[]>([]);
const weatherData = ref<any>(null);
const airQualityData = ref<any>(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const recommendationResult = ref<Recommendation | null>(null);

onMounted(async () => {
  const lat = parseFloat(route.query.lat as string);
  const lon = parseFloat(route.query.lon as string);

  if (!lat || !lon) {
    alert("위치 정보가 없습니다. 시작 페이지로 돌아갑니다.");
    router.push("/");
    return;
  }

  try {
    isLoading.value = true;
    const [weatherResult, airQualityResult] = await Promise.all([
      getWeather(lat, lon),
      getAirQualityData(lat, lon),
    ]);
    weatherData.value = weatherResult;
    airQualityData.value = airQualityResult;
  } catch (error) {
    console.error("데이터를 가져오는 데 실패했습니다:", error);
    alert("데이터를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    isLoading.value = false;
  }
});

const toggleMood = (mood: string) => {
  const index = selectedMoods.value.indexOf(mood);
  if (index > -1) {
    selectedMoods.value.splice(index, 1);
  } else {
    selectedMoods.value.push(mood);
  }
};

const handleNextClick = async () => {
  if (selectedMoods.value.length === 0) {
    alert("기분을 1개 이상 선택해주세요.");
    return;
  }

  isSubmitting.value = true;

  const weatherText = weatherData.value
    ? getWeatherCondition(weatherData.value.pty, weatherData.value.sky)
    : "알 수 없음";
  const temperature = weatherData.value?.temp ?? "알 수 없음";
  const feelsLikeTemp = weatherData.value?.feelsLikeTemp ?? "알 수 없음";
  const pm10Grade = airQualityData.value
    ? getPm10Grade(airQualityData.value.pm10Value)
    : "알 수 없음";
  const moodText = selectedMoods.value.join(", ");

  const promptToAI = `
    오늘 날씨는 ${weatherText}, 기온은 ${temperature}도인데 체감 온도는 ${feelsLikeTemp}도야.
    미세먼지 수준은 '${pm10Grade}'이고, 내 기분은 '${moodText}'인데,
    이런 날씨와 기분에 딱 맞는 음식을 추천해줘.
  `;

  try {
    const response = await fetch("http://localhost:8000/api/recommend-food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: promptToAI }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    
    recommendationResult.value = data;
  } catch (error) {
    console.error("AI 서버 요청 실패:", error);
    alert(`AI 서버 요청에 실패했습니다: ${error.message}`);
    recommendationResult.value = null;
  } finally {
    isSubmitting.value = false;
  }
};

const resetRecommendation = () => {
  recommendationResult.value = null;
  selectedMoods.value = [];
};

const moods = [
  "😊 행복해요", "😄 즐거워요", "😆 유쾌해요", "😀 만족해요", "🥳 신나요",
  "😌 편안해요", "✨ 성취해요", "💪 활기차요", "👍 자신해요", "😍 감동해요",
  "💖 설레요", "🔥 따뜻해요", "🚀 의기양양해요", "😢 슬퍼요", "😔 우울해요",
  "😭 비통해요", "😩 절망해요", "😥 후회해요", "😞 실망해요", "😔 억울해요",
  "🤬 격노해요", "😡 짜증나요", "😠 화나요", "😨 불안해요", "😭 비참해요",
  "🤕 상처있어요", "😵 무기력해요", "😟 걱정해요", "😬 초조해요", "😨 무서워요",
  "😬 긴장해요", "😰 조마해요", "🤢 싫어요", "😱 두려워요", "😖 괴로워요",
  "📉 나약해요", "🤦 한심해요", "🤢 불쾌해요", "😫 피로해요", "😥 부담있어요",
  "😳 부끄러워요",
];
</script>
