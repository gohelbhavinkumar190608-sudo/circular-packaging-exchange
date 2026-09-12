import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Scale, 
  Leaf, 
  Recycle, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Package,
  Award
} from 'lucide-react';
import ListingCard from '../components/ListingCard';

export default function BusinessProfilePage({ 
  selectedBusinessName, 
  onSelectBusiness, 
  onSelectListing,
  refreshTrigger 
}) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      if (data.success) {
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">Loading verified B2B partners directory...</p>
      </div>
    );
  }

  // If a specific business is selected, show detail view
  if (selectedBusinessName) {
    const business = businesses.find(
      (b) => b.name.toLowerCase() === selectedBusinessName.trim().toLowerCase()
    );

    if (!business) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <p className="text-sm text-slate-600">Business profile not found.</p>
          <button
            onClick={() => onSelectBusiness(null)}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            ← Back to Directory
          </button>
        </div>
      );
    }

    const activeListings = business.listings.filter((l) => l.status === 'available' || l.status === 'reserved');
    const pastListings = business.listings.filter((l) => l.status === 'sold');

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => onSelectBusiness(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Business Directory
        </button>

        {/* Business Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-emerald-400 flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-md">
                {business.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {business.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Partner
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{business.business_type}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {business.city}, {business.state}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {business.contact_email}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Impact Badge */}
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-center sm:text-right">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                ESG Circular Carbon Rating
              </span>
              <span className="text-lg font-black text-emerald-950 flex items-center justify-center sm:justify-end gap-1">
                <Award className="w-5 h-5 text-amber-500" />
                AAA Tier Partner
              </span>
            </div>

          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px]">Total Surplus Batches</span>
              <strong className="text-base text-slate-900 font-extrabold">{business.total_listings}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px]">Available in Market</span>
              <strong className="text-base text-emerald-700 font-extrabold">{business.available_listings}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px]">Successfully Diverted</span>
              <strong className="text-base text-slate-900 font-extrabold">{business.sold_listings}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px]">Embodied CO₂ Avoided</span>
              <strong className="text-base text-teal-700 font-extrabold">
                {Math.round(business.total_co2_avoided_kg).toLocaleString()} kg
              </strong>
            </div>
          </div>

        </div>

        {/* Listings Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`text-xs sm:text-sm font-bold pb-2 px-3 transition-colors border-b-2 -mb-2 ${
                activeTab === 'active'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Active Surplus Listings ({activeListings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`text-xs sm:text-sm font-bold pb-2 px-3 transition-colors border-b-2 -mb-2 ${
                activeTab === 'past'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Historical Diverted Lots ({pastListings.length})
            </button>
          </div>

          {activeTab === 'active' ? (
            activeListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                No active listings currently available for this company.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeListings.map((item) => (
                  <ListingCard
                    key={item.listing_id}
                    listing={item}
                    onSelect={onSelectListing}
                    viewMode="grid"
                  />
                ))}
              </div>
            )
          ) : (
            pastListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                No historical diverted lots logged yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastListings.map((item) => (
                  <ListingCard
                    key={item.listing_id}
                    listing={item}
                    onSelect={onSelectListing}
                    viewMode="grid"
                  />
                ))}
              </div>
            )
          )}
        </div>

      </div>
    );
  }

  // Directory View (All Businesses)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Directory Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Industrial Partner Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Participating Businesses & Recyclers Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Explore verified manufacturers, packaging recyclers, distribution centers, and logistics providers participating in the circular packaging exchange across India.
          </p>
        </div>
      </div>

      {/* Grid of Business Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {businesses.map((b) => (
          <div
            key={b.name}
            onClick={() => onSelectBusiness(b.name)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center font-black text-sm text-slate-800">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {b.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {b.business_type}
                    </span>
                  </div>
                </div>

                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{b.city}, {b.state}</span>
              </div>

              {/* Statistics Pill */}
              <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Lots</span>
                  <strong className="text-slate-900 font-bold">{b.total_listings}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Available</span>
                  <strong className="text-emerald-700 font-bold">{b.available_listings}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Diverted</span>
                  <strong className="text-slate-900 font-bold">{b.sold_listings}</strong>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
              <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                {b.contact_email}
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View Profile <ArrowRight className="w-3 h-3" />
              </span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
