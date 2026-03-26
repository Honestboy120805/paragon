'use client';

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  photo: string;
  quote: string;
  rating: number;
}

const fallbackTestimonials: Testimonial[] = [
{
  id: 'testimonial_1',
  name: 'Sarah Johnson',
  role: 'Event Coordinator',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1412c25c5-1765546883347.png",
  quote: 'Mbi Roy brought incredible energy to our corporate event. The music performance was absolutely captivating, and our team is still talking about it weeks later!',
  rating: 5
},
{
  id: 'testimonial_2',
  name: 'Michael Chen',
  role: 'Marketing Director',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1b99f91c3-1764648273737.png",
  quote: 'The animation work exceeded all expectations. Professional, creative, and delivered on time. Highly recommend for any creative project!',
  rating: 5
},
{
  id: 'testimonial_3',
  name: 'Emily Rodriguez',
  role: 'Comedy Club Owner',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_158cff79d-1769330171720.png",
  quote: "Mbi's comedy show was the highlight of our season. The audience loved every minute, and we've already booked a return performance!",
  rating: 5
},
{
  id: 'testimonial_4',
  name: 'David Thompson',
  role: 'Aspiring Comedian',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1cf7879c8-1770215401340.png",
  quote: "The comedy coaching sessions transformed my stage presence. Mbi's insights and techniques helped me develop material that really connects with audiences.",
  rating: 5
},
{
  id: 'testimonial_5',
  name: 'Jessica Martinez',
  role: 'Wedding Planner',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_11e76a71e-1766871171559.png",
  quote: 'Hired Mbi for a wedding reception and it was magical! The live music created the perfect atmosphere. Every guest was impressed!',
  rating: 5
},
{
  id: 'testimonial_6',
  name: 'Robert Kim',
  role: 'Creative Director',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1df8bbef9-1767680928447.png",
  quote: 'Outstanding animation work! The attention to detail and creativity brought our vision to life perfectly. A true professional in every sense.',
  rating: 5
}];


export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase.
      from('testimonials').
      select('*').
      eq('is_approved', true).
      order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setTestimonials(data);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const changeSlide = (newIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 200);
  };

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (isPaused || testimonials.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      changeSlide(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, currentIndex, testimonials.length]);

  const goToSlide = (index: number) => changeSlide(index);
  const goToPrevious = () => changeSlide((currentIndex - 1 + testimonials.length) % testimonials.length);
  const goToNext = () => changeSlide((currentIndex + 1) % testimonials.length);

  const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, index) =>
  <Icon
    key={`star_${index}`}
    name="StarIcon"
    size={20}
    variant="solid"
    className={index < rating ? 'text-warning fill-current' : 'text-gray-300 fill-current'} />

  );

  const current = testimonials[currentIndex];
  if (!current) return null;

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            3
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Client Testimonials
          </p>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight">What Clients Say</h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto px-4">
          Hear from clients who have experienced the magic of professional creative services.
        </p>
      </div>

      <div
        className="relative bg-card rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-8 sm:p-12 md:p-16 lg:p-20 shadow-lg border border-border"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}>
        
        {/* Testimonial Content - key forces full re-render on index change */}
        <div
          key={`testimonial-${currentIndex}`}
          className={`max-w-4xl mx-auto transition-opacity duration-200 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'}`
          }>
          
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            {/* Client Photo - changes with currentIndex */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-xl border-4 border-accent">
              <AppImage
                src={current.photo || 'https://img.rocket.new/generatedImages/rocket_gen_img_1a38ab8ca-1763294483428.png'}
                alt={`Photo of ${current.name}`}
                className="w-full h-full object-cover" />
              
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {renderStars(current.rating)}
            </div>

            {/* Quote */}
            <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-foreground leading-relaxed max-w-3xl">
              "{current.quote}"
            </blockquote>

            {/* Client Info */}
            <div>
              <p className="text-base sm:text-lg font-bold text-foreground">{current.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{current.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-border"
          aria-label="Previous testimonial">
          
          <Icon name="ChevronLeftIcon" size={20} variant="outline" className="text-primary sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-border"
          aria-label="Next testimonial">
          
          <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-primary sm:w-6 sm:h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-10 md:mt-12">
          {testimonials.map((_, index) =>
          <button
            key={`dot_${index}`}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
            index === currentIndex ?
            'w-8 sm:w-10 h-2 sm:h-2.5 bg-primary' : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-border hover:bg-primary/50'}`
            }
            aria-label={`Go to testimonial ${index + 1}`} />

          )}
        </div>
      </div>
    </section>);

}