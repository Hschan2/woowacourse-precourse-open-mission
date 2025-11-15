<template>
  <div class="grid grid-cols-1 grid-rows-1 min-h-screen pb-16 bg-white">
    <div class="col-start-1 row-start-1 pt-6 pl-6 place-self-start-start">
      <router-link
        to="/"
        class="text-xl font-bold text-neutral-800 cursor-pointer"
      >
        {{ UI_MESSAGES.APP_TITLE }}
      </router-link>
    </div>
    <div
      class="col-start-1 row-start-1 pt-6 pr-6 align-self-start justify-self-end"
    >
      <button
        class="px-4 py-1.5 bg-[#777] text-white text-sm rounded-lg hover:bg-[#666] transition cursor-pointer"
      >
        {{ UI_MESSAGES.MINI_GAME }}
      </button>
    </div>

    <div class="col-start-1 row-start-1 place-self-center w-full">
      <div v-if="isSubmitting" class="flex flex-col items-center text-center">
        <img
          src="/mat.svg"
          :alt="UI_MESSAGES.LOADING_ALT"
          class="w-24 h-24 animate-bounce"
        />
        <p class="mt-4 text-lg font-bold text-gray-700">
          {{ UI_MESSAGES.AI_RECOMMENDING }}
        </p>
      </div>

      <div
        v-else-if="recommendationResult"
        class="flex flex-col items-center text-center px-4"
      >
        <h2 class="text-2xl font-bold mb-2">
          {{ UI_MESSAGES.AI_RECOMMENDATION_TITLE }}
        </h2>
        <h1 class="text-4xl font-extrabold text-blue-600 mb-6">
          {{ recommendationResult.foodName }}
        </h1>

        <div
          class="w-full max-w-md p-6 bg-gray-50 rounded-lg border border-gray-200"
        >
          <p class="text-lg font-medium text-gray-800 mb-4">
            "{{ recommendationResult.reason }}"
          </p>

          <div
            class="grid grid-cols-2 gap-x-4 gap-y-2 text-left mt-4 pt-4 border-t border-gray-200"
          >
            <div class="font-semibold text-gray-600">
              {{ UI_MESSAGES.AVERAGE_PRICE }}
            </div>
            <div class="text-gray-800">
              {{
                Number(recommendationResult.averagePrice).toLocaleString()
              }}{{ UI_MESSAGES.UNIT_WON }}
            </div>
            <div class="font-semibold text-gray-600">
              {{ UI_MESSAGES.AVERAGE_CALORIES }}
            </div>
            <div class="text-gray-800">
              {{
                Number(recommendationResult.calories).toLocaleString()
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

        <div class="flex space-x-4 mt-8">
          <button
            @click="recommendAgainWithSameMood"
            class="px-6 py-2 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700 transition cursor-pointer"
          >
            {{ UI_MESSAGES.RECOMMEND_AGAIN_SAME_MOOD }}
          </button>
          <button
            @click="resetRecommendation"
            class="px-6 py-2 bg-gray-500 text-white font-bold rounded-full text-lg hover:bg-gray-600 transition cursor-pointer"
          >
            {{ UI_MESSAGES.RECOMMEND_AGAIN_NEW_MOOD }}
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center w-full">
        <h1 class="text-2xl font-bold mt-16 mb-10">
          {{ UI_MESSAGES.MOOD_QUESTION }}
        </h1>

        <div v-if="isLoading" class="text-gray-600">
          {{ UI_MESSAGES.LOADING_WEATHER }}
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
import { useFoodRecommendation } from "/src/composables/useFoodRecommendation";
import { moods } from "/src/constants/moods";
import { ERROR_MESSAGES, UI_MESSAGES } from "/src/constants/messages";

const route = useRoute();
const router = useRouter();

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
    alert(ERROR_MESSAGES.NO_LOCATION_INFO);
    router.push("/");
    return;
  }
  fetchInitialData(lat, lon);
});

const handleNextClick = () => getRecommendation(false);
const recommendAgainWithSameMood = () => getRecommendation(true);
const resetRecommendation = () => reset();
</script>
