import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Scale, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  Building2,
  Filter,
  Flame,
  Award
} from 'lucide-react';
import { CATEGORIES, UNITS, CITIES } from '../data/constants';
import StatusBadge from '../components/StatusBadge';

export default function MatchingEnginePage({ 
  onSelectListing, 
  buyerCity, 
  currentUser,
  onListingUpdated 
}) {
  // Query Form State
  const [category, setCategory] = useState('Wood');
  const [materialSubtype, setMaterialSubtype] = useState('');
  const [quantity, setQuantity] = useState(500);
  const [unit, setUnit] = useState('pallets');
  const [maxDistance, setMaxDistance] = useState(800);
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState(buyerCity || 'Mumbai');

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const runMatching = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          material_subtype: materialSubtype,
          quantity: Number(quantity) || 50,
          unit,
          max_distance: Number(maxDistance) || 1200,
          max_price: maxPrice ? Number(maxPrice) : null,
          buyer_city: city
        })
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches || []);
      }
    } catch (err) {
      console.error("Failed to run matching engine:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount with default criteria
  useEffect(() => {
    runMatching();
  }, []);

  // Quick Preset Scenarios for hackathon judging
  const applyPreset = (preset) => {
    setCategory(preset.category);
    setMaterialSubtype(preset.materialSubtype);
    setQuantity(preset.quantity);
    setUnit(preset.unit);
    setMaxDistance(preset.maxDistance);
    setMaxPrice(preset.maxPrice);
    setCity(preset.city);
    setTimeout(runMatching, 50);
  };

  const handleQuickClaim = async (item, e) => {
    e.stopPropagation();
    const isOwn = Boolean(
      currentUser && item && (
        (currentUser.name && item.business_name && currentUser.name.trim().toLowerCase() === item.business_name.trim().toLowerCase()) ||
        (currentUser.email && item.contact_email && currentUser.email.trim().toLowerCase() === item.contact_email.trim().toLowerCase())
      )
    );
    if (isOwn) {
      alert("Self-purchase prohibited: You cannot claim or buy your own surplus product.");
      return;
    }

    setClaimingId(item.listing_id);
    try {
      const res = await fetch(`/api/listings/${item.listing_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'reserved',
          claimed_by: currentUser.name || "Smart Match Buyer",
          buyer_email: currentUser.email
        })
      });
      const data = await res.json();
      if (data.success) {
        setMatches((prev) =>
          prev.map((m) =>
            m.listing_id === item.listing_id ? { ...m, status: 'reserved', claimed_by: currentUser.name } : m
          )
        );
        if (onListingUpdated) onListingUpdated();
      } else {
        alert(data.error || "Failed to claim lot");
      }
    } catch (err) {
      console.error("Error claiming matched lot:", err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Engine Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Multi-Factor Algorithmic Recommendation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find the Best-Fit Surplus for Your Factory Needs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Specify your plant's raw material requirements. Our engine computes geospatial Haversine proximity, volume compatibility, price arbitrage, and freshness to recommend optimal nearby surplus packaging lots.
          </p>

          {/* Quick Demo Presets */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Demo Presets:</span>
            <button
              onClick={() => applyPreset({
                category: 'Wood',
                materialSubtype: 'Wooden pallets',
                quantity: 1000,
                unit: 'pallets',
                maxDistance: 600,
                maxPrice: 20000,
                city: 'Delhi'
              })}
              className="bg-slate-800/90 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              🪵 1,000 Pallets in North (Delhi)
            </button>
            <button
              onClick={() => applyPreset({
                category: 'Plastic',
                materialSubtype: 'PET',
                quantity: 100,
                unit: 'tons',
                maxDistance: 500,
                maxPrice: 15000,
                city: 'Mumbai'
              })}
              className="bg-slate-800/90 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              🧴 PET Scrap in West (Mumbai)
            </button>
            <button
              onClick={() => applyPreset({
                category: 'Metal',
                materialSubtype: 'Steel drums',
                quantity: 100,
                unit: 'tons',
                maxDistance: 400,
                maxPrice: 5000,
                city: 'Ahmedabad'
              })}
              className="bg-slate-800/90 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              🛢️ Steel Drums in Gujarat (Ahmedabad)
            </button>
          </div>
        </div>
      </div>

      {/* Query Formulation Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Buyer Requirements Formulation</span>
          </h2>
          <span className="text-xs text-slate-400">All fields adapt recommendation weighting</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Material Category */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Required Material Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">Any Packaging Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Subtype Keyword */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Subtype / Keyword (Optional)</label>
            <input
              type="text"
              value={materialSubtype}
              onChange={(e) => setMaterialSubtype(e.target.value)}
              placeholder="e.g. pallets, boxes, bottles..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Volume + Unit */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Target Quantity & Unit</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-2/3 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-1/3 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buyer City Hub */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Buyer Plant Location</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Max Distance Radius */}
          <div className="space-y-1 sm:col-span-2">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Max Transport Radius</span>
              <span className="text-emerald-700 font-extrabold">{maxDistance} km</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Max Price / Budget */}
          <div className="space-y-1 sm:col-span-2">
            <label className="font-bold text-slate-700 block">Max Budget Cap (₹ INR, Optional)</label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Leave blank for no upper limit"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={runMatching}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{loading ? 'Matching...' : 'Calculate Best Matches'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Matching Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Ranked Best Matches</span>
            </h2>
            <p className="text-xs text-slate-500">
              Sorted by composite match score: Distance (40%) • Price Competitiveness (35%) • Volume Fulfillment (20%) • Freshness (10%)
            </p>
          </div>

          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {matches.length} Candidates Qualified
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-600">Running Haversine distance & multi-factor scoring algorithm...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No surplus lots satisfied all constraints</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try increasing your maximum transport radius (e.g. up to 1000 km) or choosing "Any Packaging Category" to broaden the recommendation scope.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((item, index) => {
              const formattedPrice = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              }).format(item.price_total_inr);

              const formattedPerUnit = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
              }).format(item.price_per_unit_inr);

              return (
                <div
                  key={item.listing_id}
                  onClick={() => onSelectListing(item)}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between cursor-pointer hover:shadow-lg ${
                    index === 0
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-r from-emerald-50/20 to-white'
                      : 'border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  
                  {/* Left: Rank Badge + Thumbnail + Details */}
                  <div className="flex items-start sm:items-center gap-4 w-full md:w-auto">
                    
                    {/* Rank Number & Score Pill */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-slate-900 text-white flex-shrink-0 shadow-sm">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Match</span>
                      <span className="text-lg font-black text-emerald-300 leading-none">
                        {item.match_score}%
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Rank #{index + 1}</span>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 hidden sm:block">
                      <img
                        src={item.image_url}
                        alt={item.material_subtype}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Main Specs */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs ${
                          item.match_badge === 'Best Match'
                            ? 'bg-emerald-600 text-white'
                            : item.match_badge === 'Great Match'
                            ? 'bg-teal-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          ★ {item.match_badge}
                        </span>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.category}
                        </span>

                        <StatusBadge status={item.status} />
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 hover:text-emerald-700 transition-colors">
                        {item.material_subtype}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Scale className="w-3.5 h-3.5 text-emerald-600" />
                          {item.quantity.toLocaleString()} {item.unit}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {item.city} ({item.distance_km} km away)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {item.business_name}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right: Score Breakdown + Price + Claim Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-black text-slate-900">{formattedPrice}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {formattedPerUnit} / {item.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'available' ? (
                        Boolean(
                          currentUser && (
                            (currentUser.name && item.business_name && currentUser.name.trim().toLowerCase() === item.business_name.trim().toLowerCase()) ||
                            (currentUser.email && item.contact_email && currentUser.email.trim().toLowerCase() === item.contact_email.trim().toLowerCase())
                          )
                        ) ? (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200" title="You are the seller of this product">
                            Your Product
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleQuickClaim(item, e)}
                            disabled={claimingId === item.listing_id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{claimingId === item.listing_id ? 'Reserving...' : '1-Click Claim'}</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                          {item.status === 'reserved' ? 'Reserved' : 'Sold'}
                        </span>
                      )}

                      <button
                        onClick={() => onSelectListing(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
