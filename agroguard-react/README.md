# 🌿 AgroGuard AI — React Frontend

Converted from vanilla HTML/CSS/JS to React.  
Fully connected to the Node.js + Express backend.

---

## 📁 Folder Structure

```
src/
├── index.js               ← React entry point
├── index.css              ← Global styles + CSS variables
├── App.jsx                ← Router + AuthProvider wrapper
│
├── api/
│   └── api.js             ← All backend API calls (axios)
│
├── context/
│   └── AuthContext.jsx    ← Global login state (JWT + user)
│
├── components/
│   ├── Navbar.jsx         ← Top navigation bar
│   ├── NavDots.jsx        ← Bottom navigation dots
│   ├── Footer.jsx         ← Footer (full on Home, mini elsewhere)
│   ├── AuthModal.jsx      ← Login + Register modal
│   └── PlantModal.jsx     ← Plant disease info modal
│
└── pages/
    ├── Home.jsx           ← Hero + image upload detection
    ├── PlantCare.jsx      ← 6 plant cards with care info
    ├── LiveDetect.jsx     ← Camera capture + detection
    └── Profile.jsx        ← Dashboard + history + profile edit
```

---

## ⚙️ Setup

```bash
# 1. Install dependencies
npm install

# 2. Make sure backend is running at http://localhost:5000
cd ../agroguard-backend && npm run dev

# 3. Start React app
npm start
# Opens at http://localhost:3000
```

---

## 🔗 Backend Mapping

| Page / Component | Backend Route Used |
|---|---|
| `AuthModal` login | `POST /api/auth/login` |
| `AuthModal` register | `POST /api/auth/register` |
| `Home` detect button | `POST /api/detect` |
| `PlantModal` info | `GET /api/plant-care?disease=NAME` |
| `LiveDetect` capture | `POST /api/detect` |
| `Profile` profile load | `GET /api/profile` |
| `Profile` update | `PUT /api/profile` |
| `Profile` password | `PUT /api/profile/change-password` |
| `Profile` history | `GET /api/history` |

---

## 📸 Images

Place your plant images in `public/Images/`:
```
public/Images/
├── bg-img.jpg
├── tomato.jpg
├── potato.jpg
├── Maize.jpg
├── Rice.jpg
├── wheat.jpg
└── cotton.jpg
```
These are the same images from your original HTML project.

---

## ⚠️ Notes

- The `ProtectedRoute` in `App.jsx` redirects unauthenticated users from `/profile` to `/`
- JWT token is stored in `localStorage` under key `agroguard_token`
- The axios interceptor in `api.js` auto-attaches the token to every request
- Camera page auto-stops on tab hide and on page unmount
