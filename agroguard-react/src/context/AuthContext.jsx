// src/context/AuthContext.jsx
// Global auth state — user info, token, login/logout helpers.
// Wrap your app with <AuthProvider> and use useAuth() anywhere.

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false); // true once localStorage is read

  // Restore session on first load
  useEffect(() => {
    const storedToken = localStorage.getItem("agroguard_token");
    const storedUser  = localStorage.getItem("agroguard_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setReady(true);
  }, []);

  const loginSave = (tokenValue, userData) => {
    localStorage.setItem("agroguard_token", tokenValue);
    localStorage.setItem("agroguard_user",  JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("agroguard_token");
    localStorage.removeItem("agroguard_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, ready, loginSave, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
