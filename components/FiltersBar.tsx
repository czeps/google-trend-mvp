import { DashboardFilters, DatePreset } from '@/lib/types';

interface FiltersBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  availableSearchTerms: string[];
}

const datePresets: DatePreset[] = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

export default function FiltersBar({
  filters,
  onFiltersChange,
  availableSearchTerms
}: FiltersBarProps) {
  const handleSearchTermToggle = (searchTerm: string) => {
    const newTerms = filters.search_terms.includes(searchTerm)
      ? filters.search_terms.filter(term => term !== searchTerm)
      : [...filters.search_terms, searchTerm];

    onFiltersChange({ ...filters, search_terms: newTerms });
  };

  const handleDatePresetChange = (value: number) => {
    onFiltersChange({ ...filters, date_preset: value });
  };

  const handleMinEngagementChange = (value: number) => {
    onFiltersChange({ ...filters, min_engagement: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Terms
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSearchTerms.map(term => (
              <button
                key={term}
                onClick={() => handleSearchTermToggle(term)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filters.search_terms.includes(term)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex gap-2">
            {datePresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => handleDatePresetChange(preset.value)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  filters.date_preset === preset.value
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Engagement: {filters.min_engagement}
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={filters.min_engagement}
            onChange={(e) => handleMinEngagementChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>5000</span>
          </div>
        </div>
      </div>
    </div>
  );
}