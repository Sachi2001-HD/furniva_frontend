import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Armchair,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Minus,
  Pencil,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import ProductFormDrawer from "../components/admin/productFormDrawer";
import CategoryFormModal from "../components/admin/categoryFormModal";
import CategoryManagerModal from "../components/admin/categoryManagerModal";
import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";

const LOW_STOCK = 5;
const PAGE_SIZE = 10;

const stockFilters = [
  { value: "all", label: "All" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

const sorts = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name A to Z" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "stock-asc", label: "Stock: low to high" },
];

const stockPill = {
  in: {
    label: "In stock",
    className: "border-[#BBD6B2] bg-[#DDEBD8] text-[#2F5D3A]",
  },
  low: {
    label: "Low stock",
    className: "border-[#E9C98F] bg-[#F7E3C3] text-[#7A4A12]",
  },
  out: {
    label: "Out of stock",
    className: "border-[#EBB8B0] bg-[#F8DCD7] text-[#8A1F14]",
  },
};

const stockEdge = {
  in: "border-transparent",
  low: "border-highlight",
  out: "border-[#B5392B]",
};

const segments = [
  { key: "in", label: "In stock", bar: "bg-[#4C8F5E]" },
  { key: "low", label: "Low stock", bar: "bg-highlight" },
  { key: "out", label: "Out of stock", bar: "bg-[#B5392B]" },
];

const defaultFilters = {
  search: "",
  category: "all",
  stock: "all",
  visibility: "all",
  sort: "newest",
};

// Define the available sort options for each category
const sortGroups = {
  product: { values: ["name"], cycle: ["name", "newest"] },
  price: {
    values: ["price-asc", "price-desc"],
    cycle: ["price-asc", "price-desc", "newest"],
  },
  stock: { values: ["stock-asc"], cycle: ["stock-asc", "newest"] },
};

const nextSort = (key, current) => {
  const { cycle } = sortGroups[key];
  return cycle[(cycle.indexOf(current) + 1) % cycle.length];
};

const sortByName = (list) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name));

const formatMoney = (n) => `Rs. ${Number(n).toLocaleString("en-US")}`;

const compactMoney = (n) =>
  n >= 1000000
    ? `Rs. ${(n / 1000000).toFixed(1).replace(".0", "")}M`
    : n >= 1000
    ? `Rs. ${Math.round(n / 1000)}k`
    : formatMoney(n);

const sellingPrice = (p) =>
  p.offerPrice != null && p.offerPrice < p.price ? p.offerPrice : p.price;

const getStockState = (stock) =>
  stock <= 0 ? "out" : stock <= LOW_STOCK ? "low" : "in";

const sorters = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  name: (a, b) => a.name.localeCompare(b.name),
  "price-desc": (a, b) => sellingPrice(b) - sellingPrice(a),
  "price-asc": (a, b) => sellingPrice(a) - sellingPrice(b),
  "stock-asc": (a, b) => a.stock - b.stock,
};

function Thumb({ src, className = "h-14 w-14" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-xl bg-accent/40 text-primary/60 ${className}`}
      >
        <Armchair size={24} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-xl object-cover ${className}`}
    />
  );
}

