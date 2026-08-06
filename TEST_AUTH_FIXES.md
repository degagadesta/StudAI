# Test Authentication Fixes

## Quick Test Checklist

### ✅ Test 1: Email Verification (Race Condition Fix)

**Goal**: Verify that verification link doesn't bounce user back to login

**Steps:**
1. Register new account at http://localhost:5173/register
2. Check backend console for verification link
3. **Copy the entire link**
4. **Open link in NEW TAB or INCOGNITO** (fresh page load - triggers race condition)
5. Wait for verification to complete

**Expected Result:**
- ✅ Shows "Email Verified! 🎉"
- ✅ Redirects to `/onboarding` after 2 seconds
- ❌ Should NOT redirect to `/login`
- ❌ Should NOT show "Loading..." indefinitely

**What Was Fixed:**
Background session restore no longer overwrites the newly established verification session.

---

### ✅ Test 2: First-Time Google Sign-In

**Goal**: Verify new Google users go to onboarding

**Steps:**
1. Use **Incognito/Private Window** (clean slate)
2. Go to http://localhost:5173/register
3. Click "Sign up with Google"
4. Complete Google authentication
5. Should be logged in

**Expected Result:**
- ✅ Redirects to `/onboarding` (NOT dashboard)
- ✅ Shows 4-step wizard
- ✅ Can complete university, department, year, courses
- ✅ After completion, redirects to `/dashboard`

**What Was Fixed:**
Google sign-in now checks `hasProfile` and routes new users to onboarding.

---

### ✅ Test 3: Returning User Login

**Goal**: Verify users with profiles go to dashboard

**Steps:**
1. Complete Test 2 first (so you have a profile)
2. Logout
3. Go to http://localhost:5173/login
4. Enter email and password
5. Click "Sign in"

**Expected Result:**
- ✅ Redirects to `/dashboard` (NOT onboarding)
- ✅ Shows dashboard with data
- ❌ Should NOT show empty dashboard
- ❌ Should NOT redirect to onboarding

**What Was Fixed:**
Regular login now checks `hasProfile` and routes correctly.

---

### ✅ Test 4: Returning Google User

**Goal**: Verify returning Google users skip onboarding

**Steps:**
1. Complete Test 2 first (so you have a profile)
2. Logout
3. Go to http://localhost:5173/login
4. Click "Continue with Google"
5. Select your account

**Expected Result:**
- ✅ Redirects to `/dashboard` (NOT onboarding)
- ✅ Shows dashboard with your data
- ❌ Should NOT go to onboarding again

**What Was Fixed:**
Google sign-in now checks `hasProfile` for returning users.

---

## Detailed Test Scenarios

### Scenario A: Email Verification Race Condition

**This tests Bug 1 fix - session race condition**

1. **Setup:**
   ```bash
   # Backend running
   cd backend && npm start
   
   # Frontend running
   cd Frontend && npm run dev
   ```

2. **Register:**
   - Go to http://localhost:5173/register
   - Fill form with unique email
   - Click "Create account"

3. **Verify in NEW TAB:**
   - Copy verification link from backend console
   - **Important**: Open in NEW TAB or Incognito (triggers background refresh)
   - The page should load fresh (background auth check runs)

4. **Observe:**
   - Page shows "Verifying Your Email"
   - Then "Email Verified! 🎉"
   - Then "Redirecting..."
   - Then redirects to `/onboarding`

5. **Success Indicators:**
   - ✅ Never shows login page
   - ✅ Never bounces back
   - ✅ Smoothly transitions to onboarding
   - ✅ `isAuthenticated` stays `true`

6. **Failure Indicators (if bug exists):**
   - ❌ Briefly shows onboarding then redirects to login
   - ❌ Console shows auth state changing from true → false
   - ❌ ProtectedRoute kicks in and redirects

---

### Scenario B: Onboarding Status Check

**This tests Bug 2 fix - consistent routing**

**Part 1: New User via Email**
```
1. Register → Verify → Should go to /onboarding
2. Complete onboarding → Should go to /dashboard
3. Logout → Login → Should go to /dashboard (not onboarding again)
```

