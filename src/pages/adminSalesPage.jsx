import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, BarChart3 } from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import Panel from "../components/admin/panel";
import RevenueChart from "../components/admin/revenueChart";
import { Thumb } from "../components/cart/cartParts";
import { useAuth } from "../context/authContext";
import { apiRequest } from "../utils/api";
import { formatMoney } from "../utils/format";

const TABS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

function PeriodTabs({ value, onChange }) {
  return (
    <div role="group" aria-label="Time period" className="flex rounded-full bg-accent/30 p-1">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`rounded-full px-4 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-primary ${
            value === key
              ? "bg-[#FDF8F1] font-medium text-primary shadow-sm"
              : "text-secondary/70 hover:text-primary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ label, value, note, tone, index, ready }) {
  const noteColor =
    tone === "up" ? "text-[#2F5D3A]" : tone === "down" ? "text-[#9B2C1F]" : "text-secondary/65";

  return (
    <div
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`rounded-2xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.08)] transition duration-500 motion-reduce:transition-none ${
        ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none text-primary xl:text-[40px]">{value}</p>
      <p className={`mt-3 flex items-center gap-1 text-sm ${noteColor}`}>
        {tone === "up" && <ArrowUpRight size={14} aria-hidden="true" />}
        {tone === "down" && <ArrowDownRight size={14} aria-hidden="true" />}
        {note}
      </p>
    </div>
  );
}

export default function AdminSalesPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [period, setPeriod] = useState("week");
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setData(await apiRequest(`/stats/sales?period=${period}`, { token }));
    } catch (failure) {
      if (failure.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: "/admin/sales" } });
        return;
      }
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [period, token, logout, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!data) return;
    setReady(false);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [data]);

  const layout = {
    title: "Sales",
    subtitle: "Revenue, orders and best sellers from the Furniva workshop.",
  };

  if (!data) {
    return (
      <AdminLayout {...layout}>
        {error ? (
          <div role="alert" className="rounded-3xl border border-accent/50 bg-[#FDF8F1] px-6 py-16 text-center">
            <p className="font-display text-2xl">We couldn’t load the sales report</p>
            <p className="mx-auto mt-2 max-w-sm text-secondary/70">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <p role="status" className="sr-only">Loading the sales report</p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-32 rounded-2xl bg-accent/40 motion-safe:animate-pulse" />
              ))}
            </div>
            <span className="mt-8 block h-96 rounded-3xl bg-accent/30 motion-safe:animate-pulse" />
          </>
        )}
      </AdminLayout>
    );
  }

  const change = data.change;

  const kpis = [
    {
      label: "Revenue",
      value: formatMoney(data.total),
      note:
        change == null
          ? `No sales in ${data.comparedTo}`
          : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs ${data.comparedTo}`,
      tone: change == null ? undefined : change >= 0 ? "up" : "down",
    },
    { label: "Orders", value: String(data.orders), note: "Excluding cancelled" },
    {
      label: "Average order",
      value: formatMoney(data.averageOrder),
      note: "Revenue ÷ orders",
    },
    { label: "Items sold", value: String(data.items), note: "Units sold" },
  ];

  const stale = loading && data.period !== period;

  return (
    <AdminLayout {...layout}>
      <div className={`transition-opacity ${stale ? "opacity-60" : ""}`} aria-busy={stale}>
        {error && (
          <p role="alert" className="mb-6 rounded-2xl bg-[#9B2C1F]/10 px-5 py-3 text-[#9B2C1F]">
            {error}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi, index) => (
            <KpiCard key={kpi.label} {...kpi} index={index} ready={ready} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <Panel
            title={`Revenue, ${data.label}`}
            action={<PeriodTabs value={period} onChange={setPeriod} />}
          >
            {data.orders === 0 ? (
              <div className="grid place-items-center px-6 py-20 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/40 text-primary">
                  <BarChart3 size={26} aria-hidden="true" />
                </span>
                <p className="mt-4 font-display text-2xl">No sales in this period</p>
                <p className="mt-1 text-secondary/65">Orders that aren’t cancelled will show up here.</p>
              </div>
            ) : (
              <RevenueChart points={data.points} caption={`Revenue, ${data.label}`} ready={ready} />
            )}
          </Panel>

          <Panel title="Sales by room">
            {data.byCategory.length === 0 ? (
              <p className="px-6 py-10 text-center text-secondary/65">Nothing sold in this period.</p>
            ) : (
              <ul className="space-y-6 px-6 py-6">
                {data.byCategory.map(({ name, percent, revenue }) => (
                  <li key={name}>
                    <div className="flex items-center justify-between gap-3 text-[15px]">
                      <span className="truncate">{name}</span>
                      <span className="shrink-0 text-secondary/70">
                        {percent}% · {formatMoney(revenue)}
                      </span>
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

        <div className="mt-8">
          <Panel title="Top selling products">
            {data.topProducts.length === 0 ? (
              <p className="px-6 py-10 text-center text-secondary/65">No products sold in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-520px text-left">
                  <caption className="sr-only">Top selling products</caption>
                  <thead>
                    <tr>
                      {["Product", "Category", "Units", "Revenue"].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className={`px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-secondary/65 ${
                            heading === "Units" || heading === "Revenue" ? "text-right" : ""
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-accent/40 transition hover:bg-accent/15"
                      >
                        <th scope="row" className="px-6 py-4 text-[15px] font-medium">
                          <span className="flex items-center gap-3">
                            <Thumb src={product.image} className="h-12 w-12" />
                            {product.name}
                          </span>
                        </th>
                        <td className="px-6 py-4 text-[15px] text-secondary/75">{product.category}</td>
                        <td className="px-6 py-4 text-right text-[15px]">{product.units}</td>
                        <td className="px-6 py-4 text-right text-[15px] font-medium">
                          {formatMoney(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}