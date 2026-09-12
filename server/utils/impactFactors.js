// Factors for converting listing units to kilograms (kg)
const UNIT_TO_KG_FACTORS = {
  kg: 1,
  tons: 1000,
  pallets: 25, // average industrial pallet ~25 kg
  rolls: 20,   // average packaging film/paper/bubble roll ~20 kg
  units: 15    // drums/crates/containers ~15 kg average weight
};

// Illustrative virgin-material market price per kg (in INR)
// Used to compute B2B cost saved compared to buying virgin material
const VIRGIN_MARKET_PRICE_PER_KG_INR = {
  Cardboard: 38.0,
  Plastic: 85.0,
  Wood: 28.0,
  Metal: 72.0,
  Glass: 22.0,
  "Foam/Packaging": 95.0,
  Paper: 45.0,
  "Textile/Jute": 55.0
};

// Embodied CO2 emission factor per material category (kg CO2 avoided per kg material diverted)
// As specified:
// Cardboard 0.9, Plastic 1.5, Metal 2.0, Glass 0.3, Wood 0.4, Paper 0.7, Foam 1.8, Textile 1.2
const CO2_EMISSION_FACTORS = {
  Cardboard: 0.9,
  Plastic: 1.5,
  Metal: 2.0,
  Glass: 0.3,
  Wood: 0.4,
  Paper: 0.7,
  "Foam/Packaging": 1.8,
  "Textile/Jute": 1.2
};

// Normalized kg calculation for a listing
function calculateKg(quantity, unit) {
  const factor = UNIT_TO_KG_FACTORS[unit] || 1;
  return Number(quantity || 0) * factor;
}

// Impact metrics for a single sold listing
function computeListingImpact(listing) {
  const kgDiverted = calculateKg(listing.quantity, listing.unit);
  const category = listing.category || "Cardboard";
  
  const emissionFactor = CO2_EMISSION_FACTORS[category] || 0.8;
  const co2AvoidedKg = Math.round(kgDiverted * emissionFactor * 10) / 10;

  const virginPricePerKg = VIRGIN_MARKET_PRICE_PER_KG_INR[category] || 40.0;
  const estimatedVirginCost = Math.round(kgDiverted * virginPricePerKg);
  const actualPaidPrice = Number(listing.price_total_inr) || 0;
  // If actual price is lower than virgin market cost, savings = virgin - actual, minimum 0
  const costSavedInr = Math.max(0, Math.round(estimatedVirginCost - actualPaidPrice));

  return {
    kgDiverted,
    tonsDiverted: Math.round((kgDiverted / 1000) * 100) / 100,
    co2AvoidedKg,
    co2AvoidedTons: Math.round((co2AvoidedKg / 1000) * 100) / 100,
    virginPricePerKg,
    estimatedVirginCost,
    actualPaidPrice,
    costSavedInr
  };
}

module.exports = {
  UNIT_TO_KG_FACTORS,
  VIRGIN_MARKET_PRICE_PER_KG_INR,
  CO2_EMISSION_FACTORS,
  calculateKg,
  computeListingImpact
};
