import Icon from '@/components/ui/AppIcon';

export default function SkillsSection() {
  const skills = [
    {
      id: 'skill_performance',
      icon: 'MusicalNoteIcon',
      title: 'Live Performance',
      description: 'Engaging stage presence with 10+ years of experience',
      level: 95,
    },
    {
      id: 'skill_comedy',
      icon: 'FaceSmileIcon',
      title: 'Comedy Writing',
      description: 'Crafting material that resonates with diverse audiences',
      level: 90,
    },
    {
      id: 'skill_animation',
      icon: 'FilmIcon',
      title: 'Event Animation',
      description: 'Bringing energy and fun to any event with interactive performances',
      level: 85,
    },
    {
      id: 'skill_coaching',
      icon: 'AcademicCapIcon',
      title: 'Coaching & Mentoring',
      description: 'Developing talent and building confidence',
      level: 88,
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            3
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Skills & Expertise
          </p>
        </div>
        <h2 className="text-6xl md:text-8xl font-serif tracking-tight">What I Do Best</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {skills?.map((skill) => (
          <div
            key={skill?.id}
            className="bg-card rounded-[40px] p-10 shadow-sm border border-border space-y-6"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon name={skill?.icon} size={32} variant="outline" className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{skill?.title}</h3>
                <p className="text-sm text-muted-foreground">{skill?.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Proficiency</span>
                <span className="text-primary">{skill?.level}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-1000"
                  style={{ width: `${skill?.level}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}