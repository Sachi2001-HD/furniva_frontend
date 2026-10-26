import { useAuth } from "../context/authContext";
import GuestNavbar from "./guestNavbar";
import CustomerNavbar from "./customerNavbar";

function Navbar() {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <CustomerNavbar /> : <GuestNavbar />;
}

export default Navbar;