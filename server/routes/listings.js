const express = require("express");
const router = express.Router();
const db = require("../db");
const { getHaversineDistance, getCityCoordinates } = require("../utils/geo");
const { computeListingImpact } = require("../utils/impactFactors");

// GET /api/listings
router.get("/", (req, res) => {
  try {
    let listings = db.getAllListings();
    const {
      search,
      category,
      condition,
      status,
      city,
      minPrice,
      maxPrice,
      buyerCity,
      buyerLat,
      buyerLng,
      maxDistance,
      sortBy
    } = req.query;

    // Resolve buyer coordinates if buyerCity or buyerLat/buyerLng passed
    let bLat = buyerLat ? parseFloat(buyerLat) : null;
    let bLng = buyerLng ? parseFloat(buyerLng) : null;
    if ((bLat == null || bLng == null) && buyerCity) {
      const cityData = getCityCoordinates(buyerCity);
      if (cityData) {
        bLat = cityData.latitude;
        bLng = cityData.longitude;
      }
    }

    // Attach distance_km and computed impact to each listing
    listings = listings.map((item) => {
      const dist =
        bLat != null && bLng != null
          ? getHaversineDistance(bLat, bLng, item.latitude, item.longitude)
          : null;
      return {
        ...item,
        distance_km: dist,
        impact_metrics: computeListingImpact(item)
      };
    });

    // 1. Filter: search keyword
    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      listings = listings.filter(
        (l) =>
          l.material_subtype.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.business_name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
      );
    }

    // 2. Filter: category
    if (category && category !== "All" && category.trim() !== "") {
      listings = listings.filter(
        (l) => l.category.toLowerCase() === category.trim().toLowerCase()
      );
    }

    // 3. Filter: condition
    if (condition && condition !== "All" && condition.trim() !== "") {
      listings = listings.filter(
        (l) => l.condition.toLowerCase() === condition.trim().toLowerCase()
      );
    }

    // 4. Filter: status (available, reserved, sold)
    if (status && status !== "all" && status.trim() !== "") {
      listings = listings.filter(
        (l) => l.status.toLowerCase() === status.trim().toLowerCase()
      );
    }

    // 5. Filter: city
    if (city && city !== "All" && city.trim() !== "") {
      listings = listings.filter(
        (l) => l.city.toLowerCase() === city.trim().toLowerCase()
      );
    }

    // 6. Filter: price range
    if (minPrice != null && minPrice !== "") {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        listings = listings.filter((l) => l.price_total_inr >= min);
      }
    }
    if (maxPrice != null && maxPrice !== "") {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        listings = listings.filter((l) => l.price_total_inr <= max);
      }
    }

    // 7. Filter: max distance radius
    if (maxDistance != null && maxDistance !== "" && bLat != null && bLng != null) {
      const maxDist = parseFloat(maxDistance);
      if (!isNaN(maxDist) && maxDist > 0) {
        listings = listings.filter(
          (l) => l.distance_km != null && l.distance_km <= maxDist
        );
      }
    }

    // 8. Sorting
    if (sortBy === "price_asc") {
      listings.sort((a, b) => a.price_total_inr - b.price_total_inr);
    } else if (sortBy === "price_desc") {
      listings.sort((a, b) => b.price_total_inr - a.price_total_inr);
    } else if (sortBy === "distance" && bLat != null && bLng != null) {
      listings.sort((a, b) => (a.distance_km ?? 999999) - (b.distance_km ?? 999999));
    } else if (sortBy === "quantity_desc") {
      listings.sort((a, b) => b.quantity - a.quantity);
    } else {
      // Default: newest first (date_listed desc, then id desc)
      listings.sort((a, b) => {
        const dA = new Date(a.date_listed).getTime();
        const dB = new Date(b.date_listed).getTime();
        if (dB !== dA) return dB - dA;
        return b.listing_id.localeCompare(a.listing_id);
      });
    }

    // Summary counts for filter pill badges
    const allListings = db.getAllListings();
    const counts = {
      total: allListings.length,
      available: allListings.filter((l) => l.status === "available").length,
      reserved: allListings.filter((l) => l.status === "reserved").length,
      sold: allListings.filter((l) => l.status === "sold").length,
      byCategory: {}
    };
    allListings.forEach((l) => {
      counts.byCategory[l.category] = (counts.byCategory[l.category] || 0) + 1;
    });

    res.json({
      success: true,
      count: listings.length,
      counts,
      listings
    });
  } catch (err) {
    console.error("[Listings API] Error fetching listings:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/listings/:id
router.get("/:id", (req, res) => {
  try {
    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    const { buyerCity, buyerLat, buyerLng } = req.query;
    let bLat = buyerLat ? parseFloat(buyerLat) : null;
    let bLng = buyerLng ? parseFloat(buyerLng) : null;
    if ((bLat == null || bLng == null) && buyerCity) {
      const cityData = getCityCoordinates(buyerCity);
      if (cityData) {
        bLat = cityData.latitude;
        bLng = cityData.longitude;
      }
    }

    const dist =
      bLat != null && bLng != null
        ? getHaversineDistance(bLat, bLng, listing.latitude, listing.longitude)
        : null;

    res.json({
      success: true,
      listing: {
        ...listing,
        distance_km: dist,
        impact_metrics: computeListingImpact(listing)
      }
    });
  } catch (err) {
    console.error("[Listings API] Error fetching listing by id:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/listings
router.post("/", (req, res) => {
  try {
    const {
      business_name,
      business_type,
      category,
      material_subtype,
      quantity,
      unit,
      condition,
      price_total_inr,
      city,
      state,
      latitude,
      longitude,
      contact_email,
      description,
      image_url
    } = req.body;

    if (!category || !quantity || price_total_inr == null) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (category, quantity, price_total_inr)"
      });
    }

    const newListing = db.createListing({
      business_name,
      business_type,
      category,
      material_subtype,
      quantity,
      unit,
      condition,
      price_total_inr,
      city,
      state,
      latitude,
      longitude,
      contact_email,
      description,
      image_url
    });

    res.status(201).json({
      success: true,
      message: "Listing created successfully with status 'available'",
      listing: newListing
    });
  } catch (err) {
    console.error("[Listings API] Error creating listing:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/listings/:id/status
router.patch("/:id/status", (req, res) => {
  try {
    const { status, claimed_by, buyer_email, buyer_address, claimed_quantity } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    // Strict Loophole Prevention: Seller cannot claim or buy their own product
    if (status === "reserved" || status === "sold") {
      const buyerName = (claimed_by || "").trim().toLowerCase();
      const sellerName = (listing.business_name || "").trim().toLowerCase();
      const bEmail = (buyer_email || "").trim().toLowerCase();
      const sEmail = (listing.contact_email || "").trim().toLowerCase();

      if ((buyerName && sellerName && buyerName === sellerName) ||
          (bEmail && sEmail && bEmail === sEmail)) {
        return res.status(400).json({
          success: false,
          error: "Self-purchase prohibited: You cannot claim or buy your own product listing."
        });
      }
    }

    const updated = db.updateListingStatus(req.params.id, status, {
      claimed_by,
      buyer_email,
      buyer_address,
      claimed_quantity
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    res.json({
      success: true,
      message: `Listing status updated to '${status}'`,
      listing: {
        ...updated,
        impact_metrics: computeListingImpact(updated)
      }
    });
  } catch (err) {
    console.error("[Listings API] Error updating listing status:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/listings/:id/inquiry
// Formal RFQ / Purchase Request dispatched directly to the selling company
router.post("/:id/inquiry", (req, res) => {
  try {
    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    const {
      buyer_name,
      buyer_email,
      buyer_address,
      buyer_city,
      requested_quantity,
      message,
      pickup_date_proposal
    } = req.body;

    const reqQty = Number(requested_quantity) || listing.quantity;
    const unitPrice = listing.price_per_unit_inr || (listing.quantity > 0 ? listing.price_total_inr / listing.quantity : 0);
    const offeredTotal = Math.round(reqQty * unitPrice);

    const inquiry = db.saveInquiry({
      listing_id: listing.listing_id,
      seller_name: listing.business_name,
      seller_email: listing.contact_email,
      buyer_name: buyer_name || "Verified B2B Enterprise",
      buyer_email: buyer_email || "",
      buyer_address: buyer_address || "",
      buyer_city: buyer_city || "",
      requested_quantity: reqQty,
      unit: listing.unit,
      offered_total_inr: offeredTotal,
      message: message || "Formal request for quote and pickup coordination.",
      pickup_date_proposal: pickup_date_proposal || ""
    });

    res.status(201).json({
      success: true,
      message: `Inquiry successfully dispatched to ${listing.business_name} (${listing.contact_email}).`,
      inquiry
    });
  } catch (err) {
    console.error("[Listings API] Error saving inquiry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/listings/:id
// Enforces strict ownership: User can ONLY remove their own listings!
router.delete("/:id", (req, res) => {
  try {
    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    const requesterName = (
      req.body?.user_name ||
      req.query?.user_name ||
      req.headers["x-user-name"] ||
      ""
    ).trim().toLowerCase();

    const requesterEmail = (
      req.body?.user_email ||
      req.query?.user_email ||
      req.headers["x-user-email"] ||
      ""
    ).trim().toLowerCase();

    const ownerName = (listing.business_name || "").trim().toLowerCase();
    const ownerEmail = (listing.contact_email || "").trim().toLowerCase();

    // Check ownership
    const isOwner = (requesterName && ownerName && requesterName === ownerName) ||
                    (requesterEmail && ownerEmail && requesterEmail === ownerEmail);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: You can only remove your own products. This listing belongs to '${listing.business_name}'.`
      });
    }

    const deleted = db.deleteListing(req.params.id);
    res.json({
      success: true,
      message: `Listing ${req.params.id} removed successfully.`,
      listing: deleted
    });
  } catch (err) {
    console.error("[Listings API] Error deleting listing:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
