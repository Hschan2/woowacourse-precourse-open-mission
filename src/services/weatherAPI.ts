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
const calculateFeelsLikeTemp = (temp: number, windSpeed: number | undefined): string => {
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.response?.header?.resultCode !== "00") {
      console.error("API Error:", data.response?.header?.resultMsg || data.error);
      return null;
    }

    const items: KMAApiItem[] = data.response.body.items.item;
    const weather: Partial<
      WeatherData & { windSpeed?: string; humidity?: string }
    > = {};

    const now = new Date();
    const base_date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}`;
    const fcst_time = `${String(now.getHours()).padStart(2, "0")}00`;

    const targetItems = items.filter(
      (item) => item.fcstDate === base_date && item.fcstTime === fcst_time
    );

    // 현재 시간에 맞는 예보가 없으면 가장 가까운 시간의 예보를 찾음
    if (targetItems.length === 0 && items.length > 0) {
        const closestTime = items[0].fcstTime;
        items.filter(item => item.fcstTime === closestTime).forEach(item => targetItems.push(item));
    }

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
    if (weather.temp) {
      const tempNum = parseFloat(weather.temp);
      const windSpeedNum = weather.windSpeed
        ? parseFloat(weather.windSpeed)
        : undefined;
      weather.feelsLikeTemp = calculateFeelsLikeTemp(tempNum, windSpeedNum);
    }

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