function StockPill({ stock }) {
  const pill = stockPill[getStockState(stock)];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${pill.className}`}
    >
      {pill.label}
    </span>
  );
}

function PriceCell({ product }) {
  const onOffer =
    product.offerPrice != null && product.offerPrice < product.price;
  const percent = onOffer
    ? Math.round((1 - product.offerPrice / product.price) * 100)
    : 0;

  return (
    <div>
      <p className="font-medium">
        {formatMoney(onOffer ? product.offerPrice : product.price)}
      </p>
      {onOffer && (
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
          <s className="text-secondary/65">
            <span className="sr-only">Original price </span>
            {formatMoney(product.price)}
          </s>
          <span className="rounded-full bg-highlight/20 px-2 py-0.5 text-xs font-medium text-[#7A4A12]">
            -{percent}%
          </span>
        </p>
      )}
    </div>
  );
}

function ProductInfo({ product, showCategory = false }) {
  const meta = [
    showCategory ? product.category?.name : null,
    product.material,
    product.colour,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-w-0 items-center gap-4">
      <Thumb
        src={product.images?.[0]}
        className={`h-16 w-16 ${product.isActive ? "" : "opacity-50"}`}
      />
      <div className="min-w-0">
        <p className="truncate font-medium">{product.name}</p>
        {meta && <p className="truncate text-sm text-secondary/65">{meta}</p>}
        {(product.badge || product.isFeatured) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {product.badge && (
              <span className="rounded-full bg-highlight/20 px-2 py-0.5 text-xs font-medium text-[#7A4A12]">
                {product.badge}
              </span>
            )}
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 text-xs text-secondary/65">
                <Star
                  size={12}
                  aria-hidden="true"
                  className="fill-highlight text-highlight"
                />
                Featured
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StockControl({ product, busy, onSave }) {
  const [draft, setDraft] = useState(String(product.stock));
  const skipCommit = useRef(false);

  useEffect(() => {
    setDraft(String(product.stock));
  }, [product.stock]);

  const apply = async (next) => {
    const ok = await onSave(product, next);
    if (!ok) setDraft(String(product.stock));
  };

  const commitDraft = () => {
    if (skipCommit.current) {
      skipCommit.current = false;
      return;
    }

    const next = Number(draft);

    if (draft.trim() === "" || !Number.isInteger(next) || next < 0) {
      setDraft(String(product.stock));
      return;
    }

    if (next !== product.stock) apply(next);
  };

  const step = (delta) => {
    const next = Math.max(0, product.stock + delta);
    if (next !== product.stock) apply(next);
  };

  const stepButton =
    "grid h-10 w-10 place-items-center text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      role="group"
      aria-label={`Stock for ${product.name}`}
      className={`inline-flex items-center overflow-hidden rounded-xl border border-accent/70 bg-background transition ${
        busy ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={busy || product.stock <= 0}
        aria-label={`Decrease stock for ${product.name}`}
        className={stepButton}
      >
        <Minus size={16} aria-hidden="true" />
      </button>

      <input
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        value={draft}
        disabled={busy}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            skipCommit.current = true;
            setDraft(String(product.stock));
            event.currentTarget.blur();
          }
        }}
        aria-label={`Stock quantity for ${product.name}`}
        className="h-10 w-14 border-x border-accent/70 bg-transparent text-center text-[15px] font-medium outline-none [appearance:textfield] focus:bg-accent/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => step(1)}
        disabled={busy}
        aria-label={`Increase stock for ${product.name}`}
        className={stepButton}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function VisibilitySwitch({ product, busy, onToggle }) {
  const on = product.isActive;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${product.name} visible in shop`}
        disabled={busy}
        onClick={() => onToggle(product)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${
          on ? "border-primary bg-primary" : "border-secondary/25 bg-accent"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
            on ? "translate-x-5" : ""
          }`}
        />
      </button>
      <span className="text-sm text-secondary/70">{on ? "Visible" : "Hidden"}</span>
    </div>
  );
}

function EditButton({ product, onEdit }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(product)}
      aria-label={`Edit ${product.name}`}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-accent/70 px-3.5 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Pencil size={15} aria-hidden="true" />
      Edit
    </button>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-2xl border border-accent/60 bg-background pl-4 pr-10 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60"
      />
    </label>
  );
}

