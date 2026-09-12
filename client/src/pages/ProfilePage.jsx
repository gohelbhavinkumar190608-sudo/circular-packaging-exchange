import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  PlusCircle, 
  Trash2, 
  Eye, 
  Package, 
  CheckCircle2, 
  Clock, 
  Leaf, 
  LogOut, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  Filter, 
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function ProfilePage({ 
  currentUser, 
  onSelectListing, 
  onPostNew, 
  onLogout,
  refreshTrigger,
  onListingUpdated 
}) {
  const [userListings, setUserListings] = useState([]);
  const [claimedListings, setClaimedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'reserved', 'sold'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      if (data.success && data.listings) {
        const currentName = (currentUser.name || '').toLowerCase().trim();
        const currentEmail = (currentUser.email || '').toLowerCase().trim();

        // Listings posted by this user/enterprise
        const owned = data.listings.filter((l) => {
          const lOwner = (l.business_name || '').toLowerCase().trim();
          const lEmail = (l.contact_email || '').toLowerCase().trim();
          return lOwner === currentName || (currentEmail && lEmail === currentEmail);
        });

        // Listings claimed/reserved by this enterprise
        const claimed = data.listings.filter((l) => {
          const claimant = (l.claimed_by || '').toLowerCase().trim();
          return claimant === currentName && l.business_name.toLowerCase().trim() !== currentName;
        });

        setUserListings(owned);
        setClaimedListings(claimed);
      }
    } catch (err) {
      console.error('Error fetching user products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [currentUser?.name, refreshTrigger]);

  // Remove a listing via DELETE /api/listings/:id
  const handleRemoveProduct = async (listingId) => {
    setIsDeleting(true);
    setDeleteMsg('');
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
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
        setDeleteMsg(`Product ${listingId} removed successfully.`);
        setUserListings((prev) => prev.filter((l) => l.listing_id !== listingId));
        if (onListingUpdated) onListingUpdated();
        setTimeout(() => setDeleteMsg(''), 3500);
      } else {
        alert(data.error || 'Failed to remove product');
      }
    } catch (err) {
      console.error('Error removing product:', err);
      alert('Network error removing product');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Filter user listings based on tab
  const filteredListings = userListings.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  // Calculate enterprise stats
  const availableCount = userListings.filter((l) => l.status === 'available').length;
  const reservedCount = userListings.filter((l) => l.status === 'reserved').length;
  const soldCount = userListings.filter((l) => l.status === 'sold').length;
  const totalKgDiverted = userListings.reduce((sum, l) => {
    return l.status === 'sold' ? sum + (l.impact_metrics?.kgDiverted || 0) : sum;
  }, 0);
  const totalCo2Avoided = userListings.reduce((sum, l) => {
    return l.status === 'sold' ? sum + (l.impact_metrics?.co2AvoidedKg || 0) : sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg flex-shrink-0">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'EP'}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentUser.name || 'Enterprise Profile'}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {currentUser.type || 'Enterprise'}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Circular Seller
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.city || 'Mumbai'}, {currentUser.state || 'Maharashtra'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.email || 'seller@circularexchange.in'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onPostNew}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post New Product</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

        </div>

        {/* Quick Enterprise Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Products Listed</span>
            <span className="text-2xl font-black text-slate-900">{userListings.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{availableCount} active in marketplace</span>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Available to Buy</span>
            <span className="text-2xl font-black text-emerald-900">{availableCount}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Ready for freight claim</span>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Reserved / In Deal</span>
            <span className="text-2xl font-black text-amber-900">{reservedCount}</span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Under 48h buyer hold</span>
          </div>

          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">CO₂ Emissions Diverted</span>
            <span className="text-2xl font-black text-teal-900">
              {totalCo2Avoided > 1000 ? `${(totalCo2Avoided / 1000).toFixed(1)} t` : `${totalCo2Avoided} kg`}
            </span>
            <span className="text-[10px] text-teal-700 block mt-0.5">From {soldCount} closed lots</span>
          </div>
        </div>
      </div>

      {deleteMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{deleteMsg}</span>
        </div>
      )}

      {/* Section: My Products (See Products & Manage/Remove) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>My Surplus Products Inventory</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              View all products posted by your enterprise, track buyer interest, or remove surplus lots.
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({userListings.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'available'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setStatusFilter('reserved')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'reserved'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reserved ({reservedCount})
            </button>
            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'sold'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sold ({soldCount})
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">Loading your enterprise products...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {statusFilter === 'all'
                  ? 'No surplus products posted yet'
                  : `No products found with status '${statusFilter}'`}
              </h3>
              <p className="text-xs text-slate-500">
                Post your excess packaging boxes, drums, pallets, or plastic scrap to monetize surplus and advance circular diversion.
              </p>
            </div>
            <button
              type="button"
              onClick={onPostNew}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Surplus Product</span>
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item) => {
              const isDeletingThis = deleteConfirmId === item.listing_id;
              return (
                <div
                  key={item.listing_id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden group">
                      <img
                        src={item.image_url}
                        alt={item.material_subtype}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/images/materials/corrugated_boxes.jpg';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {item.category}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                        {item.listing_id}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 hover:text-emerald-700 transition-colors">
                          {item.material_subtype}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.city}, {item.state}</span>
                          <span>•</span>
                          <span>{item.condition}</span>
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Quantity</span>
                          <span className="font-extrabold text-slate-800">
                            {item.quantity.toLocaleString()} {item.unit}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Price</span>
                          <span className="font-black text-slate-900 text-sm text-emerald-800">
                            ₹{Number(item.price_total_inr).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Product Actions: See Product & Remove */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2 space-y-2">
                    
                    {/* Deletion Confirmation Modal/Bar */}
                    {isDeletingThis ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 mt-2">
                        <p className="text-[11px] font-bold text-red-900">
                          Are you sure you want to remove this product?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.listing_id)}
                            disabled={isDeleting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isDeleting ? 'Removing...' : 'Confirm Remove'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-2">
                        {/* See Product Button */}
                        <button
                          type="button"
                          onClick={() => onSelectListing(item)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>See Product</span>
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.listing_id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="Remove this product from marketplace"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claimed Lots (Purchases or Requests in Negotiation) */}
      {claimedListings.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>Products Claimed / In Negotiation by You ({claimedListings.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {claimedListings.map((item) => (
              <div
                key={item.listing_id}
                className="bg-white rounded-2xl border border-teal-200 p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.image_url}
                    alt={item.material_subtype}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Reserved by You
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{item.material_subtype}</h4>
                    <p className="text-[10px] text-slate-500">Seller: {item.business_name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectListing(item)}
                  className="w-full bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>See Product & Freight Details</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
