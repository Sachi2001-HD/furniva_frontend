import { apiRequest } from "./api";

const PATHS = {
  create: "/orders",
  mine: "/orders/my",
  one: (id) => `/orders/${id}`,
};

const toNumber = (value) => Number(value ?? 0);

export function normaliseOrder(raw) {
  const items = (raw.items ?? raw.orderItems ?? []).map((item, index) => {
    const product =
      item.product && typeof item.product === "object" ? item.product : {};

    return {
      id: String(item._id ?? product._id ?? item.product ?? index),
      name: item.name ?? product.name ?? "Product",
      image: item.image ?? product.images?.[0] ?? null,
      price: toNumber(item.price ?? product.price),
      quantity: toNumber(item.quantity ?? item.qty ?? 1),
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const id = raw._id ?? raw.id;

  return {
    id,
    number: raw.orderNumber ?? String(id ?? "").slice(-8).toUpperCase(),
    status: raw.status ?? raw.orderStatus ?? "pending",
    createdAt: raw.createdAt,
    items,
    subtotal,
    total: toNumber(raw.total ?? raw.totalPrice ?? raw.totalAmount ?? subtotal),
    address: raw.shippingAddress ?? raw.address ?? {},
    paymentMethod: raw.paymentMethod ?? "",
    notes: raw.notes ?? "",
  };
}

export const buildOrderPayload = (lines, form) => ({
  items: lines.map((line) => ({ product: line.id, quantity: line.quantity })),
  shippingAddress: {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    address: [form.addressLine1.trim(), form.addressLine2.trim()]
      .filter(Boolean)
      .join(", "),
    city: form.city.trim(),
    postalCode: form.postalCode.trim(),
  },
  paymentMethod: form.paymentMethod,
  notes: form.notes.trim(),
});

export async function placeOrder(token, payload) {
  const data = await apiRequest(PATHS.create, { method: "POST", token, body: payload });
  return normaliseOrder(data.order ?? data);
}

export async function fetchMyOrders(token) {
  const data = await apiRequest(PATHS.mine, { token });
  const list = Array.isArray(data) ? data : data.orders ?? [];
  return list.map(normaliseOrder);
}

export async function fetchOrder(token, id) {
  const data = await apiRequest(PATHS.one(id), { token });
  return normaliseOrder(data.order ?? data);
}

// Timeline shown on the order page
export const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "On its way" },
  { key: "delivered", label: "Delivered" },
];

// step: index in STEPS, or -1 when cancelled
export function statusInfo(status = "") {
  const key = String(status).toLowerCase().replace(/[\s_-]/g, "");

  if (["cancelled", "canceled"].includes(key)) {
    return { label: "Cancelled", step: -1, tone: "bad" };
  }
  if (["delivered", "completed"].includes(key)) {
    return { label: "Delivered", step: 3, tone: "good" };
  }
  if (["shipped", "outfordelivery", "intransit"].includes(key)) {
    return { label: "On its way", step: 2, tone: "info" };
  }
  if (["confirmed", "processing", "paid"].includes(key)) {
    return { label: "Confirmed", step: 1, tone: "info" };
  }
  return { label: "Order placed", step: 0, tone: "warn" };
}