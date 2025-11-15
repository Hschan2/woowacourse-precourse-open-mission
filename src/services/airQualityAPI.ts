import { AIR_QUALITY_GRADES } from "/src/constants/messages";
import proj4 from "proj4";

// WGS84 좌표계(위도, 경도) 정의
proj4.defs("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
// TM 중부원점 좌표계(GRS80) 정의
proj4.defs(
  "EPSG:2097",
  "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"
);

const AIRKOREA_API_KEY = import.meta.env.VITE_AIRKOREA_API_KEY; // .env.local 파일에서 키를 가져옵니다.

interface AirQualityData {
  pm10Value: string;
  pm25Value: string;
}

/**
 * 위도, 경도를 TM 좌표로 변환하는 함수
 * @param lat 위도
 * @param lon 경도
 * @returns {{tmX: number, tmY: number}} TM 좌표
 */
const convertToTM = (lat: number, lon: number) => {
  const [tmX, tmY] = proj4("EPSG:4326", "EPSG:2097", [lon, lat]);
  return { tmX, tmY };
};

/**
 * 가까운 측정소 이름을 조회하는 함수
 * @param tmX TM X좌표
 * @param tmY TM Y좌표
 * @returns {Promise<string | null>} 측정소 이름 또는 실패 시 null
 */
const getNearbyStation = async (
  tmX: number,
  tmY: number
): Promise<string | null> => {
  const BASE_URL =
    "https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList";
  const url = `${BASE_URL}?serviceKey=${encodeURIComponent(
    AIRKOREA_API_KEY
  )}&returnType=json&tmX=${tmX}&tmY=${tmY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.response?.body?.items?.[0]?.stationName) {
      return data.response.body.items[0].stationName;
    }
    console.error("가까운 장소 확인 실패:", data.response?.header?.resultMsg);
    return null;
  } catch (error) {
    console.error("가까운 장소 데이터 가져오기 실패:", error);
    return null;
  }
};

/**
 * 측정소의 대기오염 정보를 조회하는 함수
 * @param stationName 측정소 이름
 * @returns {Promise<AirQualityData | null>} 대기오염 정보 또는 실패 시 null
 */
const getAirQuality = async (
  stationName: string
): Promise<AirQualityData | null> => {
  const BASE_URL =
    "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty";
  const url = `${BASE_URL}?serviceKey=${encodeURIComponent(
    AIRKOREA_API_KEY
  )}&returnType=json&numOfRows=1&pageNo=1&stationName=${encodeURIComponent(
    stationName
  )}&dataTerm=DAILY&ver=1.0`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const aqi = data.response?.body?.items?.[0];
    if (aqi) {
      return {
        pm10Value: aqi.pm10Value,
        pm25Value: aqi.pm25Value,
      };
    }
    console.error(
      "미세먼지 데이터 확인 실패:",
      data.response?.header?.resultMsg
    );
    return null;
  } catch (error) {
    console.error("미세먼지 데이터 가져오기 실패:", error);
    return null;
  }
};

/**
 * 위도, 경도를 사용하여 미세먼지 데이터를 가져오는 메인 함수
 * @param lat 위도
 * @param lon 경도
 * @returns {Promise<AirQualityData | null>} 미세먼지 데이터 또는 실패 시 null
 */
export const getAirQualityData = async (
  lat: number,
  lon: number
): Promise<AirQualityData | null> => {
  try {
    const { tmX, tmY } = convertToTM(lat, lon);
    const stationName = await getNearbyStation(tmX, tmY);
    if (stationName) {
      const airQuality = await getAirQuality(stationName);
      return airQuality;
    }
    return null;
  } catch (error) {
    console.error("미세먼지 공공 데이터 API에서 데이터 가져오기 실패:", error);
    return null;
  }
};

/**
 * PM10 수치를 기반으로 미세먼지 등급을 반환하는 함수
 * @param pm10Value PM10 수치 (μg/m³)
 * @returns {string} 미세먼지 등급 (좋음, 보통, 나쁨, 매우 나쁨)
 */
export const getPm10Grade = (pm10Value: string): string => {
  const value = parseInt(pm10Value, 10);
  if (isNaN(value)) {
    return AIR_QUALITY_GRADES.UNKNOWN;
  }
  if (value <= 30) {
    return AIR_QUALITY_GRADES.GOOD;
  }
  if (value <= 80) {
    return AIR_QUALITY_GRADES.NORMAL;
  }
  if (value <= 150) {
    return AIR_QUALITY_GRADES.BAD;
  }
  return AIR_QUALITY_GRADES.VERY_BAD;
};
