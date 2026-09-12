import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Scale, 
  Truck, 
  Building2, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  DollarSign,
  Leaf,
  Clock,
  Send
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { CATEGORY_DETAILS, CITIES } from '../data/constants';

export default function ListingDetailPage({ 
  listingId, 
  onBack, 
  currentUser, 
  buyerCity, 
  onViewBusiness,
  onListingUpdated 
}) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destinationCity, setDestinationCity] = useState(buyerCity || 'Mumbai');
  const [logistics, setLogistics] = useState(null);
  const [estimatingLogistics, setEstimatingLogistics] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryText, setInquiryText] = useState('');

  // Fetch single listing
  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}?buyerCity=${encodeURIComponent(destinationCity)}`);
      const data = await res.json();
      if (data.success) {
        setListing(data.listing);
      }
    } catch (err) {
      console.error("Error fetching listing details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logistics estimate
  const fetchLogistics = async () => {
    if (!listingId) return;
    setEstimatingLogistics(true);
    try {
      const res = await fetch('/api/logistics/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          buyer_city: destinationCity
        })
      });
      const data = await res.json();
      if (data.success) {
        setLogistics(data);
      }
    } catch (err) {
      console.error("Error estimating logistics:", err);
    } finally {
      setEstimatingLogistics(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [listingId, destinationCity]);

  useEffect(() => {
    if (listing) {
      fetchLogistics();
    }
  }, [listing?.listing_id, destinationCity]);

  // Handle Claim (available -> reserved)
  const handleClaim = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/listings/${listing.listing_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'reserved',
          claimed_by: currentUser.name || "Verified B2B Buyer"
        })
      });
      const data = await res.json();
      if (data.success) {
        setListing(data.listing);
        if (onListingUpdated) onListingUpdated();
      }
    } catch (err) {
      console.error("Error claiming listing:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Confirm Sale (reserved -> sold)
  const handleConfirmSale = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/listings/${listing.listing_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' })
      });
      const data = await res.json();
      if (data.success) {
        setListing(data.listing);
        if (onListingUpdated) onListingUpdated();
      }
    } catch (err) {
      console.error("Error confirming sale:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Reservation (reserved -> available)
  const handleCancelReservation = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/listings/${listing.listing_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available' })
      });
      const data = await res.json();
      if (data.success) {
        setListing(data.listing);
        if (onListingUpdated) onListingUpdated();
      }
    } catch (err) {
      console.error("Error cancelling reservation:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setContactModalOpen(false);
      setInquiryText('');
    }, 2500);
  };

  if (loading || !listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">Loading surplus item details...</p>
      </div>
    );
  }

  const categoryConfig = CATEGORY_DETAILS[listing.category] || {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    defaultImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(listing.price_total_inr);

  const formattedPerUnit = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(listing.price_per_unit_inr);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{listing.listing_id}</span>
          <span>•</span>
          <span>Listed {listing.date_listed}</span>
        </div>
      </div>

      {/* Main Grid: Left Column (Image & Specs) + Right Column (Pricing, Claims & Logistics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Photo Gallery Box */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[16/10] bg-slate-100">
              <img
                src={listing.image_url || categoryConfig.defaultImage}
                alt={listing.material_subtype}
                onError={(e) => { e.target.src = categoryConfig.defaultImage; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border ${categoryConfig.color}`}>
                  {listing.category}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-900/80 text-white backdrop-blur-sm">
                  {listing.condition}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={listing.status} />
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {listing.material_subtype}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Available from {listing.city}, {listing.state}</span>
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Material Description & Usage
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {listing.description}
                </p>
              </div>

              {/* Material Specifications Table */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Industrial Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Material Type</span>
                    <strong className="text-slate-900 font-bold">{listing.category}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Subtype</span>
                    <strong className="text-slate-900 font-bold truncate block">{listing.material_subtype}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Available Volume</span>
                    <strong className="text-slate-900 font-bold">{listing.quantity.toLocaleString()} {listing.unit}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Quality Condition</span>
                    <strong className="text-slate-900 font-bold">{listing.condition}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Effective Date</span>
                    <strong className="text-slate-900 font-bold">{listing.date_listed}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Listing Status</span>
                    <strong className="text-emerald-700 font-bold capitalize">{listing.status}</strong>
                  </div>
                </div>
              </div>

              {/* Ecological Footprint Potential */}
              {listing.impact_metrics && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>Circular Carbon Abatement Potential</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                      <span className="text-[10px] text-slate-500 block">Waste Diverted</span>
                      <strong className="text-emerald-800 text-sm font-black">
                        {listing.impact_metrics.kgDiverted.toLocaleString()} kg
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                      <span className="text-[10px] text-slate-500 block">Est. CO₂ Avoided</span>
                      <strong className="text-emerald-800 text-sm font-black">
                        {listing.impact_metrics.co2AvoidedKg.toLocaleString()} kg
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                      <span className="text-[10px] text-slate-500 block">Est. Cost Saved</span>
                      <strong className="text-emerald-800 text-sm font-black">
                        ₹{listing.impact_metrics.costSavedInr.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Col: 5 cols (Claim & Logistics Action Cards) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Price & Claim Card (OLX-style action panel) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Material Price</span>
              <div className="flex items-baseline justify-between gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {formattedPerUnit} / {listing.unit}
                </span>
              </div>
            </div>

            {/* Status Workflow Action Box */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              
              {/* AVAILABLE STATE */}
              {listing.status === 'available' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Available for immediate reservation & dispatch</span>
                  </div>
                  <button
                    onClick={handleClaim}
                    disabled={actionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading ? 'Reserving...' : 'Claim / Request to Buy'}</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Reserves this lot under your company profile for 48 hours to inspect and finalize freight.
                  </p>
                </div>
              )}

              {/* RESERVED STATE */}
              {listing.status === 'reserved' && (
                <div className="space-y-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Lot Reserved</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Currently held by: <strong>{listing.claimed_by || 'Verified Buyer'}</strong>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={handleConfirmSale}
                      disabled={actionLoading}
                      className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Confirm Sale (Mark Sold)'}
                    </button>
                    <button
                      onClick={handleCancelReservation}
                      disabled={actionLoading}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold py-2.5 px-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel Hold
                    </button>
                  </div>
                </div>
              )}

              {/* SOLD STATE */}
              {listing.status === 'sold' && (
                <div className="space-y-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Diverted & Sold to B2B Partner</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    This surplus packaging batch has been diverted from landfill and logged into the platform's Circular Carbon Dashboard.
                  </p>
                  <button
                    onClick={handleCancelReservation}
                    disabled={actionLoading}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                  >
                    Reset to Available (Demo Mode)
                  </button>
                </div>
              )}

              {/* Contact Seller Button */}
              <button
                onClick={() => setContactModalOpen(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Business Seller / Send RFQ</span>
              </button>
            </div>
          </div>

          {/* Interactive Logistics Estimator Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Logistics & Freight Estimator</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Haversine Engine
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Calculate industrial route distance, door-to-door freight rates, and estimated transit duration between seller plant and your delivery hub.
            </p>

            {/* Destination Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-600 font-bold uppercase tracking-wider text-[11px] block">
                Your Delivery Hub (Destination):
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} ({c.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimation Output */}
            {estimatingLogistics ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Computing route distance & tariffs...
              </div>
            ) : logistics ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">Transit Distance</span>
                    <strong className="text-sm text-slate-900 font-extrabold">{logistics.distance_km} km</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">Est. Freight Rate</span>
                    <strong className="text-sm text-slate-900 font-extrabold">
                      ₹{logistics.rate_breakdown.total_freight_inr.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Estimated Transit Duration</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {logistics.transit_time.description}
                  </p>
                </div>

                {/* Total Landed Cost Breakdown */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Surplus Material Price:</span>
                    <span>₹{listing.price_total_inr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Freight (Base + Distance):</span>
                    <span>₹{logistics.rate_breakdown.total_freight_inr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-emerald-950 pt-1 border-t border-emerald-200 text-sm">
                    <span>Total Landed Cost:</span>
                    <span>₹{logistics.total_landed_cost_inr.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold text-right">
                    ≈ ₹{logistics.landed_cost_per_unit_inr} / {listing.unit} landed
                  </div>
                </div>
              </div>
            ) : null}

          </div>

          {/* Seller Business Profile Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Seller Information
                </span>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>{listing.business_name}</span>
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                    {listing.business_type}
                  </span>
                  <span>•</span>
                  <span>{listing.city}, {listing.state}</span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Contact Email:</span>
              <a 
                href={`mailto:${listing.contact_email}`} 
                className="text-emerald-700 font-semibold hover:underline"
              >
                {listing.contact_email}
              </a>
            </div>

            <button
              onClick={() => onViewBusiness && onViewBusiness(listing.business_name)}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Full Business Profile & Track Record</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Contact Inquiry Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span>Contact {listing.business_name}</span>
              </div>
              <button 
                onClick={() => setContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {inquirySent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900">Inquiry Dispatched!</h4>
                <p className="text-xs text-slate-500">
                  Your formal request for quote and inspection was forwarded to {listing.contact_email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Company Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inquiry Regarding</label>
                  <input
                    type="text"
                    disabled
                    value={`${listing.listing_id} - ${listing.material_subtype} (${listing.quantity} ${listing.unit})`}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Message / Pickup Date Proposal</label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder="We are interested in acquiring this lot. Please confirm pickup dock loading availability and test certificates..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
