# StudAI Subscription System - Complete Guide

## 🎯 Overview

The subscription system includes:
- ✅ **3 Tier Plans**: FREE, STUDENT (149 ETB/month), PRO (249 ETB/month)
- ✅ **Usage Tracking**: Real-time limit enforcement for all features
- ✅ **Chapa Payment Integration**: Secure payment processing for Ethiopia
- ✅ **Checkout Flow**: Beautiful plan selection and billing cycle pages
- ✅ **Limit Modals**: Automatic upgrade prompts when limits are reached
- ✅ **Usage Display**: Dashboard showing current usage and limits

---

## 📋 Setup Instructions

### 1. Backend Setup

#### Add Chapa API Keys to `.env`

```bash
# Get your keys from: https://dashboard.chapa.co/
# For testing, use sandbox keys (CHASECK_TEST- prefix)
CHAPA_SECRET_KEY=CHASECK_TEST-your-test-secret-key
CHAPA_WEBHOOK_SECRET=your-webhook-secret
```

#### Run Database Migration

```bash
cd backend
npx prisma migrate deploy
# Or for development:
npx prisma migrate dev
```

This creates:
- `Payment` table - tracks all payment transactions
- `SubscriptionHistory` table - logs plan changes
- Adds `subscriptionExpiresAt` field to Student model
- Adds new enums: PaymentStatus, PaymentProvider, BillingCycle

#### Install Chapa Package

```bash
npm install chapa-nodejs
```

### 2. Frontend Setup

No additional setup needed! All payment pages and components are ready.

---

## 🧪 Testing Guide

### A. Test with Chapa Sandbox

#### 1. Get Sandbox Keys

