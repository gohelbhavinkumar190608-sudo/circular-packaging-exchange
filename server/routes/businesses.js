const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/businesses
router.get("/", (req, res) => {
  try {
    const businesses = db.getBusinesses();
    res.json({
      success: true,
      count: businesses.length,
      businesses
    });
  } catch (err) {
    console.error("[Businesses API] Error fetching businesses:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/businesses/:name
router.get("/:name", (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name).trim().toLowerCase();
    const businesses = db.getBusinesses();
    const business = businesses.find((b) => b.name.toLowerCase() === name);

    if (!business) {
      return res.status(404).json({ success: false, error: "Business profile not found" });
    }

    res.json({
      success: true,
      business
    });
  } catch (err) {
    console.error("[Businesses API] Error fetching business profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
