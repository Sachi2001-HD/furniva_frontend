export const formatMoney = (n) => `Rs. ${Number(n ?? 0).toLocaleString("en-US")}`;

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export const formatLongDate = (value, utc = false) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(utc ? { timeZone: "UTC" } : {}),
      })
    : "";

export const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export const sellingPrice = (item) =>
  item.offerPrice != null && item.offerPrice < item.price
    ? item.offerPrice
    : item.price;