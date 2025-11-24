export const getAddressFromCoords = async (
  lat: number,
  lon: number
): Promise<string> => {
  const url = `http://localhost:8000/api/reverse-geocode?lat=${lat}&lon=${lon}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`지오코딩 에러: ${res.status}`);
    const json = await res.json();
    if (json.address) return json.address;
    return "알 수 없는 위치";
  } catch (e) {
    console.error("지오코딩 실패", e);
    return "알 수 없는 위치";
  }
};
