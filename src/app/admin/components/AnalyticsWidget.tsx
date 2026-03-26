'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

interface ServiceBreakdown {
  service: string;
  count: number;
  percentage: number;
}

interface DailyTrend {
  date: string;
  total: number;
  confirmed: number;
  cancelled: number;
}

interface AnalyticsWidgetProps {
  className?: string;
}

export default function AnalyticsWidget({ className = '' }: AnalyticsWidgetProps) {
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceBreakdown[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case '7d': {
        const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString();
      }
      case '30d': {
        const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString();
      }
      case '90d': {
        const d = new Date(now); d.setDate(d.getDate() - 90); return d.toISOString();
      }
      case 'all': return null;
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let query = supabase.from('bookings').select('id, status, service_type, created_at');
      const startDate = getStartDate();
      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      const { data: bookings, error } = await query;
      if (error) throw error;

      const allBookings = bookings || [];

      // Status counts
      const bookingStats: BookingStats = {
        total: allBookings.length,
        pending: allBookings.filter(b => b.status === 'pending').length,
        confirmed: allBookings.filter(b => b.status === 'confirmed').length,
        completed: allBookings.filter(b => b.status === 'completed').length,
        cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      };
      setStats(bookingStats);

      // Service breakdown
      const serviceMap = new Map<string, number>();
      allBookings.forEach(b => {
        const svc = b.service_type || 'Unknown';
        serviceMap.set(svc, (serviceMap.get(svc) || 0) + 1);
      });
      const breakdown: ServiceBreakdown[] = Array.from(serviceMap.entries())
        .map(([service, count]) => ({
          service,
          count,
          percentage: allBookings.length > 0 ? Math.round((count / allBookings.length) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
      setServiceBreakdown(breakdown);

      // Daily trends (last 14 days or all)
      const trendMap = new Map<string, { total: number; confirmed: number; cancelled: number }>();
      const daysToShow = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 30;
      // Initialize all days
      for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        trendMap.set(key, { total: 0, confirmed: 0, cancelled: 0 });
      }
      allBookings.forEach(b => {
        const date = new Date(b.created_at).toISOString().split('T')[0];
        if (trendMap.has(date)) {
          const entry = trendMap.get(date)!;
          entry.total += 1;
          if (b.status === 'confirmed') entry.confirmed += 1;
          if (b.status === 'cancelled') entry.cancelled += 1;
        }
      });
      const trends: DailyTrend[] = Array.from(trendMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .slice(-14); // show last 14 days max
      setDailyTrends(trends);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancellationRate = stats.total > 0
    ? Math.round((stats.cancelled / stats.total) * 100)
    : 0;

  const confirmationRate = stats.total > 0
    ? Math.round(((stats.confirmed + stats.completed) / stats.total) * 100)
    : 0;

  const maxTrendCount = Math.max(...dailyTrends.map(d => d.total), 1);

  const statusCards = [
    { label: 'Total Bookings', value: stats.total, color: 'bg-blue-500', icon: 'CalendarIcon' },
    { label: 'Pending', value: stats.pending, color: 'bg-yellow-500', icon: 'ClockIcon' },
    { label: 'Confirmed', value: stats.confirmed, color: 'bg-green-500', icon: 'CheckCircleIcon' },
    { label: 'Completed', value: stats.completed, color: 'bg-purple-500', icon: 'CheckBadgeIcon' },
    { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-500', icon: 'XCircleIcon' },
  ];

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
          <Icon name="ChartBarIcon" className="w-6 h-6 text-primary" />
          Analytics Dashboard
        </h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-primary text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statusCards.map((card) => (
          <div key={card.label} className="bg-gray-50 rounded-lg p-3 text-center">
            <div className={`${card.color} w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2`}>
              <Icon name={card.icon} className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Rate Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Confirmation Rate</p>
              <p className="text-3xl font-bold text-green-800">{confirmationRate}%</p>
              <p className="text-xs text-green-600 mt-1">{stats.confirmed + stats.completed} of {stats.total} bookings confirmed/completed</p>
            </div>
            <Icon name="CheckCircleIcon" className="w-10 h-10 text-green-400" />
          </div>
          <div className="mt-3 bg-green-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${confirmationRate}%` }}
            />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Cancellation Rate</p>
              <p className="text-3xl font-bold text-red-800">{cancellationRate}%</p>
              <p className="text-xs text-red-600 mt-1">{stats.cancelled} of {stats.total} bookings cancelled</p>
            </div>
            <Icon name="XCircleIcon" className="w-10 h-10 text-red-400" />
          </div>
          <div className="mt-3 bg-red-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${cancellationRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Booking Trend Chart */}
      {dailyTrends.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Booking Trend (Last {Math.min(dailyTrends.length, 14)} Days)</h3>
          <div className="flex items-end gap-1 h-32 bg-gray-50 rounded-lg p-3">
            {dailyTrends.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${day.date}: ${day.total} bookings`}>
                <div className="w-full flex flex-col-reverse gap-0.5">
                  {day.cancelled > 0 && (
                    <div
                      className="w-full bg-red-400 rounded-sm"
                      style={{ height: `${(day.cancelled / maxTrendCount) * 80}px` }}
                    />
                  )}
                  {day.confirmed > 0 && (
                    <div
                      className="w-full bg-green-400 rounded-sm"
                      style={{ height: `${(day.confirmed / maxTrendCount) * 80}px` }}
                    />
                  )}
                  {(day.total - day.confirmed - day.cancelled) > 0 && (
                    <div
                      className="w-full bg-yellow-400 rounded-sm"
                      style={{ height: `${((day.total - day.confirmed - day.cancelled) / maxTrendCount) * 80}px` }}
                    />
                  )}
                </div>
                {i % 3 === 0 && (
                  <span className="text-[8px] text-muted-foreground rotate-45 origin-left mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm inline-block"></span> Pending</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded-sm inline-block"></span> Confirmed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm inline-block"></span> Cancelled</span>
          </div>
        </div>
      )}

      {/* Service Breakdown */}
      {serviceBreakdown.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Bookings by Service</h3>
          <div className="space-y-3">
            {serviceBreakdown.map((item) => (
              <div key={item.service}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{item.service}</span>
                  <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="ChartBarIcon" className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No booking data available for the selected period.</p>
          <p className="text-sm mt-1">Add bookings to see analytics here.</p>
        </div>
      )}
    </div>
  );
}