// Haversine formula to compute geodesic straight-line distance between two latitude/longitude points in kilometers
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

// Commercial freight road distance: Road transport routes follow highway corridors and curves
// Empirical road network tortuosity factor for Indian national and state highway logistics is ~1.18x
function getRoadDistance(lat1, lon1, lat2, lon2) {
  const straight = getHaversineDistance(lat1, lon1, lat2, lon2);
  if (straight == null) return null;
  if (straight === 0) return 15; // Local intra-city transit minimum (dock to warehouse)
  // Intra-city or short distances (< 40km) typically have slightly higher local road factor
  const roadFactor = straight < 40 ? 1.25 : 1.18;
  return Math.round(straight * roadFactor * 10) / 10;
}

// Comprehensive Indian manufacturing, industrial, recycling, and commercial freight hubs
const INDIAN_CITIES = [
  // West
  { city: "Mumbai", state: "Maharashtra", latitude: 19.0505, longitude: 72.8417, region: "West", defaultAddress: "MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093" },
  { city: "Thane", state: "Maharashtra", latitude: 19.2183, longitude: 72.9781, region: "West", defaultAddress: "Wagle Industrial Estate, Thane West, Maharashtra 400604" },
  { city: "Navi Mumbai", state: "Maharashtra", latitude: 19.0330, longitude: 73.0297, region: "West", defaultAddress: "TTC Industrial Area, Mahape, Navi Mumbai, Maharashtra 400710" },
  { city: "Pune", state: "Maharashtra", latitude: 18.5551, longitude: 73.8671, region: "West", defaultAddress: "Bhosari Industrial Estate, PCMC, Pune, Maharashtra 411026" },
  { city: "Nagpur", state: "Maharashtra", latitude: 21.1458, longitude: 79.0882, region: "West", defaultAddress: "MIHAN Industrial Logistics Zone, Nagpur, Maharashtra 441108" },
  { city: "Nashik", state: "Maharashtra", latitude: 19.9975, longitude: 73.7898, region: "West", defaultAddress: "Ambad MIDC Industrial Cluster, Nashik, Maharashtra 422010" },
  { city: "Aurangabad", state: "Maharashtra", latitude: 19.8762, longitude: 75.3433, region: "West", defaultAddress: "Waluj Industrial Estate, Aurangabad, Maharashtra 431136" },
  { city: "Ahmedabad", state: "Gujarat", latitude: 23.0386, longitude: 72.5987, region: "West", defaultAddress: "GIDC Industrial Estate, Naroda, Ahmedabad, Gujarat 382330" },
  { city: "Surat", state: "Gujarat", latitude: 21.1934, longitude: 72.8627, region: "West", defaultAddress: "Sachin GIDC Industrial Zone, Surat, Gujarat 394230" },
  { city: "Vadodara", state: "Gujarat", latitude: 22.3046, longitude: 73.1426, region: "West", defaultAddress: "Makarpura GIDC Estate, Vadodara, Gujarat 390010" },
  { city: "Rajkot", state: "Gujarat", latitude: 22.2988, longitude: 70.7800, region: "West", defaultAddress: "Aji GIDC Industrial Area, Rajkot, Gujarat 360003" },
  { city: "Vapi", state: "Gujarat", latitude: 20.3893, longitude: 72.9106, region: "West", defaultAddress: "Vapi GIDC Industrial Township, Gujarat 396195" },
  { city: "Ankleshwar", state: "Gujarat", latitude: 21.6264, longitude: 73.0152, region: "West", defaultAddress: "Ankleshwar GIDC Chemical & Packaging Hub, Gujarat 393002" },

  // North
  { city: "Delhi", state: "Delhi", latitude: 28.7137, longitude: 77.0910, region: "North", defaultAddress: "Okhla Industrial Area Phase III, New Delhi 110020" },
  { city: "Noida", state: "Uttar Pradesh", latitude: 28.5355, longitude: 77.3910, region: "North", defaultAddress: "Sector 63 Industrial Logistics Corridor, Noida, UP 201301" },
  { city: "Greater Noida", state: "Uttar Pradesh", latitude: 28.4744, longitude: 77.5040, region: "North", defaultAddress: "Ecotech Industrial Complex, Greater Noida, UP 201306" },
  { city: "Gurugram", state: "Haryana", latitude: 28.4595, longitude: 77.0266, region: "North", defaultAddress: "Manesar Industrial Township, Gurugram, Haryana 122051" },
  { city: "Faridabad", state: "Haryana", latitude: 28.4089, longitude: 77.3178, region: "North", defaultAddress: "Sector 24 Industrial Hub, Faridabad, Haryana 121005" },
  { city: "Ghaziabad", state: "Uttar Pradesh", latitude: 28.6692, longitude: 77.4538, region: "North", defaultAddress: "Site IV Industrial Area, Sahibabad, Ghaziabad, UP 201010" },
  { city: "Kanpur", state: "Uttar Pradesh", latitude: 26.4499, longitude: 80.3319, region: "North", defaultAddress: "Panki Industrial Estate, Kanpur, UP 208022" },
  { city: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462, region: "North", defaultAddress: "Nadarganj Industrial Hub, Amausi, Lucknow, UP 226008" },
  { city: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, region: "North", defaultAddress: "Sitapura Industrial Area, Jaipur, Rajasthan 302022" },
  { city: "Chandigarh", state: "Chandigarh", latitude: 30.7333, longitude: 76.7794, region: "North", defaultAddress: "Industrial Area Phase I, Chandigarh 160002" },
  { city: "Ludhiana", state: "Punjab", latitude: 30.9010, longitude: 75.8573, region: "North", defaultAddress: "Focal Point Industrial Zone, Ludhiana, Punjab 141010" },

  // South
  { city: "Bengaluru", state: "Karnataka", latitude: 12.9501, longitude: 77.6143, region: "South", defaultAddress: "Peenya Industrial Estate Phase II, Bengaluru, Karnataka 560058" },
  { city: "Chennai", state: "Tamil Nadu", latitude: 13.1163, longitude: 80.3176, region: "South", defaultAddress: "Ambattur Industrial Estate, Chennai, Tamil Nadu 600058" },
  { city: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867, region: "South", defaultAddress: "Sanath Nagar Industrial Development Area, Hyderabad, Telangana 500018" },
  { city: "Coimbatore", state: "Tamil Nadu", latitude: 11.0168, longitude: 76.9558, region: "South", defaultAddress: "SIDCO Industrial Estate, Kurichi, Coimbatore, Tamil Nadu 641021" },
  { city: "Kochi", state: "Kerala", latitude: 9.9312, longitude: 76.2673, region: "South", defaultAddress: "Kaloor Industrial Hub, Kochi, Kerala 682017" },
  { city: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185, region: "South", defaultAddress: "Autonagar Industrial Logistics Zone, Gajuwaka, Visakhapatnam 530012" },

  // Central & East
  { city: "Indore", state: "Madhya Pradesh", latitude: 22.7272, longitude: 75.8320, region: "Central", defaultAddress: "Sanwer Road Industrial Sector, Indore, Madhya Pradesh 452015" },
  { city: "Bhopal", state: "Madhya Pradesh", latitude: 23.2599, longitude: 77.4126, region: "Central", defaultAddress: "Govindpura Industrial Estate, Bhopal, Madhya Pradesh 462023" },
  { city: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, region: "East", defaultAddress: "Taratala Industrial Area, Kolkata, West Bengal 700088" },
  { city: "Howrah", state: "West Bengal", latitude: 22.5958, longitude: 88.2636, region: "East", defaultAddress: "Jalan Industrial Complex, Dhulagarh, Howrah, West Bengal 711302" },
  { city: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376, region: "East", defaultAddress: "Patliputra Industrial Estate, Patna, Bihar 800013" },
  { city: "Bhubaneswar", state: "Odisha", latitude: 20.2961, longitude: 85.8245, region: "East", defaultAddress: "Mancheswar Industrial Estate, Bhubaneswar, Odisha 751010" }
];

function getCityCoordinates(cityName) {
  if (!cityName) return null;
  const raw = cityName.trim().toLowerCase();

  // 1. Direct exact match
  let match = INDIAN_CITIES.find(
    (c) => c.city.toLowerCase() === raw
  );
  if (match) return match;

  // 2. Contains match (e.g. "Ahmedabad, Gujarat" or "Naroda, Ahmedabad")
  match = INDIAN_CITIES.find(
    (c) => raw.includes(c.city.toLowerCase()) || c.city.toLowerCase().includes(raw)
  );
  if (match) return match;

  // 3. Alias mappings
  const aliases = {
    "bombay": "Mumbai",
    "calcutta": "Kolkata",
    "madras": "Chennai",
    "bangalore": "Bengaluru",
    "gurgaon": "Gurugram",
    "baroda": "Vadodara",
    "new delhi": "Delhi",
    "ncr": "Delhi"
  };
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (raw.includes(alias)) {
      return INDIAN_CITIES.find((c) => c.city === canonical) || null;
    }
  }

  return null;
}

module.exports = {
  getHaversineDistance,
  getRoadDistance,
  INDIAN_CITIES,
  getCityCoordinates
};
