import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  X, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  MapPin,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import ListingCard from '../components/ListingCard';
import CategoryChips from '../components/CategoryChips';
import { CONDITIONS, CITIES } from '../data/constants';

export default function MarketplacePage({ 
  onSelectListing, 
  buyerCity, 
  refreshTrigger,
  currentUser 
}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('available'); // default to available like OLX
  const [selectedCity, setSelectedCity] = useState('All');
  const [maxDistance, setMaxDistance] = useState(1500);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch listings from API
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedCondition && selectedCondition !== 'All') params.append('condition', selectedCondition);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedCity && selectedCity !== 'All') params.append('city', selectedCity);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (maxDistance && maxDistance < 1500) params.append('maxDistance', maxDistance);
      if (buyerCity) params.append('buyerCity', buyerCity);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [
    selectedCategory,
    selectedCondition,
    selectedStatus,
    selectedCity,
    maxDistance,
    minPrice,
    maxPrice,
    sortBy,
    buyerCity,
    refreshTrigger
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedStatus('all');
    setSelectedCity('All');
    setMaxDistance(1500);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'All' ||
    selectedCondition !== 'All' ||
    selectedStatus !== 'all' ||
    selectedCity !== 'All' ||
    maxDistance < 1500 ||
    minPrice !== '' ||
    maxPrice !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Hero Banner (OLX-style search hero) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial Packaging & Surplus Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Find Surplus Packaging.<br />
            <span className="text-emerald-400">Cut Costs. Divert Waste.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Connect directly with verified manufacturing plants, retailers, and logistics hubs trading surplus cardboard, pallets, drums, films, and containers nearby.
          </p>

          {/* Big Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by material (e.g. Wooden pallets, PET scrap, Steel drums, Corrugated boxes)..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Explore by Material Category</span>
          {buyerCity && (
            <span className="text-emerald-700 normal-case font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Showing distance from {buyerCity}
            </span>
          )}
        </div>
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          counts={counts}
        />
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {listings.length} items found
          </span>
        </div>

        {/* Sidebar Filters */}
        <aside className={`w-full lg:w-72 bg-white rounded-2xl border border-slate-200 p-5 space-y-5 flex-shrink-0 shadow-sm ${
          showMobileFilters ? 'block' : 'hidden lg:block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </h2>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Status Filter (Available / Reserved / Sold) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Listing Status
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setSelectedStatus('available')}
                className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                  selectedStatus === 'available'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Available ({counts.available || 0})
              </button>
              <button
                onClick={() => setSelectedStatus('reserved')}
                className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                  selectedStatus === 'reserved'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Reserved ({counts.reserved || 0})
              </button>
              <button
                onClick={() => setSelectedStatus('sold')}
                className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                  selectedStatus === 'sold'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Sold ({counts.sold || 0})
              </button>
              <button
                onClick={() => setSelectedStatus('all')}
                className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({counts.total || 0})
              </button>
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Material Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All Conditions</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.value}
                </option>
              ))}
            </select>
          </div>

          {/* City / Hub Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Origin City Hub
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All 10 Hub Cities</option>
              {CITIES.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Distance Radius Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="uppercase tracking-wider">Distance Radius</span>
              <span className="text-emerald-700 font-extrabold">
                {maxDistance >= 1500 ? 'Any distance' : `< ${maxDistance} km`}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50 km</span>
              <span>500 km</span>
              <span>1500+ km</span>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Apply button on mobile */}
          <div className="lg:hidden pt-2">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Listings Display Area */}
        <main className="flex-1 w-full space-y-4">
          
          {/* Controls Bar: Results Count + Sort + View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-600">
              Showing <strong className="text-slate-900 font-bold">{listings.length}</strong> surplus listings
              {selectedCategory !== 'All' && <span> in <strong className="text-emerald-700 font-semibold">{selectedCategory}</strong></span>}
              {selectedStatus !== 'all' && <span> • <strong className="capitalize text-slate-800">{selectedStatus}</strong></span>}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 font-bold text-slate-800 border border-slate-200 rounded-lg py-1 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="newest">Newest Listed</option>
                  <option value="distance">Nearest Distance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="quantity_desc">Highest Quantity</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content States */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-600">Loading surplus packaging listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No surplus items match your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the material category, increasing the distance radius, or clearing the search keyword.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                : "space-y-3"
            }>
              {listings.map((item) => (
                <ListingCard
                  key={item.listing_id}
                  listing={item}
                  onSelect={onSelectListing}
                  viewMode={viewMode}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
