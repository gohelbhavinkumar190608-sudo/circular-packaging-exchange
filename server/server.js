const express = require("express");
const cors = require("cors");
const path = require("path");

const listingsRouter = require("./routes/listings");
const matchingRouter = require("./routes/matching");
const impactRouter = require("./routes/impact");
const logisticsRouter = require("./routes/logistics");
const businessesRouter = require("./routes/businesses");
const systemRouter = require("./routes/system");
const uploadRouter = require("./routes/upload");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Support high-resolution images up to 50MB)
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded photos directly
const serverUploadsPath = path.join(__dirname, "uploads");
const clientUploadsPath = path.join(__dirname, "..", "client", "dist", "uploads");
if (!require("fs").existsSync(serverUploadsPath)) {
  require("fs").mkdirSync(serverUploadsPath, { recursive: true });
}
app.use("/uploads", express.static(serverUploadsPath));
app.use("/uploads", express.static(clientUploadsPath));

// API Routes
app.use("/api/listings", listingsRouter);
app.use("/api/matching", matchingRouter);
app.use("/api/impact", impactRouter);
app.use("/api/logistics", logisticsRouter);
app.use("/api/businesses", businessesRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`♻️  Circular Packaging & Materials Exchange Server`);
  console.log(`🚀 API running on: http://localhost:${PORT}`);
  console.log(`📦 Seed data initialized from sample_listings.json`);
  console.log(`=======================================================`);
});
