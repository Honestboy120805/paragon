'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
}

export default function Timeline() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const milestones: TimelineItem[] = [
    {
      id: 'milestone_2015',
      year: '2015',
      title: 'Started Comedy',
      description: 'First open mic performance launched a passion for making people laugh.',
      icon: 'FaceSmileIcon',
    },
    {
      id: 'milestone_2017',
      year: '2017',
      title: 'First Animation Project',
      description: 'Completed first professional animation commission for a local brand.',
      icon: 'FilmIcon',
    },
    {
      id: 'milestone_2019',
      year: '2019',
      title: 'Music Career Launch',
      description: 'Performed first major music show at a 500-person venue.',
      icon: 'MusicalNoteIcon',
    },
    {
      id: 'milestone_2020',
      year: '2020',
      title: 'Professional Performer',
      description: 'Transitioned to full-time creative professional status.',
      icon: 'StarIcon',
    },
    {
      id: 'milestone_2023',
      year: '2023',
      title: 'Launched Coaching',
      description: 'Started comedy coaching program to mentor aspiring performers.',
      icon: 'AcademicCapIcon',
    },
    {
      id: 'milestone_2026',
      year: '2026',
      title: 'Present Day',
      description: 'Continuing to create, perform, and inspire across multiple disciplines.',
      icon: 'SparklesIcon',
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            2
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Creative Journey
          </p>
        </div>
        <h2 className="text-6xl md:text-8xl font-serif tracking-tight">Timeline</h2>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border"></div>

        <div className="space-y-16 overflow-x-hidden">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={`relative flex items-center ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
              style={isHydrated ? { animationDelay: `${index * 0.1}s` } : {}}
            >
              {/* Timeline Dot */}
              <div className="absolute left-8 md:left-1/2 w-16 h-16 -ml-8 bg-accent rounded-full border-4 border-background flex items-center justify-center z-10 shadow-lg">
                <Icon name={milestone.icon} size={24} variant="solid" className="text-primary" />
              </div>

              {/* Content Card */}
              <div
                className={`ml-24 md:ml-0 w-full md:w-[calc(50%-4rem)] pr-4 md:pr-0 ${
                  index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'
                }`}
              >
                <div className="bg-card rounded-[40px] p-8 shadow-sm border border-border hover-lift">
                  <span className="text-accent text-sm font-black uppercase tracking-widest">
                    {milestone.year}
                  </span>
                  <h3 className="text-2xl font-bold mt-2 mb-3">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}