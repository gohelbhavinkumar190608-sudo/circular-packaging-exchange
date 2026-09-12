import React from 'react';
import { MapPin, Building2, Scale, ArrowRight, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { CATEGORY_DETAILS } from '../data/constants';

export default function ListingCard({ listing, onSelect, viewMode = 'grid', currentUser }) {
  const isOwner = Boolean(
    currentUser && (
      (currentUser.name && listing.business_name && currentUser.name.trim().toLowerCase() === listing.business_name.trim().toLowerCase()) ||
      (currentUser.email && listing.contact_email && currentUser.email.trim().toLowerCase() === listing.contact_email.trim().toLowerCase())
    )
  );

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

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect(listing)}
        className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Thumbnail */}
          <div className="relative w-28 h-24 sm:w-32 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
            <img
              src={listing.image_url || categoryConfig.defaultImage}
              alt={listing.material_subtype}
              onError={(e) => { e.target.src = categoryConfig.defaultImage; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-1.5 left-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${categoryConfig.color}`}>
                {listing.category}
              </span>
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono font-medium">{listing.listing_id}</span>
              <StatusBadge status={listing.status} />
              {isOwner && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                  Your Product
                </span>
              )}
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                {listing.condition}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {listing.material_subtype}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-800">{listing.quantity.toLocaleString()}</strong> {listing.unit}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {listing.business_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {listing.city}
                {listing.distance_km != null && (
                  <span className="text-emerald-600 font-semibold ml-1">
                    ({listing.distance_km} km)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div>
            <div className="text-lg font-black text-slate-900">{formattedPrice}</div>
            <div className="text-xs text-slate-500 text-right">
              {formattedPerUnit} / {listing.unit}
            </div>
          </div>
          <button className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
            View & Claim <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View (Default OLX Card)
  return (
    <div
      onClick={() => onSelect(listing)}
      className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col group"
    >
      {/* Photo header with overlay badges */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={listing.image_url || categoryConfig.defaultImage}
          alt={listing.material_subtype}
          onError={(e) => { e.target.src = categoryConfig.defaultImage; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm border ${categoryConfig.color}`}>
            {listing.category}
          </span>
        </div>

        {/* Status Badge & Owner Pill */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {isOwner && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
              Your Product
            </span>
          )}
          <StatusBadge status={listing.status} />
        </div>

        {/* Condition pill bottom-left */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-sm">
            {listing.condition}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {formattedPerUnit} / {listing.unit}
            </span>
          </div>

          {/* Title / Subtype */}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mt-1">
            {listing.material_subtype}
          </h3>

          {/* Quantity */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Available: <strong className="text-slate-800">{listing.quantity.toLocaleString()}</strong> {listing.unit}
            </span>
          </div>
        </div>

        {/* Footer: Seller & Location */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 truncate text-slate-700 font-medium">
              <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{listing.business_name}</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">{listing.listing_id}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span>{listing.city}, {listing.state}</span>
            </span>
            {listing.distance_km != null && (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                {listing.distance_km} km
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
