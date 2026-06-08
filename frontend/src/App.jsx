// App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import DietPlan from './pages/DietPlan';
import MealTracker from './pages/MealTracker';
import AIAssistant from './pages/AIAssistant';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  const handleProfileSaved = () => {
    // Increment key to force state reload in dependent pages
    setProfileRefreshKey(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <Dashboard key={profileRefreshKey} setActiveTab={setActiveTab} />;
      case 'profile':
        return <Profile onProfileSaved={handleProfileSaved} />;
      case 'diet-plan':
        return <DietPlan key={profileRefreshKey} setActiveTab={setActiveTab} />;
      case 'meal-tracker':
        return <MealTracker key={profileRefreshKey} setActiveTab={setActiveTab} />;
      case 'ai-assistant':
        return <AIAssistant />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header style={styles.mobileHeader}>
        <div style={styles.logoRow}>
          <h2 style={styles.logoText}>NutriGuide <span style={{ color: '#2dd4bf' }}>AI</span></h2>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          style={styles.menuToggle}
        >
          <Menu size={24} color="#ffffff" />
        </button>
      </header>

      {/* Sidebar Panel */}
      <div style={{
        ...styles.sidebarWrapper,
        display: mobileMenuOpen ? 'block' : 'none',
      }} className="mobile-sidebar">
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false); // Close menu on select in mobile
        }} />
      </div>
      
      {/* Desktop Sidebar always visible */}
      <div style={styles.desktopSidebar}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Menu Backdrop click handler */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          style={styles.backdrop} 
        />
      )}

      {/* Main Page Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

const styles = {
  mobileHeader: {
    display: 'none', // Overridden in media queries via CSS or handled inline in JS
    height: '60px',
    backgroundColor: '#0f172a',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    padding: '0 1.5rem',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  menuToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  sidebarWrapper: {
    position: 'fixed',
    top: '60px',
    left: 0,
    bottom: 0,
    zIndex: 998,
    width: '260px',
  },
  desktopSidebar: {
    display: 'block',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 997,
  }
};

// Simple media query handler for JS styles
const checkMobile = () => {
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth <= 1024;
    const desktopEl = document.querySelector('.mobile-sidebar');
    
    // Inline dynamically inject styles for mobile responsiveness support
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @media (max-width: 1024px) {
        header { display: flex !important; }
        .app-container > div:nth-child(3) { display: none !important; }
        header { display: flex !important; }
      }
      @media (min-width: 1025px) {
        .mobile-sidebar { display: none !important; }
        header { display: none !important; }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }
};
setTimeout(checkMobile, 100);
