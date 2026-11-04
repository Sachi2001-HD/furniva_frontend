import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, Leaf, Ruler } from "lucide-react";

const reasons = [
  {
    icon: Leaf,
    title: "A natural point of view",
    text: "Warm wood tones and honest textures, with character in every detail.",
  },
  {
    icon: Ruler,
    title: "Room for your ideas",
    text: "A starting point for furniture that suits your space and your way of living.",
  },
  {
    icon: HeartHandshake,
    title: "Thoughtful guidance",
    text: "Bring your questions, your inspiration, and the pieces you love.",
  },
];

const lightWoodGrain = {
  backgroundColor: "#E8D5BC",
  backgroundImage: [
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.20) 0 1px, transparent 1px 9px)",
    "repeating-linear-gradient(88deg, rgba(120,75,40,0.06) 0 2px, transparent 2px 23px)",
    "repeating-linear-gradient(90deg, rgba(160,105,60,0.08) 0 3px, transparent 3px 41px)",
    "linear-gradient(180deg, #F0E2CF 0%, #E3CCAE 55%, #D7BB99 100%)",
  ].join(","),
};

export default function WhyChooseFurniva({ aboutTo = "/about" }) {
  return (
    <section
      id="why-furniva"
      aria-labelledby="why-heading"
      className="mt-0 px-4 py-10 sm:px-8 sm:py-14 text-primary pt-4"
    >
      <div
        style={lightWoodGrain}
        className="mx-auto max-w-[1680px] overflow-hidden rounded-3xl px-6 py-12 shadow-sm sm:px-10 sm:py-14 lg:px-14"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-#28150e/70">
              More than a beautiful piece
            </p>
            <h2
              id="why-heading"
              className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Why choose Furniva?
            </h2>
          </div>

          <Link
            to={aboutTo}
            className="group inline-flex items-center gap-2 text-base font-medium text-#28150e hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-#28150e sm:text-lg"
          >
            Get to know us
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>

        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:mt-12 md:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }) => (
            <li key={title} className="border-t border-#28150e/25 pt-8">
              <Icon size={40} strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-6 font-display text-3xl">{title}</h3>
              <p className="mt-4 text-lg leading-8 text-#28150e/75">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
