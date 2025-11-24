import { convertToTM } from "../utils/coordsUtils";

const AIRKOREA_API_KEY = import.meta.env.VITE_AIRKOREA_API_KEY; // .env.local 파일에서 키를 가져옵니다.

export const getNearbyStation = async (tmX: number, tmY: number) => {
  const base =
    "https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList";
  const url = `${base}?serviceKey=${encodeURIComponent(
    AIRKOREA_API_KEY
  )}&returnType=json&tmX=${tmX}&tmY=${tmY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const name = json.response?.body?.items?.[0]?.stationName;
    if (name) return name;
    console.error("측정소 조회 실패", json.response?.header?.resultMsg);
    return null;
  } catch (e) {
    console.error("측정소 조회 에러", e);
    return null;
  }
};

export const getAirQuality = async (station: string) => {
  const base =
    "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty";
  const url = `${base}?serviceKey=${encodeURIComponent(
    AIRKOREA_API_KEY
  )}&returnType=json&numOfRows=1&pageNo=1&stationName=${encodeURIComponent(
    station
  )}&dataTerm=DAILY&ver=1.0`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const item = json.response?.body?.items?.[0];
    if (item) return { pm10Value: item.pm10Value, pm25Value: item.pm25Value };
    return null;
  } catch (e) {
    console.error("대기질 조회 오류", e);
    return null;
  }
};

export const getAirQualityData = async (lat: number, lon: number) => {
  try {
    const { tmX, tmY } = convertToTM(lat, lon);
    const station = await getNearbyStation(tmX, tmY);
    if (!station) return null;
    return await getAirQuality(station);
  } catch (e) {
    console.error("대기질 API 에러", e);
    return null;
  }
};
