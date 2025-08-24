import React from 'react';
import RiskIndicator from './RiskIndicator';
import type { RiskLevel } from './RiskIndicator';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  riskLevel: RiskLevel;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  expanded?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  riskLevel,
  description,
  trend,
  size = 'medium',
  onClick,
  expanded = false
}) => {
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'low': return '#34C759';
      case 'moderate': return '#FF9500';
      case 'high': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '';
    }
  };

  const riskColor = getRiskColor(riskLevel);

  return (
    <div 
      className={`metric-card metric-card-${size} ${onClick ? 'metric-card-clickable' : ''} ${expanded ? 'metric-card-expanded' : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: riskColor }}
    >
      <div className="metric-card-header">
        <div className="metric-card-title">{title}</div>
        {trend && (
          <div className="metric-card-trend" style={{ color: riskColor }}>
            {getTrendIcon(trend)}
          </div>
        )}
      </div>
      
      <div className="metric-card-body">
        <div className="metric-card-value">
          <span className="metric-value">{value}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        
        <RiskIndicator 
          level={riskLevel}
          label=""
          showIcon={true}
          size="small"
        />
      </div>

      {description && (
        <div className="metric-card-description">
          {description}
        </div>
      )}

      {expanded && onClick && (
        <div className="metric-card-details">
          <div className="metric-card-expand-hint">
            Detaylar için tıklayın →
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;