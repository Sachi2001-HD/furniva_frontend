import { useAuth } from "../context/authContext";
import GuestNavbar from "./guestNavbar";
import CustomerNavbar from "./customerNavbar";

export default function Navbar({ cartCount = 0 }) {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? (
    <CustomerNavbar cartCount={cartCount} />
  ) : (
    <GuestNavbar cartCount={cartCount} />
  );
}