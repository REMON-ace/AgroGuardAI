// src/components/Footer.jsx
import { useLocation } from "react-router-dom";

const socialIcons = [
  { name: "instagram", url: "https://instagram.com",  src: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" },
  { name: "linkedin",  url: "https://linkedin.com",   src: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" },
  { name: "twitter",   url: "https://twitter.com",    src: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" },
  { name: "github",    url: "https://github.com",     src: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg" },
  { name: "youtube",   url: "https://youtube.com",    src: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg" },
];

export default function Footer() {
  const { pathname } = useLocation();
  const minimized = pathname !== "/";

  if (minimized) {
    return (
      <footer style={styles.mini}>
        <p style={styles.miniText}>© 2026 AgroGuard AI • Smart Agriculture Platform</p>
      </footer>
    );
  }

  return (
    <footer style={styles.full}>
      <div style={styles.grid}>
        <div style={styles.section}>
          <h4 style={styles.h4}>Contact</h4>
          <p style={styles.p}>Email: support@agroguard-ai.com</p>
          <p style={styles.p}>Phone: +91 9XXXXXXXXX</p>
        </div>
        <div style={styles.section}>
          <h4 style={styles.h4}>Connect With Us</h4>
          <div style={styles.socials}>
            {socialIcons.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" style={styles.socialLink}>
                <img src={s.src} alt={s.name} style={styles.socialImg} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.bottom}>© 2026 AgroGuard AI • Smart Agriculture Platform</div>
    </footer>
  );
}

const styles = {
  full:       { background: "#e8f5e9", marginTop: 0 },
  mini:       { background: "#e8f5e9", padding: "10px 0", textAlign: "center" },
  miniText:   { fontSize: 13, color: "#4a7c4a" },
  grid:       { display: "flex", justifyContent: "space-around", flexWrap: "wrap", padding: "30px 20px" },
  section:    { textAlign: "center" },
  h4:         { color: "#1b5e20", marginBottom: 12, fontFamily: "'DM Serif Display', serif", fontSize: 17 },
  p:          { fontSize: 14, marginBottom: 6, color: "#3d5a3d" },
  socials:    { display: "flex", gap: 14, justifyContent: "center", marginTop: 8 },
  socialLink: { width: 36, height: 36, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,.1)" },
  socialImg:  { width: 17, height: 17, filter: "invert(24%) sepia(19%) saturate(694%) hue-rotate(76deg)" },
  bottom:     { textAlign: "center", padding: "12px", fontSize: 13, background: "#dcedc8", color: "#2e5e2e" },
};
