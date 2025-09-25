import { TrendMetrics } from '@/lib/types';

interface PostCountChartProps {
  trendMetrics: TrendMetrics[];
  width?: number;
  height?: number;
  onTrendClick?: (trend: TrendMetrics) => void;
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280',
  '#14B8A6', '#F43F5E', '#8B5A3C', '#6366F1', '#22C55E'
];

export default function PostCountChart({
  trendMetrics,
  width = 900,
  height = 600,
  onTrendClick
}: PostCountChartProps) {
  // Sort trends by post count and take top 12 for better readability
  const sortedTrends = [...trendMetrics]
    .sort((a, b) => b.posts.length - a.posts.length)
    .slice(0, 12);

  const maxPosts = Math.max(...sortedTrends.map(trend => trend.posts.length), 1);

  // Use fixed dimensions for better control
  const chartPadding = { top: 20, right: 120, bottom: 60, left: 200 };
  const chartWidth = width - chartPadding.left - chartPadding.right;
  const chartHeight = height - chartPadding.top - chartPadding.bottom;
  const barHeight = Math.max(30, Math.min(50, chartHeight / sortedTrends.length - 12));
  const actualChartHeight = sortedTrends.length * (barHeight + 12) - 12;

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Emerging': return '🚀';
      case 'Declining': return '📉';
      default: return '📊';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Emerging': return '#10B981'; // green
      case 'Declining': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  // Helper to truncate long trend names
  const truncateLabel = (label: string, maxLength = 25) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Trends by Post Count
        </h2>
        <p className="text-sm text-gray-600">
          Top trends ranked by number of social media posts
        </p>
      </div>

      <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6">
        <svg width={width} height={Math.max(height, actualChartHeight + chartPadding.top + chartPadding.bottom)} className="overflow-visible">
          {/* Grid lines */}
          <g className="grid-lines">
            {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={chartPadding.left + chartWidth * ratio}
                y1={chartPadding.top}
                x2={chartPadding.left + chartWidth * ratio}
                y2={chartPadding.top + actualChartHeight}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
          </g>

          {/* X-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <text
              key={i}
              x={chartPadding.left + chartWidth * ratio}
              y={chartPadding.top + actualChartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {Math.round(maxPosts * ratio)}
            </text>
          ))}

          {/* Bars and labels */}
          {sortedTrends.map((trend, i) => {
            const barWidth = Math.max((trend.posts.length / maxPosts) * chartWidth, 8);
            const yPos = chartPadding.top + i * (barHeight + 12);
            const color = COLORS[i % COLORS.length];

            return (
              <g key={trend.trend_id}>
                {/* Background bar */}
                <rect
                  x={chartPadding.left}
                  y={yPos}
                  width={chartWidth}
                  height={barHeight}
                  fill="#F3F4F6"
                  rx="6"
                />

                {/* Data bar */}
                <rect
                  x={chartPadding.left}
                  y={yPos}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx="6"
                />

                {/* Trend label - positioned to the left with better spacing */}
                <text
                  x={chartPadding.left - 15}
                  y={yPos + barHeight / 2}
                  textAnchor="end"
                  className="text-sm fill-gray-700 font-medium"
                  dy="0.35em"
                  style={{ fontSize: '13px' }}
                >
                  {truncateLabel(trend.trend.label, 22)}
                </text>

                {/* Status indicator */}
                <circle
                  cx={chartPadding.left - 6}
                  cy={yPos + barHeight / 2}
                  r="4"
                  fill={getStatusColor(trend.status)}
                />
                <text
                  x={chartPadding.left - 6}
                  y={yPos + barHeight / 2}
                  textAnchor="middle"
                  className="text-xs"
                  dy="0.35em"
                  style={{ fontSize: '10px' }}
                >
                  {getStatusIcon(trend.status)}
                </text>

                {/* Post count label - inside the bar if long enough, outside if short */}
                <text
                  x={barWidth > 100 ? chartPadding.left + barWidth - 8 : chartPadding.left + barWidth + 8}
                  y={yPos + barHeight / 2}
                  textAnchor={barWidth > 100 ? "end" : "start"}
                  className={`text-sm font-semibold ${barWidth > 100 ? 'fill-white' : 'fill-gray-600'}`}
                  dy="0.35em"
                  style={{ fontSize: '12px' }}
                >
                  {trend.posts.length}
                </text>

                {/* Clickable area for interaction */}
                <rect
                  x={0}
                  y={yPos - 2}
                  width={width}
                  height={barHeight + 4}
                  fill="transparent"
                  className="cursor-pointer"
                  rx="4"
                  onClick={() => onTrendClick?.(trend)}
                >
                  <title>
                    {trend.trend.label}: {trend.posts.length} posts
                    {'\n'}Total Engagement: {formatNumber(trend.total_engagement)}
                    {'\n'}Status: {trend.status}
                    {'\n'}WoW Growth: {(trend.wow_growth_pct * 100).toFixed(1)}%
                    {onTrendClick ? '\n\nClick to view details' : ''}
                  </title>
                </rect>
              </g>
            );
          })}

          {/* X-axis line */}
          <line
            x1={chartPadding.left}
            y1={chartPadding.top + actualChartHeight}
            x2={chartPadding.left + chartWidth}
            y2={chartPadding.top + actualChartHeight}
            stroke="#9CA3AF"
            strokeWidth="1"
          />

          {/* X-axis title */}
          <text
            x={chartPadding.left + chartWidth / 2}
            y={chartPadding.top + actualChartHeight + 40}
            textAnchor="middle"
            className="text-sm fill-gray-600 font-medium"
          >
            Number of Posts
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>🚀 Emerging</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>📉 Declining</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span>📊 Stable</span>
        </div>
      </div>
    </div>
  );
}