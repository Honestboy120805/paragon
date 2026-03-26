import Icon from '@/components/ui/AppIcon';

export default function MissionVision() {
  const cards = [
    {
      id: 'mission',
      icon: 'RocketLaunchIcon',
      title: 'Mission',
      content:
        'To create memorable experiences through music, comedy, and animation that inspire, entertain, and connect with audiences on a deeper level.',
    },
    {
      id: 'vision',
      icon: 'EyeIcon',
      title: 'Vision',
      content:
        'To be recognized as a leading creative professional who pushes boundaries across multiple artistic disciplines while maintaining authenticity and excellence.',
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {cards?.map((card) => (
          <div
            key={card?.id}
            className="bg-primary text-primary-foreground rounded-[60px] p-12 md:p-16 space-y-8"
          >
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center">
              <Icon name={card?.icon} size={32} variant="outline" className="text-primary" />
            </div>
            <h3 className="text-4xl font-serif tracking-tight">{card?.title}</h3>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">{card?.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}