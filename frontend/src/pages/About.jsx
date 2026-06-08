// About.jsx
import React from 'react';
import { BookOpen, FolderTree, GraduationCap, Cpu, FileText } from 'lucide-react';

export default function About() {
  return (
    <div style={styles.container}>
      <div>
        <h1 className="section-title">About the Project</h1>
        <p className="section-subtitle">A research-based nutrition portal built with FastAPI, React, and Gemini AI.</p>
      </div>

      {/* College Presentation Strategy Card */}
      <div className="glass-card" style={styles.gradCard}>
        <div style={styles.header}>
          <GraduationCap size={28} color="#2dd4bf" />
          <h2 style={styles.title}>College Presentation Strategy</h2>
        </div>
        <p style={styles.intro}>
          This project makes a fantastic showcase for final year, pre-final year, or seminar presentations! 
          Here is how you can present this project to score maximum marks:
        </p>
        <div style={styles.steps}>
          <div style={styles.stepItem}>
            <strong>1. Define the Problem:</strong> Highlight that generic global diet recommendations don't fit 
            traditional Indian diets. There is a lack of automated engines checking for clinical restrictions 
            (like kidney disease protein caps or allergen exclusions) simultaneously.
          </div>
          <div style={styles.stepItem}>
            <strong>2. Explain the Architecture:</strong> NutriGuide AI uses a decoupled client-server model:
            <ul>
              <li><strong>Frontend:</strong> React.js + Vite, styled using a high-fidelity dark glassmorphism system, and Recharts for progress visualizers.</li>
              <li><strong>Backend:</strong> Python FastAPI executing calculation loops, safety validators, and local JSON queries.</li>
              <li><strong>AI Integration:</strong> Gemini API with offline local rule-based fail-safes.</li>
            </ul>
          </div>
          <div style={styles.stepItem}>
            <strong>3. Show the Safety Engine:</strong> Demonstrate the medical condition overrides. Triggering a profile 
            with Kidney Disease and showing the capped protein (0.8g/kg) and caution banners is a key differentiator.
          </div>
        </div>
      </div>

      {/* Research Guidelines Grid */}
      <div className="dashboard-grid">
        <div className="glass-card">
          <BookOpen size={24} color="#10b981" style={{ marginBottom: '0.75rem' }} />
          <h3 style={styles.subTitle}>Research Foundations</h3>
          <p style={styles.text}>
            Our calorie models utilize the <strong>Mifflin-St Jeor Equation</strong>, recognized as the most accurate 
            method to calculate BMR. Portion models reflect the **Indian Food Composition Tables (IFCT)** published by 
            the National Institute of Nutrition (NIN), Hyderabad.
          </p>
        </div>

        <div className="glass-card">
          <Cpu size={24} color="#3b82f6" style={{ marginBottom: '0.75rem' }} />
          <h3 style={styles.subTitle}>Clinical Safety Guidelines</h3>
          <p style={styles.text}>
            Filters food databases using strict allergy logic (milk, nuts, eggs, gluten) 
            and implements nutritional safety caps (restricting high protein for renal conditions, 
            warning diabetic profiles, blocking caloric deficits for underweight BMI).
          </p>
        </div>
      </div>

      {/* Folder Structure Code section */}
      <div className="glass-card" style={styles.codeCard}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <FolderTree size={20} color="#6366f1" />
          <h3 style={styles.subTitle}>Project Code Structure</h3>
        </div>
        <pre style={styles.pre}>
{`nutriguide-ai/
│
├── backend/
│   ├── data/
│   │   ├── foods.json            # 52 Indian foods database
│   │   ├── profile.json          # Active user profile cache
│   │   └── meal_logs.json        # User food logs
│   ├── main.py                   # FastAPI routes & CORS
│   ├── diet_logic.py             # BMR / TDEE math & meal generator
│   ├── safety_rules.py           # Medical safety flags
│   ├── chatbot.py                # Gemini API client & offline fallback
│   ├── test_backend.py           # Python formulas validator script
│   └── requirements.txt          # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── components/           # Sidebar, StatCard, SafetyWarning
    │   ├── pages/                # Home, Profile, Dashboard, Tracker...
    │   ├── services/             # api.js fetch connector
    │   ├── App.jsx               # Navigation controller
    │   └── main.jsx              # Mount point
    ├── index.html                # Typography imports
    └── package.json              # Frontend libraries`}
        </pre>
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
  gradCard: {
    borderLeft: '4px solid #2dd4bf',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(13, 148, 136, 0.05) 100%)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.4rem',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  intro: {
    fontSize: '0.95rem',
    color: '#e2e8f0',
    lineHeight: '1.5',
    marginBottom: '1.25rem',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  stepItem: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    ul: {
      paddingLeft: '1.25rem',
      marginTop: '4px',
    }
  },
  subTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  text: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    marginTop: '0.5rem',
  },
  codeCard: {
    backgroundColor: '#090d16',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  pre: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '1.25rem',
    borderRadius: '8px',
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: '#c7d2fe',
    lineHeight: '1.5',
  }
};
