# 🔧 StudAI Troubleshooting Guide

## Common Issues and Solutions

---

## ❌ Error: "Unknown argument `refreshToken`"

### Problem
```
PrismaClientValidationError: Invalid `prisma.student.update()` invocation
Unknown argument `refreshToken`. Available options are marked with ?.
```

### Cause
Prisma Client is out of sync with the database schema. The schema has `refreshToken` fields, but the generated client doesn't recognize them.

### Solution ✅

**Step 1: Regenerate Prisma Client**
```bash
cd backend
npx prisma generate
```

**Step 2: Sync Database (if needed)**
```bash
npx prisma db push
```

**Step 3: Restart Backend**
```bash
npm run dev
```

### Verification
✅ No error messages during generation  
✅ Backend starts successfully  
✅ Can login with email or Google  

---

## ❌ Error: SSL Warning

### Problem
```
Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' 
are treated as aliases for 'verify-full'
```

### Solution ✅
Already fixed! Check that your `backend/.env` has:
```env
DATABASE_URL="...?sslmode=verify-full&channel_binding=require"
DIRECT_URL="...?sslmode=verify-full&channel_binding=require"
```

---

## ❌ Error: Google OAuth Not Working

### Problem
- Google button doesn't appear
- "Invalid Client ID" error
- Authentication fails

### Solutions ✅

**Check 1: Environment Variables**
```bash
# Frontend .env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Backend .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Check 2: Google Cloud Console**
1. Go to https://console.cloud.google.com
2. Navigate to APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:4000`

**Check 3: Restart Servers**
```bash
# Kill both servers (Ctrl+C)
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd Frontend/studAI_frontend && npm run dev
```

---

## ❌ Error: CORS Policy

### Problem
```
Access to XMLHttpRequest blocked by CORS policy
```

### Solutions ✅

**Check 1: Backend CORS Configuration**
File: `backend/app.js`
```javascript
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  // ...
}));
```

**Check 2: Frontend URL in Backend .env**
```env
FRONTEND_URL=http://localhost:5173
```

**Check 3: Restart Backend**
```bash
cd backend
npm run dev
```

---

## ❌ Error: Build Fails

### Problem
```
npm run build
# TypeScript errors or build failures
```

### Solutions ✅

**Check 1: Install Dependencies**
```bash
cd Frontend/studAI_frontend
rm -rf node_modules
npm install
```

**Check 2: Check TypeScript Errors**
```bash
npm run build
# Read error messages carefully
```

**Check 3: Common TypeScript Issues**
- Missing `type` keyword for type-only imports
- Wrong import paths
- Missing dependencies

---

## ❌ Error: Token Refresh Fails

### Problem
- User logged out after 15 minutes
- "Invalid refresh token" error
- Token refresh doesn't work

### Solutions ✅

**Check 1: JWT Secrets**
```env
JWT_SECRET="your-secret-here"
JWT_REFRESH_SECRET="different-secret-here"
```
⚠️ These must be different!

**Check 2: Token Storage**
Check browser console for token storage issues.

**Check 3: Backend Logs**
Look for refresh token validation errors.

---

## ❌ Error: Database Connection Failed

### Problem
```
Error: Can't reach database server
```

### Solutions ✅

**Check 1: Database URL**
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=verify-full"
```

**Check 2: Neon Database Status**
1. Go to https://neon.tech
2. Check if database is active
3. Wake database if sleeping

**Check 3: Network Connection**
- Check internet connection
- Try pinging database host

---

## ❌ Error: Email Not Sending

### Problem
- Registration email not received
- Reset password email not sent

### Solutions ✅

**Check 1: SMTP Configuration**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Check 2: Gmail App Password**
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Generate new
4. Use generated password in `.env`

**Check 3: Check Backend Logs**
Look for email sending errors in terminal.

---

## ❌ Error: Port Already in Use

### Problem
```
Error: listen EADDRINUSE: address already in use :::4000
```

### Solutions ✅

**Windows:**
```bash
netstat -ano | findstr :4000
taskkill /PID <process-id> /F
```

**Alternative: Change Port**
```env
PORT=4001
```

---

## 🔄 Quick Reset Procedure

If everything is broken, follow this reset:

### Step 1: Clean Install
```bash
# Backend
cd backend
rm -rf node_modules
npm install
npx prisma generate
npx prisma db push

