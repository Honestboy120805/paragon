import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ContactForm from './components/ContactForm';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Contact - Paragon De Laftadian | Get in Touch with Mbi Roy',
  description:
  'Contact Mbi Roy for bookings, collaborations, or general inquiries. Get in touch via form or social media.',
  keywords: 'contact, get in touch, booking inquiry, collaboration, social media',
  openGraph: {
    title: 'Contact - Paragon De Laftadian',
    description: 'Contact Mbi Roy for bookings, collaborations, or general inquiries.',
    url: 'https://paragondelaftadian.com/contact',
    siteName: 'Paragon De Laftadian',
    type: 'website',
    images: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_1401b38be-1769357038840.png",
      width: 1200,
      height: 630,
      alt: 'Contact Mbi Roy'
    }]

  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact - Paragon De Laftadian',
    description: 'Contact Mbi Roy for bookings, collaborations, or general inquiries.',
    images: ['https://paragondelaftadian.com/og-contact.jpg']
  }
};

export default function ContactPage() {
  const contactMethods = [
  {
    id: 'contact_email',
    icon: 'EnvelopeIcon',
    label: 'Email',
    value: 'paragondelaftadian@gmail.com',
    link: 'mailto:paragondelaftadian@gmail.com'
  },
  {
    id: 'contact_phone',
    icon: 'PhoneIcon',
    label: 'Phone',
    value: '+1 (641) 954-2429',
    link: 'tel:+16419542429'
  }];


  const socialLinks = [
  { id: 'social_twitter', name: 'Twitter', icon: 'twitter', href: '#' },
  { id: 'social_instagram', name: 'Instagram', icon: 'instagram', href: '#' },
  { id: 'social_youtube', name: 'YouTube', icon: 'youtube', href: '#' },
  { id: 'social_linkedin', name: 'LinkedIn', icon: 'linkedin', href: '#' }];


  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact',
    description: 'Contact Mbi Roy for bookings, collaborations, or general inquiries.',
    url: 'https://paragondelaftadian.com/contact',
    mainEntity: {
      '@type': 'Person',
      name: 'Mbi Roy',
      alternateName: 'Paragon De Laftadian',
      telephone: '+1-641-954-2429',
      email: 'paragondelaftadian@gmail.com'
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
        <section className="max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20 text-center space-y-6 sm:space-y-8">
          <span className="bg-accent text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight">Contact</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto px-4">
            Have a question or want to work together? Fill out the form below or reach out via
            email or phone.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section className="max-w-7xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {contactMethods.map((info) =>
            <a
              key={info.id}
              href={info.link}
              className="bg-card rounded-[32px] sm:rounded-[36px] md:rounded-[40px] p-6 sm:p-8 md:p-10 shadow-sm border border-border hover-lift flex items-center gap-4 sm:gap-6">
              
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-accent rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name={info.icon} size={24} variant="outline" className="text-primary sm:w-7 sm:h-7 md:w-8 md:h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 sm:mb-2">
                    {info.label}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold break-words">{info.value}</p>
                </div>
              </a>
            )}
          </div>
        </section>

        {/* Contact Form */}
        <section className="max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <ContactForm />
        </section>
      </main>
      <Footer />
    </div>);

}