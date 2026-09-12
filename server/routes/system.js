const express = require("express");
const router = express.Router();
const db = require("../db");
const { INDIAN_CITIES } = require("../utils/geo");
const { CO2_EMISSION_FACTORS, VIRGIN_MARKET_PRICE_PER_KG_INR } = require("../utils/impactFactors");

// GET /api/cities
router.get("/cities", (req, res) => {
  res.json({
    success: true,
    cities: INDIAN_CITIES
  });
});

// GET /api/categories
router.get("/categories", (req, res) => {
  const categories = Object.keys(CO2_EMISSION_FACTORS).map((cat) => ({
    name: cat,
    emission_factor: CO2_EMISSION_FACTORS[cat],
    virgin_price_per_kg_inr: VIRGIN_MARKET_PRICE_PER_KG_INR[cat]
  }));
  res.json({
    success: true,
    categories
  });
});

// POST /api/seed/reset
router.post("/seed/reset", (req, res) => {
  try {
    const resetData = db.resetDatabase();
    res.json({
      success: true,
      message: `Database successfully reset to original ${resetData.length} sample listings.`,
      count: resetData.length
    });
  } catch (err) {
    console.error("[System API] Error resetting database:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/health
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    platform: "Circular Packaging & Materials Exchange",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
