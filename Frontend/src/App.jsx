// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar      from "./components/Navbar";
import NavDots     from "./components/NavDots";
import Footer      from "./components/Footer";
import Home        from "./pages/Home";
import PlantCare   from "./pages/PlantCare";
import LiveDetect  from "./pages/LiveDetect";
import Profile     from "./pages/Profile";

// Redirect to /login if not logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn, ready } = useAuth();
  if (!ready) return null;
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function AppInner() {
  return (
    <BrowserRouter>
      <Navbar />
      <NavDots />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/plant-care"  element={<PlantCare />} />
        <Route path="/live-detect" element={<LiveDetect />} />
        <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
