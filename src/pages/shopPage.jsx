import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Sofa,
  Armchair,
  Coffee,
  Utensils,
  Archive,
} from "lucide-react";

import AnnouncementBar from "../components/announcementBar";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import ProductCard from "../components/productCard";
import ShopHero from "../components/shop/shopHero";
import FilterPanel from "../components/shop/filterPanel";
import CompareTray from "../components/shop/compareTray";

import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";
import { addToCart } from "../utils/cart";

const MAX_PRICE = 10000000;

const formatPrice = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

const categoryIcons = {
  sofa: Sofa,
  sofas: Sofa,
  chair: Armchair,
  chairs: Armchair,
  table: Coffee,
  tables: Coffee,
  dining: Utensils,
  storage: Archive,
};

const sortOptions = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["rating", "Top rated"],
];

const defaultFilters = {
  materials: [],
  maxPrice: MAX_PRICE,
  maxWidth: "",
  inStock: false,
  saved: false,
};

const normalizeProduct = (product) => {
  const categoryId =
    typeof product.category === "object"
      ? product.category?._id
      : product.category;

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name || ""
      : "";

  const dimensions = product.dimensions || {};

  const width = Number(
    dimensions.w ??
    dimensions.width ??
    0
  );

  return {
    ...product,

    // MongoDB ID
    id: product._id || product.id,

    // Category
    category: categoryId || "",
    categoryId,
    categoryName,

    // Stock
    inStock: Number(product.stock || 0) > 0,

    // Dimensions
    dimensions: {
      ...dimensions,
      w: width,
    },

    // Product display defaults
    images: product.images || [],
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    price: Number(product.price || 0),
    offerPrice:
      product.offerPrice != null
        ? Number(product.offerPrice)
        : null,
    material: product.material || "",
    description: product.description || "",
  };
};

