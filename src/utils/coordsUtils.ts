import proj4 from "proj4";

export const convertToTM = (lat: number, lon: number) => {
  proj4.defs("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
  proj4.defs(
    "EPSG:2097",
    "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"
  );
  const [tmX, tmY] = proj4("EPSG:4326", "EPSG:2097", [lon, lat]);
  return { tmX, tmY };
};
