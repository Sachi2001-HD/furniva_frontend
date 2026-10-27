import { Link } from "react-router-dom";
import {
  Check,
  Ruler,
  Heart,
  PackageCheck,
  Leaf,
  ArrowRight,
} from "lucide-react";
import {
  materials,
  products,
  MAX_PRICE,
  formatPrice,
} from "../../data/products";

function Section({ title, children }) {
  return (
    <div className="border-t border-accent/40 py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2.5 text-[15px] font-semibold text-secondary">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, icon: Icon, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1 text-left"
    >
      <span className="flex items-center gap-2.5 text-[15px] text-secondary/85">
        <Icon size={18} className="text-primary" />
        {label}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-primary" : "bg-accent/60"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}

export default function FilterPanel({ filters, onChange, onReset }) {
  const toggleMaterial = (id) =>
    onChange({
      materials: filters.materials.includes(id)
        ? filters.materials.filter((m) => m !== id)
        : [...filters.materials, id],
    });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-secondary/60 underline-offset-4 hover:text-primary hover:underline"
        >
          Reset all
        </button>
      </div>

      <Section title="Wood & material">
        {materials.map((m) => (
          <label
            key={m.id}
            className="flex cursor-pointer items-center gap-3 py-1"
          >
            <input
              type="checkbox"
              className="peer sr-only"
              checked={filters.materials.includes(m.id)}
              onChange={() => toggleMaterial(m.id)}
            />
            <span className="grid h-5 w-5 place-items-center rounded-md border border-accent bg-background text-background transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15">
              <Check size={13} strokeWidth={3} />
            </span>
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: m.swatch }}
            />
            <span className="flex-1 text-[15px] text-secondary/85">{m.id}</span>
            <span className="text-sm text-secondary/45">
              {products.filter((p) => p.material === m.id).length}
            </span>
          </label>
        ))}
      </Section>

      <Section title="Price range">
        <input
          type="range"
          min={10000}
          max={MAX_PRICE}
          step={5000}
          value={filters.maxPrice}
          onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
          aria-label="Maximum price"
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-sm text-secondary/60">
          <span>Rs. 0</span>
          <span>Up to {formatPrice(filters.maxPrice)}</span>
        </div>
      </Section>

      <Section title="Will it fit?">
        <div className="relative">
          <Ruler
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
          />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Width of your space"
            value={filters.maxWidth}
            onChange={(e) => onChange({ maxWidth: e.target.value })}
            className="h-11 w-full rounded-2xl border border-accent/70 bg-background pl-11 pr-12 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-secondary/50">
            cm
          </span>
        </div>
        <p className="mt-1.5 text-xs text-secondary/55">
          Indicative only. Please measure your room too.
        </p>
      </Section>

      <Section title="Availability">
        <Toggle
          icon={PackageCheck}
          label="In stock only"
          checked={filters.inStock}
          onChange={(v) => onChange({ inStock: v })}
        />
        <Toggle
          icon={Heart}
          label="Saved pieces only"
          checked={filters.saved}
          onChange={(v) => onChange({ saved: v })}
        />
      </Section>

      <div className="mt-1 rounded-3xl bg-primary p-4 text-background">
        <div className="flex items-center gap-2">
          <Leaf size={20} className="text-highlight" />
          <p className="font-display text-lg">Not sure what fits?</p>
        </div>
        <p className="mt-1 text-sm leading-5 text-background/75">
          Book a free online design consultation.
        </p>
        <Link
          to="/consultation"
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-background px-4 text-sm font-medium text-primary transition hover:bg-accent"
        >
          Book consultation <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}