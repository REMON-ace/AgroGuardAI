// src/components/NavDots.jsx
import { useNavigate, useLocation } from "react-router-dom";

const routes = ["/", "/plant-care", "/live-detect", "/profile"];

export default function NavDots() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const current   = routes.indexOf(location.pathname);

  return (
    <div style={styles.wrap}>
      {routes.map((r, i) => (
        <div
          key={r}
          style={{ ...styles.dot, ...(i === current ? styles.active : {}) }}
          onClick={() => navigate(r)}
        />
      ))}
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    bottom: 22,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 14,
    zIndex: 999,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: "50%",
    background: "#c8e6c9",
    cursor: "pointer",
    transition: "background .25s, transform .2s",
  },
  active: { background: "#1b5e20", transform: "scale(1.2)" },
};
