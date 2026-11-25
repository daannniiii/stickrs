import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CatalogProvider } from "./context/CatalogContext";
import Navbar from "./components/Navbar";
import CatalogPage from "./pages/CatalogPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </BrowserRouter>
      </CatalogProvider>
    </AuthProvider>
  );
}