1. Go to [https://dashboard.chapa.co/](https://dashboard.chapa.co/)
2. Sign up/login
3. Navigate to **Settings → API Keys**
4. Copy your **Test Secret Key** (starts with `CHASECK_TEST-`)
5. Add to backend `.env` file

#### 2. Test Card Numbers

Chapa provides these test cards:

**Successful Payment:**
```
Card Number: 4200 0000 0000 0000
CVV: Any 3 digits
Expiry: Any future date
```

**Failed Payment:**
```
Card Number: 4100 0000 0000 0000
CVV: Any 3 digits
Expiry: Any future date
```

**Declined Payment:**
```
Card Number: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

#### 3. Complete Test Flow

**Step 1: Trigger Limit**
1. Login as a FREE user
2. Try to upload your 6th PDF (limit is 5)
3. Limit modal should appear automatically

**Step 2: Select Plan**
1. Click "Upgrade to STUDENT" in the modal
2. You're redirected to `/checkout?plan=student&cycle=monthly`
3. Choose billing cycle (monthly or yearly)
4. Review order summary

**Step 3: Process Payment**
1. Click "Proceed to Payment"
2. Redirected to Chapa checkout page
3. Enter test card: `4200 0000 0000 0000`
4. Complete payment

**Step 4: Verify Success**
1. Redirected to `/payment/success?tx_ref=SA-STUDENT-...`
2. Backend verifies payment with Chapa
3. User plan upgraded to STUDENT
4. Dashboard shows new limits

### B. Test Payment Webhook (Advanced)

For local testing, use [ngrok](https://ngrok.com/):

```bash
# Start your backend
npm run dev

# In another terminal, start ngrok
ngrok http 4000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Update Chapa webhook URL to: https://abc123.ngrok.io/api/payment/webhook
```

---

## 🔄 Complete User Flow

### Scenario 1: FREE User Hits Limit

1. **Trigger**: User tries to generate 11th AI summary (limit: 10)
2. **Backend**: Returns `429 Too Many Requests` with limit details
3. **Frontend**: `useLimitModal` hook detects error, shows modal
4. **Modal**: Displays usage (10/10) and upgrade options
5. **Upgrade**: User clicks "Upgrade to STUDENT"
6. **Checkout**: Redirects to `/checkout?plan=student`
7. **Payment**: Initialize Chapa payment, redirect to checkout
8. **Success**: Verify payment, upgrade plan, redirect to dashboard
9. **Result**: User can now generate 50+ summaries monthly

### Scenario 2: Manual Upgrade

1. **Settings**: User opens settings → Plan tab
2. **Usage Display**: Shows current usage across all features
3. **Upgrade**: Clicks "Upgrade to PRO" plan card
4. **Checkout**: Same flow as above
5. **Result**: Unlimited access to all features

---

## 📊 Plan Comparison

| Feature | FREE | STUDENT (149 ETB) | PRO (249 ETB) |
|---------|------|-------------------|---------------|
| **PDF Uploads** | 5/month | 25/month | Unlimited |
| **AI Summaries** | 10/month | Unlimited | Unlimited |
| **Flashcards** | 50/month | Unlimited | Unlimited |
| **Chat Messages** | 100/month | 1,000/month | Unlimited |
| **Quiz Practice** | 10/month | Unlimited | Unlimited |
| **Active Courses** | 2 | 6 | Unlimited |
| **Previous Exams** | Last 2 years | All years | All + AI solutions |
| **Study Timer** | Basic | Advanced | Advanced + Team |
| **Analytics** | No | Yes | Advanced |
| **Study Groups** | No | Join only | Create & Manage |
| **Export** | No | PDF | PDF + Markdown + Anki |
| **Support** | Email (72h) | Email (24h) | 24/7 Chat |

---

## 🎨 Key Components

### Backend

**Payment Service** (`backend/src/modules/payment/`)
- `payment.service.js` - Payment logic and subscription upgrades
- `payment.controller.js` - API handlers
- `payment.routes.js` - 6 endpoints

**Usage Service** (`backend/src/modules/usage/`)
- `usage.service.js` - Limit enforcement and tracking
- `usage.controller.js` - Usage summary API
- `usage.routes.js` - Usage endpoints

**Chapa Client** (`backend/src/lib/chapaClient.js`)
- Initialize payments
- Verify transactions
- Webhook handling

### Frontend

**Payment Pages**
- `CheckoutPage.tsx` - Plan selection and billing
- `PaymentSuccessPage.tsx` - Transaction confirmation
- `PaymentFailurePage.tsx` - Error handling

**Usage Components**
- `UsageDisplay.tsx` - Full usage dashboard
- `UsageWidget.tsx` - Topbar compact view
- `UsageProgressBar.tsx` - Inline progress bars
- `LimitReachedModal.tsx` - Upgrade prompts

**Hooks & Utilities**
- `useLimitModal.tsx` - Easy limit modal integration
- `errorHandler.ts` - API error handling
- `paymentApi.ts` - Payment API client
- `usageApi.ts` - Usage API client

---

## 🔒 Security Notes

### Production Checklist

- [ ] Replace `CHASECK_TEST-` keys with production keys
- [ ] Enable webhook signature verification in production
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use HTTPS for all payment redirects
- [ ] Set up proper CORS for payment callbacks
- [ ] Add rate limiting to payment endpoints
- [ ] Log all payment attempts for audit
- [ ] Never expose secret keys in frontend
- [ ] Validate all payment data on backend
- [ ] Test subscription expiry logic

### Webhook Security

```javascript
// Backend automatically verifies webhook signatures
// Make sure CHAPA_WEBHOOK_SECRET is set in production
```

---

## 📈 Monitoring & Analytics

### Track These Metrics

1. **Conversion Rate**: FREE → STUDENT → PRO
2. **Limit Trigger Points**: Which features cause upgrades
3. **Checkout Drop-off**: Where users abandon payment
4. **Failed Payments**: Reasons and patterns
5. **Churn Rate**: Subscription cancellations

### Recommended Tools

- **Chapa Dashboard**: Payment analytics
- **Google Analytics**: User flow tracking
- **Sentry**: Error monitoring
- **Database Queries**: Custom analytics

---

## 🐛 Common Issues & Solutions

### Issue 1: Payment Verification Fails

**Symptoms**: Success page shows "Verification Failed"

**Solutions**:
- Check Chapa API keys are correct
- Verify transaction reference is valid
- Check backend logs for API errors
- Ensure Chapa sandbox is enabled for test keys

### Issue 2: User Plan Not Updated

**Symptoms**: Payment succeeds but user still on FREE

**Solutions**:
- Check webhook is configured correctly
- Verify payment status is "SUCCESS" in database
- Check subscription history table for records
- Manually verify payment in Chapa dashboard

### Issue 3: Limit Modal Not Appearing

**Symptoms**: Error thrown but modal doesn't show

**Solutions**:
- Check `useLimitModal` hook is used in component
- Verify error status is 429
- Check error format matches expected structure
- Look for console errors in browser

### Issue 4: Chapa Redirect Not Working

**Symptoms**: Checkout button does nothing

**Solutions**:
- Check `CHAPA_SECRET_KEY` is set in backend `.env`
- Verify network request succeeds in DevTools
- Check CORS settings allow payment initialization
- Ensure callback URLs are correct

---

## 🚀 Deployment

### Environment Variables

**Backend Production `.env`:**
```bash
# Replace with production keys
CHAPA_SECRET_KEY=CHASECK-your-production-key
CHAPA_WEBHOOK_SECRET=your-production-webhook-secret

# Update URLs
FRONTEND_URL=https://studai.et
```

**Frontend Production:**
```bash
# Ensure API URL points to production
VITE_API_URL=https://api.studai.et
```

### Deployment Steps

1. **Database**: Run migrations on production DB
2. **Backend**: Deploy with production Chapa keys
3. **Frontend**: Build and deploy with production API URL
4. **Chapa**: Update webhook URL in Chapa dashboard
5. **Test**: Complete one test transaction
6. **Monitor**: Watch logs for first few transactions

---

## 💡 Tips for Your Presentation

### What to Demo

1. **Start as FREE user**: Show limited access
2. **Hit a limit**: Try to upload 6th PDF
3. **See modal**: Beautiful upgrade prompt appears
4. **Select plan**: Choose STUDENT monthly
5. **Checkout**: Show professional payment page
6. **Pay**: Use test card, show Chapa integration
7. **Success**: Show confirmation and new limits
8. **Dashboard**: Display unlimited access

### What to Highlight

- ✨ **Ethiopian Market**: Chapa integration for local payments
- ✨ **Professional UI**: Beautiful, conversion-optimized design
- ✨ **Real-time Limits**: Backend enforces all limits
- ✨ **Smooth Flow**: 3-click upgrade process
- ✨ **Secure**: Proper payment verification
- ✨ **Complete**: Database tracking, webhooks, everything

### Key Features to Mention

1. **Balanced Plans**: FREE is useful, paid plans are valuable
2. **Monthly Limits**: Reset every month automatically
3. **Instant Upgrade**: Immediate access after payment
4. **Yearly Savings**: 20-33% discount for annual billing
5. **Professional**: Production-ready, not just a prototype

---

## 📞 Support

For issues:
- Check this guide first
- Review backend logs: `npm run dev` output
- Check browser console for frontend errors
- Test with Chapa sandbox before production
- Contact Chapa support for payment issues

---

## ✅ Final Checklist

- [x] Database migration completed
- [x] Chapa keys configured
- [x] All endpoints working
- [x] Payment flow tested
- [x] Webhooks configured
- [x] Limits enforcing correctly
- [x] UI components integrated
- [x] Error handling works
- [x] Success/failure pages display
- [x] Usage tracking accurate

**Status**: ✅ **READY FOR PRESENTATION!**

---

Built with ❤️ for Ethiopian students
