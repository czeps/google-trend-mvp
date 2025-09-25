import { useState } from 'react';

interface SparklineProps {
  data: { date: string; engagement: number }[];
  width?: number;
  height?: number;
}

export default function Sparkline({ data, width = 400, height = 120 }: SparklineProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; engagement: number; date: string } | null>(null);
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  const maxEngagement = Math.max(...data.map(d => d.engagement));
  const minEngagement = Math.min(...data.map(d => d.engagement));
  const range = maxEngagement - minEngagement || 1;

  const padding = 20;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.engagement - minEngagement) / range) * chartHeight;
    return { x, y, engagement: d.engagement, date: d.date };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaData = `M ${padding} ${padding + chartHeight} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${padding + chartWidth} ${padding + chartHeight} Z`;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g className="grid-lines">
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + chartHeight * ratio}
              x2={padding + chartWidth}
              y2={padding + chartHeight * ratio}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        <path
          d={areaData}
          fill="url(#sparklineGradient)"
          className="transition-all duration-300"
        />

        <path
          d={pathData}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint?.x === point.x ? "6" : "4"}
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>

      {hoveredPoint && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
          style={{
            left: hoveredPoint.x - 50,
            top: hoveredPoint.y - 50,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold">{formatNumber(hoveredPoint.engagement)}</div>
          <div className="text-xs text-gray-300">{formatDate(hoveredPoint.date)}</div>
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
          />
        </div>
      )}

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{formatDate(data[0]?.date || '')}</span>
        <span className="font-medium text-gray-700">
          Peak: {formatNumber(maxEngagement)}
        </span>
        <span>{formatDate(data[data.length - 1]?.date || '')}</span>
      </div>

      <div className="absolute -left-2 top-4 text-xs text-gray-500">
        {formatNumber(maxEngagement)}
      </div>
      <div className="absolute -left-2 bottom-8 text-xs text-gray-500">
        {formatNumber(minEngagement)}
      </div>
    </div>
  );
}