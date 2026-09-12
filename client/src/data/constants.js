export const CATEGORIES = [
  "Cardboard",
  "Plastic",
  "Wood",
  "Metal",
  "Glass",
  "Foam/Packaging",
  "Paper",
  "Textile/Jute"
];

export const CATEGORY_DETAILS = {
  Cardboard: {
    icon: "Package",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    subtypes: [
      "Double-wall corrugated boxes",
      "Die-cut cartons",
      "Single-face corrugated rolls",
      "Corner & edge protectors",
      "Honeycomb board panels"
    ],
    defaultImage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    co2Factor: 0.9,
    virginPrice: 38
  },
  Plastic: {
    icon: "Layers",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    subtypes: [
      "PET bottles/scrap",
      "LDPE film/wrap",
      "PP strapping",
      "Plastic crates",
      "HDPE drums & carboys"
    ],
    defaultImage: "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=600&q=80",
    co2Factor: 1.5,
    virginPrice: 85
  },
  Wood: {
    icon: "TreePine",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    subtypes: [
      "Wooden pallets (standard)",
      "Euro pallets (1200x800)",
      "Plywood offcuts",
      "Wooden shipping crates",
      "Wood shavings/dunnage"
    ],
    defaultImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    co2Factor: 0.4,
    virginPrice: 28
  },
  Metal: {
    icon: "ShieldAlert",
    color: "bg-slate-100 text-slate-800 border-slate-300",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    subtypes: [
      "Steel drums",
      "Tin containers",
      "Metal strapping coils",
      "Aluminum foil scraps",
      "Steel pallet collars"
    ],
    defaultImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80",
    co2Factor: 2.0,
    virginPrice: 72
  },
  Glass: {
    icon: "Wine",
    color: "bg-cyan-100 text-cyan-800 border-cyan-300",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    subtypes: [
      "Glass bottles",
      "Broken glass cullet",
      "Glass jars",
      "Amber reagent bottles",
      "Flint glass containers"
    ],
    defaultImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80",
    co2Factor: 0.3,
    virginPrice: 22
  },
  "Foam/Packaging": {
    icon: "Box",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    subtypes: [
      "Styrofoam (EPS) sheets",
      "Bubble wrap rolls",
      "Foam packaging inserts",
      "EPE foam planks",
      "Air pillow cushions"
    ],
    defaultImage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    co2Factor: 1.8,
    virginPrice: 95
  },
  Paper: {
    icon: "FileText",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    subtypes: [
      "Kraft paper rolls",
      "Paper cores/tubes",
      "Shredded paper",
      "Pulp molded trays",
      "Newsprint bundling sheets"
    ],
    defaultImage: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80",
    co2Factor: 0.7,
    virginPrice: 45
  },
  "Textile/Jute": {
    icon: "ShoppingBag",
    color: "bg-lime-100 text-lime-800 border-lime-300",
    bg: "bg-lime-50",
    border: "border-lime-200",
    text: "text-lime-700",
    subtypes: [
      "Jute bags",
      "Cotton packaging waste",
      "Hessian fabric rolls",
      "Burlap potato sacks",
      "FIBC bulk bags (reconditioned)"
    ],
    defaultImage: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80",
    co2Factor: 1.2,
    virginPrice: 55
  }
};

export const CONDITIONS = [
  { value: "New/Unused", label: "New / Unused (100% factory pristine surplus)" },
  { value: "Like New", label: "Like New (Single-trip packaging, excellent condition)" },
  { value: "Good - Reusable", label: "Good - Reusable (Light handling marks, immediately reusable)" },
  { value: "Fair - Recyclable", label: "Fair - Recyclable (Minor tears/wear, suitable for remelt/pulping)" },
  { value: "Scrap Grade", label: "Scrap Grade (Crushed or damaged, industrial recycling feedstock)" }
];

export const UNITS = ["kg", "tons", "units", "pallets", "rolls"];

export const BUSINESS_TYPES = [
  "Manufacturer",
  "Retailer",
  "Recycler",
  "Logistics Company",
  "Distributor"
];

export const DEMO_ACCOUNTS = [
  {
    id: "acc_1",
    name: "Sunrise Logistics Pvt Ltd",
    type: "Manufacturer",
    city: "Mumbai",
    state: "Maharashtra",
    email: "sunrise.logistics.pvt.ltd@gmail.com",
    roleBadge: "Seller & Manufacturer"
  },
  {
    id: "acc_2",
    name: "Krishna Paper Mills",
    type: "Recycler",
    city: "Ahmedabad",
    state: "Gujarat",
    email: "krishna.paper.mills@business.co.in",
    roleBadge: "Industrial Recycler"
  },
  {
    id: "acc_3",
    name: "EcoBox Solutions",
    type: "Distributor",
    city: "Surat",
    state: "Gujarat",
    email: "ecobox.solutions@business.co.in",
    roleBadge: "Packaging Distributor"
  },
  {
    id: "acc_4",
    name: "Bharat Pallet Works",
    type: "Manufacturer",
    city: "Mumbai",
    state: "Maharashtra",
    email: "bharat.pallet.works@business.co.in",
    roleBadge: "Pallet Manufacturer"
  },
  {
    id: "acc_5",
    name: "GreenPack Industries",
    type: "Recycler",
    city: "Chennai",
    state: "Tamil Nadu",
    email: "greenpack.industries@business.co.in",
    roleBadge: "Circular Recycler"
  }
];

export const CITIES = [
  { city: "Mumbai", state: "Maharashtra", latitude: 19.0505, longitude: 72.8417 },
  { city: "Delhi", state: "Delhi", latitude: 28.7137, longitude: 77.0910 },
  { city: "Ahmedabad", state: "Gujarat", latitude: 23.0386, longitude: 72.5987 },
  { city: "Bengaluru", state: "Karnataka", latitude: 12.9501, longitude: 77.6143 },
  { city: "Chennai", state: "Tamil Nadu", latitude: 13.1163, longitude: 80.3176 },
  { city: "Pune", state: "Maharashtra", latitude: 18.5551, longitude: 73.8671 },
  { city: "Surat", state: "Gujarat", latitude: 21.1934, longitude: 72.8627 },
  { city: "Indore", state: "Madhya Pradesh", latitude: 22.7272, longitude: 75.8320 },
  { city: "Rajkot", state: "Gujarat", latitude: 22.2988, longitude: 70.7800 },
  { city: "Vadodara", state: "Gujarat", latitude: 22.3046, longitude: 73.1426 }
];
