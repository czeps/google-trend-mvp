import { KPIData } from '@/lib/types';

interface KPICardsProps {
  kpis: KPIData;
}

export default function KPICards({ kpis }: KPICardsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const cards = [
    {
      title: 'Active Trends',
      value: kpis.active_trends,
      icon: '📈',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Eligible Posts',
      value: kpis.eligible_posts,
      icon: '📝',
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Total Engagement',
      value: formatNumber(kpis.total_engagement),
      icon: '💫',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'New Trends',
      value: kpis.new_trends,
      icon: '🚀',
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border rounded-lg p-6 transition-shadow hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
            <div className="text-2xl">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}