function Chip({ active, count, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active
          ? "border-primary bg-primary font-medium text-background"
          : "border-accent/70 bg-background text-secondary/80 hover:border-primary/50 hover:text-primary"
      }`}
    >
      {children}
      {count != null && (
        <span
          className={`text-xs ${active ? "text-background/80" : "text-secondary/65"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Metric({ label, value, note, tone }) {
  const noteColor =
    tone === "warn"
      ? "text-[#8A4B12]"
      : tone === "bad"
      ? "text-[#9B2C1F]"
      : "text-secondary/65";

  return (
    <div className="bg-[#FDF8F1] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl leading-none text-primary xl:text-[40px]">
        {value}
      </p>
      <p className={`mt-3 text-sm ${noteColor}`}>{note}</p>
    </div>
  );
}

function Overview({ loading, ready, stats, onPickStock }) {
  const dash = loading ? "–" : null;
  const counts = { in: stats.inStock, low: stats.low, out: stats.out };

  return (
    <section
      aria-label="Inventory overview"
      className={`overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)] transition duration-500 motion-reduce:transition-none ${
        ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="grid gap-px bg-accent/40 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total products"
          value={dash ?? stats.total}
          note={loading ? "\u00a0" : `${stats.hidden} hidden from shop`}
        />
        <Metric
          label="Low stock"
          value={dash ?? stats.low}
          note={`${LOW_STOCK} or fewer left`}
          tone={stats.low > 0 ? "warn" : undefined}
        />
        <Metric
          label="Out of stock"
          value={dash ?? stats.out}
          note="Need restocking"
          tone={stats.out > 0 ? "bad" : undefined}
        />
        <Metric
          label="Stock value"
          value={dash ?? compactMoney(stats.value)}
          note="At current selling prices"
        />
      </div>

      {!loading && stats.total > 0 && (
        <div className="border-t border-accent/40 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Stock health</h2>
            <p className="text-sm text-secondary/65">
              {stats.inStock} of {stats.total} products well stocked
            </p>
          </div>

          <div
            aria-hidden="true"
            className="mt-3 flex h-3 overflow-hidden rounded-full bg-accent/40"
          >
            {segments.map(({ key, bar }) => (
              <span
                key={key}
                style={{
                  width: ready ? `${(counts[key] / stats.total) * 100}%` : "0%",
                }}
                className={`h-full transition-[width] duration-1000 ease-out motion-reduce:transition-none ${bar}`}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {segments.map(({ key, label, bar }) => (
              <button
                key={key}
                type="button"
                onClick={() => onPickStock(key)}
                className="inline-flex items-center gap-2 rounded-lg text-sm text-secondary/80 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${bar}`} />
                {label}
                <span className="font-medium text-secondary">{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function EmptyState({ title, text, children }) {
  return (
    <div className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
        <Armchair size={26} aria-hidden="true" />
      </span>
      <p className="mt-5 font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-secondary/70">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function Pagination({ start, count, total, current, pages, onPage }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-accent/40 px-6 py-4">
      <p className="text-sm text-secondary/70">
        Showing {start + 1}–{start + count} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
          className="grid h-10 w-10 place-items-center rounded-xl border border-accent/70 text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="min-w-24 text-center text-sm">
          Page {current} of {pages}
        </span>
        <button
          type="button"
          onClick={() => onPage(current + 1)}
          disabled={current === pages}
          aria-label="Next page"
          className="grid h-10 w-10 place-items-center rounded-xl border border-accent/70 text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function SortTh({ label, sortKey, sort, onSort, className = "px-4" }) {
  const active = sortGroups[sortKey].values.includes(sort);
  const descending = sort === "price-desc";

  return (
    <th
      scope="col"
      aria-sort={active ? (descending ? "descending" : "ascending") : "none"}
      className={`py-2 font-medium ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(nextSort(sortKey, sort))}
        className={`inline-flex items-center gap-1.5 rounded-lg py-2 text-xs font-medium uppercase tracking-[0.15em] transition hover:text-primary focus-visible:outline-2 focus-visible:outline-primary ${
          active ? "text-primary" : ""
        }`}
      >
        {label}
        {active ? (
          descending ? (
            <ArrowDown size={14} aria-hidden="true" />
          ) : (
            <ArrowUp size={14} aria-hidden="true" />
          )
        ) : (
          <ChevronsUpDown size={14} aria-hidden="true" className="opacity-50" />
        )}
      </button>
    </th>
  );
}

//Table
function ProductTable({ rows, busy, sort, onSort, onEdit, onToggle, onStock }) {
  const plainTh =
    "px-4 py-4 text-xs font-medium uppercase tracking-[0.15em]";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-1000px border-collapse text-left">
        <caption className="sr-only">
          Products and inventory. Use the column headings to sort.
        </caption>
        <thead>
          <tr className="bg-accent/25 text-secondary/65">
            <SortTh
              label="Product"
              sortKey="product"
              sort={sort}
              onSort={onSort}
              className="pl-6 pr-4"
            />
            <th scope="col" className={plainTh}>
              Category
            </th>
            <SortTh label="Price" sortKey="price" sort={sort} onSort={onSort} />
            <SortTh label="Stock" sortKey="stock" sort={sort} onSort={onSort} />
            <th scope="col" className={plainTh}>
              Shop visibility
            </th>
            <th scope="col" className="px-6 py-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((product) => {
            const state = getStockState(product.stock);
            const isBusy = !!busy[product._id];

            return (
              <tr
                key={product._id}
                className={`border-t border-accent/40 transition hover:bg-accent/15 ${
                  product.isActive ? "" : "bg-accent/10"
                }`}
              >
                <td className={`border-l-4 py-4 pl-5 pr-4 ${stockEdge[state]}`}>
                  <ProductInfo product={product} />
                </td>

                <td className="px-4 py-4">
                  <span className="inline-flex whitespace-nowrap rounded-full bg-accent/40 px-3 py-1 text-sm text-secondary/80">
                    {product.category?.name ?? "Uncategorised"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <PriceCell product={product} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <StockControl
                      product={product}
                      busy={isBusy}
                      onSave={onStock}
                    />
                    <StockPill stock={product.stock} />
                  </div>
                </td>

                <td className="px-4 py-4">
                  <VisibilitySwitch
                    product={product}
                    busy={isBusy}
                    onToggle={onToggle}
                  />
                </td>

                <td className="px-6 py-4 text-right">
                  <EditButton product={product} onEdit={onEdit} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Phones
function ProductList({ rows, busy, onEdit, onToggle, onStock }) {
  return (
    <ul className="divide-y divide-accent/40">
      {rows.map((product) => {
        const state = getStockState(product.stock);
        const isBusy = !!busy[product._id];

        return (
          <li
            key={product._id}
            className={`space-y-4 border-l-4 px-5 py-5 ${stockEdge[state]} ${
              product.isActive ? "" : "bg-accent/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <ProductInfo product={product} showCategory />
              <EditButton product={product} onEdit={onEdit} />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="mb-1 text-xs uppercase tracking-[0.15em] text-secondary/60">
                  Price
                </dt>
                <dd>
                  <PriceCell product={product} />
                </dd>
              </div>
              <div>
                <dt className="mb-1.5 text-xs uppercase tracking-[0.15em] text-secondary/60">
                  Shop visibility
                </dt>
                <dd>
                  <VisibilitySwitch
                    product={product}
                    busy={isBusy}
                    onToggle={onToggle}
                  />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="mb-1.5 text-xs uppercase tracking-[0.15em] text-secondary/60">
                  Stock
                </dt>
                <dd className="flex flex-wrap items-center gap-3">
                  <StockControl product={product} busy={isBusy} onSave={onStock} />
                  <StockPill stock={product.stock} />
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();

  const session = useRef({});
  session.current = { logout, navigate };

  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState(null);

  // Category management
  const [managerOpen, setManagerOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState(null); // null | "new" | category object
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // Open the add product panel
  const creating =
    location.pathname.replace(/\/+$/, "") === "/admin/products/new";
  const drawerOpen = creating || !!editing;

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = (type, text) => setToast({ type, text, id: Date.now() });

  const setBusyFor = (id, value) =>
    setBusy((previous) => {
      const next = { ...previous };
      if (value) next[id] = true;
      else delete next[id];
      return next;
    });

  const fail = (error) => {
    if (error.status === 401) {
      session.current.logout();
      session.current.navigate("/login", {
        replace: true,
        state: { from: "/admin/products" },
      });
      return;
    }
    showToast("error", error.message);
  };

  useEffect(() => {
    if (!token) return;

    let active = true;
    setLoading(true);
    setLoadError("");

    Promise.all([
      apiRequest("/products/admin/all", { token }),
      apiRequest("/categories/admin/all", { token }),
    ])
      .then(([productData, categoryData]) => {
        if (!active) return;
        setProducts(productData.products ?? []);
        setCategories(categoryData.categories ?? []);
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) {
          session.current.logout();
          session.current.navigate("/login", {
            replace: true,
            state: { from: "/admin/products" },
          });
          return;
        }
        setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, reloadKey]);

  const withCategory = (saved, previous) => {
    if (saved.category && typeof saved.category === "object") return saved;

    const found = categories.find((c) => c._id === saved.category);

    return {
      ...saved,
      category: found
        ? { _id: found._id, name: found.name }
        : previous?.category ?? saved.category,
    };
  };

  const replaceProduct = (saved) =>
    setProducts((previous) =>
      previous.map((p) => (p._id === saved._id ? withCategory(saved, p) : p))
    );

  const openCreate = () => navigate("/admin/products/new");

  const openEdit = (product) => {
    setFormError("");
    setEditing(product);
  };

  const closeDrawer = () => {
    setFormError("");
    setEditing(null);
    if (creating) navigate("/admin/products", { replace: true });
  };

  const saveProduct = async (payload) => {
    setSaving(true);
    setFormError("");

    try {
      if (editing) {
        const saved = await apiRequest(`/products/${editing._id}`, {
          method: "PUT",
          token,
          body: payload,
        });
        replaceProduct(saved);
        showToast("success", "Product updated");
      } else {
        const saved = await apiRequest("/products", {
          method: "POST",
          token,
          body: payload,
        });
        setProducts((previous) => [withCategory(saved), ...previous]);
        showToast("success", "Product added");
      }

      closeDrawer();
    } catch (error) {
      if (error.status === 401) fail(error);
      else setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStock = async (product, stock) => {
    setBusyFor(product._id, true);

    try {
      const saved = await apiRequest(`/products/${product._id}`, {
        method: "PUT",
        token,
        body: { stock },
      });
      replaceProduct(saved);
      return true;
    } catch (error) {
      fail(error);
      return false;
    } finally {
      setBusyFor(product._id, false);
    }
  };

  const toggleVisibility = async (product) => {
    const isActive = !product.isActive;
    setBusyFor(product._id, true);

    try {
      const saved = await apiRequest(`/products/${product._id}/status`, {
        method: "PATCH",
        token,
        body: { isActive },
      });
      replaceProduct(saved);
      showToast(
        "success",
        `${product.name} is now ${isActive ? "visible in" : "hidden from"} the shop`
      );
    } catch (error) {
      fail(error);
    } finally {
      setBusyFor(product._id, false);
    }
  };

  // Category actions
  const openCategoryForm = (category = null) => {
    setCategoryError("");
    setCategoryForm(category ?? "new");
  };

  const closeCategoryForm = () => {
    setCategoryError("");
    setCategoryForm(null);
  };

  const saveCategory = async (payload) => {
    const existing =
      categoryForm && categoryForm !== "new" ? categoryForm : null;

    setCategorySaving(true);
    setCategoryError("");

    try {
      if (existing) {
        const saved = await apiRequest(`/categories/${existing._id}`, {
          method: "PUT",
          token,
          body: payload,
        });

        setCategories((previous) =>
          sortByName(previous.map((c) => (c._id === saved._id ? saved : c)))
        );
        
        setProducts((previous) =>
          previous.map((p) =>
            p.category?._id === saved._id
              ? { ...p, category: { ...p.category, name: saved.name } }
              : p
          )
        );
        showToast("success", "Category updated");
      } else {
        const saved = await apiRequest("/categories", {
          method: "POST",
          token,
          body: payload,
        });

        setCategories((previous) => sortByName([...previous, saved]));
        showToast("success", `${saved.name} category added`);
      }

      closeCategoryForm();
    } catch (error) {
      if (error.status === 401) fail(error);
      else setCategoryError(error.message);
    } finally {
      setCategorySaving(false);
    }
  };

  const toggleCategory = async (category) => {
    const isActive = category.isActive === false;
    setBusyFor(category._id, true);

    try {
      const saved = await apiRequest(`/categories/${category._id}/status`, {
        method: "PATCH",
        token,
        body: { isActive },
      });

      setCategories((previous) =>
        previous.map((c) => (c._id === saved._id ? saved : c))
      );
      showToast(
        "success",
        `${category.name} is now ${isActive ? "visible in" : "hidden from"} the shop`
      );
    } catch (error) {
      fail(error);
    } finally {
      setBusyFor(category._id, false);
    }
  };

  const deleteCategory = async (category) => {
    setBusyFor(category._id, true);

    try {
      await apiRequest(`/categories/${category._id}`, {
        method: "DELETE",
        token,
      });

      setCategories((previous) => previous.filter((c) => c._id !== category._id));
      setFilters((previous) =>
        previous.category === category._id
          ? { ...previous, category: "all" }
          : previous
      );
      showToast("success", `${category.name} category deleted`);
    } catch (error) {
      fail(error);
    } finally {
      setBusyFor(category._id, false);
    }
  };

  const setFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters((previous) => ({ ...defaultFilters, sort: previous.sort }));
    setPage(1);
  };

  const stats = useMemo(() => {
    const low = products.filter((p) => getStockState(p.stock) === "low").length;
    const out = products.filter((p) => getStockState(p.stock) === "out").length;

    return {
      total: products.length,
      hidden: products.filter((p) => !p.isActive).length,
      low,
      out,
      inStock: products.length - low - out,
      value: products.reduce((sum, p) => sum + sellingPrice(p) * p.stock, 0),
    };
  }, [products]);

  const counts = useMemo(
    () => ({
      all: stats.total,
      in: stats.inStock,
      low: stats.low,
      out: stats.out,
    }),
    [stats]
  );

  const categoryCounts = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const id = p.category?._id;
      if (id) map[id] = (map[id] ?? 0) + 1;
    });
    return map;
  }, [products]);

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    const list = products.filter((p) => {
      if (
        q &&
        ![p.name, p.material, p.colour, p.category?.name].some((value) =>
          value?.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (filters.category !== "all" && p.category?._id !== filters.category) {
        return false;
      }
      if (filters.stock !== "all" && getStockState(p.stock) !== filters.stock) {
        return false;
      }
      if (filters.visibility === "active" && !p.isActive) return false;
      if (filters.visibility === "hidden" && p.isActive) return false;
      return true;
    });

    return [...list].sort(sorters[filters.sort] ?? sorters.newest);
  }, [products, filters]);

  const hasFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.stock !== "all" ||
    filters.visibility !== "all";

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);

  const handlers = {
    busy,
    onEdit: openEdit,
    onToggle: toggleVisibility,
    onStock: updateStock,
  };

  return (
    <AdminLayout
      title="Products & Inventory"
      subtitle="Manage your catalogue, prices and stock levels."
    >
      {/* Toast */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed left-1/2 top-6 z-70 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] ${
            toast.type === "error" ? "bg-[#9B2C1F]" : "bg-[#1F5C36]"
          }`}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
            {toast.type === "error" ? (
              <X size={16} aria-hidden="true" />
            ) : (
              <Check size={16} aria-hidden="true" />
            )}
          </span>
          {toast.text}
        </div>
      )}

      <Overview
        loading={loading}
        ready={ready}
        stats={stats}
        onPickStock={(key) => setFilter("stock", key)}
      />

      {/* Toolbar */}
      <section
        aria-label="Search and filters"
        className="mt-8 space-y-4 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-5 shadow-[0_10px_30px_rgba(113,62,38,0.06)]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block min-w-220px flex-1">
            <span className="sr-only">Search products</span>
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
              placeholder="Search by name, material or colour"
              className="h-11 w-full rounded-2xl border border-accent/60 bg-background pl-11 pr-4 text-[15px] outline-none transition placeholder:text-secondary/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>

          <div className="w-full sm:w-56">
            <FilterSelect
              label="Sort by"
              value={filters.sort}
              onChange={(value) => setFilter("sort", value)}
            >
              {sorts.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </FilterSelect>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-[15px] font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          >
            <Plus size={18} aria-hidden="true" />
            Add product
          </button>
        </div>

        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          <Chip
            active={filters.category === "all"}
            count={products.length}
            onClick={() => setFilter("category", "all")}
          >
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category._id}
              active={filters.category === category._id}
              count={categoryCounts[category._id] ?? 0}
              onClick={() => setFilter("category", category._id)}
            >
              {category.name}
              {category.isActive === false && (
                <span className="text-xs opacity-70">(hidden)</span>
              )}
            </Chip>
          ))}

          <button
            type="button"
            onClick={() => openCategoryForm()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-primary/60 px-4 text-sm font-medium text-primary transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus size={15} aria-hidden="true" />
            New category
          </button>

          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-primary/60 px-4 text-sm font-medium text-primary transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Pencil size={15} aria-hidden="true" />
            Manage categories
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-accent/40 pt-4">
          <div
            role="group"
            aria-label="Filter by stock"
            className="flex flex-wrap gap-1 rounded-full bg-accent/30 p-1"
          >
            {stockFilters.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filters.stock === value}
                onClick={() => setFilter("stock", value)}
                className={`rounded-full px-4 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-primary ${
                  filters.stock === value
                    ? "bg-[#FDF8F1] font-medium text-primary shadow-sm"
                    : "text-secondary/70 hover:text-primary"
                }`}
              >
                {label}
                <span className="ml-1.5 text-secondary/65">{counts[value]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <FilterSelect
                label="Shop visibility"
                value={filters.visibility}
                onChange={(value) => setFilter("visibility", value)}
              >
                <option value="all">All visibility</option>
                <option value="active">Visible in shop</option>
                <option value="hidden">Hidden</option>
              </FilterSelect>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
              >
                Clear filters
              </button>
            )}

            {!loading && !loadError && (
              <p role="status" className="text-sm text-secondary/65">
                {visible.length} {visible.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section aria-label="Products" className="mt-6">
        {loading ? (
          <div className="overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1]">
            <p role="status" className="sr-only">
              Loading products
            </p>
            <ul aria-hidden="true" className="divide-y divide-accent/40">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-5">
                  <span className="h-16 w-16 rounded-xl bg-accent/40 motion-safe:animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <span className="block h-4 w-1/3 rounded bg-accent/40 motion-safe:animate-pulse" />
                    <span className="block h-3 w-1/4 rounded bg-accent/30 motion-safe:animate-pulse" />
                  </div>
                  <span className="hidden h-10 w-32 rounded-xl bg-accent/30 motion-safe:animate-pulse md:block" />
                </li>
              ))}
            </ul>
          </div>
        ) : loadError ? (
          <div
            role="alert"
            className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center"
          >
            <p className="font-display text-2xl">We couldn’t load your products</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            text="Add your first product to start building the catalogue."
          >
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <Plus size={18} aria-hidden="true" />
              Add product
            </button>
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState
            title="No products match"
            text="Try a different search or clear your filters."
          >
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)]">
            <div className="hidden md:block">
              <ProductTable
                rows={rows}
                sort={filters.sort}
                onSort={(value) => setFilter("sort", value)}
                {...handlers}
              />
            </div>

            <div className="md:hidden">
              <ProductList rows={rows} {...handlers} />
            </div>

            <Pagination
              start={start}
              count={rows.length}
              total={visible.length}
              current={current}
              pages={pages}
              onPage={setPage}
            />
          </div>
        )}
      </section>

      {drawerOpen && (
        <ProductFormDrawer
          key={editing?._id ?? "new"}
          product={editing}
          categories={categories}
          saving={saving}
          error={formError}
          onClose={closeDrawer}
          onSubmit={saveProduct}
        />
      )}

      {managerOpen && (
        <CategoryManagerModal
          categories={categories}
          counts={categoryCounts}
          busy={busy}
          locked={categoryForm !== null}
          onClose={() => setManagerOpen(false)}
          onNew={() => openCategoryForm()}
          onEdit={(category) => openCategoryForm(category)}
          onToggle={toggleCategory}
          onDelete={deleteCategory}
        />
      )}

      {categoryForm !== null && (
        <CategoryFormModal
          key={categoryForm === "new" ? "new" : categoryForm._id}
          category={categoryForm === "new" ? null : categoryForm}
          saving={categorySaving}
          error={categoryError}
          onClose={closeCategoryForm}
          onSubmit={saveCategory}
        />
      )}
    </AdminLayout>
  );
}