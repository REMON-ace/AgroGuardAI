# 🌿 AgroGuard AI – Backend

Smart Plant Disease Detection & Care Assistant  
**Node.js + Express + MySQL + JWT + Python ML**

---

## 📁 Folder Structure

```
agroguard-backend/
├── server.js                  ← App entry point
├── package.json
├── .env                       ← Environment variables (edit this!)
├── .gitignore
│
├── config/
│   └── db.js                  ← MySQL connection pool
│
├── controllers/               ← Business logic
│   ├── authController.js
│   ├── detectController.js
│   ├── plantCareController.js
│   ├── historyController.js
│   ├── profileController.js
│   └── adminController.js
│
├── models/                    ← Database queries
│   ├── userModel.js
│   ├── detectionModel.js
│   └── plantCareModel.js
│
├── routes/                    ← API endpoints
│   ├── authRoutes.js
│   ├── detectRoutes.js
│   ├── plantCareRoutes.js
│   ├── historyRoutes.js
│   ├── profileRoutes.js
│   └── adminRoutes.js
│
├── middleware/
│   ├── authMiddleware.js      ← JWT verification
│   ├── upload.js              ← Multer file upload
│   └── errorHandler.js        ← Global error handler
│
├── ml/
│   └── predict.py             ← Python ML script
│
├── database/
│   └── setup.sql              ← MySQL schema
│
├── utils/
│   └── api-examples.js        ← Frontend fetch examples
│
└── uploads/                   ← Uploaded images saved here
```

---

## ⚙️ Setup Instructions

### Step 1 – Install Node.js Dependencies
```bash
cd agroguard-backend
npm install
```

### Step 2 – Setup MySQL Database
```bash
# Option A: via terminal
mysql -u root -p < database/setup.sql

# Option B: open MySQL Workbench or phpMyAdmin
# and paste the contents of database/setup.sql
```

### Step 3 – Configure Environment
Open `.env` and update:
```
DB_PASSWORD=your_actual_mysql_password
JWT_SECRET=choose_a_long_random_secret
FRONTEND_URL=http://127.0.0.1:5500
```

### Step 4 – Start the Server
```bash
# Development (auto-restarts on save)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 🌐 API Reference

| Method | Endpoint                        | Auth? | Description              |
|--------|---------------------------------|-------|--------------------------|
| POST   | /api/auth/register              | ❌    | Register new user        |
| POST   | /api/auth/login                 | ❌    | Login, get JWT token     |
| POST   | /api/detect                     | ✅    | Upload image, detect disease |
| GET    | /api/plant-care?disease=NAME    | ✅    | Get care info            |
| GET    | /api/history                    | ✅    | View scan history        |
| GET    | /api/history/:id                | ✅    | Single scan detail       |
| GET    | /api/profile                    | ✅    | Get profile              |
| PUT    | /api/profile                    | ✅    | Update profile           |
| PUT    | /api/profile/change-password    | ✅    | Change password          |
| GET    | /api/admin/users                | ✅    | Admin: all users         |
| DELETE | /api/admin/users/:id            | ✅    | Admin: delete user       |
| GET    | /api/admin/detections           | ✅    | Admin: all detections    |
| DELETE | /api/admin/detections/:id       | ✅    | Admin: delete detection  |

> **Auth header format:** `Authorization: Bearer <your_jwt_token>`

---

## 🧠 ML Model Integration

The backend calls `ml/predict.py` via Python subprocess.  
The script receives the image path and prints JSON to stdout:

```json
{ "disease": "Early Blight", "confidence": 87.5, "remedy": "Apply fungicide..." }
```

**To plug in your real model:**
1. Open `ml/predict.py`
2. Uncomment the TensorFlow/Keras block
3. Set `MODEL_PATH` to your `.h5` or `SavedModel` file
4. Install Python deps: `pip install tensorflow pillow numpy`

---

## 🔗 Frontend Connection

Copy `utils/api-examples.js` to your frontend and call the functions.

**Quick example in your HTML:**
```html
<script>
const BASE_URL = 'http://localhost:5000/api';

// Login
async function loginUser() {
  const res  = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@email.com', password: 'pass123' }),
  });
  const data = await res.json();
  localStorage.setItem('agroguard_token', data.token);
}

// Detect disease
async function detectDisease(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${BASE_URL}/detect`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('agroguard_token')}` },
    body: formData,
  });
  return await res.json();
}
</script>
```

---

## 🔒 Tech Stack

| Layer          | Technology        |
|----------------|-------------------|
| Server         | Node.js + Express |
| Database       | MySQL             |
| Authentication | JWT + bcrypt      |
| File Upload    | Multer            |
| Validation     | express-validator |
| ML Integration | Python subprocess |
| CORS           | cors              |
| Logging        | morgan            |

---

## 🆚 Flask Alternative

If you prefer Python (Flask) instead of Node.js:

```python
# app.py (Flask equivalent)
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:pass@localhost/agroguard_db'
app.config['JWT_SECRET_KEY'] = 'your_secret'

# Routes mirror the Express structure:
# POST /auth/register  →  @app.route('/auth/register', methods=['POST'])
# POST /detect         →  @app.route('/detect', methods=['POST'])
# etc.
```

Flask is simpler for Python-native ML, but Node.js is faster for I/O-heavy APIs.
