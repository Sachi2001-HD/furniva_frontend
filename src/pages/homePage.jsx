import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Footer from "../components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
      <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <Hero />
      <Footer />
    </main>
  );
}