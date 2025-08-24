import React from 'react';

interface GaugeChartProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  size?: number;
  thresholds?: {
    low: number;
    moderate: number;
  };
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min,
  max,
  label,
  unit = '',
  size = 200,
  thresholds
}) => {
  const radius = size * 0.35;
  const strokeWidth = size * 0.08;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * Math.PI; // Half circle
  
  // Calculate the position of the value on the gauge
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const strokeDashoffset = circumference - (percentage * circumference);

  // Determine color based on thresholds
  const getColor = () => {
    if (!thresholds) return '#000000';
    if (value <= thresholds.low) return '#34C759'; // Low - Green
    if (value <= thresholds.moderate) return '#FF9500'; // Moderate - Orange
    return '#FF3B30'; // High - Red
  };

  const color = getColor();

  return (
    <div className="gauge-chart" style={{ width: size, height: size * 0.6 }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth} ${size * 0.5} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth} ${size * 0.5}`}
          fill="none"
          stroke="#E5E5E7"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <path
          d={`M ${strokeWidth} ${size * 0.5} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth} ${size * 0.5}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="gauge-progress"
        />
      </svg>
      
      <div className="gauge-content">
        <div className="gauge-value" style={{ color }}>
          {value}{unit}
        </div>
        <div className="gauge-label">{label}</div>
        <div className="gauge-range">
          {min} - {max}{unit}
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;