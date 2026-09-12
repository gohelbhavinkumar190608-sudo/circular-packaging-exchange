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

export const SUBTYPE_IMAGES = {
  // Cardboard
  "Double-wall corrugated boxes": "/images/materials/corrugated_boxes.jpg",
  "Die-cut cartons": "/images/materials/die_cut_cartons.jpg",
  "Single-face corrugated rolls": "/images/materials/corrugated_boxes.jpg",
  "Corner & edge protectors": "/images/materials/die_cut_cartons.jpg",
  "Honeycomb board panels": "/images/materials/die_cut_cartons.jpg",

  // Plastic
  "PET bottles/scrap": "/images/materials/pet_bottles.jpg",
  "LDPE film/wrap": "/images/materials/ldpe_film_wrap.svg",
  "PP strapping": "/images/materials/pp_strapping.svg",
  "Plastic crates": "/images/materials/plastic_crates.svg",
  "HDPE drums & carboys": "/images/materials/steel_drums.jpg",

  // Wood
  "Wooden pallets (standard)": "/images/materials/wooden_pallets.jpg",
  "Euro pallets (1200x800)": "/images/materials/wooden_pallets.jpg",
  "Plywood offcuts": "/images/materials/plywood_offcuts.jpg",
  "Wooden shipping crates": "/images/materials/wooden_pallets.jpg",
  "Wood shavings/dunnage": "/images/materials/plywood_offcuts.jpg",

  // Metal
  "Steel drums": "/images/materials/steel_drums.jpg",
  "Tin containers": "/images/materials/tin_containers.jpg",
  "Metal strapping coils": "/images/materials/metal_strapping_coils.jpg",
  "Aluminum foil scraps": "/images/materials/tin_containers.jpg",
  "Steel pallet collars": "/images/materials/metal_strapping_coils.jpg",

  // Glass
  "Glass bottles": "/images/materials/glass_bottles.jpg",
  "Glass jars": "/images/materials/glass_jars.jpg",
  "Broken glass cullet": "/images/materials/broken_glass_cullet.jpg",
  "Amber reagent bottles": "/images/materials/glass_bottles.jpg",
  "Flint glass containers": "/images/materials/glass_jars.jpg",

  // Foam/Packaging
  "Styrofoam (EPS) sheets": "/images/materials/styrofoam_sheets.jpg",
  "Bubble wrap rolls": "/images/materials/bubble_wrap.jpg",
  "Foam packaging inserts": "/images/materials/foam_inserts.svg",
  "EPE foam planks": "/images/materials/foam_inserts.svg",
  "Air pillow cushions": "/images/materials/bubble_wrap.jpg",

  // Paper
  "Kraft paper rolls": "/images/materials/kraft_paper_rolls.jpg",
  "Paper cores/tubes": "/images/materials/paper_tubes.svg",
  "Shredded paper": "/images/materials/shredded_paper.svg",
  "Pulp molded trays": "/images/materials/kraft_paper_rolls.jpg",
  "Newsprint bundling sheets": "/images/materials/kraft_paper_rolls.jpg",

  // Textile/Jute
  "Jute bags": "/images/materials/jute_bags.svg",
  "Cotton packaging waste": "/images/materials/cotton_packaging_waste.svg",
  "Hessian fabric rolls": "/images/materials/jute_bags.svg",
  "Burlap potato sacks": "/images/materials/jute_bags.svg",
  "FIBC bulk bags (reconditioned)": "/images/materials/cotton_packaging_waste.svg"
};

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
    defaultImage: "/images/materials/corrugated_boxes.jpg",
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
    defaultImage: "/images/materials/pet_bottles.jpg",
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
    defaultImage: "/images/materials/wooden_pallets.jpg",
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
    defaultImage: "/images/materials/steel_drums.jpg",
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
    defaultImage: "/images/materials/glass_bottles.jpg",
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
    defaultImage: "/images/materials/bubble_wrap.jpg",
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
    defaultImage: "/images/materials/kraft_paper_rolls.jpg",
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
    defaultImage: "/images/materials/jute_bags.svg",
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
    address: "Plot 42, MIDC Industrial Area, Andheri East, Mumbai 400093",
    email: "sunrise.logistics.pvt.ltd@gmail.com",
    roleBadge: "Seller & Manufacturer"
  },
  {
    id: "acc_2",
    name: "Krishna Paper Mills",
    type: "Recycler",
    city: "Ahmedabad",
    state: "Gujarat",
    address: "Phase II, Naroda GIDC Industrial Estate, Ahmedabad 382330",
    email: "krishna.paper.mills@business.co.in",
    roleBadge: "Industrial Recycler"
  },
  {
    id: "acc_3",
    name: "EcoBox Solutions",
    type: "Distributor",
    city: "Surat",
    state: "Gujarat",
    address: "Block 7, Sachin GIDC Industrial Area, Surat 394230",
    email: "ecobox.solutions@business.co.in",
    roleBadge: "Packaging Distributor"
  },
  {
    id: "acc_4",
    name: "Bharat Pallet Works",
    type: "Manufacturer",
    city: "Mumbai",
    state: "Maharashtra",
    address: "TTC Industrial Zone, Mahape, Navi Mumbai 400710",
    email: "bharat.pallet.works@business.co.in",
    roleBadge: "Pallet Manufacturer"
  },
  {
    id: "acc_5",
    name: "GreenPack Industries",
    type: "Recycler",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "Ambattur Industrial Estate, Chennai 600058",
    email: "greenpack.industries@business.co.in",
    roleBadge: "Circular Recycler"
  }
];

