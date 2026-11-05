import { useAuth } from "../context/authContext";
import GuestNavbar from "./guestNavbar";
import CustomerNavbar from "./customerNavbar";

export default function Navbar() {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <CustomerNavbar /> : <GuestNavbar />;
}