import Navbar from "../components/navbar";
import Hero from "../components/hero";
import ShopByCategory from "../components/shopByCategory";
import FeaturedProducts from "../components/featuredProducts";
import WhyChooseFurniva from "../components/whyChooseFurniva";
import NewArrivals from "../components/newArrivals";
import CustomFurniture from "../components/customFurniture";
import PlanYourSpace from "../components/planYourSpace";
import Footer from "../components/footer";
import { useFetchData } from "../hooks/useFetchData";
import { optimizeImage } from "../utils/cloudinary";

const FEATURED_COUNT = 3;

const toCardProduct = (product) => ({
  id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  offerPrice: product.offerPrice ?? undefined,
  rating: product.rating,
  reviewCount: product.reviewCount,
  stock: product.stock,
  image: optimizeImage(product.images?.[0], 800),
  source: product,
});

export default function HomePage() {
  const { data, loading, error, reload } = useFetchData(
    `/products?featured=true&limit=${FEATURED_COUNT}`
  );
  const featured = (data?.products ?? []).map(toCardProduct);

  return (
    <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
      <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <Hero />
      <ShopByCategory />
      <FeaturedProducts
        products={featured}
        loading={loading}
        error={error}
        onRetry={reload}
      />
      <NewArrivals />
      <WhyChooseFurniva />
      <CustomFurniture />
      <PlanYourSpace />
      <Footer />
    </main>
  );
}