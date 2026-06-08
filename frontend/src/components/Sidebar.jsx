// Sidebar.jsx
import React from 'react';
import { 
  LayoutDashboard, 
  User, 
  Utensils, 
  ClipboardList, 
  MessageSquare, 
  BookOpen, 
  Activity 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', name: 'Profile Calculator', icon: User },
    { id: 'diet-plan', name: 'Diet Planner', icon: Utensils },
    { id: 'meal-tracker', name: 'Meal Tracker', icon: ClipboardList },
    { id: 'ai-assistant', name: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <Activity size={28} color="#2dd4bf" />
        <h2 style={styles.logoText}>NutriGuide <span style={styles.logoHighlight}>AI</span></h2>
      </div>
      
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {}),
              }}
            >
              <Icon size={20} color={isActive ? '#2dd4bf' : '#94a3b8'} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <p style={styles.footerText}>Research-Based Project</p>
        <p style={styles.footerSub}>ICMR-NIN & WHO Principles</p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    padding: '1.5rem',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2.5rem',
    padding: '0.5rem 0',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '0.5px',
  },
  logoHighlight: {
    color: '#0d9488',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    width: '100%',
    padding: '0.85rem 1rem',
    background: 'none',
    border: 'none',
    borderRadius: '10px',
    color: '#64748b',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    fontSize: '0.95rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    background: 'rgba(13, 148, 136, 0.08)',
    color: '#0d9488',
    borderLeft: '3px solid #0d9488',
    paddingLeft: '0.8rem',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  footerSub: {
    fontSize: '0.7rem',
    color: '#cbd5e1',
    marginTop: '2px',
  }
};
