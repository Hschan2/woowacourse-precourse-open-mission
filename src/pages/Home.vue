<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-112px)]">
    <img :src="logo" :alt="UI_MESSAGES.LOGO_ALT" class="h-24 mobile:h-28 tablet:h-32 mx-auto" />
    <button
      @click="handleStartClick"
      class="mt-8 mobile:mt-10 px-6 py-1.5 mobile:px-8 mobile:py-2 bg-blue-600 text-white font-bold rounded-full text-base mobile:text-lg hover:bg-blue-700 transition cursor-pointer"
    >
      {{ UI_MESSAGES.START }}
    </button>

    <div v-if="showPermissionModal" class="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[360px] rounded-xl p-4 mobile:p-6 shadow-lg bg-white text-center border border-gray-300"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UI_MESSAGES } from "../constants/messages";
import { useLocation } from "../hooks/useLocation";
import logo from "../assets/logo.png";

const showPermissionModal = ref(false);
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
</script>
