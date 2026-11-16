import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../utils/api";
import { useAuth } from "./authContext";

const WishlistContext = createContext(null);

const productsOf = (data) => {
  const list = data?.wishlist?.products;
  return Array.isArray(list) && list.every((item) => item && typeof item === "object")
    ? [...list].reverse()
    : null;
};

export function WishlistProvider({ children }) {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        setItems([]);
        setError("");
        return;
      }

      if (!silent) setLoading(true);
      setError("");

      try {
        setItems(productsOf(await apiRequest("/wishlist", { token })) ?? []);
      } catch (failure) {
        setError(failure.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ids = useMemo(() => new Set(items.map((item) => String(item._id))), [items]);

  const isSaved = useCallback((id) => ids.has(String(id)), [ids]);

  const toggle = useCallback(
    async (product) => {
      if (!token) return { ok: false, reason: "login" };

      const id = String(product._id ?? product.id);
      const wasSaved = ids.has(id);

      setItems((previous) =>
        wasSaved
          ? previous.filter((item) => String(item._id) !== id)
          : [{ ...product, _id: id }, ...previous]
      );

      try {
        const data = await apiRequest("/wishlist/toggle", {
          method: "POST",
          token,
          body: { productId: id },
        });

        const fresh = productsOf(data);
        if (fresh) setItems(fresh);
        else await refresh({ silent: true });

        return { ok: true, saved: data?.action ? data.action === "added" : !wasSaved };
      } catch (failure) {
        await refresh({ silent: true });
        return { ok: false, reason: "error", message: failure.message };
      }
    },
    [token, ids, refresh]
  );

  const remove = useCallback(
    async (id) => {
      if (!token) return { ok: false, reason: "login" };

      setItems((previous) => previous.filter((item) => String(item._id) !== String(id)));

      try {
        await apiRequest(`/wishlist/remove/${id}`, { method: "DELETE", token });
        return { ok: true };
      } catch (failure) {
        await refresh({ silent: true });
        return { ok: false, reason: "error", message: failure.message };
      }
    },
    [token, refresh]
  );

  const clear = useCallback(async () => {
    if (!token) return { ok: false, reason: "login" };

    setItems([]);

    try {
      await apiRequest("/wishlist/clear", { method: "DELETE", token });
      return { ok: true };
    } catch (failure) {
      if (failure.status === 404) return { ok: true };
      await refresh({ silent: true });
      return { ok: false, reason: "error", message: failure.message };
    }
  }, [token, refresh]);

  const value = useMemo(
    () => ({ items, count: items.length, loading, error, isSaved, toggle, remove, clear, refresh }),
    [items, loading, error, isSaved, toggle, remove, clear, refresh]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return context;
}