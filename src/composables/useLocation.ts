import { ref } from "vue";
import { useRouter } from "vue-router";
import { UI_MESSAGES } from "/src/constants/messages";

export function useLocation() {
  const router = useRouter();
  const locationError = ref<string | null>(null);

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(
          "위치 권한 허용됨. MoodSelect 페이지로 이동합니다:",
          pos.coords
        );
        router.push({
          name: "MoodSelect",
          query: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          },
        });
      },
      (err) => {
        console.error("위치 권한 거부:", err);
        locationError.value = UI_MESSAGES.LOCATION_PERMISSION_DENIED;
        alert(locationError.value);
      }
    );
  };

  return {
    requestLocation,
    locationError,
  };
}
