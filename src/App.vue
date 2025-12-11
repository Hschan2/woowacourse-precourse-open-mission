<template>
  <TopHeader />
  <main class="pt-[50px] pb-[40px]">
    <router-view />
  </main>
  <Footer />
  <ErrorModal
    v-if="isError"
    :message="errorMessage"
    @close="hideError"
  />
</template>

<script setup lang="ts">
import TopHeader from "./components/TopHeader.vue";
import Footer from "./components/Footer.vue";
import ErrorModal from "./components/ErrorModal.vue";
import { useError } from "./hooks/useError";

const { isError, errorMessage, hideError } = useError();
</script>

<style>
body {
  margin: 0;
  font-family: "Noto Sans KR", sans-serif;
  background-color: #fff;
}
</style>
