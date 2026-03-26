import AppImage from '@/components/ui/AppImage';


export default function AboutPreview() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 md:gap-20 items-center">
        {/* Left: Image */}
        <div className="relative group">
          <div className="aspect-[4/5] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] overflow-hidden shadow-2xl">
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_13d092eae-1763295812729.png"
              alt="Mbi Roy portrait in creative workspace with artistic background"
              className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 transition-all duration-1000" />

          </div>
        </div>

        {/* Right: Content */}
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              4
            </span>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              About Mbi Roy
            </p>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight uppercase leading-none">
            Multi-talented Creative Professional
          </h2>

          <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              With over a decade of experience across music, comedy, animation, and coaching, Mbi
              Roy brings a unique blend of creativity and professionalism to every project.
            </p>
            <p>
              From electrifying live performances to captivating animations, each project is
              approached with passion, precision, and a commitment to excellence.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary">10+</p>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2">Years Experience</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary">500+</p>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2">Shows Performed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary">50+</p>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2">Animations Created</p>
            </div>
          </div>
        </div>
      </div>
    </section>);

}