'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'nav_home', label: 'Home', href: '/homepage' },
    { id: 'nav_services', label: 'Services', href: '/services' },
    { id: 'nav_about', label: 'About', href: '/about' },
    { id: 'nav_media', label: 'Media', href: '/media' },
    { id: 'nav_contact', label: 'Contact', href: '/contact' },
    { id: 'nav_my_bookings', label: 'My Bookings', href: '/my-bookings' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/homepage" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
            <AppImage
              src="/assets/images/Screenshot_2026-02-02_181136-removebg-preview-1770214573040.png"
              alt="Paragon De Laftadian logo with artistic design"
              className="object-contain w-full h-full group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-muted-foreground hidden sm:block">
            <span className="text-foreground">Paragon De Laftadian</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-foreground">
          {navLinks?.map((link, index) => (
            <div key={link?.id} className="flex items-center gap-6">
              <Link
                href={link?.href}
                className={`hover:text-accent transition-colors ${
                  isMounted && pathname === link?.href ? 'text-accent' : ''
                }`}
              >
                {link?.label}
              </Link>
              {index < navLinks?.length - 1 && (
                <span className="w-1 h-1 bg-border rounded-full"></span>
              )}
            </div>
          ))}
          <Link
            href="/booking"
            className="bg-black text-white px-4 sm:px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors ml-2 whitespace-nowrap"
          >
            Book a Service
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2"
          aria-label="Toggle menu"
        >
          <Icon
            name={isMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
            size={24}
            variant="outline"
          />
        </button>
      </nav>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            {navLinks?.map((link) => (
              <Link
                key={link?.id}
                href={link?.href}
                className={`block text-sm font-semibold py-2 ${
                  isMounted && pathname === link?.href ? 'text-accent' : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link?.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="block text-center bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Book a Service
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}