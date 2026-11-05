import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiRequest } from "../utils/api";
import {
  MAX_PER_PRODUCT,
  addToCart,
  clearCart as clearStoredCart,
  getCart,
  removeFromCart,
  setCartQuantity,
  subscribeToCart,
} from "../utils/cart";
import { sellingPrice } from "../utils/format";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [lines, setLines] = useState(getCart); 
  const [details, setDetails] = useState({});
  const [failed, setFailed] = useState({}); 
  const [notices, setNotices] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const linesRef = useRef(lines);
  linesRef.current = lines;
  const detailsRef = useRef(details);
  detailsRef.current = details;
  const requested = useRef(new Set());

  useEffect(() => subscribeToCart(() => setLines(getCart())), []);

  const load = useCallback(async (ids) => {
    if (ids.length === 0) return;
    setRefreshing(true);

    const results = await Promise.allSettled(
      ids.map((id) => apiRequest(`/products/${id}`))
    );

    const found = {};
    const failedNow = {};
    const adjusted = {};

    results.forEach((result, index) => {
      const id = ids[index];

      if (result.status === "fulfilled") {
        const product = result.value;
        found[id] = product;

        const stored = getCart().find((line) => line.product === id)?.quantity ?? 0;
        const max = Math.min(product.stock ?? 0, MAX_PER_PRODUCT);
        if (max > 0 && stored > max) {
          setCartQuantity(id, max, max);
          adjusted[id] = `Only ${max} available, so we adjusted your quantity.`;
        }
      } else if (result.reason?.status === 404) {
        found[id] = null;
      } else {
        failedNow[id] = true; 
      }
    });

    setDetails((previous) => ({ ...previous, ...found }));
    setFailed((previous) => {
      const next = { ...previous, ...failedNow };
      Object.keys(found).forEach((id) => delete next[id]);
      return next;
    });
    if (Object.keys(adjusted).length > 0) {
      setNotices((previous) => ({ ...previous, ...adjusted }));
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const missing = lines
      .map((line) => line.product)
      .filter((id) => !requested.current.has(id));

    if (missing.length === 0) return;
    missing.forEach((id) => requested.current.add(id));
    load(missing);
  }, [lines, load]);

  const refresh = useCallback(
    () => load(linesRef.current.map((line) => line.product)),
    [load]
  );

  const dropNotice = useCallback((id) => {
    setNotices((previous) => {
      if (!previous[id]) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }, []);

  const addItem = useCallback((product, quantity = 1, { open = true } = {}) => {
    const stock = product.stock ?? 0;
    if (stock <= 0) return { ok: false, reason: "out_of_stock" };

    const id = product._id ?? product.id;
    const max = Math.min(stock, MAX_PER_PRODUCT);
    const existing = getCart().find((line) => line.product === id)?.quantity ?? 0;
    const wanted = existing + quantity;

    addToCart(id, quantity, max);

    requested.current.add(id);
    setDetails((previous) => ({ ...previous, [id]: product }));

    if (open) setDrawerOpen(true);
    return { ok: true, quantity: Math.min(wanted, max), capped: wanted > max };
  }, []);

  const setQuantity = useCallback(
    (id, quantity) => {
      const product = detailsRef.current[id];
      const max = product
        ? Math.min(product.stock ?? 0, MAX_PER_PRODUCT) || 1
        : MAX_PER_PRODUCT;

      setCartQuantity(id, quantity, max);
      dropNotice(id);
    },
    [dropNotice]
  );

  const removeItem = useCallback(
    (id) => {
      removeFromCart(id);
      dropNotice(id);
    },
    [dropNotice]
  );

  const clearCart = useCallback(() => clearStoredCart(), []);

  const items = useMemo(
    () =>
      lines.map((line) => {
        const id = line.product;
        const product = details[id];
        const base = { id, quantity: line.quantity, notice: notices[id] ?? "" };

        if (product === undefined) {
          return { ...base, status: failed[id] ? "error" : "loading" };
        }
        if (product === null || (product.stock ?? 0) <= 0) {
          return {
            ...base,
            status: "unavailable",
            name: product?.name ?? "",
            image: product?.images?.[0] ?? null,
          };
        }

        return {
          ...base,
          status: "ready",
          name: product.name,
          image: product.images?.[0] ?? null,
          price: product.price,
          offerPrice: product.offerPrice ?? null,
          stock: product.stock,
          max: Math.min(product.stock, MAX_PER_PRODUCT),
          material: product.material ?? "",
          colour: product.colour ?? "",
        };
      }),
    [lines, details, failed, notices]
  );

  const value = useMemo(() => {
    const ready = items.filter((item) => item.status === "ready");

    return {
      items,
      readyItems: ready,
      itemCount: items
        .filter((item) => item.status !== "unavailable")
        .reduce((sum, item) => sum + item.quantity, 0),
      subtotal: ready.reduce((sum, item) => sum + sellingPrice(item) * item.quantity, 0),
      savings: ready.reduce(
        (sum, item) => sum + (item.price - sellingPrice(item)) * item.quantity,
        0
      ),
      hasUnavailable: items.some((item) => item.status === "unavailable"),
      hasPending: items.some(
        (item) => item.status === "loading" || item.status === "error"
      ),
      refreshing,
      drawerOpen,
      openCart: () => setDrawerOpen(true),
      closeCart: () => setDrawerOpen(false),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      refresh,
    };
  }, [items, refreshing, drawerOpen, addItem, setQuantity, removeItem, clearCart, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}