<template>
  <div class="relative min-h-[calc(100vh-112px)] bg-white flex flex-col">
    <div
      class="pt-8 flex flex-col items-center justify-center w-full flex-grow"
    >
      <div v-if="isSubmitting" class="flex flex-col items-center text-center">
        <img
          src="/mat.svg"
          :alt="UI_MESSAGES.LOADING_ALT"
          class="w-20 h-20 mobile:w-24 mobile:h-24 animate-bounce"
        />
        <p class="mt-4 text-base mobile:text-lg font-bold text-gray-700">
          {{ UI_MESSAGES.AI_RECOMMENDING }}
        </p>
      </div>

      <div
        v-else-if="recommendationResult"
        class="flex flex-col items-center text-center px-4"
      >
        <h2 class="text-xl mobile:text-2xl font-bold mb-2">
          {{ UI_MESSAGES.AI_RECOMMENDATION_TITLE }}
        </h2>
        <h1
          class="text-3xl mobile:text-4xl font-extrabold text-blue-600 mb-4 mobile:mb-6"
        >
          {{ recommendationResult.foodName }}
        </h1>

        <div
          class="w-full max-w-md p-4 mobile:p-6 bg-gray-50 rounded-lg border border-gray-200"
        >
          <p class="text-base mobile:text-lg font-medium text-gray-800 mb-4">
            "{{ recommendationResult.reason }}"
          </p>

          <div
            class="grid grid-cols-2 gap-x-4 gap-y-2 text-left mt-4 pt-4 border-t border-gray-200"
          >
            <div class="font-semibold text-gray-600">
              {{ UI_MESSAGES.AVERAGE_PRICE }}
            </div>
            <div class="text-gray-800">
              {{ Number(recommendationResult.averagePrice).toLocaleString()
              }}{{ UI_MESSAGES.UNIT_WON }}
            </div>
            <div class="font-semibold text-gray-600">
              {{ UI_MESSAGES.AVERAGE_CALORIES }}
            </div>
            <div class="text-gray-800">
              {{ Number(recommendationResult.calories).toLocaleString()
              }}{{ UI_MESSAGES.UNIT_KCAL }}
            </div>
          </div>

          <div class="space-y-3 text-left mt-6 pt-6 border-t border-gray-200">
            <h3 class="font-bold text-gray-700 pb-2">
              {{ UI_MESSAGES.RECOMMENDED_RESTAURANTS }}
            </h3>
            <div
              v-for="restaurant in recommendationResult.restaurants"
              :key="restaurant.name"
              class="border-b border-gray-100 py-2 last:border-b-0"
            >
              <p class="font-semibold text-gray-800">{{ restaurant.name }}</p>
              <p class="text-sm text-gray-600">{{ restaurant.address }}</p>
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-500 mt-4 max-w-md">
          {{ UI_MESSAGES.DISCLAIMER }}
        </p>

        <div
          class="flex flex-col mobile:flex-row space-y-3 mobile:space-y-0 mobile:space-x-4 mt-8 w-full max-w-md"
        >
          <button
            @click="recommendAgainWithSameMood"
            class="w-full mobile:w-auto px-5 py-2 bg-blue-600 text-white font-bold rounded-full text-base hover:bg-blue-700 transition cursor-pointer"
          >
            {{ UI_MESSAGES.RECOMMEND_AGAIN_SAME_MOOD }}
          </button>
          <button
            @click="resetRecommendation"
            class="w-full mobile:w-auto px-5 py-2 bg-gray-500 text-white font-bold rounded-full text-base hover:bg-gray-600 transition cursor-pointer"
          >
            {{ UI_MESSAGES.RECOMMEND_AGAIN_NEW_MOOD }}
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center w-full">
        <h1
          class="text-xl mobile:text-2xl font-bold mt-4 mb-8 mobile:mt-6 mobile:mb-10"
        >
          {{ UI_MESSAGES.MOOD_QUESTION }}
        </h1>

        <div v-if="isLoading" class="text-gray-600">
          {{ UI_MESSAGES.LOADING_WEATHER }}
        </div>

        <div
          v-if="!isLoading && (weatherData || airQualityData)"
          class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-2 w-full max-w-[360px] md:max-w-xl mx-auto"
        >
          <button
            v-for="(mood, idx) in moods"
            :key="idx"
            @click="toggleMood(mood)"
            class="flex items-center justify-center border border-gray-300 rounded-full py-2 px-1 mobile:py-2 mobile:px-1 tablet:py-3 tablet:px-2 text-xs mobile:text-sm cursor-pointer whitespace-nowrap max-w-[140px] mx-auto"
            :class="[
              selectedMoods.includes(mood)
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100',
              'w-full flex items-center justify-center border border-gray-300 rounded-full py-3 px-4 text-sm cursor-pointer',
              'max-w-[150px] md:max-w-[180px]',
            ]"
          >
            <span class="break-words text-center leading-tight">
              {{ mood }}
            </span>
          </button>
        </div>

        <div v-if="!isLoading" class="mt-10 mobile:mt-12">
          <button
            @click="handleNextClick"
            class="px-6 py-1.5 mobile:px-8 mobile:py-2 bg-blue-600 text-white font-bold rounded-full text-base mobile:text-lg hover:bg-blue-700 transition cursor-pointer disabled:bg-gray-400"
            :disabled="selectedMoods.length === 0"
          >
            {{ UI_MESSAGES.NEXT }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFoodRecommendation } from "../hooks/useFoodRecommendation";
import { useError } from "../hooks/useError";
import { moods } from "../constants/moods";
import { ERROR_MESSAGES, UI_MESSAGES } from "../constants/messages";

const route = useRoute();
const router = useRouter();
const { showError } = useError();

const {
  weatherData,
  airQualityData,
  isLoading,
  isSubmitting,
  recommendationResult,
  selectedMoods,
  fetchInitialData,
  getRecommendation,
  toggleMood,
  reset,
} = useFoodRecommendation();

onMounted(() => {
  const lat = parseFloat(route.query.lat as string);
  const lon = parseFloat(route.query.lon as string);

  if (!lat || !lon) {
    showError(ERROR_MESSAGES.NO_LOCATION_INFO);
    router.push("/");
    return;
  }
  fetchInitialData(lat, lon);
});

const handleNextClick = () => getRecommendation(false);
const recommendAgainWithSameMood = () => getRecommendation(true);
const resetRecommendation = () => reset();
</script>
