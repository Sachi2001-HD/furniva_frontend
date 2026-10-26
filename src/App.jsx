import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import SignUpPage from "./pages/signupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  );
}