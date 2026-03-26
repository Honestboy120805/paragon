import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function FinalCTA() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="bg-muted rounded-[60px] p-12 md:p-24 text-center space-y-12">
        <div className="space-y-6">
          <span className="bg-accent text-primary px-4 py-1.5 rounded-full text-xs font-bold w-fit mx-auto block">
            Ready to Start?
          </span>
          <h2 className="text-5xl md:text-7xl font-serif tracking-tight">
            Let's Create Something Amazing
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Whether it's a live performance, animation project, or comedy show, I'm here to bring
            your vision to life.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/booking"
            className="bg-primary text-primary-foreground px-12 py-5 rounded-full font-bold text-sm hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            Book a Service <Icon name="ArrowRightIcon" size={16} variant="outline" />
          </Link>
          <Link
            href="/contact"
            className="bg-white border border-border text-foreground px-12 py-5 rounded-full font-bold text-sm hover:bg-muted transition-colors shadow-sm"
          >
            Get in Touch
          </Link>
        </div>

        <div className="pt-12 border-t border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Trusted by 100+ Clients Worldwide
          </p>
        </div>
      </div>
    </section>
  );
}