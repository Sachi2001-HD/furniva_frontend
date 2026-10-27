import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import SignUpPage from "./pages/signupPage";
import ShopPage from "./pages/shopPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/shop" element={<ShopPage />} />
    </Routes>
  );
}