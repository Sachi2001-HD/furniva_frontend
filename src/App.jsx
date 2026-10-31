import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./components/routeGuards";
import HomePage from "./pages/homePage";
import AboutPage from "./pages/aboutPage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import AdminDashboardPage from "./pages/adminDashboardPage";
import AdminSalesPage from "./pages/adminSalesPage";
import ShopPage from "./pages/shopPage";
import ConsultationPage from "./pages/consultationPage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/consultation" element={<ConsultationPage />} />

      {/* Logged-in users */}
      <Route element={<ProtectedRoute />}>
      </Route>

      {/* Admin only */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/sales" element={<AdminSalesPage />} />
      </Route>
    </Routes>
  );
}