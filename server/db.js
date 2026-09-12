const fs = require("fs");
const path = require("path");
const { getCityCoordinates } = require("./utils/geo");
const { computeListingImpact } = require("./utils/impactFactors");

const DATA_DIR = path.join(__dirname, "data");
const ACTIVE_FILE = path.join(DATA_DIR, "listings.json");
const SEED_FILE = path.join(DATA_DIR, "sample_listings.json");

let listingsCache = [];

function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(ACTIVE_FILE)) {
      console.log("[DB] listings.json not found. Seeding from sample_listings.json...");
      if (fs.existsSync(SEED_FILE)) {
        const seedData = fs.readFileSync(SEED_FILE, "utf-8");
        fs.writeFileSync(ACTIVE_FILE, seedData, "utf-8");
      } else {
        fs.writeFileSync(ACTIVE_FILE, "[]", "utf-8");
      }
    }

    const raw = fs.readFileSync(ACTIVE_FILE, "utf-8");
    listingsCache = JSON.parse(raw || "[]");
    console.log(`[DB] Loaded ${listingsCache.length} listings into memory.`);
  } catch (err) {
    console.error("[DB] Failed to initialize database:", err);
    listingsCache = [];
  }
}

function persistDatabase() {
  try {
    fs.writeFileSync(ACTIVE_FILE, JSON.stringify(listingsCache, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Error saving to listings.json:", err);
  }
}

function getAllListings() {
  return [...listingsCache];
}

function getListingById(id) {
  if (!id) return null;
  return listingsCache.find(
    (l) => l.listing_id.toLowerCase() === id.trim().toLowerCase()
  );
}

function createListing(data) {
  // Generate next listing_id
  let maxIdNum = 0;
  listingsCache.forEach((l) => {
    const match = l.listing_id.match(/LST(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });
  const nextId = "LST" + String(maxIdNum + 1).padStart(4, "0");

  const quantity = Math.max(1, Number(data.quantity) || 1);
  const priceTotal = Math.max(0, Number(data.price_total_inr) || 0);
  const pricePerUnit = Math.round((priceTotal / quantity) * 100) / 100;

  let lat = Number(data.latitude);
  let lng = Number(data.longitude);

  if ((!lat || !lng) && data.city) {
    const cityData = getCityCoordinates(data.city);
    if (cityData) {
      lat = cityData.latitude;
      lng = cityData.longitude;
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  const newListing = {
    listing_id: nextId,
    business_name: (data.business_name || "Enterprise Surplus Partner").trim(),
    business_type: data.business_type || "Manufacturer",
    category: data.category || "Cardboard",
    material_subtype: (data.material_subtype || "Packaging Material").trim(),
    quantity,
    unit: data.unit || "kg",
    condition: data.condition || "Good - Reusable",
    price_total_inr: priceTotal,
    price_per_unit_inr: pricePerUnit,
    city: (data.city || "Mumbai").trim(),
    state: (data.state || "Maharashtra").trim(),
    latitude: lat || 19.0505,
    longitude: lng || 72.8417,
    status: "available",
    date_listed: data.date_listed || today,
    contact_email: (data.contact_email || "contact@circularexchange.in").trim(),
    description: (data.description || `${data.material_subtype || "Surplus material"} available for circular reuse or recycling.`).trim(),
    image_url: data.image_url || "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    claimed_by: null,
    claimed_at: null,
    sold_at: null
  };

  listingsCache.unshift(newListing);
  persistDatabase();
  return newListing;
}

function updateListingStatus(id, newStatus, metadata = {}) {
  const listing = getListingById(id);
  if (!listing) return null;

  const validStatuses = ["available", "reserved", "sold"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const now = new Date().toISOString();
  listing.status = newStatus;

  if (newStatus === "reserved") {
    listing.claimed_by = metadata.claimed_by || metadata.buyer_name || "Verified B2B Buyer";
    listing.claimed_at = now;
  } else if (newStatus === "sold") {
    listing.sold_at = now;
    if (metadata.claimed_by && !listing.claimed_by) {
      listing.claimed_by = metadata.claimed_by;
    }
  } else if (newStatus === "available") {
    listing.claimed_by = null;
    listing.claimed_at = null;
    listing.sold_at = null;
  }

  persistDatabase();
  return listing;
}

function resetDatabase() {
  if (fs.existsSync(SEED_FILE)) {
    const raw = fs.readFileSync(SEED_FILE, "utf-8");
    listingsCache = JSON.parse(raw);
    persistDatabase();
    console.log(`[DB] Database reset to original ${listingsCache.length} seed listings.`);
    return listingsCache;
  }
  return listingsCache;
}

function getBusinesses() {
  const businessMap = {};

  listingsCache.forEach((l) => {
    const name = l.business_name;
    if (!businessMap[name]) {
      businessMap[name] = {
        name,
        business_type: l.business_type,
        city: l.city,
        state: l.state,
        contact_email: l.contact_email,
        total_listings: 0,
        available_listings: 0,
        reserved_listings: 0,
        sold_listings: 0,
        total_quantity_diverted_kg: 0,
        total_co2_avoided_kg: 0,
        total_value_inr: 0,
        listings: []
      };
    }

    const b = businessMap[name];
    b.total_listings += 1;
    b.listings.push(l);

    if (l.status === "available") {
      b.available_listings += 1;
    } else if (l.status === "reserved") {
      b.reserved_listings += 1;
    } else if (l.status === "sold") {
      b.sold_listings += 1;
      const impact = computeListingImpact(l);
      b.total_quantity_diverted_kg += impact.kgDiverted;
      b.total_co2_avoided_kg += impact.co2AvoidedKg;
      b.total_value_inr += Number(l.price_total_inr) || 0;
    }
  });

  return Object.values(businessMap).sort((a, b) => b.total_listings - a.total_listings);
}

// Initialize immediately on module load
initDatabase();

module.exports = {
  initDatabase,
  getAllListings,
  getListingById,
  createListing,
  updateListingStatus,
  resetDatabase,
  getBusinesses
};
