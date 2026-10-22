import heroImg from "../assets/hero.jpg";

const stats = [
  { value: "12k+", label: "Happy homes" },
  { value: "4.9", label: "Avg. rating" },
  { value: "25y", label: "Warranty" },
];

export default function Hero() {
  return (
    <section className="px-4 pb-24 pt-12 sm:px-8 lg:pt-16">
      <div className="mx-auto grid max-w-[1680px] items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        
        {/* Left: copy */}
        <div>
          <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
            Stylish Furniture for <em className="text-primary">Every Space</em>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-secondary/70 sm:mt-8 sm:text-xl sm:leading-9">
            Better living starts with the right furniture. Explore our curated collection of stylish and functional pieces.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 sm:mt-12 sm:gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-6 rounded-3xl bg-primary px-7 py-4 text-lg font-medium text-background transition hover:bg-primary/90 sm:px-9 sm:py-5 sm:text-xl"
            >
              Shop Now
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-6 sm:mt-16 sm:gap-x-12">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl text-primary sm:text-5xl">
                  {s.value}
                </p>
                <p className="mt-1 text-base text-secondary/60 sm:text-lg">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image*/}
        <div className="relative">
          <img
            src={heroImg}
            alt="Sunlit living room with a walnut sideboard, rattan lounge chair and round coffee table"
            className="aspect-4/3 w-full rounded-[28px] object-cover shadow-[0_40px_80px_rgba(113,62,38,0.18)] sm:rounded-[44px]"
          />
        </div>
      </div>
    </section>
  );
}