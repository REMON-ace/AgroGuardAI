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

export default api;
