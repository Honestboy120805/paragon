'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  imageAlt: string;
  features: string[];
  pricing: string;
  videoUrl: string;
  bookingLink: string;
  index: number;
}

export default function ServiceCard({
  id,
  title,
  description,
  icon,
  image,
  imageAlt,
  features,
  pricing,
  videoUrl,
  bookingLink,
  index,
}: ServiceCardProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div
      id={id}
      className="scroll-mt-24 bg-card rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-8 sm:p-12 md:p-16 lg:p-20 shadow-sm border border-border hover-lift"
      style={isHydrated ? { animationDelay: `${index * 0.2}s` } : {}}
    >
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
        {/* Image/Video Section */}
        <div className="relative aspect-[4/3] rounded-[32px] sm:rounded-[36px] md:rounded-[40px] overflow-hidden shadow-2xl group">
          <AppImage
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-accent rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
              <Icon name="PlayIcon" size={28} variant="solid" className="text-primary ml-1 sm:w-8 sm:h-8" />
            </div>
          </div>

          {/* Icon Badge */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name={icon} size={24} variant="outline" className="text-primary sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
              {index + 1}
            </span>
            <span className="bg-accent text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              Service
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight">{title}</h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{description}</p>

          {/* Features */}
          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
            {features.map((feature, idx) => (
              <div key={`${id}_feature_${idx}`} className="flex items-start gap-2 sm:gap-3">
                <Icon
                  name="CheckCircleIcon"
                  size={18}
                  variant="solid"
                  className="text-success mt-0.5 flex-shrink-0 sm:w-5 sm:h-5"
                />
                <span className="text-xs sm:text-sm font-medium text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="pt-6 sm:pt-8 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Pricing
              </p>
              <p className="text-2xl sm:text-3xl font-bold">{pricing}</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Link
              href={bookingLink}
              className="bg-primary text-primary-foreground px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-xs sm:text-sm hover:scale-105 transition-transform text-center"
            >
              Book This Service
            </Link>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-border text-foreground px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-xs sm:text-sm hover:bg-muted transition-colors text-center"
            >
              Watch Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}