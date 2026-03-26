import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HeroSection from './components/HeroSection';
import ServiceShowcase from './components/ServiceShowcase';
import FeaturedWork from './components/FeaturedWork';
import TestimonialSection from './components/TestimonialSection';
import FinalCTA from './components/FinalCTA';

export const metadata: Metadata = {
  title: 'Paragon De Laftadian - Mbi Roy | Music, Comedy, Animation & Coaching',
  description:
  'Multi-talented creative professional offering music performances, comedy shows, animation services, and coaching. Book Mbi Roy for your next event.',
  keywords:
  'Mbi Roy, music shows, comedy performances, animation, comedy coaching, live entertainment, creative services',
  openGraph: {
    title: 'Paragon De Laftadian - Mbi Roy | Music, Comedy, Animation & Coaching',
    description: 'Multi-talented creative professional offering music performances, comedy shows, animation services, and coaching.',
    url: 'https://paragondelaftadian.com',
    siteName: 'Paragon De Laftadian',
    type: 'website',
    images: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_17b3d914b-1763292640558.png",
      width: 1200,
      height: 630,
      alt: 'Mbi Roy - Paragon De Laftadian'
    }]

  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paragon De Laftadian - Mbi Roy | Music, Comedy, Animation & Coaching',
    description: 'Multi-talented creative professional offering music performances, comedy shows, animation services, and coaching.',
    images: ['https://paragondelaftadian.com/og-image.jpg']
  }
};

export default function Homepage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Mbi Roy',
    alternateName: 'Paragon De Laftadian',
    url: 'https://paragondelaftadian.com',
    jobTitle: 'Creative Professional',
    description: 'Multi-talented creative professional offering music performances, comedy shows, animation services, and coaching.',
    knowsAbout: ['Music Performance', 'Comedy', 'Animation', 'Coaching'],
    hasOccupation: [
    {
      '@type': 'Occupation',
      name: 'Musician',
      occupationLocation: {
        '@type': 'Country',
        name: 'United States'
      }
    },
    {
      '@type': 'Occupation',
      name: 'Comedian',
      occupationLocation: {
        '@type': 'Country',
        name: 'United States'
      }
    },
    {
      '@type': 'Occupation',
      name: 'Animator',
      occupationLocation: {
        '@type': 'Country',
        name: 'United States'
      }
    }],

    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-641-954-2429',
      email: 'paragondelaftadian@gmail.com',
      contactType: 'Booking'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      
      <Header />
      <main className="px-4">
        <HeroSection />
        <ServiceShowcase />
        <FeaturedWork />
        <TestimonialSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>);

}