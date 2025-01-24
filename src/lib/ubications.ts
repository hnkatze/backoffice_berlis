export function isWithinLocation(lat: number, lon: number): boolean {
  const localLat = 15.748148;
  const localLon = -85.732921;
  const distance = Math.sqrt(
    Math.pow(lat - localLat, 2) + Math.pow(lon - localLon, 2)
  );
  const threshold = 0.001;
  return distance <= threshold;
}
