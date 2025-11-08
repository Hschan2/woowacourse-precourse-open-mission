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

    <div
      class="col-start-1 row-start-1 place-self-center flex flex-col items-center mt-[-4rem]"
    >
      <img src="../assets/logo.png" alt="오늘의 맛기온" class="h-32 mx-auto" />
      <button
        @click="handleStartClick"
        class="mt-10 px-8 py-2 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700 transition cursor-pointer"
      >
        시작
      </button>
    </div>

    <div
      v-if="showPermissionModal"
      class="col-start-1 row-start-1 z-10"
    >
      <div
        class="absolute top-6 left-1/2 -translate-x-1/2 w-[360px] rounded-xl p-6 shadow-lg bg-white text-center border border-gray-300"
      >
        <p class="text-gray-800 text-sm mb-6">
          오늘의 맛기온에서 사용자의 위치 권한을 요청합니다.
        </p>
        <div class="flex justify-center space-x-3">
          <button
            class="bg-gray-200 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-gray-300 transition cursor-pointer"
            @click="showPermissionModal = false"
          >
            취소
          </button>
          <button
            class="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition cursor-pointer"
            @click="requestLocation"
          >
            허용
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const showPermissionModal = ref(false);
const userLocation = ref(null);

const handleStartClick = () => {
  if (userLocation.value) {
    router.push({
      name: 'MoodSelect',
      query: { lat: userLocation.value.latitude, lon: userLocation.value.longitude }
    });
  } else {
    showPermissionModal.value = true;
  }
};

const requestLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log("위치 권한 허용됨:", pos.coords);
      userLocation.value = pos.coords;
      showPermissionModal.value = false;
      router.push({
        name: 'MoodSelect',
        query: { lat: pos.coords.latitude, lon: pos.coords.longitude }
      });
    },
    (err) => {
      console.error("위치 권한 거부:", err);
      showPermissionModal.value = false;
    }
  );
};
</script>
