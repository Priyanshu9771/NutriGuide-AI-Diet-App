// Home.jsx
import React from 'react';
import { Play, ArrowRight, ShieldCheck, Heart, Cpu, TrendingUp } from 'lucide-react';

export default function Home({ setActiveTab }) {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div className="glass-card" style={styles.heroCard}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>College Capstone Project</span>
          <h1 style={styles.mainTitle}>
            NutriGuide <span style={{ color: '#2dd4bf' }}>AI</span>
          </h1>
          <p style={styles.tagline}>
            Personalized Diet Planning & Scientific Nutrition Assistant Powered by AI
          </p>
          <p style={styles.description}>
            A modern, research-based portal that calculates clinical targets (BMI, BMR, TDEE), 
            compiles customized traditional Indian meal plans, tracks daily food logs, 
            and features a safety-conscious AI chatbot assistant.
          </p>
          <div style={styles.btnRow}>
            <button 
              className="btn btn-primary" 
              onClick={() => setActiveTab('profile')}
              style={styles.btnCustom}
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setActiveTab('ai-assistant')}
              style={styles.btnCustom}
            >
              <span>Chat with AI</span>
            </button>
          </div>
        </div>

        {/* Right side illustrative image */}
        <div style={styles.heroImageWrapper}>
          <img 
            src="/indian_plate_diet.png" 
            alt="Healthy Indian Diet" 
            style={styles.heroImage} 
          />
        </div>
      </div>

      {/* Feature Section */}
      <h2 style={styles.featuresHeading}>Core Capabilities</h2>
      <div className="dashboard-grid">
        <div className="glass-card" style={styles.featureCard}>
          <Heart size={36} color="#ef4444" style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Clinical Health Calculator</h3>
          <p style={styles.featureText}>
            Computes BMI, basal metabolic rate (BMR) with Mifflin-St Jeor, and daily TDEE 
            with activity coefficients.
          </p>
        </div>

        <div className="glass-card" style={styles.featureCard}>
          <Cpu size={36} color="#2dd4bf" style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Indian Diet Generator</h3>
          <p style={styles.featureText}>
            Compiles customized breakfast, snack, and main course targets utilizing Roti, 
            Dals, Paneer, eggs, and local seasonal staples.
          </p>
        </div>

        <div className="glass-card" style={styles.featureCard}>
          <TrendingUp size={36} color="#6366f1" style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Meal Log Tracker</h3>
          <p style={styles.featureText}>
            Tracks consumed calories and protein against targets. Keeps daily records and 
            renders progress scores.
          </p>
        </div>

        <div className="glass-card" style={styles.featureCard}>
          <ShieldCheck size={36} color="#10b981" style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Clinical Safety Engine</h3>
          <p style={styles.featureText}>
            Restricts protein intake for kidney disease, filters food allergens, overrides 
            underweight weight-loss goals, and warns diabetic users.
          </p>
        </div>
      </div>

      {/* Research and Guidelines */}
      <div className="glass-card" style={styles.researchCard}>
        <h3 style={styles.researchTitle}>Research Foundation</h3>
        <p style={styles.researchText}>
          NutriGuide AI calculations and guidelines are built on official public standards:
        </p>
        <ul style={styles.researchList}>
          <li><strong>World Health Organization (WHO):</strong> Healthy dietary principles and calorie distributions.</li>
          <li><strong>ICMR-NIN:</strong> Dietary Guidelines for Indians (IFCT - Indian Food Composition Tables).</li>
          <li><strong>FSSAI:</strong> Clean eating guidelines and food safety parameters.</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  heroCard: {
    padding: '3.5rem 3rem',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%)',
    border: '1px solid #b2f5ea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  heroContent: {
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  badge: {
    display: 'inline-block',
    width: 'fit-content',
    padding: '0.35rem 0.85rem',
    background: 'rgba(13, 148, 136, 0.1)',
    border: '1px solid rgba(13, 148, 136, 0.25)',
    borderRadius: '20px',
    color: '#0d9488',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: "'Outfit', sans-serif",
  },
  mainTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.1',
  },
  tagline: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#334155',
    lineHeight: '1.4',
  },
  description: {
    fontSize: '0.975rem',
    color: '#475569',
    lineHeight: '1.6',
    marginTop: '0.5rem',
  },
  btnRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
  },
  btnCustom: {
    minWidth: '160px',
  },
  heroImageWrapper: {
    flex: '1 1 250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '2rem',
    maxWidth: '300px',
  },
  heroImage: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    borderRadius: '20px',
    border: '1.5px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
  },
  featuresHeading: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '-1rem',
    fontFamily: "'Outfit', sans-serif",
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    padding: '2rem 1.5rem',
  },
  featureIcon: {
    marginBottom: '0.5rem',
  },
  featureTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  featureText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: '1.5',
  },
  researchCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '2.5rem',
  },
  researchTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  researchText: {
    fontSize: '0.95rem',
    color: '#94a3b8',
  },
  researchList: {
    listStyleType: 'disc',
    paddingLeft: '1.25rem',
    color: '#64748b',
    fontSize: '0.9rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  }
};
