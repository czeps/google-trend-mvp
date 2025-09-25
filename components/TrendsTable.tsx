import { TrendMetrics } from '@/lib/types';

interface TrendsTableProps {
  trendMetrics: TrendMetrics[];
  onRowClick: (trendMetric: TrendMetrics) => void;
  sortBy: keyof TrendMetrics;
  sortOrder: 'asc' | 'desc';
  onSort: (field: keyof TrendMetrics) => void;
}

export default function TrendsTable({
  trendMetrics,
  onRowClick,
  sortBy,
  sortOrder,
  onSort
}: TrendsTableProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (pct: number): string => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${(pct * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Emerging': return '🚀';
      case 'Declining': return '📉';
      default: return '📊';
    }
  };

  const getSortIcon = (field: keyof TrendMetrics): string => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSort = (field: keyof TrendMetrics) => {
    onSort(field);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('trend')}
              >
                Trend {getSortIcon('trend')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('posts')}
              >
                Posts {getSortIcon('posts')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_engagement')}
              >
                Total Engagement {getSortIcon('total_engagement')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('wow_growth_pct')}
              >
                WoW Δ% {getSortIcon('wow_growth_pct')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('first_seen')}
              >
                First Seen {getSortIcon('first_seen')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('last_seen')}
              >
                Last Seen {getSortIcon('last_seen')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trendMetrics.map((metric, index) => (
              <tr
                key={metric.trend_id}
                onClick={() => onRowClick(metric)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {metric.trend.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {metric.trend.slug}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {metric.posts.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(metric.total_engagement)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`${
                    metric.wow_growth_pct >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(metric.wow_growth_pct)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center">
                    {getStatusIcon(metric.status)} {metric.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(metric.first_seen)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(metric.last_seen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trendMetrics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No trends found matching current filters.</p>
        </div>
      )}
    </div>
  );
}