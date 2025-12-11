import { ERROR_MESSAGES } from "../constants/messages";
import type { KMAApiItem, WeatherData } from "../types/api";

const parseWeatherItems = (items: KMAApiItem[]): Partial<WeatherData> => {
  const weather: Partial<WeatherData> = {};

  for (const item of items) {
    if (item.category === "TMP") weather.temp = item.fcstValue;
    if (item.category === "SKY") weather.sky = item.fcstValue;
    if (item.category === "PTY") weather.pty = item.fcstValue;
    if (item.category === "WSD") weather.windSpeed = item.fcstValue;
    if (item.category === "REH") weather.humidity = item.fcstValue;
  }

  return weather;
};

/**
 * 체감온도를 계산하는 함수 (기상청 동계 공식)
 * @param temp 기온 ℃
 * @param windSpeed 풍속 m/s
 * @returns {string} 계산된 체감온도
 */
const calculateFeelsLikeTemp = (
  temp: number,
  windSpeed: number | undefined
): string => {
  if (!windSpeed) return temp.toFixed(1);

  const windKmh = windSpeed * 3.6;
  if (windKmh <= 4.8) return temp.toFixed(1);

  const feels =
    13.12 +
    0.6215 * temp -
    11.37 * Math.pow(windKmh, 0.16) +
    0.3965 * temp * Math.pow(windKmh, 0.16);
  return feels.toFixed(1);
};

const findCurrentForecastItems = (items: KMAApiItem[]): KMAApiItem[] => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}00`;

  const exactItems = items.filter(
    (it) => it.fcstDate === date && it.fcstTime === time
  );
  if (exactItems.length > 0) return exactItems;

  const closestTime = items[0]?.fcstTime;
  return items.filter((it) => it.fcstTime === closestTime);
};

/**
 * 백엔드 프록시를 통해 기상청 단기예보 API를 호출하여 날씨 정보를 가져오는 함수
 * @param lat 위도
 * @param lon 경도
 * @returns {Promise<WeatherData | null>} 날씨 데이터 또는 실패 시 null
 */
export const getWeather = async (
  lat: number,
  lon: number
): Promise<WeatherData | null> => {
  const url = `http://localhost:8000/api/weather?lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(ERROR_MESSAGES.WEATHER_API_FAILED);

    const data = await response.json();
    const header = data.response?.header;
    if (header?.resultCode !== "00") return null;

    const items: KMAApiItem[] = data.response.body.items.item;
    const currentItems = findCurrentForecastItems(items);
    const weather = parseWeatherItems(currentItems);

    if (!Object.keys(weather).length) return null;

    if (weather.temp) {
      const temp = Number(weather.temp);
      const wind = weather.windSpeed ? Number(weather.windSpeed) : undefined;
      weather.feelsLikeTemp = calculateFeelsLikeTemp(temp, wind);
    }

    return weather as WeatherData;
  } catch (err) {
    console.error("날씨 데이터를 가져오지 못했습니다:", err);
    return null;
  }
};

/**
 * PTY(강수형태), SKY(하늘상태) 코드에 따라 날씨 상태를 한글로 변환하는 함수
 * @param pty PTY 코드
 * @param sky SKY 코드
 * @returns {string} 날씨 상태 (e.g., "맑음", "비", "눈")
 */
export const getWeatherCondition = (pty: string, sky: string): string => {
  const p = Number(pty);
  if (p > 0) {
    if (p === 1) return "비";
    if (p === 2) return "비/눈";
    if (p === 3) return "눈";
    if (p === 5) return "빗방울";
    if (p === 6) return "빗방울/눈날림";
    if (p === 7) return "눈날림";
    return "알 수 없음";
  }

  const s = Number(sky);
  if (s === 1) return "맑음";
  if (s === 3) return "구름많음";
  if (s === 4) return "흐림";

  return "알 수 없음";
};
