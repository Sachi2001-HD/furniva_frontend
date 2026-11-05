const KEY = "furnivaCart";
const EVENT = "furniva-cart-change";

export const MAX_PER_PRODUCT = 20;

export const getCart = () => {
  try {
    const items = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const save = (items) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
  }
  
  window.dispatchEvent(new Event(EVENT));
};

const count = (items) => items.reduce((sum, item) => sum + item.quantity, 0);

export function addToCart(productId, quantity, max = MAX_PER_PRODUCT) {
  const items = getCart();
  const found = items.find((item) => item.product === productId);

  if (found) found.quantity = Math.min(found.quantity + quantity, max);
  else items.push({ product: productId, quantity: Math.min(quantity, max) });

  save(items);
  return count(items);
}

export function setCartQuantity(productId, quantity, max = MAX_PER_PRODUCT) {
  save(
    getCart().map((item) =>
      item.product === productId
        ? { ...item, quantity: Math.min(Math.max(1, quantity), max) }
        : item
    )
  );
}

export function removeFromCart(productId) {
  save(getCart().filter((item) => item.product !== productId));
}

export function clearCart() {
  save([]);
}

export function subscribeToCart(listener) {
  const onStorage = (event) => {
    if (event.key === KEY) listener();
  };

  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}