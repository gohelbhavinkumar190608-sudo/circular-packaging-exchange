const express = require("express");
const router = express.Router();
const db = require("../db");
const { getHaversineDistance, getRoadDistance, getCityCoordinates, INDIAN_CITIES } = require("../utils/geo");
const { calculateKg } = require("../utils/impactFactors");

// POST /api/logistics/estimate
// Accurately calculates freight and transit distance between Company Plant Address and Buyer Delivery Address
router.post("/estimate", (req, res) => {
  try {
    const {
      listing_id,
      buyer_name,
      buyer_city,
      buyer_address,
      buyer_latitude,
      buyer_longitude,
      seller_city,
      seller_address,
      seller_latitude,
      seller_longitude,
      quantity,
      unit
    } = req.body;

    let sellerCompany = "Enterprise Supplier";
    let sCity = seller_city;
    let sState = "";
    let sAddress = seller_address;
    let sLat = seller_latitude ? parseFloat(seller_latitude) : null;
    let sLng = seller_longitude ? parseFloat(seller_longitude) : null;

    let unitPrice = 0;
    let fullQty = 100;
    let itemUnit = unit || "kg";

    if (listing_id) {
      const listing = db.getListingById(listing_id);
      if (listing) {
        sellerCompany = listing.business_name || "Enterprise Supplier";
        sCity = listing.city || "Mumbai";
        sState = listing.state || "Maharashtra";
        
        // Accurate coordinates verification:
        // If listing coordinates were defaulted to Mumbai while city is not Mumbai, re-resolve from city
        const cityLookup = getCityCoordinates(sCity);
        if (cityLookup && sCity.toLowerCase() !== "mumbai" && Math.abs(listing.latitude - 19.0505) < 0.001) {
          sLat = cityLookup.latitude;
          sLng = cityLookup.longitude;
        } else {
          sLat = listing.latitude || (cityLookup ? cityLookup.latitude : 19.0505);
          sLng = listing.longitude || (cityLookup ? cityLookup.longitude : 72.8417);
        }

        sAddress = listing.address || (cityLookup ? cityLookup.defaultAddress : `${sCity} Industrial Zone`);
        fullQty = listing.quantity;
        itemUnit = listing.unit;
        unitPrice = listing.price_per_unit_inr || (fullQty > 0 ? listing.price_total_inr / fullQty : 0);
      }
    } else if (seller_city) {
      const cityData = getCityCoordinates(seller_city);
      if (cityData) {
        sLat = sLat || cityData.latitude;
        sLng = sLng || cityData.longitude;
        sCity = cityData.city;
        sState = cityData.state;
        sAddress = sAddress || cityData.defaultAddress;
      }
    }

    // Determine requested quantity (defaults to full lot if not specified)
    const requestedQty = quantity != null && !isNaN(Number(quantity)) && Number(quantity) > 0
      ? Number(quantity)
      : fullQty;

    const itemPrice = Math.round(requestedQty * unitPrice);

    // Buyer location resolution
    let bCity = buyer_city || "Mumbai";
    let bState = "";
    let bLat = buyer_latitude ? parseFloat(buyer_latitude) : null;
    let bLng = buyer_longitude ? parseFloat(buyer_longitude) : null;

    const buyerCityData = getCityCoordinates(bCity);
    if (buyerCityData) {
      bCity = buyerCityData.city;
      bState = buyerCityData.state;
      if (bLat == null || bLng == null) {
        bLat = buyerCityData.latitude;
        bLng = buyerCityData.longitude;
      }
    } else {
      bLat = bLat || 19.0505;
      bLng = bLng || 72.8417;
    }

    const bAddress = buyer_address || (buyerCityData ? buyerCityData.defaultAddress : `${bCity} Hub`);
    const buyerCompany = buyer_name || "Purchasing Enterprise";

    if (sLat == null || sLng == null) {
      sLat = 19.0505;
      sLng = 72.8417;
    }

    // Accurate road transit distance (km) between Company Plant and Buyer Delivery Hub
    const straightKm = getHaversineDistance(sLat, sLng, bLat, bLng);
    const roadDistanceKm = getRoadDistance(sLat, sLng, bLat, bLng);
    const weightKg = calculateKg(requestedQty, itemUnit);

    // B2B Industrial Freight Tariffs (India):
    // Base Dispatch Fee: ₹1,200 (terminal handling, dock staging, e-way bill documentation)
    // Distance Fee: ₹16.5 - ₹22.0 per km depending on cargo tonnage
    const baseFee = 1200;
    const perKmRate = weightKg > 5000 ? 22.0 : (weightKg > 1000 ? 18.5 : 16.5);
    const distanceCost = Math.round(roadDistanceKm * perKmRate);
    const estimatedFreightInr = baseFee + distanceCost;

    // Commercial Truck Transit Time estimation based on Indian Highway speeds (avg 40-50 km/h with toll/rest stops)
    let transitHours = 0;
    let transitDescription = "";
    if (roadDistanceKm <= 50) {
      transitHours = 4;
      transitDescription = "Local Same-Day Direct Dispatch (2-4 hours)";
    } else if (roadDistanceKm <= 150) {
      transitHours = 8;
      transitDescription = "Regional Same-Day Delivery (6-8 hours)";
    } else if (roadDistanceKm <= 350) {
      transitHours = 18;
      transitDescription = "Next-Day Delivery (14-18 hours)";
    } else if (roadDistanceKm <= 750) {
      transitHours = 32;
      transitDescription = "Interstate Express Corridor (24-36 hours)";
    } else if (roadDistanceKm <= 1500) {
      transitHours = 60;
      transitDescription = "Long-Haul Interstate Freight (2-3 business days)";
    } else {
      transitHours = 96;
      transitDescription = "Trans-National Heavy Freight (3-5 business days)";
    }

    const totalLandedCostInr = itemPrice + estimatedFreightInr;
    const landedCostPerUnitInr =
      requestedQty > 0 ? Math.round((totalLandedCostInr / requestedQty) * 100) / 100 : totalLandedCostInr;

    res.json({
      success: true,
      origin: {
        company: sellerCompany,
        address: sAddress,
        city: sCity,
        state: sState,
        latitude: sLat,
        longitude: sLng
      },
      destination: {
        company: buyerCompany,
        address: bAddress,
        city: bCity,
        state: bState,
        latitude: bLat,
        longitude: bLng
      },
      distance_km: roadDistanceKm,
      straight_line_km: straightKm,
      requested_quantity: requestedQty,
      unit: itemUnit,
      unit_price_inr: unitPrice,
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
