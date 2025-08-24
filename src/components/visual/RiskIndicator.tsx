import React from 'react';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'none';

interface RiskIndicatorProps {
  level: RiskLevel;
  label: string;
  value?: string | number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ 
  level, 
  label, 
  value, 
  size = 'medium',
  showIcon = true 
}) => {
  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return {
          color: '#34C759',
          bgColor: '#E8F5E8',
          icon: '✓',
          text: 'Düşük Risk'
        };
      case 'moderate':
        return {
          color: '#FF9500',
          bgColor: '#FFF4E6',
          icon: '⚠',
          text: 'Orta Risk'
        };
      case 'high':
        return {
          color: '#FF3B30',
          bgColor: '#FFE6E6',
          icon: '⚠',
          text: 'Yüksek Risk'
        };
      case 'none':
      default:
        return {
          color: '#8E8E93',
          bgColor: '#F2F2F7',
          icon: '—',
          text: 'Veri Yok'
        };
    }
  };

  const config = getRiskConfig(level);
  const sizeClass = `risk-indicator-${size}`;

  return (
    <div className={`risk-indicator ${sizeClass} risk-${level}`}>
      {showIcon && (
        <div className="risk-icon" style={{ color: config.color }}>
          {config.icon}
        </div>
      )}
      <div className="risk-content">
        <div className="risk-label">{label}</div>
        {value && <div className="risk-value">{value}</div>}
        <div className="risk-status" style={{ color: config.color }}>
          {config.text}
        </div>
      </div>
    </div>
  );
};

export default RiskIndicator;