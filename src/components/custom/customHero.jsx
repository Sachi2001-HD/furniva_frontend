import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Armchair,
  ArrowRight,
  ArrowUpRight,
  Hammer,
  Ruler,
  TreePine,
  Sparkles,
} from "lucide-react";
import { WOODS } from "./options";

const MAIN_IMAGE =
  "https://res.cloudinary.com/nogj197t/image/upload/v1793976215/ngocnghia1810-living-room-8480223_1920.jpg";
const INSET_IMAGE =
  "https://res.cloudinary.com/nogj197t/image/upload/v1793965884/images_8.jpg";

const FACTS = [
  { icon: Ruler, label: "Made to your size" },
  { icon: TreePine, label: "Solid timber joinery" },
  { icon: Hammer, label: "Made by hand" },
];

const SIZES = [140, 180, 220, 160];
const MAX_SIZE = 240;

const grain =
  "repeating-linear-gradient(95deg, rgba(255,255,255,0.1) 0 2px, transparent 2px 7px), repeating-linear-gradient(88deg, rgba(0,0,0,0.07) 0 1px, transparent 1px 11px)";

const placeholderStyle = {
  backgroundColor: "#B98A5E",
  backgroundImage:
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 9px), linear-gradient(135deg, #D9BE9B 0%, #A8774D 100%)",
};

const darkWood = {
  backgroundColor: "#2B140C",
  backgroundImage: [
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px)",
    "repeating-linear-gradient(88deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 23px)",
    "repeating-linear-gradient(90deg, rgba(199,123,61,0.07) 0 3px, transparent 3px 41px)",
    "linear-gradient(180deg, #3A1D12 0%, #2B140C 55%, #22100A 100%)",
  ].join(","),
};

const tile =
  "group relative h-full w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

function Photo({ src, icon: Icon }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-hidden="true"
        style={placeholderStyle}
        className="absolute inset-0 grid place-items-center text-background/35"
      >
        <Icon size={56} strokeWidth={1.25} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none motion-safe:group-hover:scale-105"
    />
  );
}

function ArrowBadge({ dark = false }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
        dark ? "bg-background/15 text-background" : "bg-primary text-background"
      }`}
    >
      <ArrowUpRight
        size={16}
        className="transition motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
      />
    </span>
  );
}

function SwatchTile({ onClick }) {
  return (
    <a
      href="#design-studio"
      onClick={onClick}
      aria-label="Choose your timber in the design studio"
      className={`${tile} ${focus} flex flex-col justify-between border border-accent/60 bg-[#FDF8F1] p-4 shadow-[0_12px_30px_rgba(113,62,38,0.1)] transition duration-300 hover:shadow-[0_18px_44px_rgba(113,62,38,0.18)] sm:p-5`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-secondary/60 sm:text-xs">
          Timber
        </span>
        <ArrowBadge />
      </div>

      <div>
        <ul aria-hidden="true" className="flex">
          {WOODS.map((wood, index) => (
            <li
              key={wood.key}
              style={{
                backgroundColor: wood.color,
                backgroundImage: grain,
              }}
              className={`h-10 w-10 rounded-full shadow-sm ring-2 ring-[#FDF8F1] transition-[margin] duration-300 sm:h-12 sm:w-12 ${
                index > 0 ? "-ml-3 motion-safe:group-hover:ml-1" : ""
              }`}
            />
          ))}
        </ul>

        <p className="mt-3 text-sm font-medium text-secondary">
          <span className="sm:hidden">{WOODS.length} timbers</span>
          <span className="hidden sm:inline">
            {WOODS.map((wood) => wood.label).join(" · ")}
          </span>
        </p>
      </div>
    </a>
  );
}

function SizeTile({ onClick }) {
  const [index, setIndex] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(
      () => setIndex((current) => (current + 1) % SIZES.length),
      2600
    );

    return () => clearInterval(timer);
  }, []);

  const size = SIZES[index];

  return (
    <a
      href="#design-studio"
      onClick={onClick}
      aria-label="Set your size in the design studio"
      style={darkWood}
      className={`${tile} ${focus} flex flex-col justify-between p-4 text-background shadow-[0_12px_30px_rgba(43,20,12,0.3)] sm:p-5`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-background/65 sm:text-xs">
          Size
        </span>
        <ArrowBadge dark />
      </div>

      <div>
        <div aria-hidden="true">
          <p className="font-display text-4xl leading-none tabular-nums sm:text-5xl">
            {size}
            <span className="ml-1.5 text-base text-background/65 sm:text-lg">
              cm
            </span>
          </p>

          {/* Original ruler design */}
          <div className="relative mt-4 h-5">
            <div
              style={{ width: `${(size / MAX_SIZE) * 100}%` }}
              className="absolute left-0 top-0 h-5 transition-[width] duration-700 ease-out motion-reduce:transition-none"
            >
              <span className="absolute inset-x-0 top-0 h-2 rounded-full bg-highlight" />
              <span className="absolute right-0 top-0 h-5 w-0.5 rounded-full bg-highlight" />
            </div>

            <span
              className="absolute inset-x-0 bottom-0 h-2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(253,248,241,0.35) 0 1px, transparent 1px 10px)",
              }}
            />
          </div>

          <p className="mt-3 hidden text-sm text-background/75 sm:block">
            Any size you need
          </p>
        </div>

        <span className="sr-only">Made to any size you need</span>
      </div>
    </a>
  );
}

