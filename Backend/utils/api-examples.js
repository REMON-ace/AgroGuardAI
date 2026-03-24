// ============================================================
// utils/api-examples.js
// Frontend Integration Guide – Sample Fetch API Calls
// Copy these into your HTML/CSS/JS frontend project.
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

// ── Helper: get stored JWT token ─────────────────────────────
const getToken = () => localStorage.getItem('agroguard_token');

// ============================================================
// 1. REGISTER
// ============================================================
async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  console.log('Register:', data);
  return data;
}

// ── Usage ────────────────────────────────────────────────────
// register('Ravi Kumar', 'ravi@email.com', 'mypassword123');


// ============================================================
// 2. LOGIN
// ============================================================
async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (data.success) {
    // Save token for future requests
    localStorage.setItem('agroguard_token', data.token);
    localStorage.setItem('agroguard_user',  JSON.stringify(data.user));
  }
  return data;
}

// ── Usage ────────────────────────────────────────────────────
// login('ravi@email.com', 'mypassword123');


// ============================================================
// 3. DETECT PLANT DISEASE (image upload)
// ============================================================
async function detectDisease(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile); // 'image' must match multer field name

  const res = await fetch(`${BASE_URL}/detect`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`, // JWT token
      // DO NOT set Content-Type for FormData – browser sets it automatically
    },
    body: formData,
  });
  const data = await res.json();
  console.log('Detection result:', data);
  return data;
}

// ── Usage (from file input) ───────────────────────────────────
// const fileInput = document.getElementById('plantImage');
// fileInput.addEventListener('change', async (e) => {
//   const file   = e.target.files[0];
//   const result = await detectDisease(file);
//   console.log(result.result.disease);     // "Early Blight"
//   console.log(result.result.confidence);  // 87.5
//   console.log(result.result.remedy);      // "Apply fungicide..."
// });


// ============================================================
// 4. GET PLANT CARE INFO
// ============================================================
async function getPlantCare(diseaseName) {
  const res = await fetch(`${BASE_URL}/plant-care?disease=${encodeURIComponent(diseaseName)}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  const data = await res.json();
  console.log('Plant care:', data);
  return data;
}

// ── Usage ────────────────────────────────────────────────────
// getPlantCare('early_blight');
// getPlantCare('late blight');


// ============================================================
// 5. GET DETECTION HISTORY
// ============================================================
async function getHistory() {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  const data = await res.json();
  console.log('History:', data.history);
  return data;
}


// ============================================================
// 6. GET / UPDATE PROFILE
// ============================================================
async function getProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  return await res.json();
}

async function updateProfile(name, email) {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name, email }),
  });
  return await res.json();
}


// ============================================================
// 7. CHANGE PASSWORD
// ============================================================
async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${BASE_URL}/profile/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return await res.json();
}


// ============================================================
// 8. LOGOUT (client-side only)
// ============================================================
function logout() {
  localStorage.removeItem('agroguard_token');
  localStorage.removeItem('agroguard_user');
  window.location.href = '/login.html'; // Redirect to login page
}
