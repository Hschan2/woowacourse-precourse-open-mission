<template>
  <div class="grid grid-cols-1 grid-rows-1 min-h-screen bg-white">
    <div class="col-start-1 row-start-1 pt-6 pl-6 place-self-start-start">
      <router-link to="/" class="text-xl font-bold text-neutral-800 cursor-pointer">
        오늘의맛기온
      </router-link>
    </div>

    <div class="col-start-1 row-start-1 pt-6 pr-6 align-self-start justify-self-end">
      <button
        class="px-4 py-1.5 bg-[#777] text-white text-sm rounded-lg hover:bg-[#666] transition cursor-pointer"
      >
        미니게임
      </button>
    </div>

    <div class="col-start-1 row-start-1 place-self-center flex flex-col items-center">
      <h1 class="text-2xl font-bold mt-16 mb-10">지금 당신의 기분이 어떤가요?</h1>

      <div class="grid grid-cols-3 gap-3 w-[80%] max-w-3xl">
        <button
          v-for="(mood, idx) in moods"
          :key="idx"
          @click="toggleMood(idx)"
          class="flex items-center justify-center border border-gray-300 rounded-full py-3 px-6 transition text-sm cursor-pointer whitespace-nowrap"
          :class="[selectedMoods.includes(idx) ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100']"
        >
          {{ mood }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();

console.log("현재 위치:", route.query.lat, route.query.lon);

const selectedMoods = ref([]);

const toggleMood = (index) => {
  const selectedIndex = selectedMoods.value.indexOf(index);
  if (selectedIndex > -1) {
    selectedMoods.value.splice(selectedIndex, 1);
  } else {
    selectedMoods.value.push(index);
  }
};

const moods = [
  "😊 행복해요",
  "😄 즐거워요",
  "😆 유쾌해요",
  "😀 만족해요",
  "🥳 신나요",
  "😌 편안해요",
  "✨ 성취해요",
  "💪 활기차요",
  "👍 자신해요",
  "😍 감동해요",
  "💖 설레요",
  "🔥 따뜻해요",
  "🚀 의기양양해요",
  "😢 슬퍼요",
  "😔 우울해요",
  "😭 비통해요",
  "😩 절망해요",
  "😥 후회해요",
  "😞 실망해요",
  "😔 억울해요",
  "🤬 격노해요",
  "😡 짜증나요",
  "😠 화나요",
  "😨 불안해요",
  "😭 비참해요",
  "🤕 상처있어요",
  "😵 무기력해요",
  "😟 걱정해요",
  "😬 초조해요",
  "😨 무서워요",
  "😬 긴장해요",
  "😰 조마해요",
  "🤢 싫어요",
  "😱 두려워요",
  "😖 괴로워요",
  "📉 나약해요",
  "🤦 한심해요",
  "🤢 불쾌해요",
  "😫 피로해요",
  "😥 부담있어요",
  "😳 부끄러워요",
];
</script>
