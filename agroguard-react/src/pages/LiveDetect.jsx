// src/pages/LiveDetect.jsx
// Camera view + capture → sends to /api/detect

import { useEffect, useRef, useState } from "react";
import { useAuth }                      from "../context/AuthContext";
import { detectDisease }                from "../api/api";
import AuthModal                        from "../components/AuthModal";

export default function LiveDetect() {
  const videoRef              = useRef(null);
  const canvasRef             = useRef(null);
  const [stream, setStream]   = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const { isLoggedIn }        = useAuth();

  // Stop camera when navigating away
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Stop camera on tab hide
  useEffect(() => {
    const handler = () => { if (document.hidden) stopCamera(); };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [stream]);

  const startCamera = async () => {
    if (stream) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Capture frame from video → canvas → blob → send to backend
  const captureAndDetect = async () => {
    if (!isLoggedIn) return setShowAuth(true);
    if (!stream)     return setError("Start the camera first.");

    const canvas = canvasRef.current;
    const video  = videoRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      setLoading(true); setError(""); setResult(null);
      try {
        const fd = new FormData();
        fd.append("image", blob, "capture.jpg");
        const res = await detectDisease(fd);
        setResult(res.data.result);
      } catch (err) {
        setError(err.response?.data?.message || "Detection failed.");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg");
  };

  return (
    <div className="page fade-up" style={{ maxWidth: 700 }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <h1 className="page-title">Live Plant Detection</h1>
      <p className="page-sub">Use your camera for real-time plant identification.</p>

      <div className="card">
        {/* Video feed */}
        <div style={styles.videoWrap}>
          <video ref={videoRef} autoPlay muted playsInline style={styles.video} />
          {!stream && (
            <div style={styles.placeholder}>
              <span style={{ fontSize: 48 }}>📷</span>
              <p style={{ marginTop: 12, color: "#6a876a" }}>Camera is off</p>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Controls */}
        <div style={styles.controls}>
          {!stream
            ? <button className="btn-primary" onClick={startCamera}>Start Camera</button>
            : <button className="btn-outline" onClick={stopCamera}>Stop Camera</button>
          }
          <button className="btn-primary" onClick={captureAndDetect} disabled={loading || !stream}>
            {loading ? "Analyzing…" : "Capture & Detect"}
          </button>
        </div>

        {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}

        {/* Result */}
        {result && (
          <div style={styles.resultBox} className="fade-up">
            <p style={styles.resultTag}>Detection Result</p>
            <h3 style={styles.diseaseName}>{result.disease}</h3>
            <p style={styles.conf}>Confidence: <strong>{result.confidence}%</strong></p>
            <div style={styles.confidenceBar}>
              <div style={{ ...styles.confidenceFill, width: `${result.confidence}%` }} />
            </div>
            <p style={styles.remedy}>{result.remedy}</p>
            {result.image_url && (
              <img src={`http://localhost:5000${result.image_url}`} alt="captured" style={styles.capturedImg} />
            )}
          </div>
        )}

        <p style={styles.note}>
          {!isLoggedIn
            ? <><span style={{ color: "#2e7d32", cursor: "pointer", fontWeight: 600 }} onClick={() => setShowAuth(true)}>Login</span> to save detection results.</>
            : "Results are automatically saved to your history."
          }
        </p>
      </div>
    </div>
  );
}

const styles = {
  videoWrap:     { width: "100%", height: 280, borderRadius: 12, overflow: "hidden", background: "#111", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  video:         { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  placeholder:   { position: "absolute", textAlign: "center", color: "#aaa" },
  controls:      { display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" },
  resultBox:     { background: "#e8f5e9", borderRadius: 12, padding: 18, marginTop: 16 },
  resultTag:     { fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#4a7c4a", marginBottom: 4 },
  diseaseName:   { fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", color: "#1b5e20", marginBottom: 4 },
  conf:          { fontSize: 13, color: "#3d5a3d", marginBottom: 6 },
  confidenceBar: { background: "#c8e6c9", borderRadius: 8, height: 8, marginBottom: 10, overflow: "hidden" },
  confidenceFill:{ height: "100%", background: "#2e7d32", borderRadius: 8, transition: "width .5s" },
  remedy:        { fontSize: 14, color: "#333", lineHeight: 1.6 },
  capturedImg:   { width: "100%", borderRadius: 8, marginTop: 12, objectFit: "contain", maxHeight: 180 },
  note:          { fontSize: 13, color: "#6a876a", marginTop: 14, textAlign: "center" },
};
