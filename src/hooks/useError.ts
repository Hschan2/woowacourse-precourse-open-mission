import { ref } from 'vue';

const isError = ref(false);
const errorMessage = ref('');

export function useError() {
  const showError = (message: string) => {
    isError.value = true;
    errorMessage.value = message;
  };

  const hideError = () => {
    isError.value = false;
    errorMessage.value = '';
  };

  return {
    isError,
    errorMessage,
    showError,
    hideError,
  };
}