# Frontend
cd Frontend/studAI_frontend
rm -rf node_modules
npm install
```

### Step 2: Verify Environment Files
- Check `backend/.env` has all required variables
- Check `Frontend/studAI_frontend/.env` has API URL and Google Client ID

### Step 3: Restart Everything
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd Frontend/studAI_frontend
npm run dev
```

### Step 4: Test
1. Open http://localhost:5173
2. Try login with email
3. Try login with Google
4. Check browser console for errors

---

## 🔍 Debugging Tools

### Check Backend Health
```bash
curl http://localhost:4000/api/v1/auth/login
# Should return 405 Method Not Allowed (means route exists)
```

### Check Frontend Build
```bash
cd Frontend/studAI_frontend
npm run build
# Should complete without errors
```

### Check Database Connection
```bash
cd backend
npx prisma studio
# Opens database GUI
```

### Check Environment Variables
```bash
# Backend
cd backend
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"

# Frontend
cd Frontend/studAI_frontend
cat .env
```

---

## 📝 Checklist When Things Break

- [ ] Are both servers running?
- [ ] Are environment variables correct?
- [ ] Did you run `npx prisma generate` after schema changes?
- [ ] Did you restart servers after .env changes?
- [ ] Are there errors in browser console?
- [ ] Are there errors in backend terminal?
- [ ] Is database accessible?
- [ ] Are ports 4000 and 5173 available?

---

## 📞 Getting Help

### Check Documentation
1. `README.md` - Project overview
2. `SETUP_GUIDE.md` - Setup instructions
3. `GOOGLE_OAUTH_SETUP.md` - Google OAuth guide
4. `VERIFICATION_CHECKLIST.md` - Testing checklist

### Check Logs
1. **Browser Console** (F12) - Frontend errors
2. **Backend Terminal** - API errors
3. **Network Tab** (F12) - HTTP requests/responses

### Common Log Patterns

**Backend Success:**
```
Server running on port 4000
```

**Backend Error:**
```
Error: Missing required env var: JWT_SECRET
# Fix: Add JWT_SECRET to .env
```

**Frontend Success:**
```
VITE v8.2.0  ready in 234 ms
➜  Local:   http://localhost:5173/
```

**Frontend Error:**
```
Error: ECONNREFUSED
# Fix: Start backend server
```

---

## ✅ Prevention Tips

### 1. Always Regenerate Prisma Client
After any schema changes:
```bash
npx prisma generate
```

### 2. Keep Dependencies Updated
```bash
npm outdated
npm update
```

### 3. Use Environment Template
Create `.env.example` with placeholder values:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="generate-a-strong-secret"
```

### 4. Document Changes
When modifying code, update relevant documentation.

### 5. Test Before Committing
```bash
# Backend
cd backend && npm run dev

# Frontend
cd Frontend/studAI_frontend && npm run build
```

---

## 🎯 Most Common Issues (Quick Reference)

| Issue | Solution | Time |
|-------|----------|------|
| Prisma error | `npx prisma generate` | 1 min |
| CORS error | Restart backend | 30 sec |
| Build fails | `npm install` | 2 min |
| SSL warning | Update DATABASE_URL | 1 min |
| Google OAuth fails | Check Client IDs | 2 min |
| Token refresh fails | Check JWT secrets | 1 min |

---

**Most issues can be solved by:**
1. Regenerating Prisma Client
2. Restarting servers
3. Checking environment variables

**Still stuck? Check the documentation files for detailed guides!**

---

*Troubleshooting guide by Kiro AI Assistant*
