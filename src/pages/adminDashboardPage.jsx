import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import AdminLayout from "../components/admin/adminLayout";
import StatusBadge from "../components/admin/statusBadge";
import { useAuth } from "../context/authContext";

// Sample data 
const stats = [
  { label: "Total products", value: "120", note: "8 low in stock", tone: "warn" },
  { label: "Total orders", value: "48", note: "+6 this week", tone: "up" },
  { label: "Pending requests", value: "12", note: "Consultations & custom" },
  { label: "Total customers", value: "256", note: "+14 this month", tone: "up" },
];

const recentOrders = [
  { id: "ORD1024", customer: "N. Perera", date: "2025-05-15", status: "Processing" },
  { id: "ORD1023", customer: "S. Silva", date: "2025-05-14", status: "Shipped" },
  { id: "ORD1022", customer: "K. Fernando", date: "2025-05-13", status: "Delivered" },
  { id: "ORD1021", customer: "D. Wickramasinghe", date: "2025-05-12", status: "Processing" },
  { id: "ORD1020", customer: "P. Jayasinghe", date: "2025-05-11", status: "Canceled" },
];

const requests = [
  { id: 1, name: "S. Fernando", type: "Consultation", date: "2025-05-15", status: "Pending" },
  { id: 2, name: "M. Perera", type: "Custom Design", date: "2025-05-14", status: "In Progress" },
  { id: 3, name: "R. Silva", type: "Consultation", date: "2025-05-13", status: "Pending" },
  { id: 4, name: "D. Kumar", type: "Custom Design", date: "2025-05-12", status: "Completed" },
  { id: 5, name: "A. Niroshan", type: "Custom Design", date: "2025-05-10", status: "In Progress" },
];

const salesByRoom = [
  { room: "Living", percent: 38 },
  { room: "Bedroom", percent: 27 },
  { room: "Dining", percent: 21 },
  { room: "Office", percent: 14 },
];

const lowStock = [
  { id: 1, name: "Galle Queen Bed", left: 3 },
  { id: 2, name: "Nuwara Wardrobe", left: 0 },
  { id: 3, name: "Sigiriya Bookshelf", left: 2 },
];

const orderColumns = [
  {
    key: "id",
    label: "Order ID",
    render: (row) => (
      <Link
        to={`/admin/orders/${row.id}`}
        className="font-medium hover:text-primary hover:underline"
      >
        #{row.id}
      </Link>
    ),
  },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

const requestColumns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
];

function Panel({ title, action, className = "", children }) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-accent/50 bg-[#FDF8F1] shadow-[0_10px_30px_rgba(113,62,38,0.08)] ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-accent/40 bg-accent/25 px-6 py-5">
        <h2 className="font-display text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ViewAll({ to }) {
  return (
    <Link to={to} className="text-sm font-medium text-primary hover:underline">
      View all
    </Link>
  );
}

function DataTable({ caption, columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-480px text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-secondary/65"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-accent/40 transition hover:bg-accent/15"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 text-[15px]">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ stat, index, ready }) {
  const noteColor =
    stat.tone === "up"
      ? "text-[#2F5D3A]"
      : stat.tone === "warn"
      ? "text-[#8A4B12]"
      : "text-secondary/65";

  return (
    <div
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`rounded-2xl border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_10px_30px_rgba(113,62,38,0.08)] transition duration-500 motion-reduce:transition-none ${
        ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-secondary/65">
        {stat.label}
      </p>
      <p className="mt-3 font-display text-5xl leading-none text-primary">
        {stat.value}
      </p>
      <p className={`mt-3 flex items-center gap-1 text-sm ${noteColor}`}>
        {stat.tone === "up" && <ArrowUpRight size={14} aria-hidden="true" />}
        {stat.note}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AdminLayout
      title={user?.firstName ? `${greeting}, ${user.firstName}` : greeting}
      subtitle={`Here's what's happening in the Furniva workshop today. ${today}.`}
    >
      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} ready={ready} />
        ))}
      </div>

      {/* Orders and sales */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Panel title="Recent Orders" action={<ViewAll to="/admin/orders" />}>
          <DataTable
            caption="Recent orders"
            columns={orderColumns}
            rows={recentOrders}
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

      {/* Requests and low stock */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <Panel
          title="Consultation & Custom Requests"
          action={<ViewAll to="/admin/requests" />}
        >
          <DataTable
            caption="Recent consultation and custom design requests"
            columns={requestColumns}
            rows={requests}
          />
        </Panel>

        <Panel
          title="Low Stock"
          action={
            <Link
              to="/admin/products"
              className="text-sm font-medium text-primary hover:underline"
            >
              Manage
            </Link>
          }
        >
          <ul>
            {lowStock.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 border-t border-accent/40 px-6 py-4 first:border-t-0"
              >
                <span className="text-[15px]">{item.name}</span>
                {item.left === 0 ? (
                  <span className="font-medium text-[#9B2C1F]">Out</span>
                ) : (
                  <span className="text-secondary/70">{item.left} left</span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AdminLayout>
  );
}