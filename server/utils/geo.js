// Haversine formula to compute geodesic distance between two latitude/longitude points in kilometers
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

// Pre-seeded Indian manufacturing and industrial hub cities
const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra", latitude: 19.0505, longitude: 72.8417, region: "West" },
  { city: "Delhi", state: "Delhi", latitude: 28.7137, longitude: 77.0910, region: "North" },
  { city: "Ahmedabad", state: "Gujarat", latitude: 23.0386, longitude: 72.5987, region: "West" },
  { city: "Bengaluru", state: "Karnataka", latitude: 12.9501, longitude: 77.6143, region: "South" },
  { city: "Chennai", state: "Tamil Nadu", latitude: 13.1163, longitude: 80.3176, region: "South" },
  { city: "Pune", state: "Maharashtra", latitude: 18.5551, longitude: 73.8671, region: "West" },
  { city: "Surat", state: "Gujarat", latitude: 21.1934, longitude: 72.8627, region: "West" },
  { city: "Indore", state: "Madhya Pradesh", latitude: 22.7272, longitude: 75.8320, region: "Central" },
  { city: "Rajkot", state: "Gujarat", latitude: 22.2988, longitude: 70.7800, region: "West" },
  { city: "Vadodara", state: "Gujarat", latitude: 22.3046, longitude: 73.1426, region: "West" }
];

function getCityCoordinates(cityName) {
  if (!cityName) return null;
  const match = INDIAN_CITIES.find(
    (c) => c.city.toLowerCase() === cityName.trim().toLowerCase()
  );
  return match || null;
}

module.exports = {
  getHaversineDistance,
  INDIAN_CITIES,
  getCityCoordinates
};
