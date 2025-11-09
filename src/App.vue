<script setup lang="ts"></script>

<template>
  <router-view />
  <footer class="fixed bottom-0 inset-x-0 w-full py-4 text-center text-gray-500 text-xs bg-white z-10">
    @copyright 2025 오늘의맛기온. All rights reserved. 기상청/에어코리아 공공데이터포털 제공
  </footer>
</template>

<style>
body {
  margin: 0;
  font-family: "Noto Sans KR", sans-serif;
  background-color: #fff;
}
</style>
