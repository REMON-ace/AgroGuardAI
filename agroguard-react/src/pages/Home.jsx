// src/pages/Home.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import { detectDisease } from "../api/api";

const crops = ["tomato", "potato", "maize", "rice", "wheat", "cotton"];

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  };

  const handleDetect = async () => {
    if (!isLoggedIn) return setShowAuth(true);
    if (!file) return setError("Please select an image first.");
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await detectDisease(fd);
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Detection failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent} className="fade-up">
          <h1 style={styles.heroTitle}>SMART PLANT<br />IDENTIFICATION<br />&amp; CARE</h1>
          <p style={styles.heroSub}>AI-powered disease detection for healthy crops</p>

          {/* Upload card */}
          <div style={styles.uploadCard}>
            <label style={styles.uploadBox} onClick={() => fileRef.current?.click()}>
  {preview ? (
    <>
      <img src={preview} alt="preview" style={styles.previewImg} />
      <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 8 }}>
        <button
          type="button"
          style={{ fontSize: 12, color: "#c62828", cursor: "pointer", background: "none", border: "1px solid #c62828", borderRadius: 6, padding: "2px 6px" }}
          onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
        >
          Remove / Change
        </button>
      </div>
    </>
  ) : (
    <>
      <span style={{ fontSize: 36 }}>📷</span>
      <p style={{ marginTop: 8, fontWeight: 600 }}>Upload Plant Image</p>
      <p style={{ fontSize: 13, color: "#6a876a" }}>JPG, PNG, WEBP — max 5MB</p>
    </>
  )}
</label>

<input
  ref={fileRef}
  type="file"
  accept="image/*"
  style={{ display: "none" }}
  key={file ? file.name : "file-input"} // reset input when file removed
  onChange={(e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  }}
/>
            {error && <div className="error-msg">{error}</div>}

            {result && (
              <div style={styles.resultBox}>
                <p style={styles.resultLabel}>Detection Result</p>
                <p style={styles.resultDisease}>{result.disease}</p>
                <p style={styles.resultConf}>Confidence: <strong>{result.confidence}%</strong></p>
                <p style={styles.resultRemedy}>{result.remedy}</p>
              </div>
            )}

            <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} disabled={loading} onClick={handleDetect}>
              {loading ? "Analyzing…" : "Detect Disease"}
            </button>

            {!isLoggedIn && (
              <p style={{ fontSize: 13, color: "#6a876a", marginTop: 10, textAlign: "center" }}>
                <span style={{ color: "#2e7d32", cursor: "pointer", fontWeight: 600 }} onClick={() => setShowAuth(true)}>Login</span> to save results
              </p>
            )}
          </div>

          <button className="btn-outline" style={{ marginTop: 20, borderColor: "white", color: "white" }} onClick={() => navigate("/plant-care")}>
            Explore Plant Care →
          </button>
        </div>
      </section>

      {/* Marquee */}
        <div style={styles.marqueeWrap}>
          <div className="marqueeTrack">
            {[...crops, ...crops, ...crops].map((c, i) => (
              <div key={i} style={styles.marqueeItem}>
                <img
                  src={`/images/${c}.jpg`}
                  alt={c}
                  style={styles.marqueeImg}
                />
                <span style={styles.marqueeLabel}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

      {/* Login section (if not logged in) */}
      {!isLoggedIn && (
        <section style={styles.authSection}>
          <div style={styles.authCard}>
            <h2 style={styles.authTitle}>Login to AgroGuard</h2>
            <p style={styles.authSub}>Save your detections and track plant health history.</p>
            <button className="btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setShowAuth(true)}>
              Login / Create Account
            </button>
          </div>
        </section>
      )}
    </>
  );
}

const styles = {
  hero: { position: "relative", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 20px", overflow: "hidden" },
  heroOverlay: { position: "absolute", inset: 0,background: "linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)), url('/images/bg-img.jpg') center/cover no-repeat"},
  heroContent: { position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 520 },
  heroTitle: { fontFamily: "'DM Serif Display', serif", fontSize: "2.8rem", color: "white", lineHeight: 1.15, marginBottom: 12 },
  heroSub: { color: "#c8e6c9", fontSize: 16, marginBottom: 30 },
  uploadCard: { background: "rgba(255,255,255,.95)", borderRadius: 18, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,.3)" },
  uploadBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #81c784", borderRadius: 12, padding: 20, minHeight: 120, cursor: "pointer", background: "#f9fff9", marginBottom: 10 },
  previewImg: { width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8 },
  resultBox: { background: "#e8f5e9", borderRadius: 10, padding: 14, marginBottom: 8, textAlign: "left" },
  resultLabel: { fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#4a7c4a", marginBottom: 4 },
  resultDisease: { fontSize: 18, fontWeight: 700, color: "#1b5e20", marginBottom: 2 },
  resultConf: { fontSize: 13, color: "#3d5a3d", marginBottom: 6 },
  resultRemedy: { fontSize: 13, color: "#555", lineHeight: 1.6 },
  marqueeWrap: { background: "#f6fff7", height: 130, overflow: "hidden", display: "flex", alignItems: "center" },
  marqueeTrack: { display: "flex",width: "max-content",gap: 30},
  marqueeItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  marqueeImg: { height: 85, width: 120, objectFit: "cover", borderRadius: 12 },
  marqueeLabel: { fontSize: 12, fontWeight: 600, color: "#2e7d32" },
  authSection: { padding: "50px 20px" },
  authCard: { background: "white", borderRadius: 18, padding: 32, maxWidth: 400, margin: "0 auto", boxShadow: "0 8px 28px rgba(0,0,0,.09)", textAlign: "center" },
  authTitle: { fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "#1b5e20", marginBottom: 6 },
  authSub: { color: "#6a876a", fontSize: 14 },
};
