export const LOW_STOCK = 5;

export const idOf = (product) => String(product._id ?? product.id);

export const imageOf = (product) => product.image ?? product.images?.[0];

export const categoryIdOf = (product) => {
  const category = product.category;
  const id = category && typeof category === "object" ? category._id : category;

  return String(id ?? product.categoryId ?? "");
};

export const categoryNameOf = (product) => {
  const category = product.category;

  return (
    product.categoryName ||
    (category && typeof category === "object" ? category.name : "") ||
    ""
  );
};

export const priceOf = (product) =>
  Number(product.offerPrice ?? product.price ?? 0);

export const formatPrice = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

export const dimensionsOf = (product) => {
  const { w, d, h } = product.dimensions ?? {};

  return w && d && h ? `${w} × ${d} × ${h} cm` : "Not listed";
};

export const stockState = (product) => {
  const stock = Number(product.stock);

  if (product.stock != null && Number.isFinite(stock)) {
    return stock <= 0 ? "out" : stock <= LOW_STOCK ? "low" : "in";
  }

  return product.inStock ? "in" : "out";
};