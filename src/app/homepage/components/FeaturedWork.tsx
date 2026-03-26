'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string;
}

export default function FeaturedWork() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, category, image_url, description')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(6);
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            2
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Featured Work
          </p>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight">Recent Projects</h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto px-4">
          A selection of my latest performances, animations, and creative projects.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No projects to display yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {projects.map((item, index) => (
            <div
              key={item.id}
              className="group cursor-pointer"
              style={isHydrated ? { animationDelay: `${index * 0.1}s` } : {}}
            >
              <div className="relative aspect-[4/3] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden shadow-lg">
                <AppImage
                  src={item.image_url || '/assets/images/no_image.png'}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent opacity-100 group-hover:opacity-60 transition-opacity"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white">
                  <span className="bg-accent text-primary px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mt-2 sm:mt-3 drop-shadow-md">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12 sm:mt-16">
        <Link
          href="/media"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold border-b-2 border-primary hover:text-accent hover:border-accent transition-all"
        >
          View All Work <Icon name="ArrowRightIcon" size={16} variant="outline" />
        </Link>
      </div>
    </section>
  );
}