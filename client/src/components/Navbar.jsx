import React from 'react';
import { 
  Recycle, 
  MapPin, 
  PlusCircle, 
  Sparkles, 
  BarChart3, 
  Building2, 
  Store, 
  UserCheck, 
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Package
} from 'lucide-react';
import { CITIES, DEMO_ACCOUNTS } from '../data/constants';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  buyerCity, 
  setBuyerCity, 
  currentUser, 
  setCurrentUser,
  isLoggedIn = false,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top micro-bar: Hackathon banner & demo account switcher */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
              HackOut '26
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="text-slate-300 font-medium">Circular Carbon Ecosystem</span>
            <span className="hidden md:inline text-emerald-400 font-semibold">• Team: SYNTAX TERROR</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden sm:inline">Active Demo Persona:</span>
            <div className="relative inline-flex items-center">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const selected = DEMO_ACCOUNTS.find((a) => a.id === e.target.value);
                  if (selected) setCurrentUser(selected);
                }}
                className="bg-slate-800 text-emerald-300 text-xs font-semibold py-1 px-2.5 rounded border border-slate-700 hover:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {DEMO_ACCOUNTS.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </select>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer flex items-center gap-1"
                >
                  <Package className="w-3 h-3" />
                  <span>See My Products</span>
                </button>
                <span className="text-slate-500">|</span>
                <button
                  onClick={onLogout}
                  className="text-[11px] text-slate-400 hover:text-red-400 font-medium cursor-pointer flex items-center gap-0.5"
                  title="Sign out of enterprise account"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline ml-1 cursor-pointer flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation bar (OLX Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab('marketplace')}
            className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                LoopExchange
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                  B2B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Surplus Packaging & Materials
              </p>
            </div>
          </div>

          {/* Reference Buyer City Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-slate-500 font-medium">Your Location:</span>
            <select
              value={buyerCity}
              onChange={(e) => setBuyerCity(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {CITIES.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city}, {c.state}
                </option>
              ))}
            </select>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('marketplace')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Marketplace</span>
            </button>

            <button
              onClick={() => setCurrentTab('matcher')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'matcher'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Best-Fit Matcher</span>
            </button>

            <button
              onClick={() => setCurrentTab('impact')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'impact'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Impact Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('businesses')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'businesses'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Directory</span>
            </button>

            {/* Enterprise Profile / Sign In Button */}
            {isLoggedIn ? (
              <button
                onClick={() => setCurrentTab('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  currentTab === 'profile'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-900'
                }`}
                title="View your enterprise profile & see your products"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-xs flex-shrink-0">
                  {currentUser?.name ? currentUser.name.slice(0, 1).toUpperCase() : 'P'}
                </div>
                <div className="text-left hidden sm:block leading-tight">
                  <span className="text-xs font-black text-slate-800 block truncate max-w-[110px]">
                    {currentUser?.name || 'My Profile'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-0.5">
                    <Package className="w-2.5 h-2.5" /> See Products
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentTab === 'login'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Sign in or register enterprise account"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* OLX-Style "+ POST SURPLUS / SELL" Button */}
            <button
              onClick={() => setCurrentTab('sell')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all ml-1 ${
                currentTab === 'sell'
                  ? 'bg-emerald-800 text-white ring-2 ring-emerald-500 ring-offset-2'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post Surplus</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
}
