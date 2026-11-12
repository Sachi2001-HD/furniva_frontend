import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Check,
  MessagesSquare,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import Panel from "../components/admin/panel";
import RevenueChart from "../components/admin/revenueChart";
import Pill from "../components/ui/pill";
import { Thumb } from "../components/cart/cartParts";
import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";
import { formatDate, formatMoney } from "../utils/format";
import { statusTone } from "../utils/requestStatus";

const ORDER_STATUSES = [
  { key: "Pending", tone: "warn", bar: "bg-highlight" },
  { key: "Processing", tone: "info", bar: "bg-primary" },
  { key: "Shipped", tone: "info", bar: "bg-[#445444]" },
  { key: "Delivered", tone: "good", bar: "bg-[#4C8F5E]" },
  { key: "Cancelled", tone: "bad", bar: "bg-[#B5392B]" },
];

const orderTone = (status) =>
  ORDER_STATUSES.find((item) => item.key === status)?.tone ?? "info";

const LOW_STOCK = 5;

function Skeleton({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-2xl bg-accent/40 motion-safe:animate-pulse ${className}`}
    />
  );
}

function KpiCard({ icon: Icon, label, value, note, tone, to, index, ready }) {
  const noteColor =
    tone === "up"
      ? "text-[#2F5D3A]"
      : tone === "down"
      ? "text-[#9B2C1F]"
      : tone === "warn"
      ? "text-[#8A4B12]"
      : "text-secondary/65";

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
          {label}
        </p>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/40 text-primary">
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 font-display text-4xl leading-none text-primary xl:text-[40px]">
        {value}
      </p>
      <p className={`mt-3 flex items-center gap-1 text-sm ${noteColor}`}>
        {tone === "up" && <ArrowUpRight size={14} aria-hidden="true" />}
        {tone === "down" && <ArrowDownRight size={14} aria-hidden="true" />}
        {note}
      </p>
    </>
  );

  const classes = `block rounded-2xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.08)] transition duration-500 motion-reduce:transition-none ${
    ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
  }`;

  return to ? (
    <Link
      to={to}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`${classes} hover:shadow-[0_16px_40px_rgba(113,62,38,0.14)] focus-visible:outline-2 focus-visible:outline-primary`}
    >
      {body}
    </Link>
  ) : (
    <div style={{ transitionDelay: `${index * 80}ms` }} className={classes}>
      {body}
    </div>
  );
}

function ViewAll({ to, children = "View all" }) {
  return (
    <Link to={to} className="text-sm font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}

function PanelEmpty({ children }) {
  return <p className="px-6 py-10 text-center text-secondary/65">{children}</p>;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setData(await apiRequest("/stats/dashboard", { token }));
    } catch (failure) {
      if (failure.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: "/admin" } });
        return;
      }
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!data) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [data]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const refreshButton = (
    <button
      type="button"
      onClick={load}
      disabled={loading}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-accent/70 px-4 text-sm font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
    >
      <RefreshCw size={15} aria-hidden="true" className={loading ? "animate-spin" : ""} />
      Refresh
    </button>
  );

  const layoutProps = {
    title: user?.firstName ? `${greeting}, ${user.firstName}` : greeting,
    subtitle: `Here's what's happening in the Furniva workshop today. ${today}.`,
  };

  if (error && !data) {
    return (
      <AdminLayout {...layoutProps}>
        <div role="alert" className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center">
          <p className="font-display text-2xl">We couldn’t load the dashboard</p>
          <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Try again
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout {...layoutProps}>
        <p role="status" className="sr-only">Loading the dashboard</p>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </AdminLayout>
    );
  }

  const { revenue, orders, requests, customers, products } = data;
  const change = revenue.change;
  const totalOrdersByStatus = ORDER_STATUSES.reduce(
    (sum, item) => sum + (orders.byStatus[item.key] ?? 0),
    0
  );

  const attention = [
    { count: orders.byStatus.Pending ?? 0, label: "orders waiting to be processed", to: "/admin/orders" },
    { count: requests.pendingConsultations, label: "consultations to confirm", to: "/admin/requests" },
    { count: requests.openCustomRequests, label: "custom requests to review", to: "/admin/requests" },
    { count: products.outOfStock, label: "products out of stock", to: "/admin/products" },
  ].filter((item) => item.count > 0);

  return (
    <AdminLayout {...layoutProps}>
      {/* Needs attention */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {attention.length === 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BBD6B2] bg-[#DDEBD8] px-4 py-2 text-sm font-medium text-[#2F5D3A]">
              <Check size={15} aria-hidden="true" />
              You’re all caught up
            </span>
          ) : (
            attention.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="group inline-flex items-center gap-2 rounded-full border border-[#E9C98F] bg-[#F7E3C3] px-4 py-2 text-sm text-[#7A4A12] transition hover:bg-[#F2D9A9] focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="font-semibold">{item.count}</span>
                {item.label}
                <ArrowRight size={14} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
              </Link>
            ))
          )}
        </div>
        {refreshButton}
      </div>

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          ready={ready}
          icon={Banknote}
          label="Revenue this month"
          value={formatMoney(revenue.thisMonth)}
          note={
            change == null
              ? "No sales last month to compare"
              : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs last month`
          }
          tone={change == null ? undefined : change >= 0 ? "up" : "down"}
          to="/admin/sales"
        />
        <KpiCard
          index={1}
          ready={ready}
          icon={ShoppingBag}
          label="Total orders"
          value={orders.total}
          note={`${orders.thisWeek} in the last 7 days`}
          tone={orders.thisWeek > 0 ? "up" : undefined}
          to="/admin/orders"
        />
        <KpiCard
          index={2}
          ready={ready}
          icon={MessagesSquare}
          label="Requests to answer"
          value={requests.needsAction}
          note={`${requests.pendingConsultations} consultations · ${requests.openCustomRequests} custom designs`}
          tone={requests.needsAction > 0 ? "warn" : undefined}
          to="/admin/requests"
        />
        <KpiCard
          index={3}
          ready={ready}
          icon={Users}
          label="Customers"
          value={customers.total}
          note={`+${customers.newThisMonth} in the last 30 days`}
          tone={customers.newThisMonth > 0 ? "up" : undefined}
        />
      </div>

      {/* Revenue and order status */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Panel title="Revenue, last 7 days" action={<ViewAll to="/admin/sales">Full report</ViewAll>}>
          <div className="px-6 pt-5">
            <p className="font-display text-3xl text-primary">{formatMoney(data.weekly.total)}</p>
            <p className="text-sm text-secondary/65">Orders that weren’t cancelled</p>
          </div>
          <RevenueChart points={data.weekly.points} caption="Revenue, last 7 days" ready={ready} height="h-52" />
        </Panel>

        <Panel title="Orders by status" action={<ViewAll to="/admin/orders" />}>
          {totalOrdersByStatus === 0 ? (
            <PanelEmpty>No orders yet.</PanelEmpty>
          ) : (
            <ul className="space-y-5 px-6 py-6">
              {ORDER_STATUSES.map(({ key, bar }) => {
                const count = orders.byStatus[key] ?? 0;
                const percent = (count / totalOrdersByStatus) * 100;

                return (
                  <li key={key}>
                    <div className="flex items-center justify-between text-[15px]">
                      <span>{key}</span>
                      <span className="text-secondary/70">{count}</span>
                    </div>
                    <div aria-hidden="true" className="mt-2 h-2.5 overflow-hidden rounded-full bg-accent/40">
                      <div
                        style={{ width: ready ? `${percent}%` : "0%" }}
                        className={`h-full rounded-full ${bar} transition-[width] duration-1000 ease-out motion-reduce:transition-none`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Recent orders and sales by room */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Panel title="Recent orders" action={<ViewAll to="/admin/orders" />}>
          {data.recentOrders.length === 0 ? (
            <PanelEmpty>Orders will appear here as customers place them.</PanelEmpty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-560px text-left">
                <caption className="sr-only">Recent orders</caption>
                <thead>
                  <tr>
                    {["Order", "Customer", "Date", "Total", "Status"].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className={`px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-secondary/65 ${
                          heading === "Total" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id} className="border-t border-accent/40 transition hover:bg-accent/15">
                      <td className="px-6 py-4 text-[15px]">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[15px]">
                        {order.user
                          ? `${order.user.firstName} ${order.user.lastName}`.trim()
                          : "Former customer"}
                      </td>
                      <td className="px-6 py-4 text-[15px] text-secondary/75">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 text-right text-[15px] font-medium">{formatMoney(order.total)}</td>
                      <td className="px-6 py-4">
                        <Pill tone={orderTone(order.status)}>{order.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Sales by room" action={<span className="text-sm text-secondary/60">Last 4 weeks</span>}>
          {data.byCategory.length === 0 ? (
            <PanelEmpty>No sales in the last 4 weeks.</PanelEmpty>
          ) : (
            <ul className="space-y-6 px-6 py-6">
              {data.byCategory.slice(0, 5).map(({ name, percent }) => (
                <li key={name}>
                  <div className="flex items-center justify-between text-[15px]">
                    <span>{name}</span>
                    <span className="text-secondary/70">{percent}%</span>
                  </div>
                  <div aria-hidden="true" className="mt-2 h-2.5 overflow-hidden rounded-full bg-accent/40">
                    <div
                      style={{ width: ready ? `${percent}%` : "0%" }}
                      className="h-full rounded-full bg-highlight transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Requests and low stock */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Panel title="Consultation & custom requests" action={<ViewAll to="/admin/requests" />}>
          {data.recentRequests.length === 0 ? (
            <PanelEmpty>Customer requests will appear here.</PanelEmpty>
          ) : (
            <ul>
              {data.recentRequests.map((request) => (
                <li
                  key={`${request.type}-${request.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-accent/40 px-6 py-4 first:border-t-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">{request.name}</p>
                    <p className="truncate text-sm text-secondary/65">
                      {request.type} · {request.subject}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="hidden text-sm text-secondary/60 sm:inline">
                      {formatDate(request.createdAt)}
                    </span>
                    <Pill tone={statusTone(request.status)}>{request.status}</Pill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Low stock" action={<ViewAll to="/admin/products">Manage</ViewAll>}>
          {data.lowStockItems.length === 0 ? (
            <PanelEmpty>Every product is well stocked.</PanelEmpty>
          ) : (
            <ul>
              {data.lowStockItems.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center gap-4 border-t border-accent/40 px-6 py-4 first:border-t-0"
                >
                  <Thumb src={item.images?.[0]} className="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{item.name}</p>
                    <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent/40">
                      <div
                        style={{ width: `${Math.min((item.stock / LOW_STOCK) * 100, 100)}%` }}
                        className={`h-full rounded-full ${item.stock === 0 ? "bg-[#B5392B]" : "bg-highlight"}`}
                      />
                    </div>
                  </div>
                  {item.stock === 0 ? (
                    <span className="shrink-0 font-medium text-[#9B2C1F]">Out</span>
                  ) : (
                    <span className="shrink-0 text-secondary/70">{item.stock} left</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminLayout>
  );
}