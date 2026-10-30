import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import Panel from "../components/admin/panel";

// Sample data. Replace with totals from your orders API later.
const periods = {
  week: {
    tab: "Week",
    label: "this week",
    comparedTo: "last week",
    previous: 1260000,
    orders: 18,
    items: 31,
    points: [
      { label: "Mon", value: 182000 },
      { label: "Tue", value: 96000 },
      { label: "Wed", value: 243000 },
      { label: "Thu", value: 154000 },
      { label: "Fri", value: 318000 },
      { label: "Sat", value: 276000 },
      { label: "Sun", value: 128000 },
    ],
  },
  month: {
    tab: "Month",
    label: "this month",
    comparedTo: "last month",
    previous: 2780000,
    orders: 62,
    items: 104,
    points: [
      { label: "Week 1", value: 640000 },
      { label: "Week 2", value: 812000 },
      { label: "Week 3", value: 705000 },
      { label: "Week 4", value: 934000 },
    ],
  },
  year: {
    tab: "Year",
    label: "this year",
    comparedTo: "last year",
    previous: 24500000,
    orders: 540,
    items: 910,
    points: [
      { label: "Jan", value: 2100000 },
      { label: "Feb", value: 1800000 },
      { label: "Mar", value: 2600000 },
      { label: "Apr", value: 2400000 },
      { label: "May", value: 3100000 },
      { label: "Jun", value: 2900000 },
      { label: "Jul", value: 3400000 },
      { label: "Aug", value: 3000000 },
      { label: "Sep", value: 3600000 },
      { label: "Oct", value: 3300000 },
    ],
  },
};

const salesByRoom = [
  { room: "Living", percent: 38 },
  { room: "Bedroom", percent: 27 },
  { room: "Dining", percent: 21 },
  { room: "Office", percent: 14 },
];

const topProducts = [
  { id: 1, name: "Alder Dining Set", category: "Dining", units: 14, revenue: 2590000 },
  { id: 2, name: "Hygge Lounge Chair", category: "Chairs", units: 22, revenue: 1196800 },
  { id: 3, name: "Tova Sideboard", category: "Storage", units: 9, revenue: 1152000 },
  { id: 4, name: "Galle Queen Bed", category: "Beds", units: 11, revenue: 1078000 },
  { id: 5, name: "Sigiriya Bookshelf", category: "Storage", units: 16, revenue: 720000 },
];

const formatMoney = (n) => `Rs. ${n.toLocaleString("en-US")}`;

const compact = (n) =>
  n >= 1000000
    ? `${(n / 1000000).toFixed(1).replace(".0", "")}M`
    : n >= 1000
    ? `${Math.round(n / 1000)}k`
    : String(n);

function PeriodTabs({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Time period"
      className="flex rounded-full bg-accent/30 p-1"
    >
      {Object.entries(periods).map(([key, period]) => (
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
          {period.tab}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ label, value, note, tone, index, ready }) {
  const noteColor =
    tone === "up"
      ? "text-[#2F5D3A]"
      : tone === "down"
      ? "text-[#9B2C1F]"
      : "text-secondary/65";

  return (
    <div
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`rounded-2xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.08)] transition duration-500 motion-reduce:transition-none ${
        ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl leading-none text-primary xl:text-[40px]">
        {value}
      </p>
      <p className={`mt-3 flex items-center gap-1 text-sm ${noteColor}`}>
        {tone === "up" && <ArrowUpRight size={14} aria-hidden="true" />}
        {tone === "down" && <ArrowDownRight size={14} aria-hidden="true" />}
        {note}
      </p>
    </div>
  );
}

function RevenueChart({ points, caption, ready }) {
  const max = Math.max(...points.map((p) => p.value));
  const niceMax = Math.ceil(max / 100000) * 100000;
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((t) => Math.round(niceMax * t));

  return (
    <div className="px-6 py-6">
      {/* Visual chart (the table below gives the same data to screen readers) */}
      <div className="flex gap-3" aria-hidden="true">
        <div className="flex h-64 shrink-0 flex-col justify-between text-right text-xs leading-none text-secondary/60">
          {ticks.map((t) => (
            <span key={t}>{compact(t)}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="absolute inset-x-0 top-0 flex h-64 flex-col justify-between">
            {ticks.map((t) => (
              <span key={t} className="border-t border-accent/50" />
            ))}
          </div>

          <div className="relative flex gap-2 sm:gap-3">
            {points.map((p) => {
              const percent = (p.value / niceMax) * 100;

              return (
                <div key={p.label} className="group flex min-w-0 flex-1 flex-col">
                  <div className="relative flex h-64 items-end">
                    <div
                      style={{ height: ready ? `${percent}%` : "0%" }}
                      className="w-full rounded-t-lg bg-highlight transition-[height,background-color] duration-700 ease-out group-hover:bg-primary motion-reduce:transition-none"
                    />
                    <span
                      style={{ bottom: `calc(${percent}% + 8px)` }}
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-secondary px-2.5 py-1 text-xs text-background opacity-0 transition group-hover:opacity-100"
                    >
                      {formatMoney(p.value)}
                    </span>
                  </div>
                  <span className="mt-2 truncate text-center text-xs text-secondary/70">
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
              <td>{formatMoney(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminSalesPage() {
  const [period, setPeriod] = useState("week");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const data = periods[period];
  const total = data.points.reduce((sum, p) => sum + p.value, 0);
  const change = ((total - data.previous) / data.previous) * 100;
  const averageOrder = Math.round(total / data.orders);

  const kpis = [
    {
      label: "Revenue",
      value: formatMoney(total),
      note: `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs ${data.comparedTo}`,
      tone: change >= 0 ? "up" : "down",
    },
    { label: "Orders", value: String(data.orders), note: "Excluding cancelled" },
    { label: "Average order", value: formatMoney(averageOrder), note: "Revenue ÷ orders" },
    { label: "Items sold", value: String(data.items), note: "Units sold" },
  ];

  return (
    <AdminLayout
      title="Sales"
      subtitle="Revenue, orders and best sellers from the Furniva workshop."
    >
      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} {...kpi} index={index} ready={ready} />
        ))}
      </div>

      {/* Chart and rooms */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Panel
          title={`Revenue ${data.label}`}
          action={<PeriodTabs value={period} onChange={setPeriod} />}
        >
          <RevenueChart
            points={data.points}
            caption={`Revenue ${data.label}`}
            ready={ready}
          />
        </Panel>

        <Panel title="Sales by Room">
          <ul className="space-y-6 px-6 py-6">
            {salesByRoom.map(({ room, percent }) => (
              <li key={room}>
                <div className="flex items-center justify-between text-[15px]">
                  <span>{room}</span>
                  <span className="text-secondary/70">{percent}%</span>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-2 h-2.5 overflow-hidden rounded-full bg-accent/40"
                >
                  <div
                    style={{ width: ready ? `${percent}%` : "0%" }}
                    className="h-full rounded-full bg-highlight transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Best sellers */}
      <div className="mt-8">
        <Panel title="Top Selling Products">
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
                        heading === "Units" || heading === "Revenue"
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-accent/40 transition hover:bg-accent/15"
                  >
                    <th scope="row" className="px-6 py-4 text-[15px] font-medium">
                      {product.name}
                    </th>
                    <td className="px-6 py-4 text-[15px] text-secondary/75">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-right text-[15px]">
                      {product.units}
                    </td>
                    <td className="px-6 py-4 text-right text-[15px] font-medium">
                      {formatMoney(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}