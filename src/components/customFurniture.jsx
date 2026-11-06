import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CustomFurniture({
  to = "/custom",
  image = "/images/custom-furniture.jpg", // put your photo in public/images/
}) {
  const [failed, setFailed] = useState(false);

  return (
    <section
      id="custom"
      aria-labelledby="custom-heading"
      className="relative isolate overflow-hidden bg-[#2B140C] text-background"
    >
      {!failed && (
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(34,16,10,0.9),rgba(34,16,10,0.6)_55%,rgba(34,16,10,0.3))]"
      />

      <div className="mx-auto flex min-h-520px max-w-[1680px] flex-col justify-center px-4 py-20 sm:min-h-600px sm:px-8 sm:py-28">
        <p className="text-sm uppercase tracking-[0.2em] text-background/85">
          Made personal
        </p>

        <h2
          id="custom-heading"
          className="mt-5 max-w-3xl font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Custom furniture.
          <span className="block">Your ideas, in wood.</span>
        </h2>

        <p className="mt-8 max-w-xl text-lg leading-8 text-background/90 sm:text-xl">
          A different size. A favourite finish. A piece that feels entirely
          yours. Start with your vision.
        </p>

        <Link
          to={to}
          className="group mt-10 inline-flex h-14 w-fit items-center gap-3 rounded-full bg-[#FDF8F1] px-7 text-lg font-medium text-secondary transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FDF8F1]"
        >
          Start a custom design brief
          <ArrowRight
            size={18}
            aria-hidden="true"
            className="transition motion-safe:group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}