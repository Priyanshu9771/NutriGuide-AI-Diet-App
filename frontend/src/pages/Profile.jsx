// Profile.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SafetyWarning from '../components/SafetyWarning';
import { Save, ChevronRight, ChevronLeft, Calculator, UserCheck, HelpCircle, Activity, Heart, Shield } from 'lucide-react';

export default function Profile({ onProfileSaved }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    gender: 'male',
    height: 170,
    weight: 65,
    goal: 'maintenance',
    activity_level: 'sedentary',
    food_preference: 'vegetarian',
    budget: 'medium',
    medical_conditions: ['none'],
    allergies: ['none'],
    gym_status: 'non-gym user',
    is_pregnant: false
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load existing profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        if (data) {
          setFormData(data);
          // Run calculation automatically to show existing calculations
          const calc = await api.calculateHealth(data);
          setResults(calc);
        }
      } catch (err) {
        // Safe to ignore on first load if no profile exists
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (category, value) => {
    setFormData((prev) => {
      let items = [...prev[category]];
      
      if (value === 'none') {
        items = ['none'];
      } else {
        items = items.filter(i => i !== 'none');
        
        if (items.includes(value)) {
          items = items.filter(i => i !== value);
          if (items.length === 0) items = ['none'];
        } else {
          items.push(value);
        }
      }
      
      return { ...prev, [category]: items };
    });
  };

  const handlePregnancyToggle = () => {
    setFormData(prev => ({ ...prev, is_pregnant: !prev.is_pregnant }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      alert("Please enter your name to proceed.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Save profile to JSON db
      await api.saveProfile(formData);
      // 2. Fetch targets
      const calc = await api.calculateHealth(formData);
      setResults(calc);
      setSuccess(true);
      if (onProfileSaved) {
        onProfileSaved(); // Notify parent to refresh dashboard
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const medicalOptions = ['diabetes', 'blood pressure', 'thyroid', 'kidney disease', 'acidity'];
  const allergyOptions = ['milk', 'nuts', 'gluten', 'eggs'];

  // Switch statement to render steps
  const renderStepFields = () => {
    switch (step) {
      case 1:
        return (
          <div className="fade-in-up" style={styles.stepBlock}>
            <div style={styles.stepHeader}>
              <UserCheck size={20} color="#2dd4bf" />
              <h4 style={styles.stepTitle}>Step 1: Basic Stats</h4>
            </div>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange}
                placeholder="Enter your name" 
                className="form-input" 
              />
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={styles.col6}>
                <label className="form-label">Age (years)</label>
                <input 
                  type="number" 
                  name="age" 
                  required 
                  value={formData.age} 
                  onChange={handleChange}
                  min="1" 
                  max="120" 
                  className="form-input" 
                />
              </div>
              <div className="form-group" style={styles.col6}>
                <label className="form-label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={styles.col6}>
                <label className="form-label">Height (cm)</label>
                <input 
                  type="number" 
                  name="height" 
                  required 
                  value={formData.height} 
                  onChange={handleChange}
                  min="50" 
                  max="250" 
                  className="form-input" 
                />
              </div>
              <div className="form-group" style={styles.col6}>
                <label className="form-label">Weight (kg)</label>
                <input 
                  type="number" 
                  name="weight" 
                  required 
                  value={formData.weight} 
                  onChange={handleChange}
                  min="10" 
                  max="300" 
                  className="form-input" 
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="fade-in-up" style={styles.stepBlock}>
            <div style={styles.stepHeader}>
              <Activity size={20} color="#6366f1" />
              <h4 style={styles.stepTitle}>Step 2: Goals & Activity</h4>
            </div>

            <div className="form-group">
              <label className="form-label">Health & Fitness Goal</label>
              <select name="goal" value={formData.goal} onChange={handleChange} className="form-select">
                <option value="maintenance">Maintenance (Stay Fit & Healthy)</option>
                <option value="weight_loss">Weight Loss (Fat Loss)</option>
                <option value="muscle_gain">Muscle Gain (Build Lean Mass)</option>
                <option value="weight_gain">Weight Gain (Increase Bulk)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Activity Level</label>
              <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="form-select">
                <option value="sedentary">Sedentary (Little to no exercise, desk job)</option>
                <option value="light">Light Active (1-3 days/week of light exercise)</option>
                <option value="moderate">Moderate Active (3-5 days/week of moderate gym/sports)</option>
                <option value="active">Very Active (6-7 days/week of intense physical work)</option>
              </select>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={styles.col12}>
                <label className="form-label">Gym Workout Status</label>
                <select name="gym_status" value={formData.gym_status} onChange={handleChange} className="form-select">
                  <option value="non-gym user">Non-Gym User</option>
                  <option value="gym user">Gym User (Regular Weightlifting/Cardio)</option>
                </select>
              </div>
            </div>

            {formData.gender === 'female' && (
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <div 
                  className={`checkbox-label ${formData.is_pregnant ? 'active' : ''}`}
                  onClick={handlePregnancyToggle}
                  style={{ width: 'fit-content' }}
                >
                  <span>Currently Pregnant / Lactating</span>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="fade-in-up" style={styles.stepBlock}>
            <div style={styles.stepHeader}>
              <Shield size={20} color="#10b981" />
              <h4 style={styles.stepTitle}>Step 3: Medical Flags & Preferences</h4>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={styles.col6}>
                <label className="form-label">Food Preference</label>
                <select name="food_preference" value={formData.food_preference} onChange={handleChange} className="form-select">
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="eggitarian">Eggitarian (Veg + Eggs)</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
              <div className="form-group" style={styles.col6}>
                <label className="form-label">Diet Budget</label>
                <select name="budget" value={formData.budget} onChange={handleChange} className="form-select">
                  <option value="low">Low Budget (Staples like Dal, Rice, Eggs)</option>
                  <option value="medium">Medium Budget (Paneer, Fruits, Oats)</option>
                  <option value="high">High Budget (Almonds, Salmon, Whey Protein)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Medical Conditions</label>
              <div className="checkbox-grid">
                <div 
                  className={`checkbox-label ${formData.medical_conditions.includes('none') ? 'active' : ''}`}
                  onClick={() => handleCheckboxChange('medical_conditions', 'none')}
                >
                  <span>None</span>
                </div>
                {medicalOptions.map(cond => (
                  <div 
                    key={cond}
                    className={`checkbox-label ${formData.medical_conditions.includes(cond) ? 'active' : ''}`}
                    onClick={() => handleCheckboxChange('medical_conditions', cond)}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Allergies (Exclusions)</label>
              <div className="checkbox-grid">
                <div 
                  className={`checkbox-label ${formData.allergies.includes('none') ? 'active' : ''}`}
                  onClick={() => handleCheckboxChange('allergies', 'none')}
                >
                  <span>None</span>
                </div>
                {allergyOptions.map(allergy => (
                  <div 
                    key={allergy}
                    className={`checkbox-label ${formData.allergies.includes(allergy) ? 'active' : ''}`}
                    onClick={() => handleCheckboxChange('allergies', allergy)}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{allergy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container} className="fade-in-up">
      <div style={styles.headerRow}>
        <h1 className="section-title">Health Profile Calculator</h1>
        <p className="section-subtitle">Define your parameters to compute tailored medical targets.</p>
      </div>

      <div style={styles.contentLayout}>
        {/* Form Panel */}
        <div className="glass-card" style={styles.formCard}>
          {/* Stepper Progress Bar */}
          <div className="stepper-container">
            <div className="step-wrapper">
              <div className={`step-circle ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
              <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
            </div>
            <div className="step-wrapper">
              <div className={`step-circle ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
              <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
            </div>
            <div className="step-wrapper">
              <div className={`step-circle ${step === 3 ? 'active' : ''}`}>3</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.formElement}>
            {renderStepFields()}

            {/* Stepper Buttons */}
            <div style={styles.btnRow}>
              {step > 1 && (
                <button type="button" onClick={handleBack} className="btn btn-secondary" style={styles.flexBtn}>
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  type="button" 
                  onClick={handleNext} 
                  className="btn btn-primary" 
                  style={{ ...styles.flexBtn, marginLeft: step === 1 ? 'auto' : '0' }}
                >
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn btn-primary" 
                  style={{ ...styles.flexBtn, flex: 2 }}
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={16} />}
                  <span>Calculate & Save</span>
                </button>
              )}
            </div>

            {success && <p style={styles.successText}>✓ Profile saved and recalculated successfully!</p>}
            {error && <p style={styles.errorText}>{error}</p>}
          </form>
        </div>

        {/* Results Panel */}
        <div style={styles.resultsWrapper}>
          {results ? (
            <div className="glass-card" style={styles.resultsCard}>
              <h3 style={styles.resultsTitle}>Calculated Health Metrics</h3>
              
              <div style={styles.bmiDial}>
                <div style={styles.bmiVal}>{results.bmi}</div>
                <div style={styles.bmiLabel}>Your BMI (Category: {results.bmi_category})</div>
              </div>

              <div style={styles.metricsList}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Daily Calorie Target:</span>
                  <strong style={styles.metricValue}>{results.calorie_target} kcal</strong>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Basal Metabolic Rate (BMR):</span>
                  <strong style={styles.metricValue}>{results.bmr} kcal</strong>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Total Energy Expenditure (TDEE):</span>
                  <strong style={styles.metricValue}>{results.tdee} kcal</strong>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Daily Water Suggestion:</span>
                  <strong style={styles.metricValue}><span style={{ color: '#2dd4bf' }}>{results.water_target} Liters</span></strong>
                </div>
              </div>

              <div style={styles.macroSplit}>
                <h4 style={styles.macroHeading}>Daily Macronutrient Target</h4>
                <div style={styles.macroGrid}>
                  <div style={styles.macroCol}>
                    <div style={{...styles.macroColorBlock, backgroundColor: '#10b981'}}></div>
                    <div>
                      <div style={styles.macroName}>Protein</div>
                      <div style={styles.macroVal}>{results.protein_target}g</div>
                    </div>
                  </div>
                  <div style={styles.macroCol}>
                    <div style={{...styles.macroColorBlock, backgroundColor: '#3b82f6'}}></div>
                    <div>
                      <div style={styles.macroName}>Carbohydrates</div>
                      <div style={styles.macroVal}>{results.carb_target}g</div>
                    </div>
                  </div>
                  <div style={styles.macroCol}>
                    <div style={{...styles.macroColorBlock, backgroundColor: '#f59e0b'}}></div>
                    <div>
                      <div style={styles.macroName}>Fats</div>
                      <div style={styles.macroVal}>{results.fat_target}g</div>
                    </div>
                  </div>
                </div>
              </div>

              <SafetyWarning warnings={results.warnings} />
            </div>
          ) : (
            <div className="glass-card" style={styles.emptyCard}>
              <HelpCircle size={48} color="#64748b" />
              <h3>No Calculations Yet</h3>
              <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Complete the 3-step wizard on the left and click "Calculate & Save" 
                to output your calorie targets and safety warnings!
              </p>
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
    marginBottom: '2rem',
  },
  contentLayout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  formCard: {
    flex: '1.2 1 500px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '440px',
  },
  formElement: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
  },
  stepBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    flex: 1,
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
  },
  stepTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: "'Outfit', sans-serif",
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  col6: {
    flex: '1 1 200px',
    marginBottom: 0,
  },
  col12: {
    flex: '1 1 100%',
    marginBottom: 0,
  },
  btnRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  flexBtn: {
    flex: 1,
  },
  successText: {
    color: '#10b981',
    fontSize: '0.85rem',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '1rem',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginTop: '1rem',
  },
  resultsWrapper: {
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: '20px',
  },
  resultsCard: {
    borderLeft: '4px solid #2dd4bf',
  },
  resultsTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '1.5rem',
    fontFamily: "'Outfit', sans-serif",
  },
  bmiDial: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    marginBottom: '1.5rem',
  },
  bmiVal: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#2dd4bf',
    fontFamily: "'Outfit', sans-serif",
  },
  bmiLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: '500',
  },
  metricsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    marginBottom: '1.5rem',
  },
  metricItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.5rem',
  },
  metricLabel: {
    color: '#94a3b8',
  },
  metricValue: {
    color: '#ffffff',
  },
  macroSplit: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--border-glass)',
    marginBottom: '1.5rem',
  },
  macroHeading: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '0.75rem',
  },
  macroGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  macroCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: '1 1 100px',
  },
  macroColorBlock: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
  },
  macroName: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  macroVal: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyCard: {
    minHeight: '350px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem',
    borderStyle: 'dashed',
    borderWidth: '2px',
  }
};
