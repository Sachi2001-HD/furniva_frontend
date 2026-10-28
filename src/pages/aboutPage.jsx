import { Leaf, Hammer, Recycle, Heart, ArrowRight } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import livingRoom from "../assets/images/hero.jpg";
import loungeChair from "../assets/images/lounge_chair.jpg";
import sideboard from "../assets/images/sideboard.jpg";
import diningTable from "../assets/images/dining_table.jpg";

const values = [
  { icon: Leaf, title: "Responsible timber", text: "Every plank traced back to a certified forest." },
  { icon: Hammer, title: "Handmade joinery", text: "Dovetails and mortise-and-tenon, no shortcuts." },
  { icon: Recycle, title: "Built to be repaired", text: "Parts and refinishing for the life of the piece." },
  { icon: Heart, title: "Made for living", text: "Designed around real homes, kids and dinners." },
];

const steps = [
  { title: "The first bench", text: "A small workshop and one walnut bench for a neighbour." },
  { title: "Our own studio", text: "A team of makers and a growing collection of tables and chairs." },
  { title: "Furniva online", text: "Bringing handcrafted pieces straight to homes everywhere." },
];

const team = [
  { role: "Head Maker", focus: "Joinery & design", image: diningTable, alt: "Walnut dining table with four chairs" },
  { role: "Upholstery Lead", focus: "Comfort & fabrics", image: loungeChair, alt: "Oak lounge chair with a linen cushion" },
  { role: "Finishing Artisan", focus: "Oils & lacquers", image: sideboard, alt: "Teak sideboard with a ceramic vase" },
];

const tileRadius = "rounded-[32px] sm:rounded-[40px]";

function ImageTile({ src, alt, className = "" }) {
  return (
    <div className={`overflow-hidden bg-accent/30 ${tileRadius} ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function StatTile({ value, label, className = "" }) {
  return (
    <div
      className={`flex min-h-220px flex-col justify-end p-8 sm:p-10 ${tileRadius} ${className}`}
    >
      <p className="font-display text-6xl leading-none sm:text-7xl">{value}</p>
      <p className="mt-2 text-lg opacity-80">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
      <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      {/* Intro */}
      <section className="px-4 pb-14 pt-12 text-center sm:px-8 sm:pt-16">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-highlight">
          Our story
        </p>
        <h1 className="mx-auto mt-5 max-w-5xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-[88px]">
          We believe furniture should
          <em className="block text-primary">outlive trends.</em>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-secondary/70 sm:text-xl sm:leading-9">
          Furniva started with a simple idea: make honest, solid-wood pieces
          that become part of your family’s story.
        </p>
      </section>

      {/* Photo and stats grid */}
      <section className="px-4 sm:px-8">
        <div className="mx-auto grid max-w-[1680px] gap-4 sm:grid-cols-2 sm:gap-6 lg:auto-rows-340px lg:grid-cols-[2fr_1fr_1fr] xl:auto-rows-400px">
          <ImageTile
            src={livingRoom}
            alt="Sunlit living room with a walnut sideboard and round coffee table"
            className="aspect-4/3 sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:aspect-auto"
          />
          <StatTile
            value="12k+"
            label="Homes furnished"
            className="bg-primary text-background"
          />
          <ImageTile
            src={loungeChair}
            alt="Oak lounge chair with a linen cushion"
            className="aspect-4/3 lg:aspect-auto"
          />
          <ImageTile
            src={sideboard}
            alt="Teak sideboard with a ceramic vase"
            className="aspect-4/3 lg:aspect-auto"
          />
          <StatTile
            value="25y"
            label="Warranty on every piece"
            className="bg-accent/25 text-primary"
          />
        </div>
      </section>

      {/* Values */}
      <section className="px-4 pb-24 pt-24 sm:px-8">
        <div className="mx-auto max-w-[1680px]">
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
            What we stand for
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {values.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-[28px] border border-accent/50 bg-accent/20 p-7"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/50 text-primary">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-2xl">{title}</h3>
                <p className="mt-2 leading-7 text-secondary/70">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-secondary px-4 py-20 text-background sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-4xl tracking-tight sm:text-6xl">
            From one bench to your home
          </h2>
          <ol className="mt-14">
            {steps.map((step, i) => (
              <li key={step.title} className="relative pb-12 pl-14 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-4 top-10 w-px bg-background/25"
                  />
                )}
                <span className="absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full bg-highlight text-sm font-semibold text-secondary">
                  {i + 1}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl">{step.title}</h3>
                <p className="mt-2 text-lg text-background/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-[1680px]">
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
            The hands behind the wood
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {team.map((member) => (
              <article key={member.role} className="group">
                <div className={`overflow-hidden bg-accent/30 ${tileRadius}`}>
                  <img
                    src={member.image}
                    alt={member.alt}
                    loading="lazy"
                    className="aspect-4/5 w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-5 font-display text-2xl">{member.role}</h3>
                <p className="text-secondary/60">{member.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-4 pb-24 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-32px bg-primary px-6 py-16 text-center text-background sm:rounded-[48px] sm:py-24">
          <h2 className="mx-auto max-w-3xl font-display text-4xl leading-tight tracking-tight sm:text-6xl">
            Find the piece that feels like home
          </h2>
          <a
            href="/products"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-background px-8 py-4 text-lg font-medium text-primary transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background motion-safe:hover:-translate-y-0.5"
          >
            Explore the collection
            <ArrowRight size={20} aria-hidden="true" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}