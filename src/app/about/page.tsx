import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BiographySection from './components/BiographySection';
import MissionVision from './components/MissionVision';
import Timeline from './components/Timeline';
import SkillsSection from './components/SkillsSection';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Mbi Roy - Paragon De Laftadian | Creative Professional',
  description:
  'Learn about Mbi Roy - multi-talented creative professional with 10+ years experience in music, comedy, animation, and coaching.',
  keywords: 'mbi roy, about, biography, creative professional, performer, animator, coach',
  openGraph: {
    title: 'About Mbi Roy - Paragon De Laftadian',
    description: 'Learn about Mbi Roy - multi-talented creative professional with 10+ years experience in music, comedy, animation, and coaching.',
    url: 'https://paragondelaftadian.com/about',
    siteName: 'Paragon De Laftadian',
    type: 'profile',
    images: [
    {
      url: "https://images.unsplash.com/photo-1587928197638-4f4bf84829e9",
      width: 1200,
      height: 630,
      alt: 'About Mbi Roy'
    }]

  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Mbi Roy - Paragon De Laftadian',
    description: 'Learn about Mbi Roy - multi-talented creative professional with 10+ years experience.',
    images: ['https://paragondelaftadian.com/og-about.jpg']
  }
};

export default function AboutPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: 'Mbi Roy',
      alternateName: 'Paragon De Laftadian',
      description: 'Multi-talented creative professional with 10+ years experience in music, comedy, animation, and coaching.',
      url: 'https://paragondelaftadian.com',
      jobTitle: 'Creative Professional',
      knowsAbout: ['Music Performance', 'Comedy', 'Animation', 'Coaching'],
      yearsOfExperience: '10+'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 overflow-x-hidden">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto mb-12 sm:mb-16 md:mb-20 text-center space-y-6 sm:space-y-8">
          <span className="bg-accent text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block">
            About Me
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight">Mbi Roy</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-3xl mx-auto px-4">
            Multi-talented creative professional bringing stories to life through music, comedy,
            animation, and coaching.
          </p>
        </section>

        <BiographySection />
        <MissionVision />
        <Timeline />
        <SkillsSection />

        {/* CTA Section */}
        <section className="py-20 sm:py-28 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="bg-muted rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-8 sm:p-12 md:p-16 lg:p-20 text-center space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight">
              Ready to Work Together?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you need a performer, animator, or coach, let's discuss your project.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 pt-4">
              <Link
                href="/booking"
                className="bg-primary text-primary-foreground px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-full font-bold text-xs sm:text-sm hover:scale-105 transition-transform">
                
                Book a Service
              </Link>
              <Link
                href="/contact"
                className="bg-white border border-border text-foreground px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-full font-bold text-xs sm:text-sm hover:bg-card transition-colors">
                
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>);

}