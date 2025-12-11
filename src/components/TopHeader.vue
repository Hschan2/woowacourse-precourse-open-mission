<template>
  <header class="absolute top-0 left-0 right-0 p-4 mobile:p-6 flex justify-between items-center z-30">
    <router-link
      to="/"
      class="text-lg mobile:text-xl font-bold text-neutral-800 cursor-pointer"
    >
      {{ UI_MESSAGES.APP_TITLE }}
    </router-link>

    <button
      @click="openLottoGame"
      class="px-3 mobile:px-4 tablet:px-5 py-1.5 mobile:py-2 tablet:py-2.5 bg-[#777] text-white text-xs mobile:text-sm tablet:text-base rounded-lg hover:bg-[#666] transition cursor-pointer"
    >
      {{ UI_MESSAGES.MINI_GAME }}
    </button>

    <LottoGame v-if="showLottoGame" @close="closeLottoGame" />
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UI_MESSAGES } from "../constants/messages";
import LottoGame from "./LottoGame.vue";

const showLottoGame = ref(false);

const openLottoGame = () => {
  showLottoGame.value = true;
};

const closeLottoGame = () => {
  showLottoGame.value = false;
};
</script>
