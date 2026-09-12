const express = require("express");
const router = express.Router();
const db = require("../db");
const { getHaversineDistance, getCityCoordinates, INDIAN_CITIES } = require("../utils/geo");
const { calculateKg } = require("../utils/impactFactors");

// POST /api/logistics/estimate
router.post("/estimate", (req, res) => {
  try {
    const {
      listing_id,
      buyer_city,
      buyer_latitude,
      buyer_longitude,
      seller_city,
      seller_latitude,
      seller_longitude,
      quantity,
      unit
    } = req.body;

    let sLat = seller_latitude ? parseFloat(seller_latitude) : null;
    let sLng = seller_longitude ? parseFloat(seller_longitude) : null;
    let sCity = seller_city;
    let itemPrice = 0;
    let itemQty = parseFloat(quantity) || 100;
    let itemUnit = unit || "kg";

    if (listing_id) {
      const listing = db.getListingById(listing_id);
      if (listing) {
        sLat = listing.latitude;
        sLng = listing.longitude;
        sCity = listing.city;
        itemPrice = listing.price_total_inr;
        itemQty = listing.quantity;
        itemUnit = listing.unit;
      }
    } else if (seller_city && (sLat == null || sLng == null)) {
      const cityData = getCityCoordinates(seller_city);
      if (cityData) {
        sLat = cityData.latitude;
        sLng = cityData.longitude;
      }
    }

    let bLat = buyer_latitude ? parseFloat(buyer_latitude) : null;
    let bLng = buyer_longitude ? parseFloat(buyer_longitude) : null;
    let bCity = buyer_city;

    if (buyer_city && (bLat == null || bLng == null)) {
      const cityData = getCityCoordinates(buyer_city);
      if (cityData) {
        bLat = cityData.latitude;
        bLng = cityData.longitude;
      }
    }

    // Default buyer to Mumbai if not specified
    if (bLat == null || bLng == null) {
      bLat = 19.0505;
      bLng = 72.8417;
      bCity = bCity || "Mumbai";
    }

    if (sLat == null || sLng == null) {
      return res.status(400).json({
        success: false,
        error: "Seller location coordinates could not be determined."
      });
    }

    const distanceKm = getHaversineDistance(bLat, bLng, sLat, sLng);
    const weightKg = calculateKg(itemQty, itemUnit);

    // B2B Industrial Freight pricing formula:
    // Base Dispatch Fee: ₹1,200 (covers local loading, dock handling, documentation)
    // Distance Fee: ₹16 - ₹22 per km depending on truck capacity
    // Weight factor: small surcharge if over 5,000 kg (5 tons)
    const baseFee = 1200;
    const perKmRate = weightKg > 5000 ? 22.0 : 16.5;
    const distanceCost = Math.round(distanceKm * perKmRate);
    
    // Total estimated logistics fee
    const estimatedFreightInr = baseFee + distanceCost;

    // Transit time estimation
    let transitHours = 0;
    let transitDescription = "";
    if (distanceKm <= 75) {
      transitHours = 6;
      transitDescription = "Same-Day Direct Dispatch (4-8 hours)";
    } else if (distanceKm <= 250) {
      transitHours = 18;
      transitDescription = "Next-Day Delivery (18-24 hours)";
    } else if (distanceKm <= 600) {
      transitHours = 36;
      transitDescription = "Regional Freight (1-2 business days)";
    } else if (distanceKm <= 1200) {
      transitHours = 60;
      transitDescription = "Interstate Long-Haul (2-3 business days)";
    } else {
      transitHours = 96;
      transitDescription = "National Interstate (3-5 business days)";
    }

    const totalLandedCostInr = Math.round(itemPrice + estimatedFreightInr);
    const landedCostPerUnitInr =
      itemQty > 0 ? Math.round((totalLandedCostInr / itemQty) * 100) / 100 : totalLandedCostInr;

    res.json({
      success: true,
      origin: { city: sCity, latitude: sLat, longitude: sLng },
      destination: { city: bCity, latitude: bLat, longitude: bLng },
      distance_km: distanceKm,
      weight_kg_approx: weightKg,
      rate_breakdown: {
        base_dispatch_fee_inr: baseFee,
        per_km_rate_inr: perKmRate,
        distance_freight_inr: distanceCost,
        total_freight_inr: estimatedFreightInr
      },
      transit_time: {
        estimated_hours: transitHours,
        description: transitDescription
      },
      material_cost_inr: itemPrice,
      total_landed_cost_inr: totalLandedCostInr,
      landed_cost_per_unit_inr: landedCostPerUnitInr
    });
  } catch (err) {
    console.error("[Logistics API] Error estimating logistics:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
