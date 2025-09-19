# Nepal Adventures Platform - Complete Setup Guide

## 🚀 Quick Start Checklist

### Prerequisites (Install these first):

#### 1. **Node.js** (Required)
- Download: https://nodejs.org/
- Install version 16 or higher
- Check installation: Open command prompt and run `node --version`

#### 2. **MongoDB** (Required)
Choose ONE option:

**Option A: Local MongoDB (Recommended for development)**
- Download: https://www.mongodb.com/try/download/community
- Install MongoDB Community Server
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud - Easier)**
- Sign up: https://www.mongodb.com/atlas
- Create free cluster
- Get connection string

#### 3. **Git** (Optional but recommended)
- Download: https://git-scm.com/downloads

### Optional Services (For production features):

#### 4. **Cloudinary** (For image uploads)
- Sign up: https://cloudinary.com/
- Get API credentials

#### 5. **Gmail App Password** (For email notifications)
- Enable 2FA on Gmail
- Generate app password: https://support.google.com/accounts/answer/185833

---

## 📁 Project Structure Overview

```
D:\work\travel\
├── nepal-adventure-website/     # Frontend (Already created)
├── nepal-adventure-backend/     # Backend API (Already created)
└── SETUP_GUIDE.md              # This file
```

---

## 🛠 Step-by-Step Setup

### **Step 1: Backend Setup**

1. **Open Command Prompt** and navigate to backend:
```bash
```

2. **Install Dependencies** (First time only):
```bash
npm install
```

3. **Configure Environment**:
   - File `.env` already exists with basic config
   - Update MongoDB connection if needed
   - Add optional services later

4. **Start Backend**:
```bash
npm run dev
```

**✅ Backend will run at: http://localhost:5000**

### **Step 2: Test Backend**

Open browser and visit:
- Health check: http://localhost:5000/api/health
- Should see: `{"success": true, "message": "Nepal Adventures API is running"}`

### **Step 3: Frontend Updates**

The frontend needs to connect to the backend. Update these files:

1. **Update JavaScript files** to use backend APIs
2. **Replace mock data** with real API calls
3. **Add authentication** to forms

---

## 🔧 Configuration Details

### **Backend Environment (.env)**

The backend `.env` file is already configured with:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nepal-adventures
JWT_SECRET=nepal-adventures-super-secret-jwt-key-2024
```

### **Optional Configurations**

Add these to `.env` when ready:

```env
# For image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# For email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 🌐 Frontend-Backend Integration

### **API Base URL**
Your frontend should make requests to: `http://localhost:5000/api`

### **Key API Endpoints**

#### Authentication:
```javascript
// Register user
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+977-1234567890",
  "role": "tourist"
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Adventures:
```javascript
GET /api/adventures?type=trekking&region=everest
```

#### Get Guides:
```javascript
GET /api/guides?specializations=trekking&languages=english
```

---

## 🔌 Frontend Integration Examples

### **1. Update Registration Form**

Replace the mock registration in `js/auth.js`:

```javascript
// Replace this section in auth.js
registrationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            role: selectedUserType
        };

        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showAlert('Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'adventures.html';
            }, 2000);
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        showAlert('Registration failed. Please try again.', 'error');
    }
});
```

### **2. Update Login Form**

```javascript
// Replace login handler in auth.js
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'adventures.html';
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Login failed. Please try again.');
        }
    });
}
```

### **3. Update Guides Loading**

```javascript
// Add to guides.js
async function loadGuides() {
    try {
        const response = await fetch('http://localhost:5000/api/guides');
        const data = await response.json();
        
        if (data.success) {
            displayGuides(data.data);
        }
    } catch (error) {
        console.error('Error loading guides:', error);
    }
}

function displayGuides(guides) {
    const guidesGrid = document.getElementById('guidesGrid');
    guidesGrid.innerHTML = guides.map(guide => `
        <div class="guide-card">
            <div class="guide-header">
                <div class="guide-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="guide-info">
                    <h4>${guide.user.fullName}</h4>
                    <span class="guide-type">${guide.specializations[0]}</span>
                    <div class="guide-rating">
                        <span class="stars">${'★'.repeat(Math.floor(guide.rating.average))}</span>
                        <span>(${guide.rating.count} reviews)</span>
                    </div>
                </div>
            </div>
            <div class="guide-details">
                <p>${guide.experience.description}</p>
                <div class="guide-languages">
                    ${guide.languages.map(lang => `<span class="language-tag">${lang.language}</span>`).join('')}
                </div>
            </div>
            <div class="guide-footer">
                <span class="guide-price">$${guide.pricing.dailyRate}/day</span>
                <button class="btn-book" onclick="bookGuide('${guide._id}')">View Profile</button>
            </div>
        </div>
    `).join('');
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadGuides);
```

---

## 🚦 Testing Your Setup

### **1. Test Backend APIs**

Use a tool like Postman or simply test in browser:

1. **Health Check**: http://localhost:5000/api/health
2. **Get Adventures**: http://localhost:5000/api/adventures
3. **Get Guides**: http://localhost:5000/api/guides

### **2. Test Frontend-Backend Connection**

1. Open your website: `nepal-adventure-website/index.html`
2. Try registering a new user
3. Try logging in
4. Check browser console for any errors

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Cannot connect to MongoDB"**
**Solutions:**
- Make sure MongoDB is running
- Check if port 27017 is available
- Use MongoDB Atlas cloud database instead

### **Issue 2: "CORS Error"**
**Solution:** Backend already configured for CORS. Make sure you're accessing frontend through a web server, not file:// protocol.

### **Issue 3: "Port 5000 already in use"**
**Solution:** Change PORT in `.env` file to different number like 5001

### **Issue 4: Frontend not connecting to backend**
**Solution:** Check if both frontend and backend are running, and verify API URLs are correct.

---

## 🚀 Deployment (When Ready)

### **Development (Current)**
- Frontend: Open HTML files directly or use live server
- Backend: `npm run dev` (auto-restarts on changes)
- Database: Local MongoDB or Atlas

### **Production Options**
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas (cloud)

---

## 📞 Quick Commands Reference

```bash
# Backend
cd nepal-adventure-backend
npm install          # Install dependencies
npm run dev         # Start development server
npm start           # Start production server

# Frontend
# Just open index.html in browser or use live server

# MongoDB
mongod              # Start MongoDB (if installed locally)
mongo               # Connect to MongoDB shell
```

---

## 🎯 Next Steps Priority

1. ✅ **Start Backend** (npm run dev)
2. ✅ **Test API** (visit health check)
3. 🔄 **Update Frontend** (connect to backend APIs)
4. 🧪 **Test Registration/Login**
5. 🧪 **Test Guide/Adventure Loading**
6. 🎨 **Add Payment Integration** (when ready for production)

---

## 💡 Tips

- Keep backend running while developing frontend
- Use browser developer tools to debug API calls
- Check backend console for error messages
- Start with simple API calls before complex features

---

Need help with any specific step? Just ask! 🚀