<template>
  <div class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-4 mobile:p-6 w-full max-w-sm text-center mx-4">
      <p class="mb-4">{{ message }}</p>
      <button
        @click="$emit('close')"
        class="bg-blue-600 text-white px-5 py-1.5 text-sm mobile:px-6 mobile:py-2 mobile:text-base rounded-full hover:bg-blue-700"
      >
        확인
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
defineEmits(['close']);
</script>
