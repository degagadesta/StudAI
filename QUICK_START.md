# 🚀 StudAI - Quick Start Guide

## ⚡ Start Developing in 2 Minutes

### Prerequisites
- Node.js installed
- Two terminal windows

---

## 🎯 Start Backend (Terminal 1)

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

✅ Backend running on: **http://localhost:4000**

---

## 🎨 Start Frontend (Terminal 2)

```bash
cd Frontend/studAI_frontend
npm install
npm run dev
```

✅ Frontend running on: **http://localhost:5173**

---

## 🎉 You're Ready!

Open your browser: **http://localhost:5173**

### Try These:

1. **Create Account**
   - Click "Create an account"
   - Fill in your details
   - Submit (check backend console for verification link)

2. **Login**
   - Use your credentials
   - Access the dashboard
   - Explore features

3. **Test Features**
   - Automatic token refresh (wait 15min or reduce JWT_EXPIRES_IN)
   - Protected routes (try accessing /dashboard while logged out)
   - Logout functionality

---

## 📚 Full Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `INTEGRATION_COMPLETE.md` - All fixes and features
- `README.md` - Project overview

---

## 🐛 Quick Troubleshooting

### Backend won't start?
```bash
cd backend
npx prisma db push
npm run dev
```

### Frontend shows CORS error?
- Check backend is running on port 4000
- Check `Frontend/studAI_frontend/.env` has correct API URL
- Restart both servers

### Database error?
- Check `.env` DATABASE_URL is correct
- Run `npx prisma migrate dev`

---

## ✅ Integration Status

✅ All authentication flows working  
✅ Token refresh automatic  
✅ Protected routes functional  
✅ Security measures active  
✅ Build succeeds  
✅ Ready for development  

---

**Happy Coding! 🚀**
