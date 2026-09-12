const express = require("express");
const router = express.Router();
const db = require("../db");
const { getHaversineDistance, getCityCoordinates } = require("../utils/geo");
const { calculateKg, computeListingImpact } = require("../utils/impactFactors");

// POST /api/matching
router.post("/", (req, res) => {
  try {
    const {
      category,
      material_subtype,
      quantity,
      unit,
      max_distance,
      max_price,
      buyer_city,
      buyer_latitude,
      buyer_longitude,
      include_reserved
    } = req.body;

    let bLat = buyer_latitude ? parseFloat(buyer_latitude) : null;
    let bLng = buyer_longitude ? parseFloat(buyer_longitude) : null;

    if ((bLat == null || bLng == null) && buyer_city) {
      const cityData = getCityCoordinates(buyer_city);
      if (cityData) {
        bLat = cityData.latitude;
        bLng = cityData.longitude;
      }
    }

    // Default reference coordinates to Mumbai if completely unspecified
    if (bLat == null || bLng == null) {
      bLat = 19.0505;
      bLng = 72.8417;
    }

    const reqQty = parseFloat(quantity) || 50;
    const maxDist = max_distance ? parseFloat(max_distance) : 1200;
    const maxP = max_price ? parseFloat(max_price) : null;

    let candidates = db.getAllListings();

    // Only match available items (or reserved if user allows viewing)
    if (include_reserved) {
      candidates = candidates.filter((l) => l.status === "available" || l.status === "reserved");
    } else {
      candidates = candidates.filter((l) => l.status === "available");
    }

    // Filter by category if specified
    if (category && category !== "All" && category.trim() !== "") {
      candidates = candidates.filter(
        (l) => l.category.toLowerCase() === category.trim().toLowerCase()
      );
    }

    // Calculate distance and filter by max_distance if enforced
    const scoredListings = [];

    // Find min & max price in candidates for relative price scoring
    const prices = candidates.map((c) => c.price_per_unit_inr).filter((p) => p > 0);
    const minPricePerUnit = prices.length ? Math.min(...prices) : 5;
    const maxPricePerUnit = prices.length ? Math.max(...prices) : 25;

    const now = new Date();

    candidates.forEach((item) => {
      const dist = getHaversineDistance(bLat, bLng, item.latitude, item.longitude);
      if (dist > maxDist) return; // Exceeds buyer's max distance limit

      if (maxP != null && item.price_total_inr > maxP) return; // Exceeds budget limit

      // 1. Distance Score (0 - 40 pts)
      let distScore = 0;
      if (dist <= 50) distScore = 40;
      else if (dist <= 150) distScore = 35;
      else if (dist <= 300) distScore = 28;
      else if (dist <= 600) distScore = 20;
      else if (dist <= 1000) distScore = 12;
      else distScore = 6;

      // 2. Price Score (0 - 30 pts)
      // Lower unit price relative to range gives higher score
      let priceScore = 20;
      if (maxPricePerUnit > minPricePerUnit) {
        const normalizedPrice =
          (item.price_per_unit_inr - minPricePerUnit) / (maxPricePerUnit - minPricePerUnit);
        priceScore = Math.round((1 - Math.min(1, Math.max(0, normalizedPrice))) * 30);
      }

      // 3. Quantity Fit Score (0 - 20 pts)
      let qtyScore = 10;
      if (item.quantity >= reqQty) {
        qtyScore = 20; // Fully satisfies volume
      } else if (item.quantity >= reqQty * 0.7) {
        qtyScore = 15;
      } else if (item.quantity >= reqQty * 0.4) {
        qtyScore = 10;
      } else {
        qtyScore = 5;
      }

      // 4. Freshness Score (0 - 10 pts)
      let freshnessScore = 5;
      const listDate = new Date(item.date_listed);
      const diffDays = Math.max(0, (now.getTime() - listDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 7) freshnessScore = 10;
      else if (diffDays <= 14) freshnessScore = 8;
      else if (diffDays <= 30) freshnessScore = 6;
      else freshnessScore = 4;

      // Bonus: Material subtype keyword match (+5 pts)
      let subtypeBonus = 0;
      if (
        material_subtype &&
        item.material_subtype.toLowerCase().includes(material_subtype.trim().toLowerCase())
      ) {
        subtypeBonus = 5;
      }

      const totalScore = Math.min(
        100,
        Math.round(distScore + priceScore + qtyScore + freshnessScore + subtypeBonus)
      );

      let matchBadge = "Good Match";
      let matchBadgeColor = "blue";
      if (totalScore >= 88) {
        matchBadge = "Best Match";
        matchBadgeColor = "emerald";
      } else if (totalScore >= 75) {
        matchBadge = "Great Match";
        matchBadgeColor = "teal";
      } else if (totalScore >= 60) {
        matchBadge = "Good Match";
        matchBadgeColor = "amber";
      } else {
        matchBadge = "Alternative Match";
        matchBadgeColor = "slate";
      }

      scoredListings.push({
        ...item,
        distance_km: dist,
        match_score: totalScore,
        match_badge: matchBadge,
        match_badge_color: matchBadgeColor,
        score_breakdown: {
          distance: distScore,
          price: priceScore,
          quantity: qtyScore,
          freshness: freshnessScore,
          subtype_bonus: subtypeBonus
        },
        impact_metrics: computeListingImpact(item)
      });
    });

    // Rank descending by match_score, then nearest distance, then lowest price
    scoredListings.sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score;
      }
      if (a.distance_km !== b.distance_km) {
        return a.distance_km - b.distance_km;
      }
      return a.price_total_inr - b.price_total_inr;
    });

    res.json({
      success: true,
      query: {
        category,
        material_subtype,
        quantity: reqQty,
        unit: unit || "kg",
        max_distance: maxDist,
        max_price: maxP,
        buyer_city: buyer_city || "Mumbai",
        buyer_coordinates: { latitude: bLat, longitude: bLng }
      },
      total_matches: scoredListings.length,
      matches: scoredListings
    });
  } catch (err) {
    console.error("[Matching API] Error running matching engine:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
