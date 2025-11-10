const RE = 6371.00877;
const GRID = 5.0;
const SLAT1 = 30.0;
const SLAT2 = 60.0;
const OLON = 126.0;
const OLAT = 38.0;
const XO = 43;
const YO = 136;

/**
 * 위도, 경도를 기상청 격자 좌표로 변환하는 함수
 * @param lat 위도
 * @param lon 경도
 * @returns {{x: number, y: number}} X, Y 좌표
 */
const convertToGrid = (lat: number, lon: number) => {
  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { x, y };
};

interface WeatherData {
  temp: string;
  sky: string;
  pty: string;
  feelsLikeTemp: string;
}

interface KMAApiItem {
  baseDate: string;
  baseTime: string;
  category: "TMP" | "SKY" | "PTY" | "REH" | "WSD" | string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

/**
 * 체감온도를 계산하는 함수 (기상청 동계 공식)
 * @param temp 기온 ℃
 * @param windSpeed 풍속 m/s
 * @returns {string} 계산된 체감온도
 */
const calculateFeelsLikeTemp = (temp: number, windSpeed: number): string => {
  if (windSpeed === undefined) return temp.toFixed(1);
  const windSpeedKmh = windSpeed * 3.6;
  if (windSpeedKmh <= 4.8) {
    return temp.toFixed(1);
  }
  const feelsLike =
    13.12 +
    0.6215 * temp -
    11.37 * Math.pow(windSpeedKmh, 0.16) +
    0.3965 * temp * Math.pow(windSpeedKmh, 0.16);
  return feelsLike.toFixed(1);
};

/**
 * 기상청 단기예보 API를 호출하여 날씨 정보를 가져오는 함수
 * @param lat 위도
 * @param lon 경도
 * @returns {Promise<WeatherData | null>} 날씨 데이터 또는 실패 시 null
 */
export const getWeather = async (
  lat: number,
  lon: number
): Promise<WeatherData | null> => {
  const grid = convertToGrid(lat, lon);
  const API_KEY = import.meta.env.VITE_KMA_API_KEY;
  const BASE_URL =
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

  const now = new Date();
  let base_date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;

  // 안정적인 데이터 수신을 위해 현재 시간에서 몇 시간 전의 데이터를 요청
  const availableHours = [2, 5, 8, 11, 14, 17, 20, 23];
  let currentHour = now.getHours();
  let base_hour = availableHours
    .slice()
    .reverse()
    .find((h) => h <= currentHour);

  // 자정~새벽 2시 사이에는 전날 23시 데이터 사용
  if (base_hour === undefined) {
    now.setDate(now.getDate() - 1);
    base_date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}`;
    base_hour = 23;
  }

  const base_time = `${String(base_hour).padStart(2, "0")}00`;
  const fcst_time = `${String(currentHour).padStart(2, "0")}00`;

  const url = `${BASE_URL}?serviceKey=${encodeURIComponent(
    API_KEY
  )}&pageNo=1&numOfRows=200&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${
    grid.x
  }&ny=${grid.y}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.response?.header?.resultCode !== "00") {
      console.error("API Error:", data.response?.header?.resultMsg);
      return null;
    }

    const items: KMAApiItem[] = data.response.body.items.item;
    const weather: Partial<
      WeatherData & { windSpeed?: string; humidity?: string }
    > = {};

    const targetItems = items.filter(
      (item) => item.fcstDate === base_date && item.fcstTime === fcst_time
    );

    targetItems.forEach((item: KMAApiItem) => {
      switch (item.category) {
        case "TMP":
          weather.temp = item.fcstValue;
          break;
        case "SKY":
          weather.sky = item.fcstValue;
          break;
        case "PTY":
          weather.pty = item.fcstValue;
          break;
        case "WSD":
          weather.windSpeed = item.fcstValue;
          break;
        case "REH":
          weather.humidity = item.fcstValue;
          break;
      }
    });

    if (Object.keys(weather).length === 0) {
      console.error("현재 시간과 가까운 날씨 데이터를 가져오지 못했습니다.");
      return null;
    }

    // 체감온도 계산
    const tempNum = parseFloat(weather.temp);
    const windSpeedNum = parseFloat(weather.windSpeed);
    weather.feelsLikeTemp = calculateFeelsLikeTemp(tempNum, windSpeedNum);

    return weather as WeatherData;
  } catch (error) {
    console.error("날씨 데이터를 가져오지 못했습니다:", error);
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
  const ptyValue = parseInt(pty, 10);
  if (ptyValue > 0) {
    switch (ptyValue) {
      case 1:
        return "비";
      case 2:
        return "비/눈";
      case 3:
        return "눈";
      case 5:
        return "빗방울";
      case 6:
        return "빗방울/눈날림";
      case 7:
        return "눈날림";
      default:
        return "알 수 없음";
    }
  }

  const skyValue = parseInt(sky, 10);
  switch (skyValue) {
    case 1:
      return "맑음";
    case 3:
      return "구름많음";
    case 4:
      return "흐림";
    default:
      return "알 수 없음";
  }
};

