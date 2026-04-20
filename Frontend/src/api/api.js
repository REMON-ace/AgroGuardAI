// src/api/api.js
// Central place for all backend API calls.
// Every function maps to one route from the backend.

import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Axios instance with base URL
const api = axios.create({ baseURL: BASE_URL });

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agroguard_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────
export const register = (data) => api.post("/auth/register", data);
export const login    = (data) => api.post("/auth/login",    data);

// ── Detection ────────────────────────────────────────────────
export const detectDisease = (formData) =>
  api.post("/detect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ── Plant Care ───────────────────────────────────────────────
export const getPlantCareList = ()           => api.get("/plant-care");
export const getPlantCareInfo = (disease)    => api.get(`/plant-care?disease=${encodeURIComponent(disease)}`);

// ── History ──────────────────────────────────────────────────
export const getHistory          = ()   => api.get("/history");
export const getSingleDetection  = (id) => api.get(`/history/${id}`);

// ── Profile ──────────────────────────────────────────────────
export const getProfile      = ()     => api.get("/profile");
export const updateProfile   = (data) => api.put("/profile", data);
export const changePassword  = (data) => api.put("/profile/change-password", data);

// ── Admin ────────────────────────────────────────────────────
export const getDashboardStats    = ()   => api.get("/admin/dashboard-stats");
export const getAdminUsers        = ()   => api.get("/admin/users");
export const deleteAdminUser      = (id) => api.delete(`/admin/users/${id}`);
export const getAdminDetections   = (params) => api.get("/admin/detections", { params });
export const deleteAdminDetection = (id) => api.delete(`/admin/detections/${id}`);
export const getDetectionDetails  = (id) => api.get(`/admin/log/${id}`);
export const getAnalytics         = ()   => api.get("/admin/analytics");

export const exportLogs = async () => {
  const token = localStorage.getItem("agroguard_token");
  const response = await fetch("http://localhost:5000/api/admin/export", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Failed to export");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "detection_logs.csv";
  a.click();
};

export default api;