function DesignTile() {
  return (
    <div
      className={`${tile} flex flex-col justify-between border border-accent/60 bg-[#FDF8F1] p-4 shadow-[0_12px_30px_rgba(113,62,38,0.1)] sm:p-5`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-secondary/60 sm:text-xs">
          Your vision
        </span>

        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-background">
          <Sparkles size={16} />
        </span>
      </div>

      <div>
        <p className="font-display text-xl leading-snug text-secondary sm:text-2xl">
          Made for your space.
        </p>
        <p className="mt-2 text-sm leading-6 text-secondary/75">
          Your style, your dimensions, your very own furniture.
        </p>
      </div>
    </div>
  );
}

function Reveal({ ready, delay = 0, className = "", children }) {
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`min-h-0 transition duration-700 ease-out motion-reduce:transition-none ${
        ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function CustomHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let secondFrame;

    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, []);

  const goToStudio = (event) => {
    event.preventDefault();

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.getElementById("design-studio")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      aria-labelledby="custom-hero-heading"
      className="px-4 pb-14 pt-3 sm:px-8 sm:pt-5 lg:pb-20"
    >
      <div className="mx-auto grid max-w-[1680px] items-start gap-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16">

        {/* TEXT SECTION */}
        <div
          className={`relative z-10 pt-2 transition duration-700 ease-out motion-reduce:transition-none lg:mt-0 lg:pt-0 ${
            ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-sm uppercase mt-4 tracking-[0.2em] text-[#445444]">
            Made to measure
          </p>

          <h1
            id="custom-hero-heading"
            className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl xl:text-8xl"
          >
            Your ideas,
            <span className="block italic text-highlight">in wood.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-secondary/75 sm:text-xl sm:leading-9">
            A different size. A favourite timber. A piece that fits your room
            exactly. Design it with us, and our makers bring it to life.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#design-studio"
              onClick={goToStudio}
              className="group relative z-10 inline-flex h-14 items-center gap-3 whitespace-nowrap rounded-full bg-primary px-8 text-lg font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98]"
            >
              Start designing
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition motion-safe:group-hover:translate-x-1"
              />
            </a>

            <Link
              to="/consultation"
              className="inline-flex h-14 items-center whitespace-nowrap rounded-full border border-accent bg-[#FDF8F1] px-8 text-lg font-medium text-secondary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Talk to a designer
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-secondary/75">
            {FACTS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2.5">
                <Icon
                  size={18}
                  aria-hidden="true"
                  className="text-[#445444]"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* IMAGE SECTION */}
        <div className="relative isolate mt-4 mx-auto w-full lg:ml-auto lg:mr-0 lg:max-w-none">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(199,123,61,0.22),transparent_60%)]"
          />

          <div className="grid grid-cols-2 gap-3 sm:aspect-[1.08/1] sm:grid-cols-[1.1fr_0.9fr] sm:grid-rows-[1fr_1fr_0.85fr] sm:gap-4">

            {/* MAIN IMAGE */}
            <Reveal
              ready={ready}
              delay={120}
              className="order-1 col-span-2 aspect-4/3 sm:order-0 sm:col-span-1 sm:row-span-2 sm:aspect-auto"
            >
              <div
                className={`${tile} bg-[#D9BE9B] shadow-[0_20px_50px_rgba(113,62,38,0.2)]`}
              >
                <Photo src={MAIN_IMAGE} icon={TreePine} />

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(34,16,10,0.25),transparent_40%)]"
                />
              </div>
            </Reveal>

            {/* WOOD SELECTION */}
            <Reveal
              ready={ready}
              delay={220}
              className="order-2 min-h-36 sm:order-0 sm:min-h-0"
            >
              <SwatchTile onClick={goToStudio} />
            </Reveal>

            {/* SIZE SELECTION */}
            <Reveal
              ready={ready}
              delay={320}
              className="order-3 min-h-36 sm:order-0 sm:min-h-0"
            >
              <SizeTile onClick={goToStudio} />
            </Reveal>

            {/* SECOND IMAGE */}
            <Reveal
              ready={ready}
              delay={420}
              className="order-4 col-span-1 aspect-square sm:order-0 sm:col-span-1 sm:aspect-auto"
            >
              <div
                className={`${tile} bg-[#D9BE9B] shadow-[0_20px_50px_rgba(113,62,38,0.18)]`}
              >
                <Photo src={INSET_IMAGE} icon={Armchair} />
              </div>
            </Reveal>

            {/* NEW CONTENT TILE */}
            <Reveal
              ready={ready}
              delay={520}
              className="order-5 min-h-36 sm:order-0 sm:min-h-0"
            >
              <DesignTile />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
