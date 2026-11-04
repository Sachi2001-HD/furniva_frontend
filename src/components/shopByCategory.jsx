import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  BedDouble,
  ChevronRight,
  Laptop,
  Sofa,
  TreePine,
  Utensils,
} from "lucide-react";
import { useFetchData } from "../hooks/useFetchData";
import { optimizeImage } from "../utils/cloudinary";

const TILES = [
  {
    key: "living",
    label: "Living Room",
    match: ["livingroom", "living"],
    icon: Sofa,
    span: "col-span-1 row-span-1",
    fallback: "/images/categories/living-room.jpg",
  },
  {
    key: "bedroom",
    label: "Bedroom",
    match: ["bedroom", "bedrooms"],
    icon: BedDouble,
    span: "col-span-1",
    fallback: "/images/categories/bedroom.jpg",
  },
  {
    key: "dining",
    label: "Dining Room",
    match: ["diningroom", "dining"],
    icon: Utensils,
    span: "col-span-1",
    fallback: "/images/categories/dining-room.jpg",
  },
  {
    key: "office",
    label: "Office",
    match: ["office", "homeoffice"],
    icon: Laptop,
    span: "col-span-1",
    fallback: "/images/categories/office.jpg",
  },
  {
    key: "storage",
    label: "Storage & Organization",
    match: ["storageandorganization", "storageandorganisation", "storage"],
    icon: Archive,
    span: "col-span-1",
    fallback: "/images/categories/storage.jpg",
  },
  {
    key: "outdoor",
    label: "Outdoor Furniture",
    match: ["outdoorfurniture", "outdoor"],
    icon: TreePine,
    span: "col-span-1",
    fallback: "/images/categories/outdoor.jpg",
  },
];

const normalise = (text = "") =>
  text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");

const placeholderStyle = {
  backgroundColor: "#7A4528",
  backgroundImage:
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 9px), linear-gradient(135deg, #8F5A38 0%, #5E3320 100%)",
};

function Tile({ tile, category, shopTo }) {
  const Icon = tile.icon;

  const sources = [
    category?.image ? optimizeImage(category.image, 1000) : null,
    tile.fallback,
  ].filter(Boolean);

  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];

  const to = category ? `${shopTo}?category=${category._id}` : shopTo;

  return (
    <Link
      to={category ? `${shopTo}?category=${category._id}` : shopTo}
      className="group absolute inset-0 block overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setAttempt((current) => current + 1)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none motion-safe:group-hover:scale-105"
        />
      ) : (
        <span
          aria-hidden="true"
          style={placeholderStyle}
          className="absolute inset-0 grid place-items-center text-background/30"
        >
          <Icon size={64} strokeWidth={1.25} />
        </span>
      )}

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,21,14,0.4),transparent_50%)]"
      />

      //Category label
      <span className="absolute bottom-0 right-0 bg inline-flex max-w-[calc(100%-24px)] items-center gap-2 rounded-2xl bg-secondary/80 mr-2 mb-0.5 py-2 pl-4 pr-2.5 text-md font-semibold text-white shadow-[0_6px_20px_rgba(40,21,14,0.25)] transition-all duration-300 group-hover:bg-#713e26 group-hover:text-white sm:bottom-5 sm:right-5 sm:gap-3 sm:py-2.5 sm:pl-5 sm:pr-3 sm:text-base lg:text-lg">
        <span className="truncate">{tile.label}</span>
        <span
          aria-hidden="true"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-#713e26 text-white transition-colors group-hover:text-#713e26 sm:h-8 sm:w-8"
        >
          <ChevronRight size={18} />
        </span>
      </span>
    </Link>
  );
}

export default function ShopByCategory({ shopTo = "/shop" }) {
  const { data } = useFetchData("/categories");
  const categories = data?.categories ?? [];

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="px-4 pb-20 sm:px-8"
    >
      <div className="mx-auto max-w-[1680px] border-t border-accent pt-4 sm:pt-16">
        <div className="mb-8 sm:mb-10">
          <h2
            id="categories-heading"
            className="font-display text-4xl leading-tight tracking-tight sm:text-5xl"
          >
            Shop by category
          </h2>
          <p className="mt-3 max-w-xl text-secondary/70 sm:text-lg">
            Find furniture tailored to every room.
          </p>
        </div>

        {/* Three images per row */}
        <ul
          className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
          style={{ gridAutoRows: "clamp(160px, 22vw, 260px)" }}
        >
          {TILES.map((tile) => {
            const category = categories.find((item) =>
              tile.match.includes(normalise(item.name))
            );

            return (
              <li key={tile.key} className={`relative ${tile.span}`}>
                {/* key resets the image fallback once the category loads */}
                <Tile
                  key={`${tile.key}-${category?.image ?? "none"}`}
                  tile={tile}
                  category={category}
                  shopTo={shopTo}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
