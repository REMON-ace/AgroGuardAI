// src/pages/PlantCare.jsx
import { useState } from "react";
import PlantModal from "../components/PlantModal";

const plants = [
  { name: "Rice",   img: "/Images/Rice.jpg",   desc: "Staple cereal crop",   disease: "leaf_spot" },
  { name: "Wheat",  img: "/Images/wheat.jpg",  desc: "Major food grain",     disease: "rust" },
  { name: "Maize",  img: "/Images/Maize.jpg",  desc: "Multi-purpose crop",   disease: "early_blight" },
  { name: "Tomato", img: "/Images/tomato.jpg", desc: "Vegetable crop",       disease: "late_blight" },
  { name: "Potato", img: "/Images/potato.jpg", desc: "Tuber crop",           disease: "bacterial_blight" },
  { name: "Cotton", img: "/Images/cotton.jpg", desc: "Fiber crop",           disease: "powdery_mildew" },
];

export default function PlantCare() {
  const [selected, setSelected] = useState(null); // { name, disease }

  return (
    <div className="page fade-up">
      <h1 className="page-title">Plant Care & Information</h1>
      <p className="page-sub">Explore crops, care practices & prevention</p>

      <div style={styles.grid}>
        {plants.map((p) => (
          <div key={p.name} style={styles.card} onClick={() => setSelected(p)}>
            <img src={p.img} alt={p.name} style={styles.img} onError={(e) => { e.target.style.display = "none"; }} />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{p.name}</h3>
              <p style={styles.cardDesc}>{p.desc}</p>
              <span style={styles.viewBtn}>View Care Info →</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <PlantModal
          plantName={selected.name}
          disease={selected.disease}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 },
  card: { background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,.08)", cursor: "pointer", transition: "transform .25s, box-shadow .25s" },
  img:  { width: "100%", height: 170, objectFit: "cover" },
  cardBody:  { padding: 20 },
  cardTitle: { fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#1b5e20", marginBottom: 4 },
  cardDesc:  { color: "#6a876a", fontSize: 14, marginBottom: 10 },
  viewBtn:   { fontSize: 13, color: "#2e7d32", fontWeight: 600 },
};