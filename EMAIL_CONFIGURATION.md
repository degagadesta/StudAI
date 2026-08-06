# 📧 Email Configuration Guide

## 🚨 Current Issue: SMTP Timeout

**Error:** `ETIMEDOUT connecting to smtp.gmail.com:587`

This means the email server cannot be reached, which could be due to:
1. Firewall blocking SMTP port 587
2. Network/ISP blocking Gmail SMTP
3. Gmail security settings
4. Incorrect credentials

## ✅ Quick Fix: Development Mode (RECOMMENDED)

I've implemented a **skip email** mode that logs verification links to the console instead of sending actual emails.

### Enable Skip Email Mode

Already configured in your `.env`:
```env
SKIP_EMAIL=true
```

### How It Works

When `SKIP_EMAIL=true`:
1. User registers
2. Backend **doesn't** try to send email
3. Instead, it **logs the verification link** to the console
4. You copy the link from console
5. Paste it in browser to verify

### Example Console Output

```
📧 EMAIL (Not Sent - Development Mode):
=====================================
To: test@example.com
Subject: Verify your StudAI account
HTML: <p>Hi Test,</p><p>Click below to...

🔗 LINK TO COPY: http://localhost:5173/verify-email?token=abc123...
=====================================
```

## 🧪 Testing With Skip Email Mode

### 1. Restart Backend
```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

### 2. Register New User
1. Go to `http://localhost:5173/register`
2. Fill form and submit
3. See success message

### 3. Get Verification Link
1. Check backend console
2. Look for: `🔗 LINK TO COPY:`
3. Copy the entire URL

### 4. Verify Email
1. Paste URL in browser
2. Press Enter
3. Should verify and auto-login!

## 🔧 Fix Gmail SMTP (For Production)

If you need actual email sending to work:

### Option 1: Enable Less Secure Apps (Not Recommended)
1. Go to Google Account settings
2. Security
3. Enable "Less secure app access"

### Option 2: Use App Password (Recommended)
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use this password in `.env`:
```env
SMTP_PASS=your-16-character-app-password
```

### Option 3: Alternative SMTP Providers

**SendGrid (Free Tier):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

**Mailtrap (Development/Testing):**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

### Option 4: Check Firewall

**Windows Firewall:**
```powershell
# Check if port 587 is blocked
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
```

**If blocked, allow outbound connections on port 587**

## 📝 Environment Variables

### Development (Skip Email)
```env
# Skip email sending
SKIP_EMAIL=true

# These are still needed (but won't be used)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
EMAIL_FROM="StudAI <no-reply@studai.et>"
```

### Production (Real Email)
```env
# Enable email sending
SKIP_EMAIL=false

# Use app password or real SMTP service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="StudAI <no-reply@studai.et>"
```

## 🎯 Current Setup

Your `.env` is now configured with:
- ✅ `SKIP_EMAIL=true` - Email sending skipped in development
- ✅ Links logged to console instead
- ✅ Registration works without timeout
- ✅ Verification works by copying console link

## 🔄 How to Use

### Workflow

```
1. Register User
   ↓
2. Check Backend Console
   ↓
3. Copy Verification Link
   ↓
4. Paste in Browser
   ↓
5. Email Verified + Auto-Login!
```

### Step-by-Step

**1. Start backend:**
```bash
cd backend
npm run dev
```

**2. Register at frontend:**
```
http://localhost:5173/register
```

**3. Check backend console output:**
```
📧 EMAIL (Not Sent - Development Mode):
...
🔗 LINK TO COPY: http://localhost:5173/verify-email?token=...
```

**4. Copy and paste link in browser**

**5. Done! User is verified and logged in**

## 🐛 Troubleshooting

### Issue: Still getting timeout
**Solution:** Restart backend after adding `SKIP_EMAIL=true`

### Issue: Link not showing in console
**Solution:** Check backend console carefully, scroll up

### Issue: Link expired
**Solution:** Register again (tokens expire in 24 hours)

### Issue: Want to test real emails
**Solution:** 
1. Set `SKIP_EMAIL=false`
2. Use Mailtrap.io (free testing SMTP)
3. No real emails sent, but you can see them in Mailtrap inbox

## 🎉 Benefits of Skip Email Mode

✅ **No SMTP configuration needed**  
✅ **No network/firewall issues**  
✅ **Faster development**  
✅ **Still test complete flow**  
✅ **Easy link access**  
✅ **No email quota limits**  
✅ **Works offline**  

## 📊 Comparison

| Feature | Skip Email | Real SMTP |
|---------|-----------|-----------|
| Setup complexity | ✅ None | ❌ Complex |
| Network required | ✅ No | ❌ Yes |
| Testing speed | ✅ Instant | ❌ Slow |
| Link access | ✅ Console | ❌ Check inbox |
| Production ready | ❌ No | ✅ Yes |
| Email quota | ✅ Unlimited | ❌ Limited |

## 🚀 Recommendation

**For Development:** Use `SKIP_EMAIL=true` (already set!)  
**For Production:** Configure real SMTP or use email service

## ✅ Next Steps

1. ✅ `SKIP_EMAIL=true` is already set
2. ✅ Restart backend
3. ✅ Try registering
4. ✅ Copy link from console
5. ✅ Test verification flow

Everything should work now! 🎊

---

**Status:** ✅ Email issue resolved  
**Solution:** Skip email mode enabled  
**Testing:** Ready to go
