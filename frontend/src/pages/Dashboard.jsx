// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  Flame, 
  Dumbbell, 
  Droplet, 
  Scale, 
  UtensilsCrossed, 
  HelpCircle,
  TrendingUp,
  Award,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
      setError(null);
    } catch (err) {
      setError('Could not connect to the backend. Make sure FastAPI server is running on http://localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Dashboard Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={styles.errorCard}>
        <HelpCircle size={48} color="#ef4444" />
        <h2>Connection Error</h2>
        <p style={{ margin: '0.5rem 0', color: '#94a3b8', textAlign: 'center' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData} style={{ marginTop: '1rem' }}>
          Retry Connecting
        </button>
      </div>
    );
  }

  const hasProfile = data && data.bmi > 0;

  if (!hasProfile) {
    return (
      <div className="glass-card" style={styles.errorCard}>
        <HelpCircle size={48} color="#64748b" />
        <h2>Profile Not Configured</h2>
        <p style={{ margin: '0.5rem 0 1.5rem 0', color: '#94a3b8', textAlign: 'center', maxWidth: '450px' }}>
          Please set up your profile demographics (age, weight, height, goal) first 
          to enable calculations and dashboard statistics.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveTab('profile')}>
          Configure Profile Now
        </button>
      </div>
    );
  }

  // Calculate percentages
  const caloriePercent = Math.min((data.calories_consumed / data.calorie_target) * 100, 100) || 0;
  const proteinPercent = Math.min((data.protein_consumed / data.protein_target) * 100, 100) || 0;

  // Circle Math: Circumference C = 2 * PI * R. R=50. C ~ 314
  const strokeCircumference = 314;
  const calOffset = strokeCircumference * (1 - caloriePercent / 100);
  const protOffset = strokeCircumference * (1 - proteinPercent / 100);

  // Recharts chart data
  const chartData = [
    {
      name: 'Calories (kcal)',
      Target: data.calorie_target,
      Consumed: data.calories_consumed,
    },
    {
      name: 'Protein (g x 10)',
      Target: data.protein_target * 10,
      Consumed: data.protein_consumed * 10,
    }
  ];

  return (
    <div style={styles.container} className="fade-in-up">
      <div style={styles.headerRow}>
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Real-time tracker of calories, proteins, and safety standards.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData} style={styles.refreshBtn}>
          <TrendingUp size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div style={styles.dashboardLayout}>
        {/* Left Column: Radial Dials Cards (Mockup Style) */}
        <div style={styles.dialsCol}>
          <div className="glass-card" style={styles.glowCard}>
            <h3 style={styles.columnTitle}>Daily Goal Progress</h3>
            
            {/* Calories Radial Dial */}
            <div style={styles.radialItem}>
              <div className="radial-progress-wrapper">
                <svg className="radial-svg" viewBox="0 0 120 120">
                  <circle className="radial-bg-circle" cx="60" cy="60" r="50" />
                  <circle 
                    className="radial-fill-circle" 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    stroke="#ef4444" 
                    style={{ 
                      strokeDasharray: strokeCircumference,
                      strokeDashoffset: calOffset 
                    }} 
                  />
                </svg>
                <div className="radial-text-container">
                  <span className="radial-value">{Math.round(data.calories_consumed)}</span>
                  <span className="radial-unit">kcal</span>
                </div>
              </div>
              <div style={styles.radialLabels}>
                <h4 style={styles.radialTitle}>Calories Eaten</h4>
                <p style={styles.radialGoal}>Target Goal: {data.calorie_target} kcal</p>
                <p style={styles.radialFoot}>{Math.round(data.calories_remaining)} kcal remaining</p>
              </div>
            </div>

            {/* Protein Radial Dial */}
            <div style={styles.radialItem}>
              <div className="radial-progress-wrapper">
                <svg className="radial-svg" viewBox="0 0 120 120">
                  <circle className="radial-bg-circle" cx="60" cy="60" r="50" />
                  <circle 
                    className="radial-fill-circle" 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    stroke="#10b981" 
                    style={{ 
                      strokeDasharray: strokeCircumference,
                      strokeDashoffset: protOffset 
                    }} 
                  />
                </svg>
                <div className="radial-text-container">
                  <span className="radial-value">{data.protein_consumed.toFixed(0)}</span>
                  <span className="radial-unit">grams</span>
                </div>
              </div>
              <div style={styles.radialLabels}>
                <h4 style={styles.radialTitle}>Protein Logged</h4>
                <p style={styles.radialGoal}>Target Goal: {data.protein_target.toFixed(1)} g</p>
                <p style={styles.radialFoot}>{data.protein_remaining.toFixed(1)} g remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Other stats + Recharts */}
        <div style={styles.statsCol}>
          <div style={styles.statsGrid}>
            <StatCard 
              title="Body Mass Index"
              value={data.bmi}
              unit="BMI"
              icon={Scale}
              color="#3b82f6"
              description="Body Weight Category: Normal"
            />
            <StatCard 
              title="NutriGuide Score"
              value={data.diet_score}
              unit="/ 100"
              icon={Award}
              color="#6366f1"
              description="Calculated based on target fit"
            />
          </div>

          <div className="glass-card" style={styles.chartCard}>
            <h3 style={styles.columnTitle}>Target vs. Consumed Balance</h3>
            <div style={{ marginTop: '1.25rem' }}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Target" fill="#1e293b" radius={[4, 4, 0, 0]} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                  <Bar dataKey="Consumed" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Meals Section */}
      <div className="glass-card" style={styles.mealsCard}>
        <div style={styles.mealsHeader}>
          <h3 style={styles.columnTitle}>Today's Food Intake Log</h3>
          <button 
            className="btn btn-secondary" 
            onClick={() => setActiveTab('meal-tracker')}
            style={styles.addFoodBtn}
          >
            <Plus size={16} />
            <span>Add Meal Log</span>
          </button>
        </div>

        <div style={styles.mealsBody}>
          {data.logged_meals.length > 0 ? (
            <div style={styles.mealsGrid}>
              {data.logged_meals.map((meal, index) => (
                <div key={index} style={styles.mealItem}>
                  <div style={styles.mealLeft}>
                    <UtensilsCrossed size={16} color="#2dd4bf" />
                    <div>
                      <h4 style={styles.mealName}>{meal.food_name}</h4>
                      <p style={styles.mealType}>{meal.meal_type.replace('_', ' ')} • {meal.servings} serving(s)</p>
                    </div>
                  </div>
                  <div style={styles.mealRight}>
                    <span style={styles.mealCalories}>+{meal.calories} kcal</span>
                    <span style={styles.mealProtein}>+{meal.protein}g Protein</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyMeals}>
              <UtensilsCrossed size={36} color="#475569" />
              <p style={{ marginTop: '0.5rem', color: '#64748b' }}>No meals logged yet today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  refreshBtn: {
    padding: '0.65rem 1.25rem',
  },
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    color: '#94a3b8',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(13, 148, 136, 0.1)',
    borderTop: '4px solid #2dd4bf',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    maxWidth: '500px',
    margin: '100px auto 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 2rem',
  },
  dashboardLayout: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    marginBottom: '2rem',
  },
  dialsCol: {
    flex: '1.2 1 400px',
    display: 'flex',
  },
  glowCard: {
    width: '100%',
    borderLeft: '4px solid #0d9488',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  columnTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  radialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    flexWrap: 'wrap',
  },
  radialLabels: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  radialTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  radialGoal: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  radialFoot: {
    fontSize: '0.85rem',
    color: '#2dd4bf',
    fontWeight: '600',
    marginTop: '6px',
  },
  statsCol: {
    flex: '1.5 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  chartCard: {
    flex: 1,
  },
  mealsCard: {
    padding: '1.5rem',
  },
  mealsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '1.25rem',
  },
  addFoodBtn: {
    padding: '0.45rem 1rem',
    fontSize: '0.8rem',
  },
  mealsBody: {
    width: '100%',
  },
  mealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  mealItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  mealLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  mealName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  mealType: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
    textTransform: 'capitalize',
  },
  mealRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#2dd4bf',
  },
  mealProtein: {
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '500',
    marginTop: '2px',
  },
  emptyMeals: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 0',
  }
};
