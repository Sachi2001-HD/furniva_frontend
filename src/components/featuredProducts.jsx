import { ArrowRight } from "lucide-react";
import ProductCard from "./productCard";

export default function FeaturedProducts({ products, viewAllHref = "#" }) {
  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="px-4 pb-24 sm:px-8"
    >
      <div className="mx-auto max-w-[1680px] border-t border-accent pt-8 sm:pt-16">
        <h2
          id="featured-heading"
          className="mb-8 font-display text-4xl leading-tight tracking-tight sm:mb-10 sm:text-5xl"
        >
          Featured products
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <a
            href={viewAllHref}
            className="group inline-flex items-center gap-2 text-base font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-lg"
          >
            View all
            <ArrowRight
              size={18}
              className="transition motion-safe:group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}