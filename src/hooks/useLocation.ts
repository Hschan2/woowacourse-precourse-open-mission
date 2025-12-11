import { useRouter } from "vue-router";
import { UI_MESSAGES } from "../constants/messages";
import { useError } from "./useError";

export function useLocation() {
  const router = useRouter();
  const { showError } = useError();

  const handleSuccess = (pos: GeolocationPosition) => {
    router.push({
      name: "MoodSelect",
      query: { lat: pos.coords.latitude, lon: pos.coords.longitude },
    });
  };

  const handleError = (err: GeolocationPositionError) => {
    console.error("Location 거절:", err);
    showError(UI_MESSAGES.LOCATION_PERMISSION_DENIED);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      showError(UI_MESSAGES.LOCATION_PERMISSION_DENIED);
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  };

  return {
    requestLocation,
  };
}
