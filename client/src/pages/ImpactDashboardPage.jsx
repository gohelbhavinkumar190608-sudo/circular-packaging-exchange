import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Leaf, 
  TrendingDown, 
  DollarSign, 
  Scale, 
  Recycle, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { CATEGORY_DETAILS } from '../data/constants';

export default function ImpactDashboardPage({ refreshTrigger, onSelectListing }) {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchImpact = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/impact');
      const data = await res.json();
      if (data.success) {
        setImpactData(data);
      }
    } catch (err) {
      console.error("Failed to fetch impact metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, [refreshTrigger]);

  if (loading || !impactData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">Aggregating live circular economy metrics...</p>
      </div>
    );
  }

  const { headline_stats, category_breakdown, timeline, recent_transactions } = impactData;

  const maxCategoryKg = category_breakdown.length
    ? Math.max(...category_breakdown.map((c) => c.kg_diverted))
    : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Dashboard Hero */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>Real-Time Environmental & Cost Savings Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Circular Carbon & Landfill Diversion Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Live aggregated metrics computed strictly from surplus packaging and materials with status <span className="text-emerald-400 font-bold">sold / diverted</span>. Illustrating real-world carbon abatement and supply chain savings.
          </p>
        </div>
      </div>

      {/* 4 Headline Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Waste Diverted */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Packaging Waste Diverted</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {headline_stats.total_waste_diverted_tons.toLocaleString()} <span className="text-base font-bold text-slate-500">Tons</span>
            </div>
            <div className="text-xs font-semibold text-emerald-700 mt-0.5">
              {headline_stats.total_waste_diverted_kg.toLocaleString()} kg diverted from landfill
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Equivalent to ~{Math.round(headline_stats.total_waste_diverted_tons * 2.8)} standard garbage truckloads
          </div>
        </div>

        {/* Stat 2: CO2 Avoided */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Embodied CO₂ Avoided</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {headline_stats.total_co2_avoided_tons.toLocaleString()} <span className="text-base font-bold text-slate-500">Tons CO₂e</span>
            </div>
            <div className="text-xs font-semibold text-teal-700 mt-0.5">
              {headline_stats.total_co2_avoided_kg.toLocaleString()} kg CO₂ avoided vs virgin
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Equal to taking ~{Math.round(headline_stats.total_co2_avoided_tons / 4.6)} passenger cars off the road for a year
          </div>
        </div>

        {/* Stat 3: B2B Cost Saved */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total B2B Cost Saved</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{(headline_stats.total_cost_saved_inr / 100000).toFixed(2)} <span className="text-base font-bold text-slate-500">Lakhs</span>
            </div>
            <div className="text-xs font-semibold text-amber-800 mt-0.5">
              ₹{headline_stats.total_cost_saved_inr.toLocaleString()} vs virgin market price
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Average ~65% cost savings for buyers across 8 categories
          </div>
        </div>

        {/* Stat 4: Deals Completed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Circular Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Recycle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {headline_stats.total_deals_completed} <span className="text-base font-bold text-slate-500">Deals</span>
            </div>
            <div className="text-xs font-semibold text-blue-700 mt-0.5">
              {headline_stats.total_active_listings} active surplus lots available
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            {headline_stats.total_reserved_listings} lots currently in reservation review
          </div>
        </div>

      </div>

      {/* Main Analysis Section: Category Breakdown + Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: 7 cols (Material Category Breakdown Bars) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Waste Diverted & CO₂ Avoided by Material Category</span>
              </h2>
              <p className="text-xs text-slate-500">
                Normalized kg diversion and associated emissions avoided across each packaging stream.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {category_breakdown.map((cat) => {
              const pct = Math.min(100, Math.round((cat.kg_diverted / maxCategoryKg) * 100));
              const config = CATEGORY_DETAILS[cat.category] || { text: 'text-slate-700' };

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{cat.category}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({cat.items_count} batch{cat.items_count > 1 ? 'es' : ''})
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">
                        {cat.tons_diverted} Tons
                      </span>
                      <span className="text-emerald-700 font-semibold text-[11px] ml-2">
                        ({cat.co2_avoided_tons} T CO₂e)
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.max(4, pct)}%` }}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{cat.kg_diverted.toLocaleString()} kg diverted</span>
                    <span>Saved ₹{cat.cost_saved_inr.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Trend View */}
          {timeline.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Monthly Diversion Trajectory</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {timeline.map((t) => (
                  <div key={t.period} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{t.period}</span>
                    <div className="font-black text-slate-900 text-sm">
                      {Math.round(t.kg_diverted / 1000)} Tons
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      {Math.round(t.co2_avoided_kg / 1000)} T CO₂ avoided
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Col: 5 cols (Methodology Disclosure & Recent Transactions) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Methodology & Factors Disclosure Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Transparent Emissions & Pricing Methodology</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Calculated using standard industrial lifecycle emission factors and virgin market benchmark prices:
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Plastic</strong>
                <span className="text-slate-500">1.5 kg CO₂/kg • ₹85/kg virgin</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Cardboard</strong>
                <span className="text-slate-500">0.9 kg CO₂/kg • ₹38/kg virgin</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Metal</strong>
                <span className="text-slate-500">2.0 kg CO₂/kg • ₹72/kg virgin</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Paper</strong>
                <span className="text-slate-500">0.7 kg CO₂/kg • ₹45/kg virgin</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Wood</strong>
                <span className="text-slate-500">0.4 kg CO₂/kg • ₹28/kg virgin</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Foam/Packaging</strong>
                <span className="text-slate-500">1.8 kg CO₂/kg • ₹95/kg virgin</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Glass</strong>
                <span className="text-slate-500">0.3 kg CO₂/kg • ₹22/kg virgin</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block">Textile/Jute</strong>
                <span className="text-slate-500">1.2 kg CO₂/kg • ₹55/kg virgin</span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 italic">
              * Note: Emission factors and virgin prices are illustrative baseline models for HackOut '26 hackathon benchmarking.
            </p>
          </div>

          {/* Recent Diverted Batches Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Recently Diverted Lots</span>
              <span className="text-emerald-700 font-semibold normal-case">Verified Landfill Diversion</span>
            </h3>

            <div className="space-y-3">
              {recent_transactions.slice(0, 5).map((item) => (
                <div
                  key={item.listing_id}
                  onClick={() => onSelectListing && onSelectListing(item)}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/80 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 truncate">
                      {item.material_subtype}
                    </span>
                    <span className="text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
                      +{item.impact.co2AvoidedKg.toLocaleString()} kg CO₂
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.quantity.toLocaleString()} {item.unit} • {item.city}</span>
                    <span className="font-semibold text-slate-700">₹{item.price_total_inr.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
