import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MarketplacePage from './pages/MarketplacePage';
import ListingDetailPage from './pages/ListingDetailPage';
import MatchingEnginePage from './pages/MatchingEnginePage';
import SellListingPage from './pages/SellListingPage';
import ImpactDashboardPage from './pages/ImpactDashboardPage';
import BusinessProfilePage from './pages/BusinessProfilePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { DEMO_ACCOUNTS } from './data/constants';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState('marketplace'); // marketplace, detail, matcher, sell, impact, businesses, login, profile
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState(null);

  // App settings & Persona (saved in localStorage)
  const [buyerCity, setBuyerCity] = useState('Mumbai');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!(localStorage.getItem('loop_exchange_user') || localStorage.getItem('loop_exchange_token'));
    } catch (e) {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('loop_exchange_user');
      return saved ? JSON.parse(saved) : DEMO_ACCOUNTS[0];
    } catch (e) {
      return DEMO_ACCOUNTS[0];
    }
  });
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectListing = (listing) => {
    setSelectedListingId(listing.listing_id);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewBusiness = (businessName) => {
    setSelectedBusinessName(businessName);
    setCurrentTab('businesses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleListingCreated = (newListing) => {
    setRefreshTrigger(Date.now());
    showToast(`Listing ${newListing.listing_id} published successfully with status 'available'!`);
    setSelectedListingId(newListing.listing_id);
    setCurrentTab('detail');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.city) setBuyerCity(user.city);
    showToast(`Welcome, ${user.name}! Authenticated successfully.`);
    setCurrentTab('profile'); // Immediately take the user to their profile to see their products!
  };

  const handleLogout = () => {
    localStorage.removeItem('loop_exchange_user');
    localStorage.removeItem('loop_exchange_token');
    setIsLoggedIn(false);
    setCurrentUser(DEMO_ACCOUNTS[0]);
    showToast('Signed out of enterprise account.');
    setCurrentTab('marketplace');
  };

  const handleListingUpdated = () => {
    setRefreshTrigger(Date.now());
    showToast(`Status updated successfully! Live impact metrics synced.`);
  };

  const handleResetData = () => {
    setRefreshTrigger(Date.now());
    showToast('Platform reset to 45 original sample listings!');
    setCurrentTab('marketplace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fa] text-slate-900 font-sans">
      
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
              : 'bg-red-950 text-red-200 border-red-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header / Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'businesses') setSelectedBusinessName(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        buyerCity={buyerCity}
        setBuyerCity={(city) => {
          setBuyerCity(city);
          showToast(`Reference location switched to ${city}. All transport distances recalculated.`);
        }}
        currentUser={currentUser}
        setCurrentUser={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          showToast(`Active persona changed to ${user.name} (${user.type})`);
        }}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Dynamic Content Views */}
      <div className="flex-1">
        {currentTab === 'marketplace' && (
          <MarketplacePage
            onSelectListing={handleSelectListing}
            buyerCity={buyerCity}
            refreshTrigger={refreshTrigger}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'detail' && selectedListingId && (
          <ListingDetailPage
            listingId={selectedListingId}
            onBack={() => setCurrentTab('marketplace')}
            currentUser={currentUser}
            buyerCity={buyerCity}
            onViewBusiness={handleViewBusiness}
            onListingUpdated={handleListingUpdated}
          />
        )}

        {currentTab === 'matcher' && (
          <MatchingEnginePage
            onSelectListing={handleSelectListing}
            buyerCity={buyerCity}
            currentUser={currentUser}
            onListingUpdated={handleListingUpdated}
          />
        )}

        {currentTab === 'sell' && (
          <SellListingPage
            currentUser={currentUser}
            onListingCreated={handleListingCreated}
            onCancel={() => setCurrentTab('marketplace')}
          />
        )}

        {currentTab === 'impact' && (
          <ImpactDashboardPage
            refreshTrigger={refreshTrigger}
            onSelectListing={handleSelectListing}
          />
        )}

        {currentTab === 'businesses' && (
          <BusinessProfilePage
            selectedBusinessName={selectedBusinessName}
            onSelectBusiness={(name) => setSelectedBusinessName(name)}
            onSelectListing={handleSelectListing}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setCurrentTab('marketplace')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onSelectListing={handleSelectListing}
            onPostNew={() => setCurrentTab('sell')}
            onLogout={handleLogout}
            refreshTrigger={refreshTrigger}
            onListingUpdated={handleListingUpdated}
          />
        )}
      </div>

      {/* Global Footer */}
      <Footer onResetData={handleResetData} />

    </div>
  );
}
