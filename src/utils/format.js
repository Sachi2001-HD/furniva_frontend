export const formatMoney = (n) => `Rs. ${Number(n ?? 0).toLocaleString("en-US")}`;

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

// The price a customer actually pays for one unit
export const sellingPrice = (item) =>
  item.offerPrice != null && item.offerPrice < item.price
    ? item.offerPrice
    : item.price;