export default function ShopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  // Main states
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState(defaultFilters);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("grid");

  // Product states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interaction states
  const [saved, setSaved] = useState(() => new Set());
  const [compare, setCompare] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState("");

  const searchRef = useRef(null);
  const toastTimer = useRef(null);

  // Fetch products from the backend
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest("/products");

        const productList = Array.isArray(response)
          ? response
          : response?.products || response?.data?.products || [];

        const normalizedProducts = productList.map(normalizeProduct);

        if (isMounted) {
          setProducts(normalizedProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);

        if (isMounted) {
          setError(
            err.message || "Unable to load products. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Category tabs
  const tabs = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      if (!product.category || !product.categoryName) return;

      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          id: product.category,
          label: product.categoryName,
        });
      }
    });

    const dynamicCategories = Array.from(categoryMap.values()).map(
      (item) => {
        const iconKey = item.label.toLowerCase().trim();

        return {
          ...item,
          icon: categoryIcons[iconKey] || Archive,
          count: products.filter(
            (product) => product.category === item.id
          ).length,
        };
      }
    );

    return [
      {
        id: "all",
        label: "All furniture",
        icon: LayoutGrid,
        count: products.length,
      },
      ...dynamicCategories,
    ];
  }, [products]);

  // Common functions
  const update = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const resetAll = () => {
    setFilters(defaultFilters);
    setCategory("all");
    setQuery("");
  };

  const scrollToCollection = () =>
    document
      .getElementById("collection")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  const showToast = (message) => {
    setToast(message);

    clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setToast("");
    }, 2200);
  };

  // Guests are sent to sign up
  const requireAuth = (action) => {
    if (!isLoggedIn) {
      navigate("/signup", {
        state: { from: location.pathname },
      });
      return;
    }

    action();
  };

  // Wishlist
  const toggleSave = (product) => {
    requireAuth(() => {
      setSaved((prev) => {
        const next = new Set(prev);

        next.has(product.id)
          ? next.delete(product.id)
          : next.add(product.id);

        return next;
      });
    });
  };

  // Cart
  const handleAddToCart = (product) => {
    requireAuth(() => {
      try {
        addToCart(
          product._id || product.id,
          1,
          product.stock
        );

        showToast(`${product.name} added to your cart`);
      } catch (error) {
        showToast(
          error.message || "Unable to add this product to your cart"
        );
      }
    });
  };

  // Product comparison
  const toggleCompare = (product) => {
    const exists = compare.some(
      (item) => item.id === product.id
    );

    if (!exists && compare.length >= 3) {
      showToast("You can compare up to 3 pieces");
      return;
    }

    setCompare(
      exists
        ? compare.filter((item) => item.id !== product.id)
        : [...compare, product]
    );
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;

      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(tag)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Search, filter and sort products
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = products.filter((product) => {
      const price = product.offerPrice ?? product.price;

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesMaterial =
        filters.materials.length === 0 ||
        filters.materials.includes(product.material);

      const matchesPrice =
        price <= filters.maxPrice;

      const matchesStock =
        !filters.inStock || product.inStock;

      const matchesSaved =
        !filters.saved || saved.has(product.id);

      const matchesWidth =
        !filters.maxWidth ||
        (
          product.dimensions.w > 0 &&
          product.dimensions.w <= Number(filters.maxWidth)
        );

      const searchableText = [
        product.name,
        product.description,
        product.material,
        product.categoryName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !q || searchableText.includes(q);

      return (
        matchesCategory &&
        matchesMaterial &&
        matchesPrice &&
        matchesStock &&
        matchesSaved &&
        matchesWidth &&
        matchesSearch
      );
    });

    const priceOf = (product) =>
      product.offerPrice ?? product.price;

    const sorters = {
      "price-asc": (a, b) =>
        priceOf(a) - priceOf(b),

      "price-desc": (a, b) =>
        priceOf(b) - priceOf(a),

      rating: (a, b) =>
        b.rating - a.rating,

      newest: (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0),

      featured: (a, b) =>
        Number(Boolean(b.isFeatured)) -
        Number(Boolean(a.isFeatured)),
    };

    return sorters[sort]
      ? [...list].sort(sorters[sort])
      : list;
  }, [products, category, filters, query, sort, saved]);

  // Active filter chips
  const chips = [
    ...filters.materials.map((material) => ({
      key: material,
      label: material,
      clear: () =>
        update({
          materials: filters.materials.filter(
            (item) => item !== material
          ),
        }),
    })),

    filters.maxPrice < MAX_PRICE && {
      key: "price",
      label: `Under ${formatPrice(filters.maxPrice)}`,
      clear: () => update({ maxPrice: MAX_PRICE }),
    },

    filters.maxWidth && {
      key: "width",
      label: `Fits ${filters.maxWidth} cm`,
      clear: () => update({ maxWidth: "" }),
    },

    filters.inStock && {
      key: "stock",
      label: "In stock",
      clear: () => update({ inStock: false }),
    },

    filters.saved && {
      key: "saved",
      label: "Saved",
      clear: () => update({ saved: false }),
    },

    query && {
      key: "query",
      label: `"${query}"`,
      clear: () => setQuery(""),
    },
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">

      {/* Announcement bar + navbar stay fixed together */}
      <div className="pointer-events-none sticky top-0 z-50">
        <AnnouncementBar />

        <div className="px-4 pt-4 sm:px-8 sm:pt-6">
          <div className="pointer-events-auto">
            <Navbar />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1680px] px-4 pb-28 pt-6 sm:px-8">

        {/* Hero carousel */}
        <ShopHero onExplore={scrollToCollection} />

        {/* Heading + search */}
        <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
              Find your everyday favourite
            </p>

            <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-secondary sm:text-5xl">
              Made for your home.
            </h1>
          </div>

          <div className="relative w-full lg:max-w-xl">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/50"
            />

            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search furniture, wood, style…"
              aria-label="Search furniture"
              className="h-14 w-full rounded-full border border-accent/70 bg-background pl-14 pr-16 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-secondary/60 hover:bg-accent/30"
              >
                <X size={18} />
              </button>
            ) : (
              <kbd className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-md border border-accent/70 px-2 py-0.5 text-xs text-secondary/50 sm:block">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Sticky toolbar */}
        <div className="sticky top-152px z-30 -mx-4 mt-8 px-4 sm:-mx-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-3 rounded-4xl border border-accent/40 bg-background/90 p-2.5 shadow-[0_8px_30px_rgba(113,62,38,0.08)] backdrop-blur">

            <div
              role="tablist"
              aria-label="Categories"
              className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scrollbar-width:none"
            >
              {tabs.map(({ id, label, icon: Icon, count }) => {
                const active = category === id;

                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(id)}
                    className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-medium transition ${
                      active
                        ? "bg-primary text-background shadow-sm"
                        : "text-secondary/75 hover:bg-accent/30"
                    }`}
                  >
                    <Icon size={18} />

                    {label}

                    <span
                      className={`text-sm ${
                        active
                          ? "text-background/70"
                          : "text-secondary/45"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="relative flex h-11 items-center gap-2 rounded-full border border-accent/60 px-4 text-[15px] font-medium text-secondary lg:hidden"
              >
                <SlidersHorizontal size={18} />
                Filters

                {chips.length > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-highlight px-1 text-xs text-background">
                    {chips.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort products"
                  className="h-11 appearance-none rounded-full border border-accent/60 bg-background pl-4 pr-10 text-[15px] text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                >
                  {sortOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60"
                />
              </div>

              <div className="hidden rounded-full bg-accent/30 p-1 sm:flex">
                {[
                  ["grid", LayoutGrid, "Grid view"],
                  ["list", List, "List view"],
                ].map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setView(id)}
                    aria-label={label}
                    aria-pressed={view === id}
                    className={`grid h-9 w-9 place-items-center rounded-full transition ${
                      view === id
                        ? "bg-background text-primary shadow-sm"
                        : "text-secondary/60 hover:text-primary"
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Body */}
        <div
          id="collection"
          className="mt-8 grid scroll-mt-240px gap-10 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]"
        >

          {/* Filters */}
          <aside className="hidden lg:block">
            <div className="[@media(min-height:900px)]:sticky @media(min-height:900px)]:top-[232px]">
              <FilterPanel
                filters={filters}
                onChange={update}
                onReset={resetAll}
              />
            </div>
          </aside>

          {/* Products */}
          <section>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <p className="mr-2 text-[15px] text-secondary/70">
                <span className="font-semibold text-secondary">
                  {loading ? "..." : filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "piece" : "pieces"} in the collection
              </p>

              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-accent/35 pl-3 pr-2 text-sm text-primary transition hover:bg-accent/60"
                >
                  {chip.label}
                  <X size={14} />
                </button>
              ))}
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="grid place-items-center rounded-4xl border border-dashed border-accent/70 px-6 py-20 text-center">
                <p className="text-secondary/65">
                  Loading furniture...
                </p>
              </div>

            ) : error ? (
              /* Error state */
              <div className="grid place-items-center rounded-4xl border border-dashed border-accent/70 px-6 py-20 text-center">
                <h3 className="font-display text-2xl text-primary">
                  Unable to load products
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-secondary/65">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-6 h-11 rounded-full bg-primary px-6 text-sm font-medium text-background hover:bg-secondary"
                >
                  Try again
                </button>
              </div>

            ) : filtered.length === 0 ? (
              /* No products state */
              <div className="grid place-items-center rounded-4xl border border-dashed border-accent/70 px-6 py-20 text-center">

                <Search size={36} className="text-primary/40" />

                <h3 className="mt-4 font-display text-2xl text-primary">
                  No pieces match yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-secondary/65">
                  Try a wider price range, remove a filter, or ask us about a
                  custom piece made to your measurements.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">

                  <button
                    type="button"
                    onClick={resetAll}
                    className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-background hover:bg-secondary"
                  >
                    Reset filters
                  </button>

                  <Link
                    to="/custom-furniture"
                    className="grid h-11 place-items-center rounded-full border border-primary px-6 text-sm font-medium text-primary hover:bg-accent/30"
                  >
                    Request custom furniture
                  </Link>

                </div>
              </div>

            ) : (
              /* Product cards */
              <div
                className={
                  view === "grid"
                    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col gap-5"
                }
              >
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    view={view}
                    showMeta
                    saved={saved.has(product.id)}
                    comparing={compare.some(
                      (item) => item.id === product.id
                    )}
                    onToggleWishlist={toggleSave}
                    onToggleCompare={toggleCompare}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

          </section>
        </div>
      </div>

      <Footer />

      {/* Mobile filter sheet */}
      {drawer && (
        <div className="fixed inset-0 z-60 lg:hidden">

          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-secondary/50"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-4xl bg-background p-6 shadow-2xl">

            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30"
            >
              <X size={22} />
            </button>

            <FilterPanel
              filters={filters}
              onChange={update}
              onReset={resetAll}
            />

            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="mt-6 h-12 w-full rounded-full bg-primary font-medium text-background"
            >
              Show {filtered.length}{" "}
              {filtered.length === 1 ? "piece" : "pieces"}
            </button>

          </div>
        </div>
      )}

      {/* Compare tray */}
      <CompareTray
        items={compare}
        onRemove={toggleCompare}
        onClear={() => setCompare([])}
      />

      {/* Toast */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-24 z-70 flex justify-center px-4 transition duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        }`}
      >
        <p className="rounded-full bg-secondary px-5 py-3 text-sm text-background shadow-xl">
          {toast}
        </p>
      </div>

    </main>
  );
}