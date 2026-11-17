import {
  Bell,
  CalendarCheck,
  CreditCard,
  Palette,
  ShoppingBag,
} from "lucide-react";

const typeMeta = {
  order: { label: "Order", icon: ShoppingBag, tint: "bg-accent/50 text-primary" },
  payment: { label: "Payment", icon: CreditCard, tint: "bg-[#DDEBD8] text-[#2F5D3A]" },
  consultation: { label: "Consultation", icon: CalendarCheck, tint: "bg-[#DCE9F2] text-[#1F4E6B]" },
  custom_request: { label: "Custom request", icon: Palette, tint: "bg-[#F7E3C3] text-[#7A4A12]" },
  system: { label: "Update", icon: Bell, tint: "bg-accent/40 text-secondary" },
};

export const getTypeMeta = (type) => typeMeta[type] ?? typeMeta.system;

export const typeLabel = (type) => getTypeMeta(type).label;

export const isInternalLink = (link) =>
  typeof link === "string" && link.startsWith("/") && !link.startsWith("//");

export function timeAgo(value) {
  const date = new Date(value);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (Number.isNaN(seconds) || seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
  });
}

const dayStart = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

export const GROUP_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

export function dayGroup(value) {
  const days = Math.round((dayStart(Date.now()) - dayStart(value)) / 86400000);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  return "Earlier";
}