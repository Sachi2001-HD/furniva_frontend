import { useEffect, useRef, useState } from "react";
import { Armchair, Pencil, Plus, Trash2, X } from "lucide-react";

function Thumb({ src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-accent/40 text-primary/60"
      >
        <Armchair size={22} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-xl object-cover"
    />
  );
}

export default function CategoryManagerModal({
  categories,
  counts,
  busy,
  locked, 
  onClose,
  onNew,
  onEdit,
  onToggle,
  onDelete,
}) {
  const [confirmId, setConfirmId] = useState(null);

  const newRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    newRef.current?.focus();

    const onKey = (event) => {
      if (event.key === "Escape" && !lockedRef.current) closeRef.current();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  const handleDelete = async (category) => {
    await onDelete(category);
    setConfirmId(null);
  };

  const iconButton =
    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/70 transition focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-manager-title"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-accent/50 bg-accent/25 px-6 py-5">
          <div>
            <h2 id="category-manager-title" className="font-display text-2xl">
              Manage categories
            </h2>
            <p className="mt-0.5 text-sm text-secondary/65">
              Hidden categories and their products don’t appear in the shop.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-secondary/70 transition hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-accent/40 px-6 py-4">
          <button
            ref={newRef}
            type="button"
            onClick={onNew}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-[15px] font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus size={18} aria-hidden="true" />
            New category
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="px-6 py-12 text-center text-secondary/70">
            No categories yet. Create your first one above.
          </p>
        ) : (
          <ul className="flex-1 divide-y divide-accent/40 overflow-y-auto">
            {categories.map((category) => {
              const count = counts[category._id] ?? 0;
              const isBusy = !!busy[category._id];
              const confirming = confirmId === category._id;
              const on = category.isActive !== false;

              return (
                <li
                  key={category._id}
                  className={`px-5 py-4 ${on ? "" : "bg-accent/10"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={on ? "" : "opacity-50"}>
                      <Thumb key={category.image ?? "none"} src={category.image} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{category.name}</p>
                      <p className="truncate text-sm text-secondary/65">
                        {count} {count === 1 ? "product" : "products"}
                        {!on && " · Hidden from shop"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`${category.name} visible in shop`}
                        title={on ? "Visible in shop" : "Hidden from shop"}
                        disabled={isBusy}
                        onClick={() => onToggle(category)}
                        className={`relative h-6 w-11 shrink-0 rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${
                          on
                            ? "border-primary bg-primary"
                            : "border-secondary/25 bg-accent"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
                            on ? "translate-x-5" : ""
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        disabled={isBusy}
                        aria-label={`Edit ${category.name}`}
                        title="Edit"
                        className={`${iconButton} text-primary hover:bg-accent/30`}
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmId(category._id)}
                        disabled={isBusy}
                        aria-label={`Delete ${category.name}`}
                        title="Delete"
                        className={`${iconButton} text-[#9B2C1F] hover:bg-[#9B2C1F]/10`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {confirming && (
                    <div
                      role="alert"
                      className="mt-4 rounded-2xl bg-[#9B2C1F]/10 px-4 py-3"
                    >
                      {count > 0 ? (
                        <>
                          <p className="text-sm text-[#9B2C1F]">
                            “{category.name}” still has {count}{" "}
                            {count === 1 ? "product" : "products"}. Move{" "}
                            {count === 1 ? "it" : "them"} to another category
                            first, or hide the category instead.
                          </p>
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="inline-flex h-10 items-center rounded-full border border-accent bg-[#FDF8F1] px-5 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary"
                            >
                              OK
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-[#9B2C1F]">
                            Delete “{category.name}”? This can’t be undone.
                          </p>
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              disabled={isBusy}
                              className="inline-flex h-10 items-center rounded-full border border-accent bg-[#FDF8F1] px-5 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category)}
                              disabled={isBusy}
                              className="inline-flex h-10 items-center rounded-full bg-[#9B2C1F] px-5 text-sm font-medium text-white transition hover:bg-[#7F2318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C1F] disabled:opacity-60"
                            >
                              {isBusy ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}