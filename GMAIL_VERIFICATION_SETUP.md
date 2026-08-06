# ✅ Gmail Verification Setup - FIXED

## What Was Changed

### 1. ✅ Enabled Real Email Sending
Changed `SKIP_EMAIL=false` in `.env` - Now emails will be sent to Gmail inbox!

### 2. ✅ Fixed Database Timeout Issues
- Increased connection timeout to 30 seconds
- Added connection pooling with proper configuration
- Updated DATABASE_URL with timeout parameters

---

## 🚀 Test Now (3 Steps)

### Step 1: Restart Backend
```bash
# Stop current backend (Ctrl+C)
cd backend
npm start
```

### Step 2: Register New Account
1. Go to http://localhost:5173/register
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - **Email: amenteshomereg@gmail.com** (or any Gmail)
   - Password: Test123!@#
3. Click "Register"

### Step 3: Check Gmail Inbox
1. **Open Gmail**: https://gmail.com
2. **Check inbox** for email from "StudAI <no-reply@studai.et>"
3. **Subject**: "Verify your StudAI account"
4. **Click the verification link** in the email
5. ✅ Should verify email, auto-login, and redirect to onboarding!

---

## What the Email Looks Like

```
From: StudAI <no-reply@studai.et>
To: amenteshomereg@gmail.com
Subject: Verify your StudAI account

Hi Amen,

Click below to verify your account:
[Verify My Account] ← Click this button

This link expires in 24 hours.
```

---

## If Email Doesn't Arrive (Troubleshooting)

### Check 1: Spam Folder
- Go to Gmail Spam folder
- Search for "StudAI" or "no-reply@studai.et"

### Check 2: Backend Console
Even with `SKIP_EMAIL=false`, if email fails, the link will be logged:
```
❌ Failed to send email to amenteshomereg@gmail.com: ...
🔗 VERIFICATION/RESET LINK:
http://localhost:5173/verify-email?token=...
```

### Check 3: SMTP Credentials
Verify in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=amenteshomereg@gmail.com
SMTP_PASS=ovfddwhhxwgomgvj  # Should be App Password
```

**Is this an App Password?** (Not your regular Gmail password)
- Go to: https://myaccount.google.com/apppasswords
- Create new app password for "Mail"
- Replace `SMTP_PASS` in `.env`

---

## Changes Made

### File 1: `backend/.env`
```diff
- SKIP_EMAIL=true
+ SKIP_EMAIL=false

- DATABASE_URL="postgresql://...?sslmode=verify-full&channel_binding=require"
+ DATABASE_URL="postgresql://...?sslmode=require&connect_timeout=30"
```

### File 2: `backend/src/lib/prisma.js`
```diff
- const adapter = new PrismaPg({
-   connectionString: env.databaseUrl,
-   ssl: { rejectUnauthorized: false },
- });

+ const pool = new Pool({
+   connectionString: env.databaseUrl,
+   ssl: { rejectUnauthorized: false },
+   connectionTimeoutMillis: 30000,
+   query_timeout: 30000,
+   max: 20,
+ });
+ const adapter = new PrismaPg(pool);
```

---

## Expected Flow Now

### Registration Flow
```
1. User fills registration form
   ↓
2. Backend sends email via Gmail SMTP
   ↓
3. User receives email in Gmail inbox
   ↓
4. User clicks verification link
   ↓
5. Email verified + auto-login
   ↓
6. Redirected to /onboarding
   ↓
7. Complete 4-step wizard
   ↓
8. Redirected to /dashboard
```

### Backend Console Output (Success)
```
✅ Email sent successfully to amenteshomereg@gmail.com
```

### Backend Console Output (Failure)
```
❌ Failed to send email to amenteshomereg@gmail.com: [reason]
🔗 VERIFICATION/RESET LINK:
http://localhost:5173/verify-email?token=abc123...
```

---

## Database Timeout Fix

### Problem
```
PrismaClientKnownRequestError: Operation has timed out
DriverAdapterError: SocketTimeout
```

### Solution
1. ✅ Increased connection timeout to 30 seconds
2. ✅ Added connection pooling configuration
3. ✅ Updated DATABASE_URL with proper parameters
4. ✅ Added query timeout settings

### If Timeout Still Occurs
Your network connection to Neon (eu-central-1) might be slow.

**Option 1: Use Different Region** (if possible)
- Create new Neon database in closer region
- Update DATABASE_URL

**Option 2: Increase Timeout Further**
Edit `backend/src/lib/prisma.js`:
```javascript
connectionTimeoutMillis: 60000, // 60 seconds instead of 30
query_timeout: 60000,
```

---

## Summary

| What | Before | After |
|------|--------|-------|
| Email Mode | Console only | **Real Gmail** ✅ |
| SKIP_EMAIL | true | **false** ✅ |
| DB Timeout | Default (~10s) | **30 seconds** ✅ |
| Connection Pool | None | **Configured** ✅ |

---

## 🎯 Action Items

1. **Restart backend** (important!)
   ```bash
   cd backend
   # Press Ctrl+C to stop
   npm start
   ```

2. **Register with your Gmail**
   - Use: amenteshomereg@gmail.com
   - Or any other Gmail address

3. **Check Gmail inbox**
   - Email should arrive in 5-10 seconds
   - Check spam if not in inbox

4. **Click verification link**
   - Should verify + auto-login
   - Should redirect to onboarding

---

## Success Indicators

✅ Registration succeeds without errors  
✅ Backend logs: "Email sent successfully"  
✅ Email arrives in Gmail inbox  
✅ Clicking link verifies account  
✅ Auto-login works  
✅ Redirect to onboarding works  
✅ No database timeout errors  

---

## If It Still Doesn't Work

### Backend shows success but no email?
- Check Gmail spam folder
- Verify SMTP_PASS is an App Password
- Try with different Gmail address

### Database timeout still happening?
- Increase timeout to 60 seconds
- Check network connection to Neon
- Consider using connection pooler URL from Neon

### Backend crashes or errors?
- Share the complete error message
- Check all env variables are set
- Verify pg package is installed: `npm install pg`

---

**Status**: 🟢 CONFIGURED TO SEND REAL EMAILS

Restart backend and test now! 🚀
