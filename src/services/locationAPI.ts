export const getAddressFromCoords = async (
  lat: number,
  lon: number
): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=ko`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "woowacourse-precourse-open-mission/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.address) {
      const { state, city, county, suburb, neighbourhood, road } = data.address;
      const addressParts = [
        state,
        city || county,
        suburb || neighbourhood || road,
      ].filter((part) => part);

      return addressParts.join(" ");
    } else {
      console.error("주소 변환 실패: 유효한 주소 정보 없음", data);
      return "알 수 없는 위치";
    }
  } catch (error) {
    console.error("리버스 지오코딩 API 요청 실패:", error);
    return "알 수 없는 위치";
  }
};
