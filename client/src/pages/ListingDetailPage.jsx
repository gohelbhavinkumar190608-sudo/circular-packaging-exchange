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
  Send,
  Trash2,
  ShieldAlert,
  Navigation,
  Plus,
  Minus
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

  // Buyer destination location state
  const initialCity = buyerCity || currentUser?.city || 'Mumbai';
  const initialCityObj = CITIES.find((c) => c.city === initialCity) || CITIES[0];
  const [destinationCity, setDestinationCity] = useState(initialCity);
  const [buyerDeliveryAddress, setBuyerDeliveryAddress] = useState(
    currentUser?.address || initialCityObj?.defaultAddress || `${initialCity} Delivery Hub`
  );

  // Buyer requested quantity state
  const [takeQuantity, setTakeQuantity] = useState(1);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');

  // Logistics state
  const [logistics, setLogistics] = useState(null);
  const [estimatingLogistics, setEstimatingLogistics] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Company inquiry / RFQ state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [inquiryQuantity, setInquiryQuantity] = useState(1);
  const [pickupDateProposal, setPickupDateProposal] = useState('');
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [inquirySuccessMsg, setInquirySuccessMsg] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch single listing
  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}?buyerCity=${encodeURIComponent(destinationCity)}`);
      const data = await res.json();
      if (data.success) {
        setListing(data.listing);
        // Default takeQuantity to the available listing quantity
        setTakeQuantity(data.listing.quantity);
        setInquiryQuantity(data.listing.quantity);
      }
    } catch (err) {
      console.error("Error fetching listing details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logistics estimate between Company Plant Address and Buyer Delivery Address
  const fetchLogistics = async (qty, destCity, destAddress) => {
    if (!listingId) return;
    const currentQty = qty != null ? qty : takeQuantity;
    const currentCity = destCity || destinationCity;
    const currentAddress = destAddress || buyerDeliveryAddress;

    setEstimatingLogistics(true);
    try {
      const res = await fetch('/api/logistics/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          buyer_name: currentUser?.name || "Purchasing Enterprise",
          buyer_city: currentCity,
          buyer_address: currentAddress,
          quantity: currentQty
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
  }, [listingId]);

  useEffect(() => {
    if (listing) {
      fetchLogistics(takeQuantity, destinationCity, buyerDeliveryAddress);
    }
  }, [listing?.listing_id, destinationCity]);

  const handleDestinationCityChange = (newCity) => {
    setDestinationCity(newCity);
    const cityData = CITIES.find((c) => c.city === newCity);
    const newAddress = cityData?.defaultAddress || `${newCity} Delivery Hub`;
    setBuyerDeliveryAddress(newAddress);
    fetchLogistics(takeQuantity, newCity, newAddress);
  };

  const handleTakeQuantityChange = (newQty) => {
    if (!listing) return;
    const val = Number(newQty);
    const validQty = isNaN(val) || val <= 0 ? 1 : Math.min(listing.quantity, val);
    setTakeQuantity(validQty);
    setInquiryQuantity(validQty);
    fetchLogistics(validQty, destinationCity, buyerDeliveryAddress);
  };

  const isOwner = Boolean(
    currentUser && listing && (
      (currentUser.name && listing.business_name && currentUser.name.trim().toLowerCase() === listing.business_name.trim().toLowerCase()) ||
      (currentUser.email && listing.contact_email && currentUser.email.trim().toLowerCase() === listing.contact_email.trim().toLowerCase())
    )
  );

  // Handle Claim with specified takeQuantity
  const handleClaim = async () => {
    if (isOwner) {
      alert("Self-purchase prohibited: You cannot buy or claim your own product listing.");
      return;
    }
    setActionLoading(true);
    setClaimSuccessMsg('');
    try {
      const res = await fetch(`/api/listings/${listing.listing_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'reserved',
          claimed_by: currentUser.name || "Verified B2B Buyer",
          buyer_email: currentUser.email,
          buyer_address: buyerDeliveryAddress,
          claimed_quantity: takeQuantity
        })
      });
      const data = await res.json();
      if (data.success) {
        setListing(data.listing);
        setClaimSuccessMsg(
          `Successfully reserved ${takeQuantity} ${listing.unit} from ${listing.business_name}!`
        );
        if (onListingUpdated) onListingUpdated();
        setTimeout(() => setClaimSuccessMsg(''), 6000);
      } else {
        alert(data.error || 'Failed to claim lot');
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

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    setInquirySubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listing.listing_id}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_name: currentUser.name,
          buyer_email: currentUser.email,
          buyer_address: buyerDeliveryAddress,
          buyer_city: destinationCity,
          requested_quantity: inquiryQuantity,
          message: inquiryText,
          pickup_date_proposal: pickupDateProposal
        })
      });
      const data = await res.json();
      if (data.success) {
        setInquirySent(true);
        setInquirySuccessMsg(
          data.message || `Your formal inquiry for ${inquiryQuantity} ${listing.unit} was successfully transmitted to ${listing.business_name}!`
        );
        setTimeout(() => {
          setInquirySent(false);
          setContactModalOpen(false);
          setInquiryText('');
          setInquirySuccessMsg('');
        }, 3200);
      } else {
        alert(data.error || 'Failed to submit inquiry');
      }
    } catch (err) {
      console.error('Error sending formal inquiry:', err);
      alert('Network error sending inquiry');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!isOwner) {
      alert("Permission denied: You can only remove your own product listings.");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.listing_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': currentUser.name || '',
          'x-user-email': currentUser.email || ''
        },
        body: JSON.stringify({
          user_name: currentUser.name,
          user_email: currentUser.email
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onListingUpdated) onListingUpdated();
        onBack();
      } else {
        alert(data.error || 'Failed to remove listing');
      }
    } catch (err) {
      console.error('Error removing listing:', err);
      alert('Network error removing listing');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
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
                isOwner ? (
                  /* Owner View: Cannot buy own product */
                  <div className="space-y-3 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Your Enterprise Product Listing</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      You are the seller of this surplus lot. <strong>You cannot buy or claim your own product</strong> (self-purchase loophole prevention).
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={handleConfirmSale}
                        disabled={actionLoading}
                        className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        title="Mark this lot as sold if sold through offline / external trade"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark as Sold (Offline / Direct Buyer)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Buyer View: Can Select Quantity & Claim */
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Available for immediate reservation & dispatch</span>
                    </div>

                    {/* Buyer Quantity Selection Panel */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Order Quantity to Take:
                        </label>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Available: <strong className="text-slate-800">{listing.quantity.toLocaleString()} {listing.unit}</strong>
                        </span>
                      </div>

                      {/* Stepper & Number Input */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTakeQuantityChange(takeQuantity - (listing.quantity > 50 ? 5 : 1))}
                          disabled={takeQuantity <= 1}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-black text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            min="1"
                            max={listing.quantity}
                            value={takeQuantity}
                            onChange={(e) => handleTakeQuantityChange(e.target.value)}
                            className="w-full text-center py-1.5 px-3 bg-white border border-slate-300 rounded-lg font-black text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                            {listing.unit}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTakeQuantityChange(takeQuantity + (listing.quantity > 50 ? 5 : 1))}
                          disabled={takeQuantity >= listing.quantity}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-black text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick Percentage Presets */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick:</span>
                        {[
                          { label: '25%', val: Math.max(1, Math.round(listing.quantity * 0.25)) },
                          { label: '50%', val: Math.max(1, Math.round(listing.quantity * 0.50)) },
                          { label: '75%', val: Math.max(1, Math.round(listing.quantity * 0.75)) },
                          { label: 'All (100%)', val: listing.quantity }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleTakeQuantityChange(preset.val)}
                            className={`flex-1 py-1 text-[11px] font-extrabold rounded-md border transition-all cursor-pointer ${
                              takeQuantity === preset.val
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Calculated Pricing Summary */}
                      <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Material Price for {takeQuantity.toLocaleString()} {listing.unit}:</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            ₹{Math.round(takeQuantity * (listing.price_per_unit_inr || (listing.price_total_inr / listing.quantity))).toLocaleString()}
                          </span>
                        </div>
                        {takeQuantity < listing.quantity && (
                          <div className="flex justify-between items-center text-[11px] text-emerald-700 font-medium">
                            <span>Remaining with Seller:</span>
                            <span className="font-bold">{(listing.quantity - takeQuantity).toLocaleString()} {listing.unit}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {claimSuccessMsg && (
                      <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-300 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <span>{claimSuccessMsg}</span>
                      </div>
                    )}

                    <button
                      onClick={handleClaim}
                      disabled={actionLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {actionLoading
                          ? 'Reserving...'
                          : `Claim / Reserve ${takeQuantity.toLocaleString()} ${listing.unit} (₹${Math.round(takeQuantity * (listing.price_per_unit_inr || (listing.price_total_inr / listing.quantity))).toLocaleString()})`}
                      </span>
                    </button>
                    <p className="text-[11px] text-slate-400 text-center">
                      Reserves this quantity under your company profile for freight and inspection coordination.
                    </p>
                  </div>
                )
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
                    Re-list Lot as Available
                  </button>
                </div>
              )}

              {/* Contact Seller Button */}
              {isOwner ? (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center font-medium">
                  📬 Buyer inquiries will be sent directly to your registered email: <strong className="text-slate-800">{listing.contact_email}</strong>
                </div>
              ) : (
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Business Seller / Send RFQ</span>
                </button>
              )}

              {/* Remove Listing Button - ONLY visible to the owner of this listing */}
              {isOwner && (
                deleteConfirmOpen ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>Are you sure you want to remove this product listing?</span>
                    </p>
                    <p className="text-[11px] text-red-700">
                      This will permanently remove your product from the marketplace and circular exchange index.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleDeleteListing}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isDeleting ? 'Removing...' : 'Yes, Remove Product'}</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="w-full bg-white hover:bg-red-50 text-red-700 border border-red-200 hover:border-red-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Remove Listing</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Interactive Logistics Estimator Widget: Company Address to Buyer Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Logistics & Route Freight Estimator</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Highway Corridor Engine
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates direct road highway distance, commercial freight rates, and transit duration from the <strong>seller's plant address</strong> to your <strong>buyer delivery hub</strong> for {takeQuantity.toLocaleString()} {listing.unit}.
            </p>

            {/* Origin & Destination Display */}
            <div className="space-y-2.5 text-xs">
              {/* Origin (Company Plant) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                    Origin (Company Plant Address):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    GPS: {listing.latitude?.toFixed(4)}° N, {listing.longitude?.toFixed(4)}° E
                  </span>
                </div>
                <p className="font-black text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{logistics?.origin?.company || listing.business_name}</span>
                </p>
                <p className="text-[11px] text-slate-600 pl-5">
                  {logistics?.origin?.address || listing.address || `${listing.city}, ${listing.state}`}
                </p>
              </div>

              {/* Destination (Buyer Delivery Hub & Address) */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider">
                    Destination (Buyer Delivery Hub & Address):
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    GPS: {logistics?.destination?.latitude?.toFixed(4) || '19.0505'}° N, {logistics?.destination?.longitude?.toFixed(4) || '72.8417'}° E
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={destinationCity}
                      onChange={(e) => handleDestinationCityChange(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    >
                      {CITIES.map((c) => (
                        <option key={c.city} value={c.city}>
                          {c.city} ({c.state})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={buyerDeliveryAddress}
                    onChange={(e) => {
                      setBuyerDeliveryAddress(e.target.value);
                      fetchLogistics(takeQuantity, destinationCity, e.target.value);
                    }}
                    placeholder="Enter your warehouse / delivery dock address..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Estimation Output */}
            {estimatingLogistics ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Computing route road distance & industrial tariffs...
              </div>
            ) : logistics ? (
              <div className="space-y-3 pt-1">
                {/* Distance & Route Banner */}
                <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Freight Route Corridor
                    </span>
                    <p className="text-xs font-extrabold">
                      {logistics.origin.city} Plant ➔ {logistics.destination.city} Hub
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Road Transit Distance</span>
                    <strong className="text-base font-black text-emerald-400">{logistics.distance_km} km</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">Est. Freight Rate</span>
                    <strong className="text-sm text-slate-900 font-extrabold">
                      ₹{logistics.rate_breakdown.total_freight_inr.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Base ₹{logistics.rate_breakdown.base_dispatch_fee_inr} + ₹{logistics.rate_breakdown.per_km_rate_inr}/km
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">Transit Duration</span>
                    <strong className="text-sm text-slate-900 font-extrabold">
                      {logistics.transit_time.estimated_hours} Hours
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                      {logistics.transit_time.description}
                    </span>
                  </div>
                </div>

                {/* Total Landed Cost Breakdown for Selected Quantity */}
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Material Price ({takeQuantity.toLocaleString()} {listing.unit}):</span>
                    <span className="font-bold text-slate-900">₹{logistics.material_cost_inr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Freight (Road Route {logistics.distance_km} km):</span>
                    <span className="font-bold text-slate-900">₹{logistics.rate_breakdown.total_freight_inr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-emerald-950 pt-1.5 border-t border-emerald-200 text-sm">
                    <span>Total Landed Cost:</span>
                    <span>₹{logistics.total_landed_cost_inr.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold text-right">
                    ≈ ₹{logistics.landed_cost_per_unit_inr} / {listing.unit} fully delivered
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
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-extrabold text-slate-900">Formal RFQ Dispatched!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {inquirySuccessMsg || `Your formal purchase request for ${inquiryQuantity} ${listing.unit} was successfully transmitted to ${listing.business_name} (${listing.contact_email}).`}
                </p>
                <div className="pt-2 text-[11px] text-slate-400">
                  A copy of this inquiry has been logged under your enterprise transaction audit index.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3.5 text-xs">
                {/* Enterprise Parties Overview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seller Enterprise:</span>
                    <strong className="text-slate-800">{listing.business_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plant Dispatch Address:</span>
                    <span className="text-slate-700 font-medium text-right truncate max-w-[240px]">
                      {logistics?.origin?.address || listing.address || `${listing.city}, ${listing.state}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Your Company:</span>
                    <strong className="text-slate-800">{currentUser.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Your Delivery Address:</span>
                    <span className="text-slate-700 font-medium text-right truncate max-w-[240px]">
                      {buyerDeliveryAddress}
                    </span>
                  </div>
                </div>

                {/* Requested Quantity to Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Requested Quantity ({listing.unit}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={listing.quantity}
                      value={inquiryQuantity}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(listing.quantity, Number(e.target.value) || 1));
                        setInquiryQuantity(val);
                        setTakeQuantity(val);
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-black text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Available: {listing.quantity.toLocaleString()} {listing.unit}
                    </span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Estimated Material Cost
                    </label>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-100 font-black text-slate-900 text-sm">
                      ₹{Math.round(inquiryQuantity * (listing.price_per_unit_inr || (listing.price_total_inr / listing.quantity))).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                      Rate: ₹{listing.price_per_unit_inr || (listing.price_total_inr / listing.quantity)} / {listing.unit}
                    </span>
                  </div>
                </div>

                {/* Proposed Pickup / Inspection Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Proposed Pickup / Dock Inspection Date
                  </label>
                  <input
                    type="date"
                    value={pickupDateProposal}
                    onChange={(e) => setPickupDateProposal(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Message / RFQ details */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Message / Technical Specifications Request *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder={`We are requesting quote and dock pickup for ${inquiryQuantity} ${listing.unit} of ${listing.material_subtype}. Please confirm sample inspection availability...`}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{inquirySubmitting ? 'Transmitting Request...' : 'Send Formal RFQ & Purchase Request'}</span>
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
