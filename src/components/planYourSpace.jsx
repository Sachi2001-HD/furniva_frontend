import { Link } from "react-router-dom";
import { ArrowRight, Video, Sofa } from "lucide-react";

export default function SpaceServices() {
  return (
    <section className="mb-2 mx-8 rounded-3xl shadow-orange-200 bg-background/25 px-2 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto grid max-w-[1680px] grid-cols-1 divide-y divide-primary/30 lg:grid-cols-2 lg:divide-x lg:divide-y-0">

        {/* Plan Your Space */}
        <div className="flex flex-col items-start justify-between gap-8 px-2 py-6 sm:px-6 lg:py-8 lg:pr-12">
          <div>
            <Video
              size={42}
              strokeWidth={1.75}
              aria-hidden="true"
              className="text-[#445444]"
            />

            <p className="mt-7 text-sm uppercase tracking-[0.2em] text-[#445444]">
              A little direction. A lot of possibility.
            </p>

            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Let’s plan your space.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-secondary/70 sm:text-lg sm:leading-8">
              Explore furniture choices, room layouts, and an online
              consultation with a brief shaped around your home.
            </p>
          </div>

          <Link
            to="/consultation"
            className="group inline-flex h-13 items-center gap-3 rounded-full bg-primary px-7 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.18)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Prepare a consultation brief
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Custom Furniture */}
        <div className="flex flex-col items-start justify-between gap-8 px-2 py-4 sm:px-6 lg:py-4 lg:pl-12">
          <div>
            <Sofa
              size={42}
              strokeWidth={1.75}
              aria-hidden="true"
              className="text-[#445444]"
            />

            <p className="mt-7 text-sm uppercase tracking-[0.2em] text-[#445444]">
              Made personal
            </p>

            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Custom furniture for you.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-secondary/70 sm:text-lg sm:leading-8">
              A different size. A favourite finish. A piece that feels
              entirely yours. Start with your vision.
            </p>
          </div>

          <Link
            to="/custom-furniture"
            className="group inline-flex h-13 items-center gap-3 rounded-full bg-primary px-7 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.18)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Start a custom design brief
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>

      </div>
    </section>
  );
}
