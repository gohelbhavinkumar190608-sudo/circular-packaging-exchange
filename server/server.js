const express = require("express");
const cors = require("cors");
const path = require("path");

const listingsRouter = require("./routes/listings");
const matchingRouter = require("./routes/matching");
const impactRouter = require("./routes/impact");
const logisticsRouter = require("./routes/logistics");
const businessesRouter = require("./routes/businesses");
const systemRouter = require("./routes/system");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/listings", listingsRouter);
app.use("/api/matching", matchingRouter);
app.use("/api/impact", impactRouter);
app.use("/api/logistics", logisticsRouter);
app.use("/api/businesses", businessesRouter);
app.use("/api", systemRouter);

// Serve static frontend in production / build
const clientDistPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDistPath));

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
  const indexPath = path.join(clientDistPath, "index.html");
  if (require("fs").existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: "Circular Packaging & Materials Exchange API Server is running.",
      api_documentation: "/api/listings, /api/matching, /api/impact, /api/logistics, /api/businesses, /api/cities",
      status: "ready"
    });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`♻️  Circular Packaging & Materials Exchange Server`);
  console.log(`🚀 API running on: http://localhost:${PORT}`);
  console.log(`📦 Seed data initialized from sample_listings.json`);
  console.log(`=======================================================`);
});
