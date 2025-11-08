<template>
  <div
    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
  >
    <div class="bg-white rounded-2xl shadow-xl p-6 w-96 text-center">
      <p class="mb-6">오늘의 맛기온에서 사용자의 위치 권한을 요청합니다.</p>
      <div class="flex justify-center gap-4">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-200 rounded-md text-gray-700"
        >
          취소
        </button>
        <button
          @click="$emit('allow')"
          class="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          허용
        </button>
      </div>
    </div>
  </div>
</template>
