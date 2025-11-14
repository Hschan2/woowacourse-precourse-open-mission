export const getAddressFromCoords = async (
  lat: number,
  lon: number
): Promise<string> => {
  // 백엔드 프록시 서버를 통해 VWorld API에 요청합니다.
  const url = `http://localhost:8000/api/reverse-geocode?lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Reverse geocode proxy error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.address) {
      return data.address;
    } else {
      console.error("주소 변환 실패:", data.error || "알 수 없는 오류");
      return "알 수 없는 위치";
    }
  } catch (error) {
    console.error("리버스 지오코딩 API 요청 실패:", error);
    return "알 수 없는 위치";
  }
};
