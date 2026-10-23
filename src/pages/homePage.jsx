import Navbar from "../components/navbar";
import Hero from "../components/hero";
import FeaturedProducts from "../components/featuredProducts";
import Footer from "../components/footer";
import DiningTable from "../assets/images/Dining_Table.jpg";
import LoungeChair from "../assets/images/Lounge_Chair.jpg";
import Sideboard from "../assets/images/Sideboard.jpg";

const products = [
  {
    id: 1,
    name: "Alder Dining Set",
    description: "Six-seater walnut dining table with four matching chairs.",
    price: 185000,
    rating: 4.8,
    reviewCount: 10,
    image: DiningTable,
  },
  {
    id: 2,
    name: "Hygge Lounge Chair",
    description: "White oak frame with a soft, deep linen cushion.",
    price: 64000,
    offerPrice: 54400,
    rating: 4.5,
    reviewCount: 12,
    image: LoungeChair,
  },
  {
    id: 3,
    name: "Tova Sideboard",
    description: "Teak sideboard with four drawers and two cabinet doors.",
    price: 128000,
    rating: 4.0,
    reviewCount: 8,
    image: Sideboard,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
      <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <Hero />
      <FeaturedProducts products={products} />
      <Footer />
    </main>
  );
}