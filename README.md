# Circular Packaging & Materials Exchange
> **A B2B Marketplace Platform to Match and Trade Surplus Packaging & Industrial Materials**  
> **HackOut '26 — Circular Carbon Ecosystem**  
> **Team:** SYNTAX TERROR  
> - Tirth Vyas (Team Leader)  
> - Bhavinkumar Gohel  
> - Saurabh Prajapati  
> - Mihir Pathakji  

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/gohelbhavinkumar82/localrepo.)

---


## 1. Problem & Core Solution

Manufacturing and retail industries generate massive volumes of packaging waste (corrugated cardboard boxes, industrial plastics, wooden pallets, steel drums, foam inserts, and sacks) that are often clean and structurally sound. Right now, there is no standardized, easy-to-use B2B platform connecting a factory with surplus packaging to another business nearby that needs exactly that material as affordable input.

**The Result:** Usable packaging goes directly to landfills, buyers pay full price for virgin packaging material, and industrial supply chains produce excess embodied carbon emissions.

**The Solution:** An OLX/Craigslist-style B2B exchange that enables companies to list, discover, match, and claim surplus packaging materials nearby — with integrated logistics cost estimation, intelligent multi-factor matching, and a live Circular Carbon & Cost Abatement Dashboard.

```
Reduces Waste                 Cuts Costs                  Lowers Carbon
Less packaging sent to        Cheaper inputs vs           Less embodied carbon from
landfill (~1,550+ tons)       virgin materials            avoiding virgin production
```

---

## 2. Core User Flows Implemented

### 1. Sell / List Surplus Packaging (`/sell`)
- **Seller Profile:** Company name and business type (*Manufacturer, Retailer, Recycler, Logistics Company, Distributor*).
- **8 Packaging Categories:** *Cardboard, Plastic, Wood, Metal, Glass, Foam/Packaging, Paper, Textile/Jute*.
- **Subtypes:** Standard suggested chips (e.g., *Double-wall corrugated boxes*, *Wooden pallets*, *Steel drums*, *PET scrap*, *Kraft paper rolls*).
- **Volume & Units:** Quantity with unit selection (*kg, tons, units, pallets, rolls*).
- **Quality Condition:** *New/Unused, Like New, Good - Reusable, Fair - Recyclable, Scrap Grade*.
- **Commercial Pricing:** Total price (₹ INR) with automatic calculation of price per unit.
- **Geographic Location:** Auto-populates state and latitude/longitude coordinates upon city selection.
- **Auto-Suggest Description:** One-click B2B commercial description generator tailored to the selected material and condition.
- **Photo Selector & Live Card Preview:** Real-time OLX card preview showing how the listing will render before submission.
- On submit, automatically indexed with status `available`.

### 2. Browse & Buy — OLX-Style Marketplace Grid (`/`)
- **Marketplace Grid & List View:** Toggle between rich card grid and compact row list.
- **Cards Display:** Photo, category badge, material subtype, quantity + unit, condition badge, total price & unit price (₹ INR), origin city + calculated distance from buyer, and status badge.
- **Category Filter Chips:** Horizontal scrolling pills with real-time lot counts per category.
- **Search:** Instant keyword search by material subtype, description, company, or city.
- **Deep Filters:** Filter by Status (*Available, Reserved, Sold, All*), Condition, Hub City, Distance Radius slider, and Price Range.
- **Dynamic Sorting:** Sort by Newest, Nearest to my location, Price (Low to High, High to Low), or Highest Quantity.

### 3. Smart Matching Engine — "Best Fit For Your Needs" (`/matcher`)
- Dedicated procurement tool where buyers enter required category, target volume, buyer location, max allowable transport radius, and budget cap.
- **Algorithmic Multi-Factor Scoring (0 - 100 points):**
  - **Distance Proximity (40%):** Geodesic distance calculated using the **Haversine formula**.
  - **Price Competitiveness (35%):** Unit price comparison against category market rates.
  - **Volume Alignment (20%):** How completely the lot fulfills required volume.
  - **Freshness & Keyword Relevance (10%):** Days listed and subtype match bonus.
- **Ranked Results:** Displays match score % (*"97% Match - Best Match"*, *"Great Match"*, *"Good Match"*), distance, unit price, and a 1-click claim button.
- **Preset Scenarios:** Pre-configured 1-click test scenarios for hackathon judging (e.g., *1,000 Pallets in Delhi*, *PET Scrap in Mumbai*).

