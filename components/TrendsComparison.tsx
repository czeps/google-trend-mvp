import { useState } from 'react';
import { TrendMetrics } from '@/lib/types';
import { generateSparklineData } from '@/lib/metrics';

interface TrendsComparisonProps {
  trendMetrics: TrendMetrics[];
  dateRangeDays: number;
  width?: number;
  height?: number;
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6B7280'  // gray
];

export default function TrendsComparison({
  trendMetrics,
  dateRangeDays,
  width = 800,
  height = 400
}: TrendsComparisonProps) {
  const [hoveredTrend, setHoveredTrend] = useState<string | null>(null);
  const [selectedTrends, setSelectedTrends] = useState<Set<string>>(
    new Set(trendMetrics.slice(0, 5).map(tm => tm.trend_id))
  );

  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Get sparkline data for all trends
  const trendsData = trendMetrics.map(metric => ({
    ...metric,
    sparklineData: generateSparklineData(metric.posts, dateRangeDays),
    color: COLORS[metric.trend_id.length % COLORS.length]
  }));

  // Calculate global min/max for consistent scaling
  const allEngagementValues = trendsData.flatMap(trend =>
    trend.sparklineData.map(d => d.engagement)
  );
  const maxEngagement = Math.max(...allEngagementValues, 1);
  const minEngagement = Math.min(...allEngagementValues, 0);
  const range = maxEngagement - minEngagement || 1;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Emerging': return '🚀';
      case 'Declining': return '📉';
      default: return '📊';
    }
  };

  const toggleTrend = (trendId: string) => {
    const newSelected = new Set(selectedTrends);
    if (newSelected.has(trendId)) {
      newSelected.delete(trendId);
    } else {
      newSelected.add(trendId);
    }
    setSelectedTrends(newSelected);
  };

  const filteredTrends = trendsData.filter(trend => selectedTrends.has(trend.trend_id));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Trends Comparison</h2>

        {/* Trend Legend/Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {trendsData.map(trend => (
            <button
              key={trend.trend_id}
              onClick={() => toggleTrend(trend.trend_id)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                selectedTrends.has(trend.trend_id)
                  ? 'border-2 shadow-sm'
                  : 'border border-gray-300 opacity-60 hover:opacity-80'
              }`}
              style={{
                borderColor: selectedTrends.has(trend.trend_id) ? trend.color : undefined,
                backgroundColor: selectedTrends.has(trend.trend_id)
                  ? trend.color + '10'
                  : 'transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: trend.color }}
                />
                <span className="font-medium">{trend.trend.label}</span>
                <span className="text-xs">{getStatusIcon(trend.status)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          <g className="grid-lines">
            {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
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

          {/* Vertical grid lines */}
          <g className="vertical-grid-lines">
            {[0.25, 0.5, 0.75].map((ratio, i) => (
              <line
                key={i}
                x1={padding + chartWidth * ratio}
                y1={padding}
                x2={padding + chartWidth * ratio}
                y2={padding + chartHeight}
                stroke="#F3F4F6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
          </g>

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <text
              key={i}
              x={padding - 10}
              y={padding + chartHeight * (1 - ratio)}
              textAnchor="end"
              className="text-xs fill-gray-500"
              dy="0.35em"
            >
              {formatNumber(minEngagement + (maxEngagement - minEngagement) * ratio)}
            </text>
          ))}

          {/* Trend lines */}
          {filteredTrends.map(trend => {
            if (trend.sparklineData.length === 0) return null;

            const points = trend.sparklineData.map((d, i) => {
              const x = padding + (i / (trend.sparklineData.length - 1)) * chartWidth;
              const y = padding + chartHeight - ((d.engagement - minEngagement) / range) * chartHeight;
              return { x, y, engagement: d.engagement, date: d.date };
            });

            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return (
              <g key={trend.trend_id}>
                {/* Area fill with hover */}
                <path
                  d={`M ${padding} ${padding + chartHeight} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${padding + chartWidth} ${padding + chartHeight} Z`}
                  fill={trend.color}
                  fillOpacity={hoveredTrend === trend.trend.slug ? 0.3 : 0.1}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredTrend(trend.trend.slug)}
                  onMouseLeave={() => setHoveredTrend(null)}
                />

                {/* Invisible wider line for easier hovering */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTrend(trend.trend.slug)}
                  onMouseLeave={() => setHoveredTrend(null)}
                />

                {/* Visible line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={trend.color}
                  strokeWidth={hoveredTrend === trend.trend.slug ? 4 : 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300 pointer-events-none"
                />

                {/* Data points */}
                {points.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r={hoveredTrend === trend.trend.slug ? "5" : "3"}
                    fill={trend.color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Fixed position hover info */}
        {hoveredTrend && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border z-10">
            {(() => {
              const trend = filteredTrends.find(t => t.trend.slug === hoveredTrend);
              if (!trend) return null;
              return (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: trend.color }}
                    />
                    <span className="font-medium text-sm">{trend.trend.label}</span>
                    <span className="text-xs">{getStatusIcon(trend.status)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Total: {formatNumber(trend.total_engagement)}
                  </div>
                  <div className="text-xs text-gray-600">
                    WoW: {(trend.wow_growth_pct * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="relative mt-2 px-10">
        <div className="flex justify-between text-xs text-gray-500">
          {(() => {
            // Get all unique dates from all trends and sort them
            const allDates = Array.from(new Set(
              trendsData.flatMap(trend =>
                trend.sparklineData.map(d => d.date)
              ).filter(Boolean)
            )).sort();

            if (allDates.length === 0) return null;

            // Show first, middle, and last dates for better context
            const startDate = allDates[0];
            const endDate = allDates[allDates.length - 1];
            const middleDate = allDates[Math.floor(allDates.length / 2)];

            return (
              <>
                <span>{formatDate(startDate)}</span>
                <span className="absolute left-1/2 transform -translate-x-1/2">
                  {formatDate(middleDate)}
                </span>
                <span>{formatDate(endDate)}</span>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}