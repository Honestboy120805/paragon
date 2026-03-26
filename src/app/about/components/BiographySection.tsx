import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function BiographySection() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="relative group">
          <div className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl">
            <AppImage
              src="/assets/images/perfect.jpeg"
              alt="Mbi Roy portrait in professional setting with artistic background"
              className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 transition-all duration-1000" />

          </div>
          <div className="absolute -bottom-12 -right-12 bg-accent p-8 rounded-[40px] shadow-2xl border border-border max-sm:hidden">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Icon name="StarIcon" size={32} variant="solid" className="text-accent fill-current" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary/60">
                  Experience
                </p>
                <p className="text-3xl font-bold text-primary">10+ Years</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Mobile-only experience badge */}
          <div className="sm:hidden bg-accent p-6 rounded-[30px] shadow-lg border border-border mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Icon name="StarIcon" size={24} variant="solid" className="text-accent fill-current" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary/60">
                  Experience
                </p>
                <p className="text-2xl font-bold text-primary">10+ Years</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              1
            </span>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Biography
            </p>
          </div>

          <h2 className="text-5xl md:text-6xl font-serif tracking-tight">
            A Journey Through Creativity
          </h2>

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Mbi Roy is a multi-talented creative professional with over a decade of experience
              spanning music performance, comedy, animation, and coaching. What began as a passion
              for entertaining others has evolved into a diverse career touching multiple creative
              disciplines.
            </p>
            <p>
              From electrifying live music performances that captivate audiences to stand-up comedy
              that delivers genuine laughter, Mbi brings authenticity and energy to every stage.
              Behind the scenes, his animation work brings stories to life with stunning visual
              storytelling.
            </p>
            <p>
              Through comedy coaching, Mbi shares his expertise with aspiring performers, helping
              them find their unique voice and develop the confidence to succeed on stage.
            </p>
          </div>

          <div className="pt-8 border-t border-border grid grid-cols-2 gap-8">
            <div>
              <p className="text-4xl font-bold text-primary">500+</p>
              <p className="text-xs font-medium text-muted-foreground mt-2">Shows Performed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">50+</p>
              <p className="text-xs font-medium text-muted-foreground mt-2">Animations Created</p>
            </div>
          </div>
        </div>
      </div>
    </section>);

}