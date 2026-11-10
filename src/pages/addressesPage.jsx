import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Check,
  Home,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import PageShell from "../components/pageShell";
import AddressFormDrawer from "../components/addresses/addressFormDrawer";
import { useAuth } from "../context/authContext";
import {
  MAX_ADDRESSES,
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from "../utils/addressApi";

const LABEL_ICONS = { Home, Work: Briefcase, Other: MapPin };

function AddressCard({
  address,
  busy,
  confirming,
  onEdit,
  onMakeDefault,
  onAskDelete,
  onCancelDelete,
  onDelete,
}) {
  const Icon = LABEL_ICONS[address.label] ?? MapPin;
  const place = [address.city, address.postalCode].filter(Boolean).join(" ");

  return (
    <li
      className={`relative flex flex-col rounded-3xl border bg-[#FDF8F1] p-6 transition sm:p-7 ${
        address.isDefault
          ? "border-primary shadow-[0_0_0_3px_rgba(113,62,38,0.12),0_16px_40px_rgba(113,62,38,0.12)]"
          : "border-accent/50 shadow-[0_10px_30px_rgba(113,62,38,0.06)] hover:shadow-[0_16px_40px_rgba(113,62,38,0.12)]"
      } ${busy ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-3.5 py-1.5 text-sm font-medium text-primary">
          <Icon size={16} aria-hidden="true" />
          {address.label}
        </span>

        {address.isDefault && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-background">
            <Check size={13} aria-hidden="true" />
            Default
          </span>
        )}
      </div>

      <div className="mt-5 flex-1">
        <h2 className="font-display text-2xl leading-tight">{address.fullName}</h2>

        <address className="mt-3 space-y-0.5 not-italic text-secondary/80">
          <p>{address.address}</p>
          <p>{place}</p>
        </address>

        <p className="mt-3 inline-flex items-center gap-2 text-sm text-secondary/70">
          <Phone size={15} aria-hidden="true" />
          {address.phone}
        </p>
      </div>

      {confirming ? (
        <div role="alert" className="mt-6 rounded-2xl bg-[#9B2C1F]/10 px-4 py-3">
          <p className="text-sm text-[#9B2C1F]">
            Delete this address? This can’t be undone.
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelDelete}
              disabled={busy}
              className="inline-flex h-10 items-center rounded-full border border-accent bg-[#FDF8F1] px-5 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="inline-flex h-10 items-center rounded-full bg-[#9B2C1F] px-5 text-sm font-medium text-white transition hover:bg-[#7F2318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B2C1F] disabled:opacity-60"
            >
              {busy ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-accent/40 pt-5">
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-accent/70 px-4 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
          >
            <Pencil size={15} aria-hidden="true" />
            Edit
          </button>

          {!address.isDefault && (
            <button
              type="button"
              onClick={onMakeDefault}
              disabled={busy}
              className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
            >
              Set as default
            </button>
          )}

          <button
            type="button"
            onClick={onAskDelete}
            disabled={busy}
            aria-label={`Delete the ${address.label} address for ${address.fullName}`}
            className="ml-auto grid h-10 w-10 place-items-center rounded-full text-[#9B2C1F] transition hover:bg-[#9B2C1F]/10 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
          >
            <Trash2 size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </li>
  );
}

function CardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="space-y-4 rounded-3xl border border-accent/50 bg-[#FDF8F1] p-7"
    >
      <span className="block h-8 w-24 rounded-full bg-accent/40 motion-safe:animate-pulse" />
      <span className="block h-7 w-1/2 rounded bg-accent/40 motion-safe:animate-pulse" />
      <span className="block h-4 w-3/4 rounded bg-accent/30 motion-safe:animate-pulse" />
      <span className="block h-4 w-1/3 rounded bg-accent/30 motion-safe:animate-pulse" />
    </li>
  );
}

export default function AddressesPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [drawer, setDrawer] = useState(null); // null | "new" | an address
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const atLimit = addresses.length >= MAX_ADDRESSES;

  const expireSession = useCallback(() => {
    logout();
    navigate("/login", { replace: true, state: { from: "/addresses" } });
  }, [logout, navigate]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError("");

      try {
        setAddresses(await fetchAddresses(token));
      } catch (failure) {
        if (failure.status === 401) expireSession();
        else setError(failure.message);
      } finally {
        setLoading(false);
      }
    },
    [token, expireSession]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type, text) => setToast({ type, text, id: Date.now() });

  const setBusyFor = (id, value) =>
    setBusy((previous) => {
      const next = { ...previous };
      if (value) next[id] = true;
      else delete next[id];
      return next;
    });

  const openNew = () => {
    setFormError("");
    setDrawer("new");
  };

  const openEdit = (address) => {
    setFormError("");
    setDrawer(address);
  };

  const save = async (payload) => {
    const editing = drawer && drawer !== "new" ? drawer : null;

    setSaving(true);
    setFormError("");

    try {
      if (editing) await updateAddress(token, editing._id, payload);
      else await createAddress(token, payload);

      await load({ silent: true });
      showToast("success", editing ? "Address updated" : "Address added");
      setDrawer(null);
    } catch (failure) {
      if (failure.status === 401) expireSession();
      else setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (address) => {
    setBusyFor(address._id, true);

    try {
      await setDefaultAddress(token, address._id);
      await load({ silent: true });
      showToast("success", `${address.label} is now your default address`);
    } catch (failure) {
      if (failure.status === 401) expireSession();
      else showToast("error", failure.message);
    } finally {
      setBusyFor(address._id, false);
    }
  };

  const remove = async (address) => {
    setBusyFor(address._id, true);

    try {
      await deleteAddress(token, address._id);
      setConfirmId(null);
      await load({ silent: true });
      showToast("success", "Address deleted");
    } catch (failure) {
      if (failure.status === 401) expireSession();
      else showToast("error", failure.message);
    } finally {
      setBusyFor(address._id, false);
    }
  };

  const addButton = (
    <button
      type="button"
      onClick={openNew}
      disabled={atLimit}
      className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus size={18} aria-hidden="true" />
      Add new address
    </button>
  );

  return (
    <PageShell width="max-w-5xl">
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed left-1/2 top-6 z-90 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] ${
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

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            My addresses
          </h1>
          <p className="mt-3 max-w-xl text-secondary/70 sm:text-lg">
            Save the places you’d like your furniture delivered. Your default
            address is filled in for you at checkout.
          </p>
        </div>

        {!loading && !error && addresses.length > 0 && addButton}
      </div>

      <section aria-label="Saved addresses" className="mt-10">
        {loading ? (
          <>
            <p role="status" className="sr-only">
              Loading your addresses
            </p>
            <ul className="grid gap-6 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </ul>
          </>
        ) : error ? (
          <div
            role="alert"
            className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center"
          >
            <p className="font-display text-2xl">We couldn’t load your addresses</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-primary/40 bg-[#FDF8F1] px-6 py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/40 text-primary">
              <MapPin size={28} aria-hidden="true" />
            </span>
            <p className="mt-6 font-display text-2xl">No saved addresses yet</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">
              Add your home or work address once and check out faster every time.
            </p>
            <div className="mt-8 flex justify-center">{addButton}</div>
          </div>
        ) : (
          <>
            <ul className="grid gap-6 md:grid-cols-2">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  busy={!!busy[address._id]}
                  confirming={confirmId === address._id}
                  onEdit={() => openEdit(address)}
                  onMakeDefault={() => makeDefault(address)}
                  onAskDelete={() => setConfirmId(address._id)}
                  onCancelDelete={() => setConfirmId(null)}
                  onDelete={() => remove(address)}
                />
              ))}

              <li>
                <button
                  type="button"
                  onClick={openNew}
                  disabled={atLimit}
                  className="flex h-full min-h-60 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/40 bg-accent/10 p-6 text-primary transition hover:border-primary hover:bg-accent/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-background">
                    <Plus size={22} aria-hidden="true" />
                  </span>
                  <span className="font-display text-xl">Add a new address</span>
                  <span className="text-sm text-secondary/65">
                    {atLimit
                      ? `You can save up to ${MAX_ADDRESSES} addresses`
                      : "Save time at checkout"}
                  </span>
                </button>
              </li>
            </ul>
          </>
        )}
      </section>

      {drawer !== null && (
        <AddressFormDrawer
          key={drawer === "new" ? "new" : drawer._id}
          address={drawer === "new" ? null : drawer}
          defaultName={[user?.firstName, user?.lastName].filter(Boolean).join(" ")}
          isFirst={addresses.length === 0}
          saving={saving}
          error={formError}
          onClose={() => setDrawer(null)}
          onSubmit={save}
        />
      )}
    </PageShell>
  );
}