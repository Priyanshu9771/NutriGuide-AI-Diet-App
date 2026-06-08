// StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color, description, progress }) {
  const accentColor = color || '#0d9488';
  
  return (
    <div className="glass-card" style={styles.card}>
      <div style={styles.header}>
        <div>
          <p style={styles.title}>{title}</p>
          <h3 style={styles.value}>
            {value} <span style={styles.unit}>{unit}</span>
          </h3>
        </div>
        <div style={{ ...styles.iconWrapper, backgroundColor: `${accentColor}1A` }}>
          <Icon size={24} color={accentColor} />
        </div>
      </div>
      
      {progress !== undefined && (
        <div style={styles.progressContainer}>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${Math.min(progress, 100)}%`, 
                backgroundColor: accentColor 
              }} 
            />
          </div>
          <div style={styles.progressLabel}>
            <span>{Math.round(progress)}% Completed</span>
          </div>
        </div>
      )}
      
      {description && <p style={styles.desc}>{description}</p>}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  title: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem',
  },
  value: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.2',
  },
  unit: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#64748b',
    marginLeft: '2px',
  },
  iconWrapper: {
    padding: '0.75rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: '0.5rem',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '4px',
  },
  desc: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.5rem',
  }
};