### 4. Claim & Purchase Flow
- **Available &rarr; Reserved:** Buyer clicks *"Claim / Request to Buy"*, locking the batch and recording the claiming company.
- **Reserved &rarr; Sold:** Seller or buyer confirms sale, permanently logging the diverted waste into the Circular Impact Dashboard.
- **Cancellation / Hold Release:** Either party can cancel a reservation, returning status to `available`.

### 5. Freight & Logistics Estimator
- Accessible on every listing detail page.
- Computes actual travel distance using the **Haversine formula** between seller and buyer coordinates.
- **B2B Industrial Tariff Formula:** Base dispatch fee (₹1,200) + mileage rate (₹16.5–₹22/km adjusted for bulk weight).
- **Transit Time:** Estimates delivery window (*Same-Day Direct Dispatch 4-8 hrs*, *Next-Day 18-24 hrs*, *Regional Freight 1-2 days*, *Interstate 2-3 days*).
- **Total Landed Cost:** Item material price + freight = total landed cost and landed cost per unit.

### 6. Circular Carbon Impact Dashboard (`/impact`)
- Computed live from all listings with status `sold`:
  - **Total Waste Diverted:** Aggregated in kilograms and Metric Tons (normalized across units: tons &times; 1000, pallets &times; 25, rolls &times; 20, units &times; 15, kg &times; 1).
  - **Total Cost Saved:** Financial savings vs assumed virgin-material market benchmarks (Cardboard ₹38/kg, Plastic ₹85/kg, Metal ₹72/kg, Glass ₹22/kg, Wood ₹28/kg, Foam ₹95/kg, Paper ₹45/kg, Textile ₹55/kg).
  - **Embodied CO₂ Avoided:** Kg and Tons of CO₂e avoided using standard industrial factors (Cardboard 0.9, Plastic 1.5, Metal 2.0, Glass 0.3, Wood 0.4, Paper 0.7, Foam 1.8, Textile 1.2 kg CO₂/kg).
  - **Category Breakdown Bars & Timeline:** Visual distribution of diversion and greenhouse gas reductions.
  - **Recent Transactions Ledger:** Audit feed of diverted materials.

### 7. Business Directory & Profiles (`/businesses`)
- Profile page for all 25 participating industrial enterprises across India.
- Shows business type, location, contact details, ESG Circular Carbon Rating (*AAA Tier Partner*), total surplus batches, available listings, and completed diversion track record.

---

## 3. Quick Start (Single Command)

### Option A: Run Single Production Server (Port 5000)
Serves both the backend REST API and the bundled React frontend:
```bash
npm start
```
Then open your browser at: **`http://localhost:5000`**

### Option B: Run Development Mode (Vite + Express concurrently)
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 4. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/listings` | Fetch all listings with query filters (`search`, `category`, `condition`, `status`, `city`, `minPrice`, `maxPrice`, `buyerCity`, `maxDistance`, `sortBy`) |
| `GET` | `/api/listings/:id` | Fetch single listing details with distance and impact potential |
| `POST` | `/api/listings` | Create a new listing (auto-assigns ID, calculates unit price, sets status `available`) |
| `PATCH` | `/api/listings/:id/status` | Transition status (`available` &harr; `reserved` &rarr; `sold`) |
| `POST` | `/api/matching` | Multi-factor Haversine matching engine returning ranked recommendations |
| `POST` | `/api/logistics/estimate` | Compute freight distance, transport fee, and transit duration |
| `GET` | `/api/impact` | Aggregate live waste diverted, CO₂ avoided, and cost savings from sold listings |
| `GET` | `/api/businesses` | Directory of businesses and trust metrics |
| `GET` | `/api/businesses/:name` | Single business profile and active/past listings |
| `POST` | `/api/seed/reset` | Reset database back to the original 45 sample listings |
| `GET` | `/api/cities` | List 10 Indian hub cities with coordinates |
| `GET` | `/api/health` | Health check endpoint |

---

## 5. Pre-Seeded Dataset
The platform ships with all **45 realistic listings** across:
- **8 Packaging Categories:** Cardboard, Plastic, Wood, Metal, Glass, Foam/Packaging, Paper, Textile/Jute
- **10 Major Indian Cities:** Mumbai, Delhi, Ahmedabad, Bengaluru, Chennai, Pune, Surat, Indore, Rajkot, Vadodara
- Initial states include **Available**, **Reserved**, and **Sold** lots, so the marketplace and impact dashboard are demoable immediately on first run.
- Includes a **1-Click "Reset Seed Data"** button in the footer for repeatable demonstrations during judging.
