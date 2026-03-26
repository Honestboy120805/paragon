'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'booking' | 'contact' | 'cancellation';
  title: string;
  message: string;
  reference_id: string;
  reference_table: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .gte('created_at', '1970-01-01');

      if (error) {
        console.error('Error clearing notifications:', error);
        return;
      }
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleViewDetails = async (notification: Notification) => {
    // Auto mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Append a unique timestamp so every click produces a different URL,
    // guaranteeing full navigation and searchParams refresh even when clicking
    // the same notification multiple times in a row.
    const ts = Date.now();
    if (notification.reference_table === 'bookings') {
      window.location.href = `/admin/bookings?id=${notification.reference_id}&_t=${ts}`;
    } else if (notification.reference_table === 'contact_submissions') {
      window.location.href = `/admin/contacts?id=${notification.reference_id}&_t=${ts}`;
    } else {
      window.location.href = '/admin';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'CalendarIcon';
      case 'contact': return 'EnvelopeIcon';
      case 'cancellation': return 'XCircleIcon';
      default: return 'BellIcon';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'contact': return 'bg-green-100 text-green-800';
      case 'cancellation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Icon name="BellIcon" className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-serif font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm transition-colors ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white text-foreground hover:bg-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm transition-colors ${
                filter === 'unread' ? 'bg-primary text-primary-foreground' : 'bg-white text-foreground hover:bg-muted'
              }`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 text-sm text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3 py-1 text-sm text-red-500 hover:underline flex items-center gap-1"
            >
              <Icon name="TrashIcon" className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="BellSlashIcon" className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-colors ${
                notification.is_read ? 'border-border bg-white' : 'border-primary/30 bg-primary/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                  <Icon name={getNotificationIcon(notification.type)} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm">{notification.title}</h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <span className="capitalize">{notification.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => handleViewDetails(notification)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Icon name="ArrowRightIcon" className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}