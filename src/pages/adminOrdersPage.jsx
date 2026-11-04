import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Clock3,
  PackageCheck,
  Truck,
  Banknote,
  ChevronRight,
  X,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  UserRound,
  CreditCard,
  Eye,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Package,
} from "lucide-react";

import AdminLayout from "../components/admin/adminLayout";
import { useAuth } from "../context/authContext";

const API_URL = import.meta.env.VITE_API_URL;

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const FILTERS = [
  "All Orders",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const getOrderStatus = (order) =>
  String(order.orderStatus || order.status || "pending").toLowerCase();

const getPaymentStatus = (order) =>
  String(order.paymentStatus || "pending").toLowerCase();

const getCustomerName = (order) => {
  const address = order.shippingAddress || {};
  const user = order.user || {};

  return (
    address.fullName ||
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Guest Customer"
  );
};

const getOrderItems = (order) => order.items || order.orderItems || [];

const getOrderTotal = (order) =>
  Number(
    order.totalAmount ??
      order.totalPrice ??
      order.total ??
      0
  );

const getItemName = (item) =>
  item.productName ||
  item.name ||
  item.product?.name ||
  "Furniture item";

const getItemImage = (item) =>
  item.image ||
  item.product?.images?.[0] ||
  item.product?.image ||
  "";

const getItemPrice = (item) =>
  Number(item.unitPrice ?? item.price ?? item.product?.price ?? 0);

const getItemQuantity = (item) => Number(item.quantity || 1);

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        statusStyles[normalized] || "bg-gray-100 text-gray-700"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {capitalize(normalized)}
    </span>
  );
}

