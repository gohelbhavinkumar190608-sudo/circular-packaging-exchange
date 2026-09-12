const fs = require("fs");
const path = require("path");
const { getCityCoordinates } = require("./utils/geo");
const { computeListingImpact } = require("./utils/impactFactors");

const DATA_DIR = path.join(__dirname, "data");
const ACTIVE_FILE = path.join(DATA_DIR, "listings.json");
const SEED_FILE = path.join(DATA_DIR, "sample_listings.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

let listingsCache = [];
let inquiriesCache = [];

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

    if (fs.existsSync(INQUIRIES_FILE)) {
      try {
        inquiriesCache = JSON.parse(fs.readFileSync(INQUIRIES_FILE, "utf-8") || "[]");
      } catch (e) {
        inquiriesCache = [];
      }
    } else {
      inquiriesCache = [];
      fs.writeFileSync(INQUIRIES_FILE, "[]", "utf-8");
    }
  } catch (err) {
    console.error("[DB] Failed to initialize database:", err);
    listingsCache = [];
    inquiriesCache = [];
  }
}

function persistDatabase() {
  try {
    fs.writeFileSync(ACTIVE_FILE, JSON.stringify(listingsCache, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Error saving to listings.json:", err);
  }
}

function persistInquiries() {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiriesCache, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Error saving to inquiries.json:", err);
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

  if (data.city) {
    const cityData = getCityCoordinates(data.city);
    if (cityData) {
      if (!lat || !lng || (data.city.toLowerCase() !== "mumbai" && Math.abs(lat - 19.0505) < 0.001)) {
        lat = cityData.latitude;
        lng = cityData.longitude;
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  let finalImageUrl = data.image_url || "/images/materials/corrugated_boxes.jpg";
  if (finalImageUrl && finalImageUrl.startsWith("data:image/")) {
    try {
      const match = finalImageUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        let ext = match[1].toLowerCase();
        if (ext === "jpeg") ext = "jpg";
        else if (ext === "svg+xml") ext = "svg";
        const buffer = Buffer.from(match[2], "base64");
        const filename = `listing_${nextId.toLowerCase()}_${Date.now()}.${ext}`;
        const uploadsDir = path.join(__dirname, "uploads");
        const distUploads = path.join(__dirname, "..", "client", "dist", "uploads");
        [uploadsDir, distUploads].forEach(d => {
          if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
          fs.writeFileSync(path.join(d, filename), buffer);
        });
        finalImageUrl = `/uploads/${filename}`;
        console.log(`[DB] Converted base64 image to static file: ${finalImageUrl}`);
      }
    } catch (e) {
      console.error("[DB] Failed to convert base64 image:", e.message);
    }
  }

  const cityObj = getCityCoordinates(data.city);

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
    state: (data.state || (cityObj ? cityObj.state : "Maharashtra")).trim(),
    address: (data.address || (cityObj ? cityObj.defaultAddress : `${data.city || "Mumbai"} Industrial Area`)).trim(),
    latitude: lat || 19.0505,
    longitude: lng || 72.8417,
    status: "available",
    date_listed: data.date_listed || today,
    contact_email: (data.contact_email || "contact@circularexchange.in").trim(),
    description: (data.description || `${data.material_subtype || "Surplus material"} available for circular reuse or recycling.`).trim(),
    image_url: finalImageUrl,
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

  if (newStatus === "reserved") {
    const reqQty = metadata.claimed_quantity ? Number(metadata.claimed_quantity) : listing.quantity;

    if (reqQty > 0 && reqQty < listing.quantity) {
      // Partial purchase: deduct taken quantity from current listing and keep it available
      const remainingQty = listing.quantity - reqQty;
      listing.quantity = remainingQty;
      listing.price_total_inr = Math.round(remainingQty * listing.price_per_unit_inr);
      listing.status = "available";

      // Create new reserved lot for the claimed amount
      let maxIdNum = 0;
      listingsCache.forEach((l) => {
        const match = l.listing_id.match(/LST(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxIdNum) maxIdNum = num;
        }
      });
      const reservedLotId = "LST" + String(maxIdNum + 1).padStart(4, "0");

      const claimedLot = {
        ...listing,
        listing_id: reservedLotId,
        quantity: reqQty,
        price_total_inr: Math.round(reqQty * listing.price_per_unit_inr),
        status: "reserved",
        claimed_by: metadata.claimed_by || metadata.buyer_name || "Verified B2B Buyer",
        buyer_email: metadata.buyer_email || "",
        buyer_address: metadata.buyer_address || "",
        claimed_at: now,
        sold_at: null,
        description: `${listing.description} (Reserved lot of ${reqQty} ${listing.unit})`
      };

      listingsCache.unshift(claimedLot);
      persistDatabase();
      return claimedLot;
    } else {
      // Full reservation
      listing.status = "reserved";
      listing.claimed_by = metadata.claimed_by || metadata.buyer_name || "Verified B2B Buyer";
      listing.buyer_email = metadata.buyer_email || "";
      listing.buyer_address = metadata.buyer_address || "";
      listing.claimed_at = now;
      persistDatabase();
      return listing;
    }
  } else if (newStatus === "sold") {
    listing.status = "sold";
    listing.sold_at = now;
    if (metadata.claimed_by && !listing.claimed_by) {
      listing.claimed_by = metadata.claimed_by;
    }
    persistDatabase();
    return listing;
  } else if (newStatus === "available") {
    listing.status = "available";
    listing.claimed_by = null;
    listing.claimed_at = null;
    listing.sold_at = null;
    persistDatabase();
    return listing;
  }

  persistDatabase();
  return listing;
}

function deleteListing(id) {
  const index = listingsCache.findIndex((l) => l.listing_id === id);
  if (index === -1) return null;
  const removed = listingsCache.splice(index, 1)[0];
  persistDatabase();
  console.log(`[DB] Listing ${id} (${removed.material_subtype}) removed successfully.`);
  return removed;
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

function saveInquiry(data) {
  const inquiry = {
    inquiry_id: "INQ" + Date.now(),
    listing_id: data.listing_id || "",
    seller_name: data.seller_name || "",
    seller_email: data.seller_email || "",
    buyer_name: data.buyer_name || "Verified B2B Buyer",
    buyer_email: data.buyer_email || "",
    buyer_address: data.buyer_address || "",
    buyer_city: data.buyer_city || "",
    requested_quantity: Number(data.requested_quantity) || 1,
    unit: data.unit || "kg",
    offered_total_inr: Number(data.offered_total_inr) || 0,
    message: data.message || "",
    pickup_date_proposal: data.pickup_date_proposal || "",
    created_at: new Date().toISOString()
  };
  inquiriesCache.unshift(inquiry);
  persistInquiries();
  console.log(`[DB] Saved formal inquiry ${inquiry.inquiry_id} for listing ${inquiry.listing_id} from ${inquiry.buyer_name}`);
  return inquiry;
}

function getInquiriesForListing(listingId) {
  return inquiriesCache.filter((i) => i.listing_id === listingId);
}

// Initialize immediately on module load
initDatabase();

module.exports = {
  initDatabase,
  getAllListings,
  getListingById,
  createListing,
  updateListingStatus,
  deleteListing,
  resetDatabase,
  getBusinesses,
  saveInquiry,
  getInquiriesForListing
};
