// DietPlan.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SafetyWarning from '../components/SafetyWarning';
import { Utensils, HelpCircle, Coffee, Clock, Sun, Moon, Dumbbell, AlertCircle } from 'lucide-react';

export default function DietPlan({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDietPlan = async () => {
    try {
      setLoading(true);
      // Try to load saved profile first
      const profile = await api.getProfile();
      if (profile) {
        const res = await api.generateDietPlan(profile);
        setData(res);
        setError(null);
      } else {
        setData(null);
      }
    } catch (err) {
      setError('Could not compile diet plan. Please configure your profile first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietPlan();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Compiling Personalized Indian Diet Plan...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={styles.errorCard}>
        <HelpCircle size={48} color="#64748b" />
        <h2>Profile Required</h2>
        <p style={{ margin: '0.5rem 0 1.5rem 0', color: '#94a3b8', textAlign: 'center', maxWidth: '450px' }}>
          We need your health goal, food preferences, budget, and allergies 
          to compile a personalized Indian diet plan safely.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveTab('profile')}>
          Set Up Demographics
        </button>
      </div>
    );
  }

  const mealSections = [
    { id: 'breakfast', name: 'Breakfast (8:30 AM)', icon: Coffee, color: '#f59e0b' },
    { id: 'mid_morning', name: 'Mid-Morning (11:30 AM)', icon: Clock, color: '#10b981' },
    { id: 'lunch', name: 'Lunch (2:00 PM)', icon: Sun, color: '#3b82f6' },
    { id: 'evening_snack', name: 'Evening Snack (5:30 PM)', icon: Clock, color: '#f59e0b' },
    { id: 'dinner', name: 'Dinner (8:30 PM)', icon: Moon, color: '#6366f1' },
  ];

  // Add workout meals if gym user and meals are populated
  const isGymUser = data.meals.pre_workout.length > 0 || data.meals.post_workout.length > 0;
  if (isGymUser) {
    // Insert pre-workout before evening snack/dinner and post-workout after evening snack
    mealSections.push({ id: 'pre_workout', name: 'Pre-Workout Meal (30 min before)', icon: Dumbbell, color: '#ec4899' });
    mealSections.push({ id: 'post_workout', name: 'Post-Workout Feed (30 min after)', icon: Dumbbell, color: '#06b6d4' });
  }

  // Sort meals by biological order
  const getOrderedMeals = () => {
    const order = ['breakfast', 'mid_morning', 'pre_workout', 'post_workout', 'lunch', 'evening_snack', 'dinner'];
    return mealSections.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  };

  const orderedMeals = getOrderedMeals();

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 className="section-title">Your Personalized Indian Diet Plan</h1>
          <p className="section-subtitle">
            Nutritional plan filtered for your budget ({data.targets.budget}) and food preferences ({data.targets.food_preference}).
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDietPlan}>Recompile Plan</button>
      </div>

      <SafetyWarning warnings={data.targets.warnings} />

      <div style={styles.planLayout}>
        {/* Left Side: Meal Schedule Cards */}
        <div style={styles.mealsList}>
          {orderedMeals.map((sec) => {
            const Icon = sec.icon;
            const items = data.meals[sec.id] || [];
            
            if (items.length === 0) return null;

            return (
              <div key={sec.id} className="glass-card" style={styles.mealCard}>
                <div style={styles.mealHeader}>
                  <div style={{ ...styles.iconWrapper, backgroundColor: `${sec.color}15` }}>
                    <Icon size={20} color={sec.color} />
                  </div>
                  <h3 style={styles.mealTitle}>{sec.name}</h3>
                </div>

                <div style={styles.mealBody}>
                  {items.map((item, idx) => (
                    <div key={idx} style={styles.foodItem}>
                      <div style={styles.foodNameCol}>
                        <span style={styles.foodName}>{item.food_name}</span>
                        <span style={styles.servingDesc}>Portion: {item.servings} x {item.base_serving}</span>
                      </div>
                      <div style={styles.foodMacrosCol}>
                        <span style={styles.macroVal}>{item.calories} kcal</span>
                        <span style={styles.macroLabel}>P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Nutrients Summary & Tips */}
        <div style={styles.summaryCol}>
          <div className="glass-card" style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Nutritional Plan Target Fit</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Comparison of today's calculated target vs. the food compilation totals.
            </p>

            <div style={styles.totalsTable}>
              <div style={styles.tableRowHead}>
                <span>Nutrient</span>
                <span>Target</span>
                <span>Planned Total</span>
              </div>
              <div style={styles.tableRow}>
                <span>Calories</span>
                <span>{data.targets.calorie_target} kcal</span>
                <span style={{ color: '#2dd4bf', fontWeight: '700' }}>{data.totals.calories} kcal</span>
              </div>
              <div style={styles.tableRow}>
                <span>Protein</span>
                <span>{data.targets.protein_target} g</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>{data.totals.protein} g</span>
              </div>
              <div style={styles.tableRow}>
                <span>Carbs</span>
                <span>{data.targets.carb_target} g</span>
                <span>{data.totals.carbs} g</span>
              </div>
              <div style={styles.tableRow}>
                <span>Fats</span>
                <span>{data.targets.fat_target} g</span>
                <span>{data.totals.fat} g</span>
              </div>
            </div>

            <div style={styles.waterBox}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Clock size={16} color="#3b82f6" />
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Water Suggestion</span>
              </div>
              <p style={styles.waterText}>
                Drink at least <strong>{data.targets.water_target} Liters</strong> of water today, 
                evenly spaced out (approx. 8-10 glasses).
              </p>
            </div>
          </div>

          <div className="glass-card" style={styles.tipsCard}>
            <img 
              src="/indian_plate_diet.png" 
              alt="Healthy Indian Diet" 
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
            />
            <h3 style={styles.summaryTitle}>Dietary Advice & Tips</h3>
            <ul style={styles.tipsList}>
              <li>🥗 Eat raw salads before lunch/dinner to supply dietary fiber (FSSAI guideline).</li>
              <li>🍛 Replace white polished rice with brown rice or whole-wheat roti to limit insulin spikes.</li>
              <li>🥛 For calcium demands, drink curd/milk. (Filtered out if milk allergy is present).</li>
              <li>🍳 Gym Users: Ensure you consume your pre-workout meal 30-45 minutes before workouts.</li>
            </ul>
          </div>
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
  planLayout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  mealsList: {
    flex: '1.5 1 600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  mealCard: {
    padding: '1.5rem',
  },
  mealHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
  },
  iconWrapper: {
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  mealBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  foodItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
  },
  foodNameCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  foodName: {
    fontSize: '0.95rem',
    color: '#ffffff',
    fontWeight: '500',
  },
  servingDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
  },
  foodMacrosCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  macroVal: {
    fontSize: '0.95rem',
    color: '#2dd4bf',
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
  },
  summaryCol: {
    flex: '1 1 350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    position: 'sticky',
    top: '20px',
  },
  summaryCard: {
    borderLeft: '4px solid #3b82f6',
  },
  summaryTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  totalsTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  tableRowHead: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#94a3b8',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.5rem',
  },
  waterBox: {
    padding: '1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '10px',
    color: '#f8fafc',
  },
  waterText: {
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    lineHeight: '1.4',
    color: '#94a3b8',
  },
  tipsCard: {
    borderLeft: '4px solid #f59e0b',
  },
  tipsList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  tipsListLi: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  }
};