function MetricCard({ title, value, icon: Icon, note, iconBg }) {
  return (
    <div className="rounded-2xl border border-accent/50 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-secondary/60">{title}</p>
          <h3 className="mt-3 font-display text-3xl font-semibold text-secondary sm:text-4xl">
            {value}
          </h3>
          <p className="mt-2 text-xs text-secondary/50">{note}</p>
        </div>

        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconBg}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ search, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#F4EBDD] text-primary">
        <ShoppingBag size={30} />
      </div>

      <h3 className="mt-5 font-display text-2xl text-secondary">
        No orders found
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-secondary/60">
        {search
          ? "We couldn't find any orders matching your search."
          : "Orders will appear here when customers place them."}
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl border border-accent px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-[#F8F0E6]"
      >
        Clear filters
      </button>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F5EDE2] text-primary">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-secondary/50">{label}</p>
        <p className="mt-1 wrap-break-word text-sm font-medium text-secondary">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function OrderTimeline({ status, createdAt, updatedAt }) {
  const steps = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const currentIndex = steps.indexOf(status);
  const isCancelled = status === "cancelled";

  return (
    <div className="rounded-2xl border border-accent/50 bg-[#FFFCF8] p-5">
      <h3 className="font-display text-xl text-secondary">Order timeline</h3>

      {isCancelled ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-rose-700">
          <CircleAlert size={20} />
          <div>
            <p className="text-sm font-semibold">Order cancelled</p>
            <p className="mt-1 text-xs">This order is no longer being processed.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {steps.map((step, index) => {
            const completed = currentIndex >= index;
            const isCurrent = currentIndex === index;

            return (
              <div key={step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-full ${
                      completed
                        ? "bg-primary text-white"
                        : "border border-accent bg-white text-secondary/30"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>

                  {index !== steps.length - 1 && (
                    <div
                      className={`mt-1 h-6 w-0.5 ${
                        currentIndex > index ? "bg-primary" : "bg-accent"
                      }`}
                    />
                  )}
                </div>

                <div className="pt-1">
                  <p
                    className={`text-sm ${
                      isCurrent
                        ? "font-semibold text-primary"
                        : completed
                          ? "font-medium text-secondary"
                          : "text-secondary/40"
                    }`}
                  >
                    {capitalize(step)}
                  </p>

                  {index === 0 && (
                    <p className="mt-1 text-xs text-secondary/50">
                      Order placed on {formatDate(createdAt)}
                    </p>
                  )}

                  {isCurrent && updatedAt && index !== 0 && (
                    <p className="mt-1 text-xs text-secondary/50">
                      Last updated {formatDate(updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderDetailsPanel({
  order,
  onClose,
  onStatusChange,
  updating,
}) {
  if (!order) return null;

  const items = getOrderItems(order);
  const address = order.shippingAddress || {};
  const customer = order.user || {};
  const status = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);

  const customerEmail = address.email || customer.email;
  const customerPhone = address.phone || address.contactNumber || customer.contactNumber;

  const subtotal = Number(
    order.subtotal ??
      items.reduce(
        (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
        0
      )
  );

  const shippingFee = Number(order.shippingFee || 0);
  const discount = Number(order.discountAmount || 0);

  return (
    <div className="fixed inset-0 z-60 flex justify-end">
      <button
        type="button"
        aria-label="Close order details"
        onClick={onClose}
        className="absolute inset-0 bg-secondary/50 backdrop-blur-[2px]"
      />

      <aside className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-[#FBF7F1] shadow-2xl">
        <div className="flex items-center justify-between border-b border-accent/50 bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/50">
              Order details
            </p>
            <h2 className="mt-1 font-display text-2xl text-secondary">
              #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full border border-accent text-secondary transition hover:bg-[#F5EDE2]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={status} />
            <p className="text-sm text-secondary/50">
              {formatDate(order.createdAt)} {formatTime(order.createdAt)}
            </p>
          </div>

          {/* Update order status */}
          <div className="rounded-2xl border border-accent/50 bg-white p-5">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-primary" />
              <h3 className="font-semibold text-secondary">Update order status</h3>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={status}
                disabled={updating}
                onChange={(event) => onStatusChange(order._id, event.target.value)}
                className="h-12 flex-1 rounded-xl border border-accent bg-[#FFFCF8] px-4 text-sm text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
              >
                {ORDER_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {capitalize(item)}
                  </option>
                ))}
              </select>

              {updating && (
                <div className="flex items-center gap-2 text-sm text-secondary/60">
                  <RefreshCw size={16} className="animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </div>

          {/* Customer */}
          <section>
            <h3 className="mb-4 font-display text-xl text-secondary">
              Customer information
            </h3>

            <div className="grid gap-4 rounded-2xl border border-accent/50 bg-white p-5 sm:grid-cols-2">
              <DetailRow
                icon={UserRound}
                label="Customer name"
                value={getCustomerName(order)}
              />

              <DetailRow
                icon={Mail}
                label="Email address"
                value={customerEmail}
              />

              <DetailRow
                icon={Phone}
                label="Contact number"
                value={customerPhone}
              />

              <DetailRow
                icon={MapPin}
                label="Delivery city"
                value={address.city}
              />
            </div>
          </section>

          {/* Shipping address */}
          <section>
            <h3 className="mb-4 font-display text-xl text-secondary">
              Delivery address
            </h3>

            <div className="rounded-2xl border border-accent/50 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5EDE2] text-primary">
                  <MapPin size={19} />
                </div>

                <div className="text-sm leading-6 text-secondary/80">
                  <p className="font-semibold text-secondary">
                    {address.fullName || getCustomerName(order)}
                  </p>
                  <p>{address.address || "Address not provided"}</p>
                  <p>
                    {[address.city, address.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {address.phone && <p>{address.phone}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Products */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-secondary">
                Ordered items
              </h3>
              <span className="text-xs text-secondary/50">
                {items.length} product{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item._id || item.product?._id || index}
                  className="flex gap-4 rounded-2xl border border-accent/50 bg-white p-3"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F4EBDD]">
                    {getItemImage(item) ? (
                      <img
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-primary/50">
                        <Package size={28} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-sm font-semibold text-secondary">
                      {getItemName(item)}
                    </h4>
                    <p className="mt-1 text-xs text-secondary/50">
                      Quantity: {getItemQuantity(item)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {formatCurrency(
                        getItemPrice(item) * getItemQuantity(item)
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment summary */}
          <section>
            <h3 className="mb-4 font-display text-xl text-secondary">
              Payment summary
            </h3>

            <div className="rounded-2xl border border-accent/50 bg-white p-5">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-secondary/60">Subtotal</span>
                <span className="font-medium text-secondary">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-3 text-sm">
                <span className="text-secondary/60">Shipping fee</span>
                <span className="font-medium text-secondary">
                  {formatCurrency(shippingFee)}
                </span>
              </div>

              {discount > 0 && (
                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <span className="text-secondary/60">Discount</span>
                  <span className="font-medium text-emerald-700">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}

              <div className="my-4 border-t border-dashed border-accent" />

              <div className="flex justify-between gap-3">
                <span className="font-semibold text-secondary">Total amount</span>
                <span className="font-display text-xl font-semibold text-primary">
                  {formatCurrency(getOrderTotal(order))}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8F2E9] p-3">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <CreditCard size={17} />
                  {capitalize(order.paymentMethod || "Not specified")}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    paymentStatus === "paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : paymentStatus === "failed"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Payment: {capitalize(paymentStatus)}
                </span>
              </div>
            </div>
          </section>

          {/* Customer note */}
          {order.note && (
            <section>
              <h3 className="mb-3 font-display text-xl text-secondary">
                Customer note
              </h3>
              <div className="rounded-2xl border border-accent/50 bg-white p-5 text-sm leading-6 text-secondary/70">
                {order.note}
              </div>
            </section>
          )}

          <OrderTimeline
            status={status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </div>

        <div className="border-t border-accent/50 bg-white px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            Close order details
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");

  const pageSize = 8;

  const fetchOrders = async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to load orders.");
      }

      const orderList = Array.isArray(result)
        ? result
        : result.orders || result.data || [];

      setOrders(orderList);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Something went wrong.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchOrders(controller.signal);

    return () => controller.abort();
  }, [token]);

  const metrics = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) => getOrderStatus(order) === "pending"
    ).length;

    const processing = orders.filter((order) =>
      ["confirmed", "processing", "shipped"].includes(getOrderStatus(order))
    ).length;

    const delivered = orders.filter(
      (order) => getOrderStatus(order) === "delivered"
    ).length;

    const revenue = orders
      .filter((order) => getPaymentStatus(order) === "paid")
      .reduce((sum, order) => sum + getOrderTotal(order), 0);

    return { total, pending, processing, delivered, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeFilter !== "All Orders") {
      result = result.filter(
        (order) =>
          getOrderStatus(order) === activeFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((order) => {
        const orderNumber = String(
          order.orderNumber || order._id || ""
        ).toLowerCase();

        const customerName = getCustomerName(order).toLowerCase();
        const email = String(order.user?.email || "").toLowerCase();

        return (
          orderNumber.includes(query) ||
          customerName.includes(query) ||
          email.includes(query)
        );
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [orders, activeFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [activeFilter, search, sortBy]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!ORDER_STATUSES.includes(newStatus)) return;

    try {
      setUpdatingId(orderId);

      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderStatus: newStatus }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to update order status.");
      }

      const updatedOrder = result.order || result.data || result;

      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? {
                ...order,
                ...updatedOrder,
                orderStatus:
                  updatedOrder.orderStatus || newStatus,
              }
            : order
        )
      );

      setSelectedOrder((previous) =>
        previous?._id === orderId
          ? {
              ...previous,
              ...updatedOrder,
              orderStatus: updatedOrder.orderStatus || newStatus,
            }
          : previous
      );
    } catch (err) {
      window.alert(err.message || "Unable to update order.");
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setActiveFilter("All Orders");
    setSortBy("newest");
    setPage(1);
  };

  const handleRefresh = () => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="Manage customer orders, payments, and deliveries."
    >
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* Page heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-secondary/60">
              Here's what's happening with your store.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-accent bg-white px-4 text-sm font-medium text-secondary transition hover:bg-[#F8F0E6] disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Overview cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Total orders"
            value={metrics.total}
            icon={ShoppingBag}
            note="All orders received"
            iconBg="bg-[#F3E8D9] text-[#80502F]"
          />

          <MetricCard
            title="Pending"
            value={metrics.pending}
            icon={Clock3}
            note="Awaiting confirmation"
            iconBg="bg-amber-100 text-amber-700"
          />

          <MetricCard
            title="In progress"
            value={metrics.processing}
            icon={Truck}
            note="Being prepared or shipped"
            iconBg="bg-blue-100 text-blue-700"
          />

          <MetricCard
            title="Delivered"
            value={metrics.delivered}
            icon={PackageCheck}
            note="Successfully completed"
            iconBg="bg-emerald-100 text-emerald-700"
          />

          <MetricCard
            title="Paid revenue"
            value={formatCurrency(metrics.revenue)}
            icon={Banknote}
            note="Orders marked as paid"
            iconBg="bg-purple-100 text-purple-700"
          />
        </section>

        {/* Order management */}
        <section className="overflow-hidden rounded-2xl border border-accent/50 bg-white shadow-sm">
          {/* Table heading */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-accent/40 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-display text-2xl text-secondary">
                Order management
              </h2>
              <p className="mt-1 text-sm text-secondary/50">
                Review and manage all customer orders.
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F0E7] px-3 py-2 text-sm font-medium text-primary">
              {filteredOrders.length} orders
            </div>
          </div>

          {/* Search and sorting */}
          <div className="flex flex-col gap-3 border-b border-accent/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order ID or customer..."
                className="h-11 w-full rounded-xl border border-accent/60 bg-[#FFFCF8] pl-11 pr-4 text-sm outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-secondary/50" />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 flex-1 rounded-xl border border-accent/60 bg-white px-3 text-sm text-secondary outline-none focus:border-primary sm:flex-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto border-b border-accent/40 px-5 py-4 sm:px-6">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "bg-[#F7F2EB] text-secondary/65 hover:bg-[#EFE4D5] hover:text-secondary"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="m-5 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CircleAlert size={18} />
                {error}
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-[#F5EFE7]"
                />
              ))}
            </div>
          ) : paginatedOrders.length === 0 ? (
            <EmptyState search={search} onReset={clearFilters} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-900px text-left">
                  <thead className="bg-[#FCF9F5] text-xs uppercase tracking-wider text-secondary/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order</th>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 font-semibold">Items</th>
                      <th className="px-5 py-4 font-semibold">Total</th>
                      <th className="px-5 py-4 font-semibold">Payment</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-accent/30">
                    {paginatedOrders.map((order) => {
                      const items = getOrderItems(order);
                      const status = getOrderStatus(order);
                      const paymentStatus = getPaymentStatus(order);

                      return (
                        <tr
                          key={order._id}
                          className="transition hover:bg-[#FFFCF8]"
                        >
                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-primary">
                              #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="max-w-180px truncate text-sm font-medium text-secondary">
                              {getCustomerName(order)}
                            </p>
                            <p className="mt-1 max-w-180px truncate text-xs text-secondary/45">
                              {order.user?.email || order.shippingAddress?.email || ""}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm text-secondary">
                              {formatDate(order.createdAt)}
                            </p>
                            <p className="mt-1 text-xs text-secondary/45">
                              {formatTime(order.createdAt)}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {items.slice(0, 2).map((item, index) => (
                                  <div
                                    key={item._id || index}
                                    className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-[#F4EBDD]"
                                  >
                                    {getItemImage(item) ? (
                                      <img
                                        src={getItemImage(item)}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="grid h-full place-items-center text-primary/60">
                                        <Package size={15} />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <span className="text-xs text-secondary/60">
                                {items.length} item{items.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm font-semibold text-secondary">
                              {formatCurrency(getOrderTotal(order))}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                paymentStatus === "paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : paymentStatus === "failed"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {capitalize(paymentStatus)}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge status={status} />
                          </td>

                          <td className="px-5 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              aria-label={`View order ${order.orderNumber || order._id}`}
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-accent px-3 text-xs font-semibold text-secondary transition hover:border-primary hover:bg-[#F7F0E7] hover:text-primary"
                            >
                              <Eye size={15} />
                              View
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile order cards */}
              <div className="space-y-3 p-4 md:hidden">
                {paginatedOrders.map((order) => (
                  <button
                    type="button"
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full rounded-2xl border border-accent/50 bg-[#FFFCF8] p-4 text-left transition hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-primary">
                          #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-secondary">
                          {getCustomerName(order)}
                        </p>
                        <p className="mt-1 text-xs text-secondary/50">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <StatusBadge status={getOrderStatus(order)} />
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-accent/40 pt-3">
                      <div>
                        <p className="text-xs text-secondary/50">
                          {getOrderItems(order).length} item(s)
                        </p>
                        <p className="mt-1 font-semibold text-secondary">
                          {formatCurrency(getOrderTotal(order))}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        View details
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-accent/40 px-5 py-4 sm:px-6">
              <p className="text-xs text-secondary/50">
                Showing{" "}
                {Math.min((page - 1) * pageSize + 1, filteredOrders.length)}–
                {Math.min(page * pageSize, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-accent px-3 py-2 text-xs font-medium text-secondary transition hover:bg-[#F7F0E7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="px-2 text-xs font-semibold text-secondary">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-accent px-3 py-2 text-xs font-medium text-secondary transition hover:bg-[#F7F0E7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Order details drawer */}
      {selectedOrder && (
        <OrderDetailsPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          updating={updatingId === selectedOrder._id}
        />
      )}
    </AdminLayout>
  );
}
