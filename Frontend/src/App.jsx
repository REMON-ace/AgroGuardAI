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
import AdminPanel  from "./pages/AdminPanel"; // <-- IMPORT ADMIN PANEL

function ProtectedRoute({ children }) {
  const { isLoggedIn, ready } = useAuth();
  if (!ready) return null;
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

// Redirect to admin dashboard if an admin tries accessing user pages
function UserBoundRoute({ children }) {
  const { isLoggedIn, ready, user } = useAuth();
  if (!ready) return null;
  return (isLoggedIn && user?.role === 'admin') ? <Navigate to="/admin/dashboard" replace /> : children;
}

// Redirect to / if not an admin
function AdminRoute({ children }) {
  const { isLoggedIn, ready, user } = useAuth();
  if (!ready) return null;
  return (isLoggedIn && user?.role === 'admin') ? children : <Navigate to="/" replace />;
}

function AppInner() {
  return (
    <BrowserRouter>
      <Navbar />
      <NavDots />
      <Routes>
        <Route path="/"            element={<UserBoundRoute><Home /></UserBoundRoute>} />
        <Route path="/plant-care"  element={<ProtectedRoute><UserBoundRoute><PlantCare /></UserBoundRoute></ProtectedRoute>} />
        <Route path="/live-detect" element={<ProtectedRoute><UserBoundRoute><LiveDetect /></UserBoundRoute></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute><UserBoundRoute><Profile /></UserBoundRoute></ProtectedRoute>} />
        <Route path="/admin/*"     element={<AdminRoute><AdminPanel /></AdminRoute>} />
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
