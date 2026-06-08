// SafetyWarning.jsx
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function SafetyWarning({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>
        <AlertTriangle size={18} color="#ef4444" />
        <span>Nutritional Safety & Clinical Warnings</span>
      </h4>
      <div style={styles.list}>
        {warnings.map((warning, index) => {
          const isCritical = warning.includes('⚠️') || warning.includes('Kidney') || warning.includes('Low BMI') || warning.includes('Diabetes');
          return (
            <div 
              key={index} 
              className={isCritical ? 'warning-box' : 'notice-box'}
              style={{ margin: '0.5rem 0' }}
            >
              <div style={styles.iconCol}>
                {isCritical ? (
                  <AlertTriangle size={16} color="#ef4444" style={{ marginTop: '2px' }} />
                ) : (
                  <Info size={16} color="#f59e0b" style={{ marginTop: '2px' }} />
                )}
              </div>
              <div style={styles.textCol}>
                <p style={styles.text}>{warning.replace(/^[⚠️🔄💡\s]+/, '')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: '2rem',
    width: '100%',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '0.75rem',
    fontFamily: "'Outfit', sans-serif",
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  iconCol: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  textCol: {
    flex: 1,
  },
  text: {
    fontSize: '0.85rem',
    lineHeight: '1.4',
    color: '#f8fafc',
  }
};
