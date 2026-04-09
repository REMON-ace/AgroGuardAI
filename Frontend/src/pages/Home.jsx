// src/pages/Home.jsx
import { useState, useRef, useEffect } from "react";
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
  const [longLoad, setLongLoad] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  // Ensure page always starts at the top when navigating or refreshing
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    // Show a hint message if analysis takes longer than 3 seconds
    const timeoutMsg = setTimeout(() => setLongLoad(true), 3000);

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await detectDisease(fd);
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Detection failed. Try again.");
    } finally {
      clearTimeout(timeoutMsg);
      setLongLoad(false);
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

            {/* Replaced internal inline result box with full screen modal render below */}

            <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} disabled={loading} onClick={handleDetect}>
              {loading ? "Analyzing Image..." : "Detect Disease"}
            </button>
            
            {longLoad && (
              <p style={{ fontSize: 11, color: '#6a876a', marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
                Note: The deep learning engine takes a few seconds to warm up. Please hold on...
              </p>
            )}

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

      {/* Result Full Screen Overlay Modal */}
      {result && (
        <div style={styles.resultOverlay}>
          <div style={{...styles.resultModal, position: 'relative'}} className="fade-up">
            
            {/* Elegant Top-Right Cross Button */}
            <button 
              style={{ position: 'absolute', top: 16, right: 24, fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', color: '#888', lineHeight: 1 }}
              onClick={() => {
                setResult(null);
                setFile(null);
                setPreview(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Close"
            >
              &times;
            </button>

            <div style={styles.resultModalLeft}>
              <img src={preview} alt="uploaded plant" style={styles.resultModalImg} />
            </div>

            <div style={styles.resultModalRight}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={styles.resultLabel}>Detection Analysis Details</p>
                <span style={{ background: '#c8e6c9', color: '#1b5e20', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 'bold' }}>
                  Confidence: {result.confidence}%
                </span>
              </div>
              
              <h3 style={{ fontSize: 32, fontWeight: 800, color: '#1b5e20', marginBottom: 10 }}>
                {result.disease}
              </h3>

              {result.confidence < 50 && (
                <div style={{ background: '#fff3e0', borderLeft: '4px solid #ff9800', padding: 12, marginBottom: 16, borderRadius: 4 }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#e65100' }}>
                    <strong>Low Confidence:</strong> The AI isn't completely certain. Accuracy will improve immensely as background training finishes optimizing over your dataset!
                  </p>
                </div>
              )}
                
              <p style={{ fontSize: 16, fontWeight: 700, color: '#2e7d32', marginBottom: 10, marginTop: 24 }}>Suggested Prevention & Care:</p>
              <ul style={{ paddingLeft: 24, margin: 0 }}>
                {result.remedy.split('\n').map((step, idx) => (
                  <li key={idx} style={{ fontSize: 15, color: "#444", marginBottom: 10, lineHeight: 1.5 }}>{step}</li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', paddingTop: 30 }}>
                <button 
                  className="btn-primary" 
                  style={{ width: "100%", padding: "16px", fontSize: 16, boxShadow: "0 10px 20px rgba(0,0,0,.15)" }} 
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setPreview(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  📸 Analyze Another Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  resultLabel: { fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#4a7c4a", marginBottom: 4 },
  resultOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", padding: 20, backdropFilter: "blur(8px)" },
  resultModal: { background: "white", borderRadius: 24, padding: 30, width: "100%", maxWidth: 1000, display: "flex", gap: 40, boxShadow: "0 30px 90px rgba(0,0,0,.4)", overflow: "hidden", flexDirection: "row", flexWrap: "wrap", maxHeight: '90vh', overflowY: 'auto' },
  resultModalLeft: { flex: "1 1 300px", display: "flex", flexDirection: "column" },
  resultModalRight: { flex: "2 1 400px", display: "flex", flexDirection: "column", justifyContent: "center" },
  resultModalImg: { width: "100%", height: "100%", maxHeight: 500, objectFit: "cover", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.1)" },
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
