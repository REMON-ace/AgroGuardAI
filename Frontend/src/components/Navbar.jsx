// src/components/Navbar.jsx


import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const links = [
  { label: "Home",        path: "/" },
  { label: "Plant Care",  path: "/plant-care" },
  { label: "Live Detect", path: "/live-detect" },
  { label: "My Profile",  path: "/profile" },
];
const routesOrder = [
  "/",
  "/plant-care",
  "/live-detect",
  "/profile"
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout, user } = useAuth();



      useEffect(() => {
    const handleKey = (e) => {
      const currentIndex = routesOrder.indexOf(location.pathname);

      if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
        e.preventDefault(); // optional
      }

      if (e.key === "ArrowRight") {
        const next = routesOrder[currentIndex + 1];
        if (next) navigate(next);
      }

      if (e.key === "ArrowLeft") {
        const prev = routesOrder[currentIndex - 1];
        if (prev) navigate(prev);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [location.pathname, navigate]);
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoggedIn && user?.role === 'admin') return null;

  return (
    <header style={styles.nav}>
      <div style={styles.left} onClick={() => navigate("/")}>
        <img src="/images/logo2.jpg" alt="logo" style={{ width: 30 }} />
        <span style={styles.brand}>AgroGuard AI</span>
      </div>

      <nav style={styles.right}>
        {links.map((l) => (
          <button
            key={l.path}
            style={{
              ...styles.navBtn,
              ...(location.pathname === l.path ? styles.navBtnActive : {}),
            }}
            onClick={() => navigate(l.path)}
          >
            {l.label}
          </button>
        ))}

        {isLoggedIn ? (
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout ({user?.name?.split(" ")[0]})
          </button>
        ) : null}
      </nav>
    </header>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 50px",
    background: "#f6fff4",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    position: "sticky",
    top: 0,
    zIndex: 200,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  logo: { fontSize: 24 },
  brand: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "'DM Serif Display', serif",
    color: "#1b5e20",
  },
  right: { display: "flex", gap: 8, alignItems: "center" },
  navBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 500,
    color: "#2e7d32",
    cursor: "pointer",
    padding: "8px 14px",
    borderRadius: 8,
    transition: "background .15s",
  },
  navBtnActive: {
    background: "#e8f5e9",
    fontWeight: 700,
  },
  logoutBtn: {
    background: "#ffebee",
    color: "#c62828",
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
};
