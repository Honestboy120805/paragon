'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  imageAlt: string;
  videoUrl: string;
  price: string;
  features: string[];
}

export default function ServiceShowcase() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const services: Service[] = [
  {
    id: 'service_music',
    title: 'Music Shows',
    description: 'Live performances that captivate audiences with energy and emotion.',
    icon: 'MusicalNoteIcon',
    image: "/assets/images/musicshow.png",
    imageAlt: 'Live music performance on stage with colorful stage lights and crowd',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    price: 'From $2,500',
    features: ['Live Performance', '2-Hour Set', 'Professional Sound']
  },
  {
    id: 'service_animation',
    title: 'Event Animation',
    description: 'Live entertainment that brings joy and excitement to your events.',
    icon: 'FilmIcon',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_14c9b6b1f-1770973330307.png",
    imageAlt: 'Event animator performing live character entertainment at celebration with audience',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    price: 'From $1,200',
    features: ['Live Character Work', 'Interactive Entertainment', 'Face Painting']
  },
  {
    id: 'service_comedy',
    title: 'Comedy Shows',
    description: 'Stand-up comedy that delivers laughter and memorable moments.',
    icon: 'FaceSmileIcon',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1518215f8-1767900803837.png",
    imageAlt: 'Comedian performing stand-up comedy on stage with spotlight and microphone',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    price: 'From $1,800',
    features: ['Stand-up Comedy', '45-60 Minutes', 'Corporate Events']
  },
  {
    id: 'service_coaching',
    title: 'Comedy Coaching',
    description: 'One-on-one coaching to develop your comedic skills and stage presence.',
    icon: 'AcademicCapIcon',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1cf7879c8-1770215401340.png",
    imageAlt: 'One-on-one coaching session with instructor and student reviewing comedy material',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    price: 'From $200/session',
    features: ['Personal Coaching', 'Material Development', 'Stage Techniques']
  }];


  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            1
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Services & Expertise
          </p>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight">What I Offer</h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto px-4">
          Professional services across music, comedy, animation, and coaching tailored to your
          needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {services.map((service, index) =>
        <div
          key={service.id}
          className="bg-card rounded-[32px] md:rounded-[40px] overflow-hidden shadow-sm border border-border hover-lift group"
          style={isHydrated ? { animationDelay: `${index * 0.1}s` } : {}}>

            <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
              <AppImage
              src={service.image}
              alt={service.imageAlt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Icon name={service.icon} size={20} variant="outline" className="text-primary sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold">{service.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{service.description}</p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {service.features.map((feature, idx) =>
              <div key={`${service.id}_feature_${idx}`} className="flex items-center gap-2">
                    <Icon
                  name="CheckIcon"
                  size={14}
                  variant="solid"
                  className="text-success bg-success/10 rounded-full p-0.5 flex-shrink-0" />

                    <span className="text-xs font-medium text-muted-foreground">{feature}</span>
                  </div>
              )}
              </div>

              <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-between">
                <span className="text-base sm:text-lg font-bold">{service.price}</span>
                <Link
                href="/booking"
                className="bg-primary text-primary-foreground px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">

                  Book Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>);

}