import { Link } from "react-router-dom";
import { Briefcase, Home, MapPin, Plus } from "lucide-react";

const LABEL_ICONS = { Home, Work: Briefcase, Other: MapPin };

export default function SavedAddressPicker({ addresses, selectedId, onSelect, onNew }) {
  if (addresses.length === 0) return null;

  return (
    <fieldset className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <legend className="text-sm font-medium">Saved addresses</legend>
        <Link
          to="/addresses"
          className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Manage
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => {
          const Icon = LABEL_ICONS[address.label] ?? MapPin;

          return (
            <label key={address._id} className="block cursor-pointer">
              <input
                type="radio"
                name="saved-address"
                checked={selectedId === address._id}
                onChange={() => onSelect(address)}
                className="peer sr-only"
              />
              <span className="flex h-full gap-3 rounded-2xl border border-accent/70 bg-background p-4 transition hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-[0_0_0_3px_rgba(113,62,38,0.12)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/40 text-primary">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {address.label}
                    {address.isDefault && (
                      <span className="ml-2 text-xs font-normal text-secondary/60">
                        Default
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-sm text-secondary/70">
                    {address.address}
                  </span>
                  <span className="block truncate text-sm text-secondary/55">
                    {address.city}
                  </span>
                </span>
              </span>
            </label>
          );
        })}

        <label className="block cursor-pointer">
          <input
            type="radio"
            name="saved-address"
            checked={selectedId === "new"}
            onChange={onNew}
            className="peer sr-only"
          />
          <span className="flex h-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-background p-4 text-primary transition hover:border-primary peer-checked:border-solid peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/40">
              <Plus size={18} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">Use a different address</span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}