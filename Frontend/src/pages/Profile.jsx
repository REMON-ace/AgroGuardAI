// src/pages/Profile.jsx
// Shows user info, scan history, and profile update form.
// All data comes from real backend endpoints.

import { useEffect, useState } from "react";
import { useAuth }             from "../context/AuthContext";
import { getProfile, updateProfile, changePassword, getHistory } from "../api/api";

export default function Profile() {
  const { user, loginSave, token } = useAuth();

  // Profile state
  const [name,     setName]     = useState(user?.name  || "");
  const [email,    setEmail]    = useState(user?.email || "");
  const [profMsg,  setProfMsg]  = useState("");
  const [profErr,  setProfErr]  = useState("");
  const [profLoad, setProfLoad] = useState(false);

  // Password state
  const [curPwd,   setCurPwd]   = useState("");
  const [newPwd,   setNewPwd]   = useState("");
  const [pwdMsg,   setPwdMsg]   = useState("");
  const [pwdErr,   setPwdErr]   = useState("");
  const [pwdLoad,  setPwdLoad]  = useState(false);

  // History state
  const [history,  setHistory]  = useState([]);
  const [histLoad, setHistLoad] = useState(true);

  useEffect(() => {
    // Fetch latest profile
    getProfile().then((r) => {
      setName(r.data.user.name);
      setEmail(r.data.user.email);
    }).catch(() => {});

    // Fetch scan history
    getHistory().then((r) => setHistory(r.data.history || []))
      .catch(() => {})
      .finally(() => setHistLoad(false));
  }, []);

  const handleProfileUpdate = async () => {
    setProfErr(""); setProfMsg(""); setProfLoad(true);
    try {
      await updateProfile({ name, email });
      loginSave(token, { ...user, name, email });
      setProfMsg("Profile updated successfully!");
    } catch (err) {
      setProfErr(err.response?.data?.message || "Update failed.");
    } finally {
      setProfLoad(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwdErr(""); setPwdMsg(""); setPwdLoad(true);
    if (!curPwd || !newPwd) { setPwdErr("Both fields required."); setPwdLoad(false); return; }
    try {
      await changePassword({ currentPassword: curPwd, newPassword: newPwd });
      setPwdMsg("Password changed successfully!");
      setCurPwd(""); setNewPwd("");
    } catch (err) {
      setPwdErr(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwdLoad(false);
    }
  };

  return (
    <div className="page fade-up">
      <h1 className="page-title">My Dashboard</h1>
      <p className="page-sub">Your activity and profile overview</p>

      <div style={styles.grid}>
        {/* Stats cards */}
        {[
          { label: "Total Scans",    value: history.length },
          { label: "Diseases Found", value: history.filter((h) => !h.disease_name.toLowerCase().includes("healthy") && h.disease_name !== "Unknown" && !h.disease_name.toLowerCase().includes("not a valid plant")).length },
          { label: "Healthy Plants", value: history.filter((h) => h.disease_name.toLowerCase().includes("healthy")).length },
          { label: "Member Since",   value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—" },
        ].map((c) => (
          <div key={c.label} style={styles.statCard}>
            <p style={styles.statLabel}>{c.label}</p>
            <p style={styles.statValue}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={styles.twoCol}>
        {/* Profile update */}
        <div className="card">
          <h3 style={styles.sectionTitle}>Edit Profile</h3>
          {profMsg && <div className="success-msg">{profMsg}</div>}
          {profErr && <div className="error-msg">{profErr}</div>}
          <input className="input-field" placeholder="Full Name" value={name}  onChange={(e) => setName(e.target.value)} />
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-primary" disabled={profLoad} onClick={handleProfileUpdate}>
            {profLoad ? "Saving…" : "Update Profile"}
          </button>
        </div>

        {/* Change password */}
        <div className="card">
          <h3 style={styles.sectionTitle}>Change Password</h3>
          {pwdMsg && <div className="success-msg">{pwdMsg}</div>}
          {pwdErr && <div className="error-msg">{pwdErr}</div>}
          <input className="input-field" type="password" placeholder="Current Password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} />
          <input className="input-field" type="password" placeholder="New Password"     value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          <button className="btn-primary" disabled={pwdLoad} onClick={handlePasswordChange}>
            {pwdLoad ? "Updating…" : "Change Password"}
          </button>
        </div>
      </div>

      {/* Detection History */}
      <div className="card" style={{ marginTop: 28 }}>
        <h3 style={styles.sectionTitle}>Detection History</h3>
        {histLoad && <div className="spinner" />}
        {!histLoad && history.length === 0 && (
          <p style={{ color: "#6a876a", fontSize: 14, textAlign: "center", padding: 20 }}>No detections yet. Upload or capture a plant image to get started!</p>
        )}
        {!histLoad && history.map((h) => (
          <div key={h.id} style={styles.histItem}>
            {h.image_path && (
              <img src={`http://localhost:5000${h.image_path}`} alt="scan" style={styles.histImg} />
            )}
            <div style={styles.histInfo}>
              <p style={styles.histDisease}>{h.disease_name}</p>
              <p style={styles.histConf}>Confidence: {h.confidence}%</p>
              <p style={styles.histRemedy}>{h.remedy}</p>
              <p style={styles.histDate}>{new Date(h.created_at).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 18, marginBottom: 28 },
  statCard:    { background: "white", borderRadius: 14, padding: 22, boxShadow: "0 6px 18px rgba(0,0,0,.07)", textAlign: "center" },
  statLabel:   { fontSize: 13, color: "#6a876a", marginBottom: 6 },
  statValue:   { fontSize: "2rem", fontWeight: 700, color: "#2e7d32", fontFamily: "'DM Serif Display', serif" },
  twoCol:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 0 },
  sectionTitle:{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#1b5e20", marginBottom: 16 },
  histItem:    { display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid #f0f0f0", alignItems: "flex-start" },
  histImg:     { width: 72, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
  histInfo:    { flex: 1 },
  histDisease: { fontWeight: 700, color: "#1b5e20", fontSize: 15, marginBottom: 2 },
  histConf:    { fontSize: 12, color: "#3d5a3d", marginBottom: 2 },
  histRemedy:  { fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 4 },
  histDate:    { fontSize: 11, color: "#aaa" },
};
