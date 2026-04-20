// Geo-delimitación: Tecámac y municipios colindantes (Estado de México)
// Bounding box aproximado que cubre: Tecámac, Ecatepec, Zumpango, Jaltenco,
// Nextlalpan, Tonanitla, Tultepec, Tultitlán.

export const TECAMAC_CENTER = { lat: 19.7167, lng: -99.0 } as const;

export const COVERAGE_BBOX = {
  // Extendido para cubrir los 8 municipios
  minLat: 19.48,
  maxLat: 19.92,
  minLng: -99.3,
  maxLng: -98.88,
} as const;

export const COVERAGE_MUNICIPALITIES = [
  "Tecámac",
  "Ecatepec",
  "Zumpango",
  "Jaltenco",
  "Nextlalpan",
  "Tonanitla",
  "Tultepec",
  "Tultitlán",
] as const;

export function isWithinCoverage(lat: number, lng: number): boolean {
  return (
    lat >= COVERAGE_BBOX.minLat &&
    lat <= COVERAGE_BBOX.maxLat &&
    lng >= COVERAGE_BBOX.minLng &&
    lng <= COVERAGE_BBOX.maxLng
  );
}

/** Haversine distance in km */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
