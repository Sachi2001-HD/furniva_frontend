import DiningTable from "../assets/images/Dining_Table.jpg";
import LoungeChair from "../assets/images/Lounge_Chair.jpg";
import Sideboard from "../assets/images/Sideboard.jpg";
import LinenSofa from "../assets/images/linen_sofa.jpg";
import CoffeeTable from "../assets/images/Coffee_Table.jpg";
import Bookcase from "../assets/images/Bookcase.jpg";

export const formatPrice = (n) => `Rs. ${n.toLocaleString("en-US")}`;

export const categories = [
  { id: "sofas", label: "Sofas" },
  { id: "chairs", label: "Chairs" },
  { id: "tables", label: "Tables" },
  { id: "dining", label: "Dining" },
  { id: "storage", label: "Storage" },
];

export const materials = [
  { id: "Walnut", swatch: "#5a3825" },
  { id: "White Oak", swatch: "#c9ac80" },
  { id: "Teak", swatch: "#b9703a" },
];

export const MAX_PRICE = 250000;

// image: null shows a tidy placeholder. Import your image and put it here when ready.
export const products = [
  {
    id: 1,
    name: "Alder Dining Set",
    description: "Six-seater walnut dining table with four matching chairs.",
    category: "dining",
    material: "Walnut",
    price: 185000,
    rating: 4.8,
    reviewCount: 10,
    dimensions: { w: 180, d: 90, h: 75 },
    inStock: true,
    badge: "New",
    image: DiningTable,
    createdAt: "2026-05-02",
  },
  {
    id: 2,
    name: "Hygge Lounge Chair",
    description: "White oak frame with a soft, deep linen cushion.",
    category: "chairs",
    material: "White Oak",
    price: 64000,
    offerPrice: 54400,
    rating: 4.5,
    reviewCount: 12,
    dimensions: { w: 72, d: 78, h: 80 },
    inStock: true,
    badge: null,
    image: LoungeChair,
    createdAt: "2026-04-18",
  },
  {
    id: 3,
    name: "Tova Sideboard",
    description: "Teak sideboard with four drawers and two cabinet doors.",
    category: "storage",
    material: "Teak",
    price: 128000,
    rating: 4.0,
    reviewCount: 8,
    dimensions: { w: 160, d: 45, h: 75 },
    inStock: true,
    image: Sideboard,
    createdAt: "2026-03-10",
  },
  {
    id: 4,
    name: "Sora Linen Sofa",
    description: "Three-seater with a solid oak base and washable linen covers.",
    category: "sofas",
    material: "White Oak",
    price: 245000,
    rating: 4.7,
    reviewCount: 5,
    dimensions: { w: 220, d: 95, h: 82 },
    inStock: true,
    badge: "New",
    image: LinenSofa,
    createdAt: "2026-10-12",
  },
  {
    id: 5,
    name: "Forma Coffee Table",
    description: "Round walnut coffee table with a low shelf for books.",
    category: "tables",
    material: "Walnut",
    price: 78000,
    rating: 4.6,
    reviewCount: 7,
    dimensions: { w: 100, d: 60, h: 40 },
    inStock: true,
    badge: "New",
    image: CoffeeTable,
    createdAt: "2026-10-05",
  },
  {
    id: 6,
    name: "Nord Open Bookcase",
    description: "Tall open walnut bookcase with five adjustable shelves.",
    category: "storage",
    material: "Walnut",
    price: 96000,
    rating: 4.3,
    reviewCount: 6,
    dimensions: { w: 90, d: 35, h: 180 },
    inStock: false,
    image: Bookcase,
    createdAt: "2026-02-21",
  },
];