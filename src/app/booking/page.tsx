import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BookingForm from './components/BookingForm';
import Icon from '@/components/ui/AppIcon';
import FAQSection from '@/components/common/FAQSection';

export const metadata: Metadata = {
  title: 'Book a Service - Paragon De Laftadian | Mbi Roy',
  description:
  'Book music shows, comedy performances, animation projects, or coaching sessions with Mbi Roy. Easy online booking system.',
  keywords: 'book mbi roy, booking, music show booking, comedy booking, animation services',
  openGraph: {
    title: 'Book a Service - Paragon De Laftadian',
    description: 'Book music shows, comedy performances, animation projects, or coaching sessions with Mbi Roy.',
    url: 'https://paragondelaftadian.com/booking',
    siteName: 'Paragon De Laftadian',
    type: 'website',
    images: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_17043f765-1765106878232.png",
      width: 1200,
      height: 630,
      alt: 'Book a Service with Mbi Roy'
    }]

  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Service - Paragon De Laftadian',
    description: 'Book music shows, comedy performances, animation projects, or coaching sessions.',
    images: ['https://paragondelaftadian.com/og-booking.jpg']
  }
};

export default function BookingPage() {
  const benefits = [
  {
    id: 'benefit_response',
    icon: 'ClockIcon',
    title: '24-Hour Response',
    description: 'Quick confirmation and availability check'
  },
  {
    id: 'benefit_flexible',
    icon: 'CalendarIcon',
    title: 'Flexible Scheduling',
    description: 'Work around your event timeline'
  },
  {
    id: 'benefit_professional',
    icon: 'ShieldCheckIcon',
    title: 'Professional Service',
    description: 'Quality guaranteed on every project'
  }];


  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Book a Service',
    description: 'Book music shows, comedy performances, animation projects, or coaching sessions with Mbi Roy.',
    url: 'https://paragondelaftadian.com/booking',
    mainEntity: {
      '@type': 'Service',
      serviceType: 'Booking Service',
      provider: {
        '@type': 'Person',
        name: 'Mbi Roy',
        alternateName: 'Paragon De Laftadian',
        telephone: '+1-641-954-2429',
        email: 'paragondelaftadian@gmail.com'
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4">
        {/* Page Header */}
        <section className="max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20 text-center space-y-6 sm:space-y-8">
          <span className="bg-accent text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block">
            Easy Booking
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight">Book a Service</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto px-4">
            Fill out the form below to request a booking. I'll review your request and get back to
            you within 24 hours.
          </p>
        </section>

        {/* Benefits */}
        <section className="max-w-7xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit) =>
            <div
              key={benefit.id}
              className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-3 sm:space-y-4 border border-border">
              
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-accent rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto">
                  <Icon name={benefit.icon} size={24} variant="outline" className="text-primary sm:w-7 sm:h-7 md:w-8 md:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection title="Booking Questions?" subtitle="Everything you need to know about booking our services" />

        {/* Booking Form */}
        <section className="max-w-4xl mx-auto pb-20 sm:pb-28 md:pb-32">
          <BookingForm />
        </section>
      </main>
      <Footer />
    </div>);

}