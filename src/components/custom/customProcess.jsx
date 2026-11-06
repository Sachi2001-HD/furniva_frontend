import { Hammer, Ruler, Sparkles, Truck } from "lucide-react";

const STEPS = [
  { n: "01", icon: Ruler, title: "Design", text: "Share your piece, size and finish." },
  { n: "02", icon: Sparkles, title: "Refine", text: "We review drawings and details with you." },
  { n: "03", icon: Hammer, title: "Craft", text: "Made by hand with solid timber joinery." },
  { n: "04", icon: Truck, title: "Deliver", text: "Brought home, ready to live with." },
];

const woodGrain = {
  backgroundColor: "#2B140C",
  backgroundImage: [
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 9px)",
    "repeating-linear-gradient(88deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 23px)",
    "repeating-linear-gradient(90deg, rgba(199,123,61,0.07) 0 3px, transparent 3px 41px)",
    "linear-gradient(180deg, #3A1D12 0%, #2B140C 55%, #22100A 100%)",
  ].join(","),
};

export default function CustomProcess() {
  return (
    <section
      aria-labelledby="process-heading"
      style={woodGrain}
      className="text-background"
    >
      <h2 id="process-heading" className="sr-only">
        How custom furniture works
      </h2>

      <div className="mx-auto max-w-[1680px] px-4 py-14 sm:px-8 sm:py-20">
        <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, icon: Icon, title, text }) => (
            <li key={n} className="relative border-t border-background/20 pt-8">
              <span
                aria-hidden="true"
                className="absolute -top-1.5 left-0 h-3 w-3 rounded-full bg-highlight"
              />

              <div className="flex items-center gap-4">
                <span className="font-display text-5xl leading-none text-background/35">
                  {n}
                </span>
                <Icon size={26} strokeWidth={1.5} aria-hidden="true" className="text-highlight" />
              </div>

              <h3 className="mt-6 font-display text-3xl">{title}</h3>
              <p className="mt-2 text-lg leading-7 text-background/75">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}