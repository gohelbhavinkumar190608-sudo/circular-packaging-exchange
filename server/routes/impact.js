const express = require("express");
const router = express.Router();
const db = require("../db");
const { computeListingImpact, CO2_EMISSION_FACTORS, VIRGIN_MARKET_PRICE_PER_KG_INR } = require("../utils/impactFactors");

// GET /api/impact
router.get("/", (req, res) => {
  try {
    const allListings = db.getAllListings();
    const soldListings = allListings.filter((l) => l.status === "sold");

    let totalKgDiverted = 0;
    let totalCo2AvoidedKg = 0;
    let totalCostSavedInr = 0;
    let totalRevenueInr = 0;

    const categoryBreakdown = {};
    const timelineData = {};

    soldListings.forEach((item) => {
      const impact = computeListingImpact(item);
      totalKgDiverted += impact.kgDiverted;
      totalCo2AvoidedKg += impact.co2AvoidedKg;
      totalCostSavedInr += impact.costSavedInr;
      totalRevenueInr += Number(item.price_total_inr) || 0;

      // Group by category
      const cat = item.category || "Other";
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = {
          category: cat,
          items_count: 0,
          kg_diverted: 0,
          tons_diverted: 0,
          co2_avoided_kg: 0,
          co2_avoided_tons: 0,
          cost_saved_inr: 0,
          emission_factor: CO2_EMISSION_FACTORS[cat] || 0.8,
          virgin_price_per_kg: VIRGIN_MARKET_PRICE_PER_KG_INR[cat] || 40.0
        };
      }
      categoryBreakdown[cat].items_count += 1;
      categoryBreakdown[cat].kg_diverted += impact.kgDiverted;
      categoryBreakdown[cat].co2_avoided_kg += impact.co2AvoidedKg;
      categoryBreakdown[cat].cost_saved_inr += impact.costSavedInr;

      // Group by date/month for timeline chart
      const dateKey = item.date_listed ? item.date_listed.slice(0, 7) : "2026-08"; // YYYY-MM
      if (!timelineData[dateKey]) {
        timelineData[dateKey] = {
          period: dateKey,
          kg_diverted: 0,
          co2_avoided_kg: 0,
          cost_saved_inr: 0,
          deals_count: 0
        };
      }
      timelineData[dateKey].kg_diverted += impact.kgDiverted;
      timelineData[dateKey].co2_avoided_kg += impact.co2AvoidedKg;
      timelineData[dateKey].cost_saved_inr += impact.costSavedInr;
      timelineData[dateKey].deals_count += 1;
    });

    // Format category breakdown
    Object.values(categoryBreakdown).forEach((c) => {
      c.tons_diverted = Math.round((c.kg_diverted / 1000) * 100) / 100;
      c.co2_avoided_tons = Math.round((c.co2_avoided_kg / 1000) * 100) / 100;
      c.co2_avoided_kg = Math.round(c.co2_avoided_kg * 10) / 10;
      c.cost_saved_inr = Math.round(c.cost_saved_inr);
    });

    // Sort timeline chronologically
    const timeline = Object.values(timelineData).sort((a, b) => a.period.localeCompare(b.period));

    // Recent sold listings for transactions feed
    const recentTransactions = soldListings
      .sort((a, b) => new Date(b.date_listed).getTime() - new Date(a.date_listed).getTime())
      .slice(0, 10)
      .map((l) => ({
        listing_id: l.listing_id,
        business_name: l.business_name,
        material_subtype: l.material_subtype,
        category: l.category,
        city: l.city,
        quantity: l.quantity,
        unit: l.unit,
        price_total_inr: l.price_total_inr,
        date_listed: l.date_listed,
        impact: computeListingImpact(l)
      }));

    res.json({
      success: true,
      headline_stats: {
        total_deals_completed: soldListings.length,
        total_active_listings: allListings.filter((l) => l.status === "available").length,
        total_reserved_listings: allListings.filter((l) => l.status === "reserved").length,
        total_waste_diverted_kg: Math.round(totalKgDiverted),
        total_waste_diverted_tons: Math.round((totalKgDiverted / 1000) * 100) / 100,
        total_cost_saved_inr: Math.round(totalCostSavedInr),
        total_co2_avoided_kg: Math.round(totalCo2AvoidedKg * 10) / 10,
        total_co2_avoided_tons: Math.round((totalCo2AvoidedKg / 1000) * 100) / 100,
        total_revenue_inr: Math.round(totalRevenueInr)
      },
      category_breakdown: Object.values(categoryBreakdown),
      timeline,
      recent_transactions: recentTransactions,
      emission_factors_used: CO2_EMISSION_FACTORS,
      virgin_prices_used: VIRGIN_MARKET_PRICE_PER_KG_INR
    });
  } catch (err) {
    console.error("[Impact API] Error computing impact dashboard:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