export const CITIES = [
  // West
  { city: "Mumbai", state: "Maharashtra", latitude: 19.0505, longitude: 72.8417, defaultAddress: "MIDC Industrial Area, Andheri East, Mumbai 400093" },
  { city: "Thane", state: "Maharashtra", latitude: 19.2183, longitude: 72.9781, defaultAddress: "Wagle Industrial Estate, Thane West 400604" },
  { city: "Navi Mumbai", state: "Maharashtra", latitude: 19.0330, longitude: 73.0297, defaultAddress: "TTC Industrial Area, Mahape, Navi Mumbai 400710" },
  { city: "Pune", state: "Maharashtra", latitude: 18.5551, longitude: 73.8671, defaultAddress: "Bhosari Industrial Estate, Pune 411026" },
  { city: "Nagpur", state: "Maharashtra", latitude: 21.1458, longitude: 79.0882, defaultAddress: "MIHAN Industrial Logistics Zone, Nagpur 441108" },
  { city: "Nashik", state: "Maharashtra", latitude: 19.9975, longitude: 73.7898, defaultAddress: "Ambad MIDC Industrial Cluster, Nashik 422010" },
  { city: "Aurangabad", state: "Maharashtra", latitude: 19.8762, longitude: 75.3433, defaultAddress: "Waluj Industrial Estate, Aurangabad 431136" },
  { city: "Ahmedabad", state: "Gujarat", latitude: 23.0386, longitude: 72.5987, defaultAddress: "GIDC Industrial Estate, Naroda, Ahmedabad 382330" },
  { city: "Surat", state: "Gujarat", latitude: 21.1934, longitude: 72.8627, defaultAddress: "Sachin GIDC Industrial Zone, Surat 394230" },
  { city: "Vadodara", state: "Gujarat", latitude: 22.3046, longitude: 73.1426, defaultAddress: "Makarpura GIDC Estate, Vadodara 390010" },
  { city: "Rajkot", state: "Gujarat", latitude: 22.2988, longitude: 70.7800, defaultAddress: "Aji GIDC Industrial Area, Rajkot 360003" },
  { city: "Vapi", state: "Gujarat", latitude: 20.3893, longitude: 72.9106, defaultAddress: "Vapi GIDC Industrial Township, Gujarat 396195" },
  { city: "Ankleshwar", state: "Gujarat", latitude: 21.6264, longitude: 73.0152, defaultAddress: "Ankleshwar GIDC Industrial Hub, Gujarat 393002" },

  // North
  { city: "Delhi", state: "Delhi", latitude: 28.7137, longitude: 77.0910, defaultAddress: "Okhla Industrial Area Phase III, New Delhi 110020" },
  { city: "Noida", state: "Uttar Pradesh", latitude: 28.5355, longitude: 77.3910, defaultAddress: "Sector 63 Industrial Corridor, Noida 201301" },
  { city: "Greater Noida", state: "Uttar Pradesh", latitude: 28.4744, longitude: 77.5040, defaultAddress: "Ecotech Industrial Complex, Greater Noida 201306" },
  { city: "Gurugram", state: "Haryana", latitude: 28.4595, longitude: 77.0266, defaultAddress: "Manesar Industrial Township, Gurugram 122051" },
  { city: "Faridabad", state: "Haryana", latitude: 28.4089, longitude: 77.3178, defaultAddress: "Sector 24 Industrial Hub, Faridabad 121005" },
  { city: "Ghaziabad", state: "Uttar Pradesh", latitude: 28.6692, longitude: 77.4538, defaultAddress: "Site IV Industrial Area, Sahibabad, Ghaziabad 201010" },
  { city: "Kanpur", state: "Uttar Pradesh", latitude: 26.4499, longitude: 80.3319, defaultAddress: "Panki Industrial Estate, Kanpur 208022" },
  { city: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462, defaultAddress: "Nadarganj Industrial Hub, Amausi, Lucknow 226008" },
  { city: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, defaultAddress: "Sitapura Industrial Area, Jaipur 302022" },
  { city: "Chandigarh", state: "Chandigarh", latitude: 30.7333, longitude: 76.7794, defaultAddress: "Industrial Area Phase I, Chandigarh 160002" },
  { city: "Ludhiana", state: "Punjab", latitude: 30.9010, longitude: 75.8573, defaultAddress: "Focal Point Industrial Zone, Ludhiana 141010" },

  // South
  { city: "Bengaluru", state: "Karnataka", latitude: 12.9501, longitude: 77.6143, defaultAddress: "Peenya Industrial Estate Phase II, Bengaluru 560058" },
  { city: "Chennai", state: "Tamil Nadu", latitude: 13.1163, longitude: 80.3176, defaultAddress: "Ambattur Industrial Estate, Chennai 600058" },
  { city: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867, defaultAddress: "Sanath Nagar Industrial Development Area, Hyderabad 500018" },
  { city: "Coimbatore", state: "Tamil Nadu", latitude: 11.0168, longitude: 76.9558, defaultAddress: "SIDCO Industrial Estate, Kurichi, Coimbatore 641021" },
  { city: "Kochi", state: "Kerala", latitude: 9.9312, longitude: 76.2673, defaultAddress: "Kaloor Industrial Hub, Kochi 682017" },
  { city: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185, defaultAddress: "Autonagar Industrial Zone, Visakhapatnam 530012" },

  // Central & East
  { city: "Indore", state: "Madhya Pradesh", latitude: 22.7272, longitude: 75.8320, defaultAddress: "Sanwer Road Industrial Sector, Indore 452015" },
  { city: "Bhopal", state: "Madhya Pradesh", latitude: 23.2599, longitude: 77.4126, defaultAddress: "Govindpura Industrial Estate, Bhopal 462023" },
  { city: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, defaultAddress: "Taratala Industrial Area, Kolkata 700088" },
  { city: "Howrah", state: "West Bengal", latitude: 22.5958, longitude: 88.2636, defaultAddress: "Jalan Industrial Complex, Dhulagarh, Howrah 711302" },
  { city: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376, defaultAddress: "Patliputra Industrial Estate, Patna 800013" },
  { city: "Bhubaneswar", state: "Odisha", latitude: 20.2961, longitude: 85.8245, defaultAddress: "Mancheswar Industrial Estate, Bhubaneswar 751010" }
];
