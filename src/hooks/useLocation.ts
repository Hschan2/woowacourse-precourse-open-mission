import { ref } from "vue";
import { useRouter } from "vue-router";
import { UI_MESSAGES } from "../constants/messages";

export function useLocation() {
  const router = useRouter();
  const locationError = ref<string | null>(null);

  const handleSuccess = (pos: GeolocationPosition) => {
    router.push({
      name: "MoodSelect",
      query: { lat: pos.coords.latitude, lon: pos.coords.longitude },
    });
  };

  const handleError = (err: GeolocationPositionError) => {
    console.error("Location 거절:", err);
    locationError.value = UI_MESSAGES.LOCATION_PERMISSION_DENIED;
    alert(locationError.value);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      locationError.value = UI_MESSAGES.LOCATION_PERMISSION_DENIED;
      alert(locationError.value);
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  };

  return {
    requestLocation,
    locationError,
  };
}
