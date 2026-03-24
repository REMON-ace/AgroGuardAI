// src/components/PlantModal.jsx
import { useEffect, useState } from "react";
import { getPlantCareInfo } from "../api/api";
import plantLocalData from "../data/plantCare.json";

export default function PlantModal({ plantName, disease, onClose }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plantName) return;

    setLoading(true);
    setError("");

    getPlantCareInfo(disease)
      .then((res) => setInfo(res.data)) // Axios response
      .catch(() => {
        // fallback to local JSON
        const fallback = plantLocalData.find(p => p.disease === disease);
        if (fallback) setInfo(fallback);
        else setError("Could not load information.");
      })
      .finally(() => setLoading(false));

  }, [plantName, disease]);

  // Helper to format disease names nicely
  const formatDiseaseName = (d) =>
    d ? d.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : "";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.close} onClick={onClose}>×</button>

        <h2 style={styles.title}>{plantName}</h2>

        {info?.disease && (
          <h3 style={{ color: "#2e7d32", marginBottom: 12, fontStyle: "italic" }}>
            Disease: {formatDiseaseName(info.disease)}
          </h3>
        )}

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "#c62828" }}>{error}</p>}

        {info && (
          <>
            {info.severity && (
              <span style={{ ...styles.badge, background: severityColor(info.severity) }}>
                Severity: {info.severity}
              </span>
            )}

            <Section label="Causes" items={info.causes} />
            <Section label="Prevention" items={info.prevention} />
            <Section label="Treatment" items={info.treatment} />
          </>
        )}
      </div>
    </div>
  );
}

function Section({ label, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <h4 style={styles.sectionLabel}>{label}</h4>
      <ul style={styles.list}>
        {items.map((item, i) => <li key={i} style={styles.li}>{item}</li>)}
      </ul>
    </div>
  );
}

const severityColor = (s) => ({
  none: "#e8f5e9",
  mild: "#fff9c4",
  moderate: "#ffe0b2",
  severe: "#ffcdd2"
}[s] || "#f5f5f5");

const styles = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal:        { background: "white", borderRadius: 18, padding: 32, width: "min(600px, 92vw)", maxHeight: "85vh", overflowY: "auto", position: "relative" },
  close:        { position: "absolute", top: 14, right: 18, background: "none", border: "none", fontSize: 28, cursor: "pointer", color: "#666" },
  title:        { fontFamily: "'DM Serif Display', serif", fontSize: "1.8rem", color: "#1b5e20", marginBottom: 14 },
  badge:        { display: "inline-block", padding: "3px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 18, textTransform: "capitalize" },
  sectionLabel: { fontSize: 15, fontWeight: 700, color: "#2e7d32", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" },
  list:         { paddingLeft: 20 },
  li:           { marginBottom: 5, fontSize: 14, lineHeight: 1.6, color: "#333" },
};