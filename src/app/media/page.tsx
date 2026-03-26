import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import MediaGallery from './components/MediaGallery';

export const metadata: Metadata = {
  title: 'Media Gallery - Paragon De Laftadian | Mbi Roy Portfolio',
  description:
  'Explore videos and images from Mbi Roy\'s performances, animations, comedy shows, and coaching sessions.',
  keywords: 'media gallery, portfolio, videos, performances, comedy clips, animation reel',
  openGraph: {
    title: 'Media Gallery - Paragon De Laftadian',
    description: 'Explore videos and images from Mbi Roy\'s performances, animations, comedy shows, and coaching sessions.',
    url: 'https://paragondelaftadian.com/media',
    siteName: 'Paragon De Laftadian',
    type: 'website',
    images: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_131bb47d1-1768818053588.png",
      width: 1200,
      height: 630,
      alt: 'Media Gallery - Mbi Roy Portfolio'
    }]

  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media Gallery - Paragon De Laftadian',
    description: 'Explore videos and images from Mbi Roy\'s performances and creative work.',
    images: ['https://paragondelaftadian.com/og-media.jpg']
  }
};

export default function MediaPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Media Gallery',
    description: 'Portfolio of videos and images from performances, animations, comedy shows, and coaching sessions.',
    creator: {
      '@type': 'Person',
      name: 'Mbi Roy',
      alternateName: 'Paragon De Laftadian'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      
      <Header />
      <main className="pt-32 px-4">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto mb-20 text-center space-y-8">
          <span className="bg-accent text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            Portfolio
          </span>
          <h1 className="text-6xl md:text-8xl font-serif tracking-tight">Media Gallery</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-3xl mx-auto">
            Explore videos and images from my performances, animations, comedy shows, and coaching
            sessions. Click any item to view full size or watch video.
          </p>
        </section>

        {/* Gallery */}
        <section className="max-w-7xl mx-auto pb-32">
          <MediaGallery />
        </section>
      </main>
      <Footer />
    </div>);

}