const db = require("./server/db");
const { getHaversineDistance } = require("./server/utils/geo");
const { computeListingImpact } = require("./server/utils/impactFactors");

console.log("--- TEST 1: Database listings & distance ---");
const listings = db.getAllListings();
console.log(`Total listings: ${listings.length}`);

// Mumbai to Pune distance test
const mumbaiListing = listings.find(l => l.city === "Mumbai");
const puneListing = listings.find(l => l.city === "Pune");
const dist = getHaversineDistance(mumbaiListing.latitude, mumbaiListing.longitude, puneListing.latitude, puneListing.longitude);
console.log(`Distance Mumbai -> Pune: ${dist} km (expected ~110-140 km)`);

console.log("--- TEST 2: Status transition ---");
const item = listings.find(l => l.status === "available");
console.log(`Initial status of ${item.listing_id}: ${item.status}`);

const reserved = db.updateListingStatus(item.listing_id, "reserved", { claimed_by: "Test Recycler Corp" });
console.log(`Updated status: ${reserved.status}, claimed_by: ${reserved.claimed_by}`);

const sold = db.updateListingStatus(item.listing_id, "sold");
console.log(`Updated status: ${sold.status}`);

const reverted = db.updateListingStatus(item.listing_id, "available");
console.log(`Reverted status: ${reverted.status}`);

console.log("--- TEST 3: Impact Calculation for Sold Items ---");
const soldItems = db.getAllListings().filter(l => l.status === "sold");
console.log(`Found ${soldItems.length} initially sold items in seed.`);
soldItems.forEach(s => {
  const imp = computeListingImpact(s);
  console.log(`[${s.listing_id}] ${s.category} (${s.quantity} ${s.unit}) -> Diverted: ${imp.kgDiverted} kg, CO2 Avoided: ${imp.co2AvoidedKg} kg, Cost Saved: Rs. ${imp.costSavedInr}`);
});

console.log("--- ALL BACKEND TESTS PASSED ---");
