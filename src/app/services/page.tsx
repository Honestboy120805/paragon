'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ServiceCard from './components/ServiceCard';
import FAQSection from '@/components/common/FAQSection';
import { createClient } from '@/lib/supabase/client';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  pricing: string;
  image_url: string;
  video_url: string;
  is_active: boolean;
  display_order: number;
}

const staticServices = [
  {
    id: 'music',
    title: 'Music Shows',
    description:
      'Electrifying live performances that captivate audiences with energy, emotion, and musical excellence. Perfect for corporate events, festivals, and private celebrations.',
    icon: 'MusicalNoteIcon',
    image: 'https://images.unsplash.com/photo-1595270601830-c8ff3271ba25',
    imageAlt: 'Live music performance on stage with dynamic lighting and engaged audience',
    features: [
      'Live 2-hour performance with professional sound equipment',
      'Diverse repertoire spanning multiple genres',
      'Customizable setlist based on event theme',
      'Meet & greet sessions with attendees',
      'Professional sound and lighting coordination',
    ],
    pricing: 'From $2,500',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    bookingLink: '/booking',
  },
  {
    id: 'animation',
    title: 'Event Animation',
    description:
      'Professional event animation services that entertain and engage audiences with live character performances, interactive entertainment, and memorable experiences for all ages.',
    icon: 'FilmIcon',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_10122dbb0-1770973332156.png',
    imageAlt: 'Event animator entertaining crowd with live character performance and interactive activities',
    features: [
      'Live character performances and entertainment',
      'Interactive audience engagement activities',
      'Face painting and balloon artistry',
      'Themed entertainment for corporate and private events',
      'Professional costume and character work',
    ],
    pricing: 'From $1,200',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    bookingLink: '/booking',
  },
  {
    id: 'comedy',
    title: 'Comedy Shows',
    description:
      'Stand-up comedy performances that deliver laughter, memorable moments, and entertainment tailored to your audience and event type.',
    icon: 'FaceSmileIcon',
    image: 'https://images.unsplash.com/photo-1727425694543-b6313757b478',
    imageAlt: 'Stand-up comedian performing on stage with microphone and spotlight',
    features: [
      '45-60 minute stand-up comedy set',
      'Clean or adult humor options available',
      'Corporate event and private party experience',
      'Interactive audience engagement',
      'Custom material based on event theme',
    ],
    pricing: 'From $1,800',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    bookingLink: '/booking',
  },
  {
    id: 'coaching',
    title: 'Comedy Coaching',
    description:
      'One-on-one coaching sessions to develop your comedic skills, stage presence, and material writing for aspiring comedians and performers.',
    icon: 'AcademicCapIcon',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1cf7879c8-1770215401340.png',
    imageAlt: 'One-on-one coaching session with instructor guiding student on comedy techniques',
    features: [
      'Personalized 1-on-1 coaching sessions',
      'Material development and joke writing',
      'Stage presence and delivery techniques',
      'Performance feedback and improvement',
      'Career guidance and industry insights',
    ],
    pricing: 'From $200/session',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    bookingLink: '/booking',
  },
];

const categoryIconMap: Record<string, string> = {
  music: 'MusicalNoteIcon',
  comedy: 'FaceSmileIcon',
  animation: 'FilmIcon',
  coaching: 'AcademicCapIcon',
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>(staticServices);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map((s: Service) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: categoryIconMap[s.category] || 'BriefcaseIcon',
          image: s.image_url || 'https://images.unsplash.com/photo-1595270601830-c8ff3271ba25',
          imageAlt: `${s.title} service by Mbi Roy`,
          features: s.features || [],
          pricing: s.pricing,
          videoUrl: s.video_url || '',
          bookingLink: '/booking',
        }));
        setServices(mapped);
      }
      // else keep static services as fallback
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto mb-12 sm:mb-16 md:mb-20 text-center space-y-6 sm:space-y-8">
          <span className="bg-accent text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block">
            Professional Services
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight">What I Offer</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-3xl mx-auto px-4">
            From electrifying performances to creative animations and professional coaching, explore
            the full range of services designed to bring your vision to life.
          </p>
        </section>

        {/* Service Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-20 pb-32">
            {services.map((service, index) => (
              <ServiceCard key={service.id} {...service} index={index} />
            ))}
          </div>
        )}


        {/* Bottom CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 md:pb-32">
          <div className="bg-primary text-primary-foreground rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-8 sm:p-12 md:p-16 lg:p-20 text-center space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight">
              Ready to Book a Service?
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Let's discuss your project and create something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 pt-4">
              <a
                href="/booking"
                className="bg-accent text-primary px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-full font-bold text-xs sm:text-sm hover:scale-105 transition-transform"
              >
                Book Now
              </a>
              <a
                href="/contact"
                className="bg-white/10 border border-white/20 text-primary-foreground px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-full font-bold text-xs sm:text-sm hover:bg-white/20 transition-colors"
              >
                Contact Me
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}