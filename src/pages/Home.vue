<template>
  <div class="grid grid-cols-1 grid-rows-1 min-h-screen pb-16 bg-white">
    <div class="col-start-1 row-start-1 pt-4 pl-4 mobile:pt-6 mobile:pl-6 place-self-start-start">
      <router-link
        to="/"
        class="text-lg mobile:text-xl font-bold text-neutral-800 cursor-pointer"
      >
        {{ UI_MESSAGES.APP_TITLE }}
      </router-link>
    </div>

    <div
      class="col-start-1 row-start-1 pt-4 pr-4 mobile:pt-6 mobile:pr-6 align-self-start justify-self-end"
    >
      <button
        @click="openLottoGame"
        class="px-3 mobile:px-4 tablet:px-5 py-1.5 mobile:py-2 tablet:py-2.5 bg-[#777] text-white text-xs mobile:text-sm tablet:text-base rounded-lg hover:bg-[#666] transition cursor-pointer"
      >
        {{ UI_MESSAGES.MINI_GAME }}
      </button>
    </div>

    <div
      class="col-start-1 row-start-1 place-self-center flex flex-col items-center mt-[-2rem] mobile:mt-[-3rem] tablet:mt-[-4rem]"
    >
      <img :src="logo" :alt="UI_MESSAGES.LOGO_ALT" class="h-24 mobile:h-28 tablet:h-32 mx-auto" />
      <button
        @click="handleStartClick"
        class="mt-8 mobile:mt-10 px-6 py-1.5 mobile:px-8 mobile:py-2 bg-blue-600 text-white font-bold rounded-full text-base mobile:text-lg hover:bg-blue-700 transition cursor-pointer"
      >
        {{ UI_MESSAGES.START }}
      </button>
    </div>

    <div v-if="showPermissionModal" class="col-start-1 row-start-1 z-10">
      <div
        class="absolute top-4 mobile:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[360px] rounded-xl p-4 mobile:p-6 shadow-lg bg-white text-center border border-gray-300"
      >
        <p class="text-gray-800 text-sm mb-4 mobile:mb-6">
          {{ UI_MESSAGES.REQUEST_LOCATION_PERMISSION }}
        </p>
        <div class="flex justify-center space-x-3">
          <button
            class="bg-gray-200 text-gray-700 px-4 py-1.5 mobile:px-5 mobile:py-2 rounded-full font-medium hover:bg-gray-300 transition cursor-pointer"
            @click="showPermissionModal = false"
          >
            {{ UI_MESSAGES.CANCEL }}
          </button>
          <button
            class="bg-blue-600 text-white px-4 py-1.5 mobile:px-5 mobile:py-2 rounded-full font-medium hover:bg-blue-700 transition cursor-pointer"
            @click="handleAllowClick"
          >
            {{ UI_MESSAGES.ALLOW }}
          </button>
        </div>
      </div>
    </div>
    <LottoGame v-if="showLottoGame" @close="closeLottoGame" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UI_MESSAGES } from "../constants/messages";
import { useLocation } from "../hooks/useLocation";
import logo from "../assets/logo.png";
import LottoGame from "../components/LottoGame.vue";

const showPermissionModal = ref(false);
const showLottoGame = ref(false);
const { requestLocation } = useLocation();

const handleStartClick = () => {
  navigator.permissions.query({ name: "geolocation" }).then((permission) => {
    if (permission.state === "granted") {
      requestLocation();
      return;
    }
    showPermissionModal.value = true;
  });
};

const handleAllowClick = () => {
  showPermissionModal.value = false;
  requestLocation();
};

const openLottoGame = () => {
  showLottoGame.value = true;
};

const closeLottoGame = () => {
  showLottoGame.value = false;
};
</script>
