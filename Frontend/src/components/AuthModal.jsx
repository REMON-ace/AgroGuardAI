// src/components/AuthModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";
import { login as apiLogin, register as apiRegister } from "../api/api";

export default function AuthModal({ onClose }) {
  const [mode,     setMode]     = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [loginRole, setLoginRole] = useState("user");
  const { loginSave } = useAuth();
  const navigate = useNavigate();

  const clearMessages = () => { setError(""); setSuccess(""); };

  // Wipe everything when toggling between Login and Register
  const switchMode = (newMode) => {
    setMode(newMode);
    setName(""); setEmail(""); setPassword("");
    setError(""); setSuccess("");
  };

  // Translate any backend or network error into a human-readable sentence
  const parseError = (err) => {
    if (!err.response) {
      return "Cannot reach the server. Make sure the backend is running on port 5000.";
    }
    const status  = err.response.status;
    const message = err.response.data?.message || "";
    const errors  = err.response.data?.errors;

    if (errors && errors.length > 0) {
      return errors.map((e) => e.msg).join(" • ");
    }
    if (status === 409) return "This email is already registered. Please log in instead.";
    if (status === 401) return "Incorrect email or password. Please try again.";
    if (status === 400) return message || "Please fill in all fields correctly.";
    if (status === 500) return "Server error. Please try again in a moment.";
    if (message)        return message;
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async () => {
    clearMessages();

    if (mode === "register") {
      if (!name.trim())              return setError("Full name is required.");
      if (name.trim().length < 2)    return setError("Name must be at least 2 characters.");
    }
    if (!email.trim())               return setError("Email address is required.");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Please enter a valid email address.");
    if (!password)                   return setError("Password is required.");
    if (password.length < 6)        return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      if (mode === "register") {
        await apiRegister({ name: name.trim(), email: email.trim().toLowerCase(), password });
        setName(""); setEmail(""); setPassword("");
        setMode("login");
        setSuccess("Account created! You can now log in with your email and password.");
      } else {
        const res = await apiLogin({ email: email.trim().toLowerCase(), password, loginRole });
        loginSave(res.data.token, res.data.user);
        onClose?.();
        if (res.data.user.role === 'admin') {
          navigate("/admin/dashboard");
        }
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleSubmit();
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.box} onClick={(e) => e.stopPropagation()}>

        <button style={S.close} onClick={onClose}>x</button>

        <h2 style={S.title}>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p style={S.sub}>
          {mode === "login"
            ? "Login to save your plant scans and history."
            : "Register once to access your full dashboard."}
        </p>

        {error   && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {mode === "register" && (
          <input
            className="input-field"
            placeholder="Full Name"
            value={name}
            autoFocus
            onChange={(e) => { clearMessages(); setName(e.target.value); }}
            onKeyDown={handleKeyDown}
          />
        )}

        <input
          className="input-field"
          type="email"
          placeholder="Email address"
          value={email}
          autoFocus={mode === "login"}
          onChange={(e) => { clearMessages(); setEmail(e.target.value); }}
          onKeyDown={handleKeyDown}
        />

        <input
          className="input-field"
          type="password"
          placeholder={mode === "register" ? "Password (min 6 characters)" : "Password"}
          value={password}
          onChange={(e) => { clearMessages(); setPassword(e.target.value); }}
          onKeyDown={handleKeyDown}
        />

        {mode === "login" && (
          <div style={{ display: 'flex', gap: '15px', margin: '15px 0', fontSize: '15px', color: '#333' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="radio" value="user" checked={loginRole === 'user'} onChange={(e) => setLoginRole(e.target.value)} /> User
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="radio" value="admin" checked={loginRole === 'admin'} onChange={(e) => setLoginRole(e.target.value)} /> Admin
            </label>
          </div>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%", marginTop: 6, opacity: loading ? 0.7 : 1 }}
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>

        <p style={S.toggle}>
          {mode === "login" ? "New user? " : "Already registered? "}
          <span
            style={S.link}
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create account" : "Login instead"}
          </span>
        </p>

      </div>
    </div>
  );
}

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 500 },
  box:     { background: "white", borderRadius: 18, padding: 36, width: "min(420px, 92vw)", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,.2)" },
  close:   { position: "absolute", top: 14, right: 18, background: "none", border: "none", fontSize: 26, color: "#666", cursor: "pointer" },
  title:   { fontFamily: "'DM Serif Display', serif", fontSize: "1.7rem", color: "#1b5e20", marginBottom: 6 },
  sub:     { fontSize: 14, color: "#6a876a", marginBottom: 20 },
  toggle:  { marginTop: 16, textAlign: "center", fontSize: 14, color: "#555" },
  link:    { color: "#2e7d32", fontWeight: 600, cursor: "pointer", textDecoration: "underline" },
};
