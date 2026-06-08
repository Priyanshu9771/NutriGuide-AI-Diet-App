// MealTracker.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusCircle, Trash2, UtensilsCrossed, Sparkles, Scale, Dumbbell } from 'lucide-react';

export default function MealTracker({ setActiveTab }) {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1.0);
  const [mealType, setMealType] = useState('lunch');
  
  const [logs, setLogs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const loadTrackerData = async () => {
    try {
      setLoading(true);
      // Fetch 50+ foods
      const foodsList = await api.getFoods();
      setFoods(foodsList);
      
      // Fetch logged meals & stats
      const mealLogs = await api.getMealLogs();
      setLogs(mealLogs);
      
      const dash = await api.getDashboard();
      setDashboard(dash);
      setError(null);
    } catch (err) {
      setError('Could not connect to server. Please ensure the backend FastAPI app is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackerData();
  }, []);

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setSearch(food.name);
  };

  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;

    try {
      const quantity = parseFloat(servings);
      const payload = {
        food_name: selectedFood.name,
        servings: quantity,
        calories: Math.round(selectedFood.calories * quantity),
        protein: parseFloat((selectedFood.protein * quantity).toFixed(1)),
        carbs: parseFloat((selectedFood.carbs * quantity).toFixed(1)),
        fat: parseFloat((selectedFood.fat * quantity).toFixed(1)),
        meal_type: mealType
      };

      await api.logMeal(payload);
      
      // Reset state
      setSelectedFood(null);
      setSearch('');
      setServings(1.0);
      setSuccessMsg('Meal logged successfully!');
      
      // Reload lists
      const mealLogs = await api.getMealLogs();
      setLogs(mealLogs);
      
      const dash = await api.getDashboard();
      setDashboard(dash);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to log meal.');
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all meal logs for today?')) {
      try {
        await api.clearMealLogs();
        setLogs([]);
        const dash = await api.getDashboard();
        setDashboard(dash);
      } catch (err) {
        setError('Failed to clear logs.');
      }
    }
  };

  // Filter foods for search
  const filteredFoods = search 
    ? foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Food Log Databases...</p>
      </div>
    );
  }

  // Check if profile exists (BMI is 0 if no profile config)
  const hasProfile = dashboard && dashboard.bmi > 0;

  if (!hasProfile) {
    return (
      <div className="glass-card" style={styles.errorCard}>
        <Scale size={48} color="#64748b" />
        <h2>Profile Setup Required</h2>
        <p style={{ margin: '0.5rem 0 1.5rem 0', color: '#94a3b8', textAlign: 'center' }}>
          Please complete your demographics form (age, weight, height, and goal) 
          so we can calculate your macro limits before tracking meals.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveTab('profile')}>
          Set Up Profile Now
        </button>
      </div>
    );
  }

  const calorieProgress = Math.min((dashboard.calories_consumed / dashboard.calorie_target) * 100, 100);
  const proteinProgress = Math.min((dashboard.protein_consumed / dashboard.protein_target) * 100, 100);

  return (
    <div style={styles.container}>
      <div>
        <h1 className="section-title">Daily Meal Tracker</h1>
        <p className="section-subtitle">Log what you eat and see how close you are to your daily targets.</p>
      </div>

      {/* Target Progress Bars */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={styles.progressHeader}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Sparkles size={18} color="#ef4444" />
              <span style={styles.progressTitle}>Calories Consumed</span>
            </div>
            <strong style={styles.progressVal}>{dashboard.calories_consumed} / {dashboard.calorie_target} kcal</strong>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${calorieProgress}%`, backgroundColor: '#ef4444' }} />
          </div>
          <p style={styles.progressFoot}>{dashboard.calories_remaining} kcal remaining today</p>
        </div>

        <div className="glass-card">
          <div style={styles.progressHeader}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Dumbbell size={18} color="#10b981" />
              <span style={styles.progressTitle}>Protein Consumed</span>
            </div>
            <strong style={styles.progressVal}>{dashboard.protein_consumed} / {dashboard.protein_target} g</strong>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${proteinProgress}%`, backgroundColor: '#10b981' }} />
          </div>
          <p style={styles.progressFoot}>{dashboard.protein_remaining.toFixed(1)} g remaining today</p>
        </div>
      </div>

      <div style={styles.trackerLayout}>
        {/* Log Meal Form */}
        <form onSubmit={handleLogMeal} className="glass-card" style={styles.formCard}>
          <h3 style={styles.cardTitle}>Add Eaten Food</h3>
          
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Search Indian Food</label>
            <input 
              type="text" 
              placeholder="e.g. Roti, Dal, Paneer, Egg..." 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value);
                if (selectedFood) setSelectedFood(null); // Clear selection if typing
              }}
              className="form-input" 
            />
            {/* Search Dropdown list */}
            {search && !selectedFood && filteredFoods.length > 0 && (
              <div style={styles.dropdown}>
                {filteredFoods.slice(0, 8).map(food => (
                  <div 
                    key={food.id} 
                    onClick={() => handleFoodSelect(food)}
                    style={styles.dropdownItem}
                  >
                    <span>{food.name}</span>
                    <span style={styles.dropdownDetail}>({food.serving_size} • {food.calories} kcal • P: {food.protein}g)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFood && (
            <div style={styles.selectedFoodBox}>
              <h4 style={styles.selectedFoodName}>{selectedFood.name}</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Serving Base: {selectedFood.serving_size}</p>
              <div style={styles.foodMacroRow}>
                <span>{selectedFood.calories} kcal</span>
                <span>P: {selectedFood.protein}g</span>
                <span>C: {selectedFood.carbs}g</span>
                <span>F: {selectedFood.fat}g</span>
              </div>
            </div>
          )}

          <div style={styles.formRow}>
            <div className="form-group" style={styles.col6}>
              <label className="form-label">Number of Servings</label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1" 
                value={servings} 
                onChange={(e) => setServings(e.target.value)} 
                className="form-input" 
              />
            </div>
            <div className="form-group" style={styles.col6}>
              <label className="form-label">Meal Type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="form-select">
                <option value="breakfast">Breakfast</option>
                <option value="mid_morning">Mid-Morning Snack</option>
                <option value="lunch">Lunch</option>
                <option value="evening_snack">Evening Snack</option>
                <option value="dinner">Dinner</option>
                <option value="pre_workout">Pre-Workout Meal</option>
                <option value="post_workout">Post-Workout Meal</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!selectedFood} 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <PlusCircle size={18} />
            <span>Log Food Item</span>
          </button>

          {successMsg && <p style={styles.success}>{successMsg}</p>}
        </form>

        {/* Logs Table */}
        <div className="glass-card" style={styles.logsCard}>
          <div style={styles.logsHeader}>
            <h3 style={styles.cardTitle}>Daily Food Log</h3>
            {logs.length > 0 && (
              <button onClick={handleClearLogs} style={styles.clearBtn}>
                <Trash2 size={16} />
                <span>Reset Day</span>
              </button>
            )}
          </div>

          <div style={styles.logsBody}>
            {logs.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Food Name</th>
                      <th style={styles.th}>Meal</th>
                      <th style={styles.th}>Portion</th>
                      <th style={styles.th}>Calories</th>
                      <th style={styles.th}>Protein</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} style={styles.tr}>
                        <td style={styles.td}>{log.food_name}</td>
                        <td style={{ ...styles.td, textTransform: 'capitalize' }}>{log.meal_type.replace('_', ' ')}</td>
                        <td style={styles.td}>{log.servings} serving(s)</td>
                        <td style={{ ...styles.td, color: '#2dd4bf', fontWeight: '600' }}>{log.calories} kcal</td>
                        <td style={{ ...styles.td, color: '#10b981', fontWeight: '600' }}>{log.protein} g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyLogs}>
                <UtensilsCrossed size={48} color="#475569" />
                <h3>No food logged today</h3>
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>
                  Search for a food item on the left panel, adjust portions, and click "Log Food Item" 
                  to start tracking your progress!
                </p>
              </div>
            )}
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
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  progressTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  progressVal: {
    fontSize: '1rem',
    color: '#ffffff',
  },
  progressFoot: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '6px',
  },
  trackerLayout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  formCard: {
    flex: '1 1 380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
    zIndex: 1000,
    marginTop: '4px',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  dropdownItem: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    transition: 'background 0.2s',
  },
  dropdownDetail: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  selectedFoodBox: {
    background: 'rgba(13, 148, 136, 0.08)',
    border: '1px solid rgba(13, 148, 136, 0.25)',
    borderRadius: '8px',
    padding: '1rem',
  },
  selectedFoodName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  foodMacroRow: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.8rem',
    color: '#2dd4bf',
    marginTop: '0.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  col6: {
    flex: 1,
    marginBottom: 0,
  },
  success: {
    color: '#10b981',
    fontSize: '0.8rem',
    textAlign: 'center',
    fontWeight: '500',
  },
  logsCard: {
    flex: '2 1 600px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '400px',
  },
  logsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '6px',
    color: '#ef4444',
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  logsBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.01)'
    }
  },
  td: {
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#e2e8f0',
  },
  emptyLogs: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '260px',
  }
};
const dropdownHoverStyle = {
  background: 'rgba(255,255,255,0.05)'
};
