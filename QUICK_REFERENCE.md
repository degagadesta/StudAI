# 🚀 StudAI Quick Reference Card

## ⚡ Start in 30 Seconds

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2 (new window)
cd Frontend/studAI_frontend && npm run dev
```

**Open:** http://localhost:5173

---

## 🔧 Common Commands

### Backend
```bash
cd backend
npm run dev              # Start server
npx prisma generate      # Regenerate Prisma Client
npx prisma db push       # Sync database
npx prisma studio        # Open database GUI
```

### Frontend
```bash
cd Frontend/studAI_frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## 🐛 Quick Fixes

### Prisma Error
```bash
cd backend
npx prisma generate
```

### CORS Error
- Restart backend server
- Check `FRONTEND_URL` in `backend/.env`

### Build Error
```bash
cd Frontend/studAI_frontend
rm -rf node_modules && npm install
```

### Port in Use
**Windows:**
```bash
netstat -ano | findstr :4000
taskkill /PID <pid> /F
```

---

## 🔐 Authentication

### Email/Password
- Login: http://localhost:5173/login
- Register: http://localhost:5173/register

### Google OAuth
- Click "Continue with Google" (Login)
- Click "Sign up with Google" (Register)

---

## 📁 Important Files

### Configuration
- `backend/.env` - Backend environment
- `Frontend/studAI_frontend/.env` - Frontend environment
- `backend/prisma/schema.prisma` - Database schema

### Key Code
- `backend/src/modules/auth/` - Authentication logic
- `Frontend/studAI_frontend/src/pages/` - Page components
- `Frontend/studAI_frontend/src/api/` - API calls

---

## 🔍 Debugging

### Check Backend
```bash
curl http://localhost:4000/api/v1/auth/login
# Should return error (means route exists)
```

### Check Frontend
- Open browser console (F12)
- Check Network tab for API calls
- Look for error messages

### Check Database
```bash
cd backend
npx prisma studio
```

---

## 📊 Status Check

### ✅ Everything Working
- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- No SSL warnings
- No Prisma errors
- Google OAuth working

### ❌ Something Wrong
1. Check both servers running
2. Check `.env` files
3. Run `npx prisma generate`
4. Restart servers
5. Check browser console

---

## 📚 Documentation

- `README.md` - Overview
- `SETUP_GUIDE.md` - Setup
- `TROUBLESHOOTING.md` - Fixes
- `GOOGLE_OAUTH_SETUP.md` - OAuth
- `ALL_FIXES_COMPLETE.md` - Status

---

## 🎯 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:4000 |
| API | http://localhost:4000/api/v1 |
| Database | Neon Cloud |

---

## ✅ Quick Test

1. Open http://localhost:5173
2. Click "Continue with Google"
3. Select Google account
4. **Result:** Logged in! ✅

---

**Need help? Check `TROUBLESHOOTING.md`**

*Quick Reference by Kiro AI Assistant*
