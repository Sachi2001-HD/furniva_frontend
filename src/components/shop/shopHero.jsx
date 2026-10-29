import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import DiningTable from "../../assets/images/Dining_Table.jpg";
import Banner1 from "../../assets/images/banner1.jpg";
import Sideboard from "../../assets/images/banner2.jpg";

const slides = [
  {
    image: Banner1,
    heading: ["A little nature.", "A lot of home."],
    text: "Thoughtful wooden furniture for your everyday moments.",
  },
  {
    image: DiningTable,
    heading: ["Warm grain.", "Honest craft."],
    text: "Walnut, white oak and teak pieces, finished by hand.",
  },
  {
    image: Sideboard,
    heading: ["Sized to fit", "your space."],
    text: "Enter the width of your room and see what fits.",
  },
];

export default function ShopHero({ onExplore }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  //Timer
  useEffect(() => {
    if (!playing) return;

    const id = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => clearTimeout(id);
  }, [playing, index]);

  const go = (i) => setIndex((i + slides.length) % slides.length);
  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-480px overflow-hidden rounded-4xl bg-secondary sm:h-560px"
    >
      {/* Slide images */}
      {slides.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none ${
            i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        />
      ))}

      {/* Overlays for text contrast */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(40,21,14,0.82),rgba(40,21,14,0.4)_55%,rgba(40,21,14,0.1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,21,14,0.55),transparent_40%)]" />

      {/* Content */}
      <div
        key={index}
        aria-live={playing ? "off" : "polite"}
        className="relative z-10 flex h-full max-w-3xl flex-col justify-center px-6 pb-20 motion-safe:animate-rise sm:px-12 lg:px-72px"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/80">
          The Furniva collection
        </p>

        <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-background sm:text-6xl lg:text-7xl">
          {slide.heading[0]}
          <br />
          {slide.heading[1]}
        </h2>

        <p className="mt-5 max-w-sm text-lg leading-7 text-background/85">
          {slide.text}
        </p>

        <button
          type="button"
          onClick={onExplore}
          className="mt-8 inline-flex h-14 w-fit items-center gap-3 rounded-full bg-background px-8 text-base font-medium text-secondary transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background"
        >
          Explore the collection
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Indicators + pause */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 sm:bottom-8 sm:left-12 lg:left-72px">
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              className="flex h-6 items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-background"
                    : "w-1.5 bg-background/50 hover:bg-background/80"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          className="grid h-9 w-9 place-items-center rounded-full text-background/90 transition hover:bg-background/15"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>

      {/* Arrows */}
      <div className="absolute bottom-6 right-6 z-10 flex gap-3 sm:bottom-8 sm:right-8">
        {[
          [ArrowLeft, -1, "Previous slide"],
          [ArrowRight, 1, "Next slide"],
        ].map(([Icon, step, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => go(index + step)}
            aria-label={label}
            className="grid h-12 w-12 place-items-center rounded-full border border-background/60 text-background backdrop-blur-sm transition hover:bg-background hover:text-secondary"
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
    </section>
  );
}