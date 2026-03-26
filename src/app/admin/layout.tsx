'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    let mounted = true;

    const checkAdminAccess = async () => {
      if (loading) return;

      try {
        if (!user) {
          if (mounted) router.push('/admin/login');
          return;
        }

        setVerifying(true);
        const adminStatus = await isAdmin();

        if (!mounted) return;

        if (!adminStatus) {
          router.push('/');
          return;
        }

        setIsAdminUser(true);
        setVerifying(false);
      } catch (err) {
        console.error('Error checking admin access:', err);
        if (mounted) router.push('/admin/login');
      }
    };

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, [user, loading, router, isLoginPage, isAdmin]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (verifying || isAdminUser === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'HomeIcon' },
    { href: '/admin/bookings', label: 'Bookings', icon: 'CalendarIcon' },
    { href: '/admin/contacts', label: 'Messages', icon: 'EnvelopeIcon' },
    { href: '/admin/testimonials', label: 'Testimonials', icon: 'StarIcon' },
    { href: '/admin/media', label: 'Gallery', icon: 'PhotoIcon' },
    { href: '/admin/projects', label: 'Projects', icon: 'FolderIcon' },
    { href: '/admin/services', label: 'Services', icon: 'BriefcaseIcon' },
    { href: '/admin/users', label: 'Users', icon: 'UsersIcon' },
    { href: '/admin/settings', label: 'Settings', icon: 'CogIcon' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="text-xl font-bold whitespace-nowrap">
              Paragon Admin
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center space-x-2">
              <Link
                href="/"
                className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center space-x-2 text-sm"
              >
                <Icon name="HomeIcon" className="w-4 h-4" />
                <span>View Site</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors flex items-center space-x-2 text-sm"
              >
                <Icon name="ArrowRightOnRectangleIcon" className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <Icon
                name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name={item.icon} className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="HomeIcon" className="w-5 h-5" />
                  <span>View Site</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors text-sm text-left"
                >
                  <Icon name="ArrowRightOnRectangleIcon" className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}