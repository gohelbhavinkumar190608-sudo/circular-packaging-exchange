import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Scale, 
  DollarSign, 
  Building2, 
  AlertCircle,
  Eye,
  Camera
} from 'lucide-react';
import { CATEGORIES, CATEGORY_DETAILS, CONDITIONS, UNITS, BUSINESS_TYPES, CITIES } from '../data/constants';
import ListingCard from '../components/ListingCard';

export default function SellListingPage({ 
  currentUser, 
  onListingCreated, 
  onCancel 
}) {
  // Form State
  const [businessName, setBusinessName] = useState(currentUser.name || 'Sunrise Logistics Pvt Ltd');
  const [businessType, setBusinessType] = useState(currentUser.type || 'Manufacturer');
  const [contactEmail, setContactEmail] = useState(currentUser.email || 'seller@circularexchange.in');
  
  const [category, setCategory] = useState('Cardboard');
  const [materialSubtype, setMaterialSubtype] = useState('Double-wall corrugated boxes');
  const [quantity, setQuantity] = useState(250);
  const [unit, setUnit] = useState('tons');
  const [condition, setCondition] = useState('Good - Reusable');
  
  const [priceTotalInr, setPriceTotalInr] = useState(3500);
  const [city, setCity] = useState(currentUser.city || 'Mumbai');
  const [state, setState] = useState(currentUser.state || 'Maharashtra');
  const [latitude, setLatitude] = useState(19.0505);
  const [longitude, setLongitude] = useState(72.8417);
  
  const [description, setDescription] = useState(
    'High-grade double-wall corrugated shipping boxes from surplus production run. Clean, dry-stored, and structurally sound for heavy industrial freight reuse or high-yield pulp recycling.'
  );
  
  const [imageUrl, setImageUrl] = useState(CATEGORY_DETAILS['Cardboard'].defaultImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill coordinates and state when city changes
  const handleCityChange = (newCityName) => {
    setCity(newCityName);
    const matched = CITIES.find((c) => c.city === newCityName);
    if (matched) {
      setState(matched.state);
      setLatitude(matched.latitude);
      setLongitude(matched.longitude);
    }
  };

  // When category changes, update default image, subtype suggestions, and auto-generate description
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const config = CATEGORY_DETAILS[newCat];
    if (config) {
      setImageUrl(config.defaultImage);
      if (config.subtypes && config.subtypes.length > 0) {
        setMaterialSubtype(config.subtypes[0]);
      }
      autoSuggestDescription(newCat, config.subtypes ? config.subtypes[0] : newCat, condition, quantity, unit);
    }
  };

  // Auto-suggest B2B description generator
  const autoSuggestDescription = (cat, subtype, cond, qty, u) => {
    const templates = [
      `Surplus ${subtype || cat} available in ${cond.toLowerCase()} condition. Fully vetted batch of ${qty} ${u} available for immediate B2B circular reuse or industrial recycling. Palletized and dock-ready for truckload freight dispatch.`,
      `Commercial excess inventory of ${subtype || cat}. Tested and inspected under ${cond.toLowerCase()} standard. Ideal for sustainable manufacturing inputs or packaging converters seeking reduced raw material carbon footprint.`,
      `High-volume lot of ${subtype || cat} (${qty} ${u}). Certified clean and dry-stored industrial surplus. Save significant costs vs virgin market tariffs while advancing ESG diversion goals.`
    ];
    const picked = templates[Math.floor(Math.random() * templates.length)];
    setDescription(picked);
  };

  // Calculate live price per unit
  const calculatedPricePerUnit =
    quantity > 0 && priceTotalInr > 0
      ? Math.round((priceTotalInr / quantity) * 100) / 100
      : 0;

  // Mock listing object for the live preview card
  const previewListing = {
    listing_id: "LST-PREVIEW",
    business_name: businessName || "Your Enterprise Name",
    business_type: businessType,
    category,
    material_subtype: materialSubtype || "Surplus Packaging Lot",
    quantity: Number(quantity) || 100,
    unit,
    condition,
    price_total_inr: Number(priceTotalInr) || 0,
    price_per_unit_inr: calculatedPricePerUnit,
    city,
    state,
    latitude,
    longitude,
    status: "available",
    date_listed: new Date().toISOString().slice(0, 10),
    contact_email: contactEmail,
    description,
    image_url: imageUrl,
    distance_km: 0
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!quantity || quantity <= 0) {
      setErrorMsg('Quantity must be greater than 0');
      return;
    }
    if (priceTotalInr == null || priceTotalInr < 0) {
      setErrorMsg('Please specify a valid total price in INR');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        business_name: businessName,
        business_type: businessType,
        category,
        material_subtype: materialSubtype,
        quantity: Number(quantity),
        unit,
        condition,
        price_total_inr: Number(priceTotalInr),
        city,
        state,
        latitude: Number(latitude),
        longitude: Number(longitude),
        contact_email: contactEmail,
        description,
        image_url: imageUrl
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        if (onListingCreated) onListingCreated(data.listing);
      } else {
        setErrorMsg(data.error || 'Failed to publish listing');
      }
    } catch (err) {
      console.error("Error creating listing:", err);
      setErrorMsg('Network error connecting to API server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>OLX-Style B2B Listing Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Post Surplus Packaging or Industrial Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Turn your factory or retail warehouse packaging surplus into revenue. Listings appear instantly in the regional marketplace with status <span className="text-emerald-400 font-bold">available</span>.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form (7 cols) + Live Card Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Step 1: Seller Business Profile */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>1. Seller Business Profile</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Tata Packaging Works"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Type *</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Official Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Material Categorization */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>2. Material Category & Subtype</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Material Subtype *</label>
                  <input
                    type="text"
                    required
                    value={materialSubtype}
                    onChange={(e) => setMaterialSubtype(e.target.value)}
                    placeholder="e.g. Double-wall boxes, Steel drums"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Subtype Pills */}
              {CATEGORY_DETAILS[category]?.subtypes && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold block">Suggested standard subtypes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_DETAILS[category].subtypes.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          setMaterialSubtype(sub);
                          autoSuggestDescription(category, sub, condition, quantity, unit);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-all ${
                          materialSubtype === sub
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Quantity, Unit & Condition */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                3. Volume, Unit & Quality Grading
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Available Quantity *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-2/3 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-1/3 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Physical Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.value}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Pricing & Location */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>4. Commercial Pricing & Plant Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Lot Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={priceTotalInr}
                    onChange={(e) => setPriceTotalInr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                    Auto-computed: ₹{calculatedPricePerUnit} / {unit}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plant City Hub (Auto-fills Coords) *</label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.state})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 5: Description with Auto-Suggest */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Description & Reusability Rationale *</label>
                <button
                  type="button"
                  onClick={() => autoSuggestDescription(category, materialSubtype, condition, quantity, unit)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>⚡ Auto-Suggest Description</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-800 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Step 6: Photo Selector */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Packaging Photo / Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(CATEGORY_DETAILS[category]?.defaultImage || '')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" /> Category Default
                </button>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing Lot...' : 'Publish Surplus Listing'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live Marketplace Card Preview</span>
              </span>
              <span className="text-emerald-700 font-semibold normal-case">Updates as you type</span>
            </div>

            <ListingCard
              listing={previewListing}
              onSelect={() => {}}
              viewMode="grid"
            />

            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Instant Verification
              </div>
              <p>
                Once published, this listing will be indexable by keyword, material type, and geographic proximity across the 10 industrial hub regions.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