**Part 2: New User via Google**
```
1. Google sign-in (first time) → Should go to /onboarding
2. Complete onboarding → Should go to /dashboard
3. Logout → Google sign-in again → Should go to /dashboard
```

**Part 3: Edge Cases**
```
1. Start onboarding but don't complete
2. Logout
3. Login again → Should go to /onboarding (resume)
4. Complete it → Should go to /dashboard
5. Future logins → Should always go to /dashboard
```

---

## Backend Verification

### Check hasProfile is Returned

**Login Endpoint:**
```bash
# Test login response
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Should return:
{
  "accessToken": "...",
  "student": { "id": "...", "firstName": "...", "email": "..." },
  "hasProfile": false  // ← Should be present
}
```

**Google Sign-In Endpoint:**
```bash
# After Google sign-in, response should include:
{
  "accessToken": "...",
  "student": { "id": "...", "firstName": "...", "email": "..." },
  "hasProfile": false  // ← Should be present
}
```

**Verify Email Endpoint:**
```bash
# Already working - verify it still includes:
{
  "message": "...",
  "accessToken": "...",
  "student": { ... },
  "hasProfile": false  // ← Should be present
}
```

---

## Console Debugging

### Check Auth State

Open browser DevTools console and check:

```javascript
// After verification/login, check:
// 1. Access token stored
localStorage.getItem('accessToken')  // Should have value

// 2. Refresh token in cookie
document.cookie  // Should include refreshToken

// 3. Auth context state
// Look for React DevTools → AuthContext
// Should show:
// - isAuthenticated: true
// - isLoading: false
// - user: { id, email, firstName }
```

### Check Race Condition Fix

Add temporary logging in `useAuth.ts`:

```typescript
const setUser = useCallback((user: User | null) => {
  console.log('[EXPLICIT AUTH] Setting user:', user);
  lastExplicitAuthTime.current = Date.now();
  // ... rest of code
}, []);

const checkAuth = useCallback(async (isExplicitAuth = false) => {
  console.log('[CHECK AUTH] Start. Explicit:', isExplicitAuth);
  // ... rest of code
  console.log('[CHECK AUTH] Complete. Auth time:', lastExplicitAuthTime.current);
}, []);
```

**Expected logs during verification:**
```
[CHECK AUTH] Start. Explicit: false          // Background restore
[EXPLICIT AUTH] Setting user: { ... }        // Verification sets user
[CHECK AUTH] Complete. Auth time: 1234567890 // Background completes
[CHECK AUTH] Skipped update (stale)          // Doesn't overwrite
```

---

## Known Edge Cases

### Edge Case 1: Very Fast Network
If network is super fast, background refresh might complete BEFORE verification. This is fine - verification will still set user and win.

### Edge Case 2: Backend Down During Onboarding Check
If backend fails to check profile status, `hasProfile` will be `undefined`. System defaults to `/onboarding` (safe fallback).

### Edge Case 3: User Manually Types /dashboard
If user has no profile and manually navigates to `/dashboard`, dashboard should:
- Either show "Complete onboarding first" message
- Or redirect to `/onboarding`
- This is up to Dashboard component implementation

---

## Rollback Plan

If fixes cause issues:

### Revert Frontend:
```bash
cd Frontend
git checkout HEAD~1 src/hooks/useAuth.ts
git checkout HEAD~1 src/pages/VerifyEmail.tsx
git checkout HEAD~1 src/pages/LoginPage.tsx
git checkout HEAD~1 src/pages/Register.tsx
rm src/utils/authRouting.ts
```

### Revert Backend:
```bash
cd backend
git checkout HEAD~1 src/modules/auth/auth.service.js
git checkout HEAD~1 src/modules/auth/auth.controller.js
```

---

## Success Criteria

All fixes working correctly if:

✅ Email verification never bounces to login  
✅ New Google users go to onboarding  
✅ Returning users go to dashboard  
✅ No race conditions or timing issues  
✅ All auth flows route consistently  
✅ Loading states resolve properly  
✅ No console errors  

---

**Test thoroughly before deploying to production!** 🚀
