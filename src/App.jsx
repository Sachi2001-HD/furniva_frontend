import { Routes, Route } from "react-router-dom";

import { ProtectedRoute, AdminRoute } from "./components/routeGuards";
import RequireAuth from "./components/requireAuth";

import HomePage from "./pages/homePage";
import AboutPage from "./pages/aboutPage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import ShopPage from "./pages/shopPage";
import ConsultationPage from "./pages/consultationPage";
import ProductDetailsPage from "./pages/productDetailsPage";

import AdminDashboardPage from "./pages/adminDashboardPage";
import AdminSalesPage from "./pages/adminSalesPage";
import AdminProductsPage from "./pages/adminProductsPage";
import AdminOrdersPage from "./pages/adminOrdersPage";

import CartDrawer from "./components/cart/cartDrawer";
import CheckoutPage from "./pages/checkoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/orderDetailPage";
import ScrollToTop from "./components/scrollToTop";
import CustomFurniturePage from "./pages/customFurniturePage";
import MyProfilePage from "./pages/myProfilePage";
import AddressesPage from "./pages/addressesPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <CartDrawer />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/shop/:id" element={<ProductDetailsPage />} />
        <Route path="/custom-furniture" element={<CustomFurniturePage />} />

        {/* Logged-in customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />

          <Route
            path="/orders"
            element={
              <RequireAuth>
                <OrdersPage />
              </RequireAuth>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route
          path="/account"
          element={
            <RequireAuth>
              <MyProfilePage />
            </RequireAuth>
          }
        />

        <Route
          path="/account/addresses"
          element={
            <RequireAuth>
              <AddressesPage />
            </RequireAuth>} />

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/sales" element={<AdminSalesPage />} />
          <Route path="/admin/products/*" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Route>
      </Routes>
    </>
  );
}