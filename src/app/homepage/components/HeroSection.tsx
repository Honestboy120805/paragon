'use client';

import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function HeroSection() {

  const floatingPills = [
  {
    id: 'pill_music',
    label: 'Music Shows',
    icon: 'MusicalNoteIcon',
    color: 'bg-accent',
    position: 'top-20 -left-16'
  },
  {
    id: 'pill_animation',
    label: 'Event Animation',
    icon: 'FilmIcon',
    color: 'bg-success',
    position: 'bottom-40 -left-12'
  },
  {
    id: 'pill_comedy',
    label: 'Comedy Shows',
    icon: 'FaceSmileIcon',
    color: 'bg-warning',
    position: 'bottom-20 -left-8'
  }];


  return (
    <section className="max-w-7xl mx-auto bg-muted rounded-[32px] md:rounded-[48px] p-4 sm:p-8 md:p-12 lg:p-20 relative overflow-hidden min-h-[450px] sm:min-h-[600px] md:min-h-[700px] flex items-center mt-16 sm:mt-20 md:mt-24">
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 md:gap-16 items-center w-full">
        {/* Left Content */}
        <div className="space-y-4 sm:space-y-6 md:space-y-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] md:text-[13px] font-bold whitespace-nowrap">
              <Icon name="StarIcon" size={14} variant="solid" className="fill-current" />
              Creative Professional
            </div>
            <Link
              href="/about"
              className="text-xs sm:text-sm font-bold border-b-2 border-primary hover:text-accent transition-colors">
              Learn About <span className="opacity-100">My Journey</span>
            </Link>
          </div>

          <h1 className="text-[48px] sm:text-[70px] md:text-[90px] lg:text-[120px] font-serif leading-[0.8] tracking-tight">
            Mbi Roy
          </h1>

          <div className="max-w-md space-y-4 sm:space-y-6 md:space-y-8">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-tight text-muted-foreground">
              Music. Comedy. Animation. Coaching. Bringing creativity to life across multiple
              mediums.
            </p>

            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 border-t border-border">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
                <Icon name="SparklesIcon" size={20} variant="outline" className="sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Multi-talented performer with{' '}
                <span className="text-primary">10+ years experience</span>
                <br />
                <span className="opacity-60 font-medium">in entertainment & creative arts.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-3 sm:pt-4">
              <Link
                href="/booking"
                className="bg-primary text-primary-foreground px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-xs sm:text-sm hover:scale-105 transition-transform text-center">
                Book a Service
              </Link>
              <a
                href="/media"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-border text-foreground px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-xs sm:text-sm hover:bg-muted transition-colors shadow-sm inline-flex items-center justify-center gap-2">
                <Icon name="PlayIcon" size={16} variant="solid" />
                Watch Demo
              </a>
            </div>
          </div>
        </div>

        {/* Right Content (Image & Floating Elements) */}
        <div className="relative flex justify-center lg:justify-end mt-6 sm:mt-8 lg:mt-0">
          <div className="relative w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] aspect-[4/5] rounded-[32px] md:rounded-[40px] shadow-2xl">
            <AppImage
              src="/assets/images/show.png"
              alt="Mbi Roy performing on stage with microphone in professional lighting"
              className="w-full h-full object-cover rounded-[40px]" />

            {/* Floating Pills */}
            {floatingPills?.map((pill) =>
              <div
                key={pill?.id}
                className={`absolute ${pill?.position} ${pill?.color} px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 sm:gap-3 shadow-lg animate-bounce-gentle hidden lg:flex`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name={pill?.icon} size={14} variant="outline" className="text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">{pill?.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

}