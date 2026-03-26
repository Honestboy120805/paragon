'use client';

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface MediaItem {
  id: string;
  title: string;
  category: string;
  media_type: 'video' | 'image';
  thumbnail_url: string;
  url: string;
  description?: string;
}

export default function MediaGallery() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setIsHydrated(true);
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_gallery')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category || 'general',
        media_type: item.media_type,
        thumbnail_url: item.thumbnail_url || item.url,
        url: item.url,
        description: item.description,
      }));
      setMediaItems(mapped);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'filter_all', value: 'all', label: 'All' },
    { id: 'filter_music', value: 'music', label: 'Music' },
    { id: 'filter_comedy', value: 'comedy', label: 'Comedy' },
    { id: 'filter_animation', value: 'animation', label: 'Animation' },
    { id: 'filter_coaching', value: 'coaching', label: 'Coaching' },
  ];

  const filteredItems =
    activeFilter === 'all'
      ? mediaItems
      : mediaItems.filter((item) => item.category === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveFilter(category.value)}
            className={`px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-all ${
              activeFilter === category.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground border border-border hover:bg-muted'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <Icon name="PhotoIcon" className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No media found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group cursor-pointer"
              onClick={() => setLightboxItem(item)}
              style={isHydrated ? { animationDelay: `${index * 0.1}s` } : {}}
            >
              <div className="relative aspect-[4/3] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden shadow-lg">
                {item.media_type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <AppImage
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-100 group-hover:opacity-60 transition-opacity"></div>

                {/* Play Icon for Videos */}
                {item.media_type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-accent rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Icon name="PlayIcon" size={20} variant="solid" className="text-primary ml-1 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white">
                  <span className="bg-accent text-primary px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold mt-2 sm:mt-3 drop-shadow-md">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxItem && isHydrated && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-8 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Icon name="XMarkIcon" size={24} variant="outline" className="text-primary" />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.media_type === 'video' ? (
              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <video
                  src={lightboxItem.url}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              </div>
            ) : (
              <AppImage
                src={lightboxItem.url}
                alt={lightboxItem.title}
                className="w-full h-auto rounded-2xl"
              />
            )}
            <div className="text-white text-center mt-6">
              <h3 className="text-2xl font-bold">{lightboxItem.title}</h3>
              {lightboxItem.description && (
                <p className="text-white/70 mt-2">{lightboxItem.description}</p>
              )}
              <p className="text-sm text-white/60 mt-2 uppercase tracking-wider">
                {lightboxItem.category}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}