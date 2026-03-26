'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import AnalyticsWidget from './components/AnalyticsWidget';
import NotificationCenter from './components/NotificationCenter';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalMedia: number;
  totalServices: number;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  service_type: string;
  event_date: string;
  status: string;
  created_at: string;
}

interface MediaItem {
  id: string;
  title: string;
  media_type: string;
  is_featured: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    totalMedia: 0,
    totalServices: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentMedia, setRecentMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [bookingsRes, pendingRes, mediaRes, servicesRes] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('media_gallery').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalBookings: bookingsRes.count || 0,
        pendingBookings: pendingRes.count || 0,
        totalMedia: mediaRes.count || 0,
        totalServices: servicesRes.count || 0,
      });

      // Fetch upcoming bookings (next 5 pending/confirmed bookings)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['pending', 'confirmed'])
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(5);

      setUpcomingBookings(bookingsData || []);

      // Fetch recent media (last 5 uploads)
      const { data: mediaData } = await supabase
        .from('media_gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentMedia(mediaData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: 'CalendarIcon',
      color: 'bg-blue-500',
      link: '/admin/bookings',
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: 'ClockIcon',
      color: 'bg-yellow-500',
      link: '/admin/bookings',
    },
    {
      title: 'Media Items',
      value: stats.totalMedia,
      icon: 'PhotoIcon',
      color: 'bg-purple-500',
      link: '/admin/media',
    },
    {
      title: 'Services',
      value: stats.totalServices,
      icon: 'BriefcaseIcon',
      color: 'bg-green-500',
      link: '/admin/services',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.link}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-2`}>
                <Icon name={stat.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Widget */}
      <AnalyticsWidget />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings Widget */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Icon name="CalendarDaysIcon" className="w-6 h-6 text-primary" />
              Upcoming Bookings
            </h2>
            <Link href="/admin/bookings" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="CalendarIcon" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{booking.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{booking.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.service_type} • {formatDate(booking.event_date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Media Widget */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Icon name="PhotoIcon" className="w-6 h-6 text-primary" />
              Recent Media
            </h2>
            <Link href="/admin/media" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          {recentMedia.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="PhotoIcon" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No media uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMedia.map((media) => (
                <div
                  key={media.id}
                  className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon
                          name={media.media_type === 'video' ? 'VideoCameraIcon' : 'PhotoIcon'}
                          className="w-5 h-5 text-purple-600"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{media.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {media.media_type} • {formatDate(media.created_at)}
                        </p>
                      </div>
                    </div>
                    {media.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex-shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Analytics Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
          <Icon name="ChartBarIcon" className="w-6 h-6 text-primary" />
          Media Analytics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Media</p>
                <p className="text-2xl font-bold mt-1">{stats.totalMedia}</p>
              </div>
              <Icon name="PhotoIcon" className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured Items</p>
                <p className="text-2xl font-bold mt-1">{recentMedia.filter(m => m.is_featured).length}</p>
              </div>
              <Icon name="StarIcon" className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Uploads</p>
                <p className="text-2xl font-bold mt-1">{recentMedia.length}</p>
              </div>
              <Icon name="ArrowUpTrayIcon" className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/admin/bookings"
            className="flex items-center space-x-3 p-3 sm:p-4 border border-muted-foreground/20 rounded-lg hover:border-primary transition-colors"
          >
            <Icon name="CalendarIcon" className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Manage Bookings</span>
          </Link>
          <Link
            href="/admin/media"
            className="flex items-center space-x-3 p-3 sm:p-4 border border-muted-foreground/20 rounded-lg hover:border-primary transition-colors"
          >
            <Icon name="PhotoIcon" className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Upload Media</span>
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center space-x-3 p-3 sm:p-4 border border-muted-foreground/20 rounded-lg hover:border-primary transition-colors"
          >
            <Icon name="PlusIcon" className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Add Service</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center space-x-3 p-3 sm:p-4 border border-muted-foreground/20 rounded-lg hover:border-primary transition-colors"
          >
            <Icon name="UserGroupIcon" className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Manage Users</span>
          </Link>
        </div>
      </div>
    </div>
  );
}