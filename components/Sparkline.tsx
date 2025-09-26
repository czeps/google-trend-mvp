import { useState } from 'react';

interface SparklineProps {
  data: { date: string; engagement: number }[];
  width?: number;
  height?: number;
  color?: string;
  showGlow?: boolean;
}

export default function Sparkline({
  data,
  width = 400,
  height = 120,
  color = '#3B82F6',
  showGlow = true
}: SparklineProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; engagement: number; date: string } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  const padding = 25;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.engagement - minEngagement) / range) * chartHeight;
    return { x, y, engagement: d.engagement, date: d.date };
  });

  // Create smooth curve using cubic bezier curves
  const createSmoothPath = (points: any[]) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      const next = points[i + 1];

      if (i === 1) {
        // First curve
        const cp1x = previous.x + (current.x - previous.x) * 0.3;
        const cp1y = previous.y;
        const cp2x = current.x - (current.x - previous.x) * 0.3;
        const cp2y = current.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
      } else if (i === points.length - 1) {
        // Last curve
        const cp1x = previous.x + (current.x - previous.x) * 0.3;
        const cp1y = previous.y;
        const cp2x = current.x - (current.x - previous.x) * 0.3;
        const cp2y = current.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
      } else {
        // Middle curves with smoother control points
        const prevPoint = points[i - 2] || previous;
        const cp1x = previous.x + (current.x - prevPoint.x) * 0.15;
        const cp1y = previous.y + (current.y - prevPoint.y) * 0.15;
        const cp2x = current.x - (next.x - previous.x) * 0.15;
        const cp2y = current.y - (next.y - previous.y) * 0.15;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
      }
    }

    return path;
  };

  const smoothPath = createSmoothPath(points);
  const areaPath = `${smoothPath} L ${padding + chartWidth} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const uniqueId = `sparkline-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredPoint(null);
      }}
    >
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>

          {showGlow && (
            <filter id={`glow-${uniqueId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}

          <filter id={`shadow-${uniqueId}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
          </filter>
        </defs>

        {/* Background grid - subtle */}
        <g className="grid-lines" opacity={isHovered ? "0.8" : "0.4"}>
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + chartHeight * ratio}
              x2={padding + chartWidth}
              y2={padding + chartHeight * ratio}
              stroke="#E5E7EB"
              strokeWidth="0.5"
              strokeDasharray="4,4"
              className="transition-all duration-300"
              style={{
                strokeOpacity: isHovered ? 0.8 : 0.3
              }}
            />
          ))}
        </g>

        {/* Area fill with gradient */}
        <path
          d={areaPath}
          fill={`url(#gradient-${uniqueId})`}
          className="transition-all duration-700 ease-in-out"
          style={{
            filter: showGlow ? `url(#shadow-${uniqueId})` : undefined,
            opacity: isHovered ? 0.9 : 0.7
          }}
        />

        {/* Main line with glow effect */}
        <path
          d={smoothPath}
          fill="none"
          stroke={color}
          strokeWidth={isHovered ? "4.5" : "3.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: showGlow && isHovered ? `url(#glow-${uniqueId})` : undefined,
            opacity: isHovered ? 1.0 : 0.85,
            strokeDasharray: isHovered ? undefined : undefined,
            transform: isHovered ? 'scale(1.01)' : 'scale(1)',
            transformOrigin: 'center'
          }}
        />

        {/* Data points */}
        {points.map((point, i) => {
          const isHighlighted = hoveredPoint?.x === point.x;
          const isStart = i === 0;
          const isEnd = i === points.length - 1;

          return (
            <g key={i}>
              {/* Point glow effect */}
              {(isHighlighted || isStart || isEnd) && showGlow && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHighlighted ? "12" : "8"}
                  fill={color}
                  opacity="0.2"
                  className="transition-all duration-200"
                />
              )}

              {/* Main point */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isHighlighted ? "6" : isStart || isEnd ? "5" : "4"}
                fill={isHighlighted ? "#ffffff" : color}
                stroke={color}
                strokeWidth={isHighlighted ? "3" : "2"}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  filter: isHighlighted ? `url(#shadow-${uniqueId})` : undefined
                }}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Inner dot for highlighted point */}
              {isHighlighted && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill={color}
                  className="transition-all duration-200"
                />
              )}
            </g>
          );
        })}
      </svg>

      {hoveredPoint && (
        <div
          className="absolute bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm pointer-events-none z-10 animate-in fade-in duration-200 slide-in-from-bottom-2"
          style={{
            left: hoveredPoint.x - 60,
            top: hoveredPoint.y - 65,
            transform: 'translateX(-50%)',
            backdropFilter: 'blur(8px)',
            background: 'rgba(17, 24, 39, 0.95)'
          }}
        >
          <div className="font-bold text-base text-blue-200">{formatNumber(hoveredPoint.engagement)}</div>
          <div className="text-xs text-gray-300 mt-1">{formatDate(hoveredPoint.date)}</div>
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
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