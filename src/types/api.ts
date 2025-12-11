/**
 * src/services/weatherAPI.ts 에서 사용되는 타입
 */

// 기상청 API 원본 데이터 아이템
export interface KMAApiItem {
  baseDate: string;
  baseTime: string;
  category: "TMP" | "SKY" | "PTY" | "REH" | "WSD" | string; // 기온, 하늘상태, 강수형태, 습도, 풍속 등
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

// 가공된 날씨 데이터
export interface WeatherData {
  temp: string; // 현재 기온
  sky: string; // 하늘 상태 (e.g., "1" for 맑음)
  pty: string; // 강수 형태 (e.g., "0" for 없음)
  feelsLikeTemp: string; // 체감 온도
  windSpeed?: string; // 풍속 (선택적)
  humidity?: string; // 습도 (선택적)
}

/**
 * src/services/airQualityAPI.ts 에서 사용되는 타입
 */

// 에어코리아 API 응답의 측정소 정보 아이템
export interface AirKoreaStationItem {
  stationName: string;
  addr: string;
  tm: number;
}

// 에어코리아 API 응답의 측정 정보 아이템
export interface AirKoreaMeasureItem {
  pm10Value: string; // 미세먼지(PM10) 농도 (단위: ㎍/㎥)
  pm25Value: string; // 초미세먼지(PM2.5) 농도 (단위: ㎍/㎥)
  dataTime: string; // 측정일시
  // 필요하다면 다른 측정값들(so2, co, o3, no2)도 추가할 수 있습니다.
}

// 가공된 대기 질 데이터
export interface AirQualityData {
  pm10Value: string;
  pm25Value: string;
}

/**
 * API 응답의 공통 구조 (선택적으로 사용 가능)
 */
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: T[];
      totalCount: number;
      pageNo: number;
      numOfRows: number;
    };
  };
}
