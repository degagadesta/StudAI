# 🧪 Final Testing Guide - Complete Flow

## 🎯 Complete End-to-End Test

This guide walks you through testing the entire user journey from registration to dashboard.

## 🚀 Prerequisites

### 1. Start Backend
```bash
cd backend
npm run dev
```
**Expected Output:**
```
Server running on port 4000
```

### 2. Start Frontend
```bash
cd Frontend
npm run dev
```
**Expected Output:**
```
VITE ready at http://localhost:5173
```

### 3. Verify Database
```bash
cd backend
node test-db-connection.js
```
**Expected Output:**
```
✅ Universities: 3
✅ Departments: 3
✅ Courses: 33
✅ Database connection successful!
```

## 📝 Test Scenario 1: New User Complete Journey

### Step 1: Register
1. Open `http://localhost:5173/register`
2. Fill in the form:
   - First Name: `Test`
   - Last Name: `Student`
   - Email: `test@example.com`
   - Password: `Password123!`
3. Click **Register**

**Expected Result:**
- ✅ Success message: "Check your email to verify your account"
- ✅ User is NOT logged in yet
- ✅ Cannot access protected routes

**Check Backend Console:**
```
Email sent to test@example.com with verification link
```

### Step 2: Get Verification Link
**Option A: Check Email**
- Open your email inbox
- Look for email from StudAI
- Find verification link

**Option B: Check Backend Console**
- Look for the verification URL in console
- Format: `http://localhost:5173/verify-email?token=...`

**Option C: Check Database (for testing)**
```sql
SELECT 
  "firstName",
  "email",
  "emailVerified",
  "verificationToken"
FROM "Student"
WHERE email = 'test@example.com';
```

### Step 3: Click Verification Link
1. Copy the verification link from email/console
2. Paste in browser and press Enter
3. Observe the verification page

**Expected Behavior:**
```
Loading State (1-2 seconds):
- Spinner shows
- "Verifying Your Email"
- "Please wait..."

↓

Success State (2 seconds):
- Green checkmark
- "Email Verified! 🎉"
- "Redirecting..." with spinner

↓

Auto-redirect to /onboarding
```

**Verify in Browser:**
- ✅ URL changes to `/onboarding`
- ✅ User IS logged in (check DevTools → Application → Local Storage → `accessToken`)
- ✅ User data in memory

**Verify in Database:**
```sql
SELECT 
  "firstName",
  "email",
  "emailVerified",
  "verificationToken",
  "refreshToken"
FROM "Student"
WHERE email = 'test@example.com';
```
**Expected:**
- `emailVerified`: `true`
- `verificationToken`: `null` (cleared)
- `refreshToken`: `[hash]` (set)

### Step 4: Onboarding - Select University
**You should see:**
- Progress: "STEP 1 OF 4"
- 3 suggested universities:
  - AASTU
  - AAU
  - ASTU
- "More" button to search

**Actions:**
1. Click **AASTU** (or any suggested university)
2. Verify selected university shows with "Change" button
3. Click **Continue**

**Expected Result:**
- ✅ Button enabled only after selection
- ✅ Moves to Step 2

### Step 5: Onboarding - Select Department
**You should see:**
- Progress: "STEP 2 OF 4"
- University name displayed
- 3 departments:
  - Software Engineering
  - Computer Science
  - Electrical & Computer Engineering

**Actions:**
1. Click **Software Engineering**
2. Verify checkmark appears
3. Click **Continue**

**Expected Result:**
- ✅ Button enabled only after selection
- ✅ Moves to Step 3

### Step 6: Onboarding - Select Year & Semester
**You should see:**
- Progress: "STEP 3 OF 4"
- Department and University displayed
- Year buttons: 1, 2, 3, 4, 5
- Semester buttons: 1, 2

**Actions:**
1. Click **Year: 3**
2. Click **Semester: 1**
3. Verify both are highlighted
4. Click **Continue**

**Expected Result:**
- ✅ Button enabled only after both selections
- ✅ Loading spinner shows briefly
- ✅ Moves to Step 4

### Step 7: Onboarding - Select Courses
**You should see:**
- Progress: "STEP 4 OF 4"
- "Year 3 · Semester 1 · Software Engineering"
- 4 courses ALL PRE-SELECTED:
  - ☑ SWE301 - Software Architecture (4 credits)
  - ☑ SWE302 - Mobile Application Development (4 credits)
  - ☑ CS301 - Machine Learning (3 credits)
  - ☑ SWE303 - Human-Computer Interaction (3 credits)
- Counter: "4 of 4 selected"
- "Deselect all" button

**Actions:**
1. Verify all 4 courses are checked
2. (Optional) Uncheck one course to test
3. (Optional) Click "Select all" to select again
4. Click **Complete Setup**

**Expected Result:**
- ✅ Button shows "Saving setup..."
- ✅ Redirect to `/dashboard`
- ✅ User is fully onboarded

**Verify in Database:**
```sql
SELECT 
  s."firstName",
  s."email",
  sp."currentYear",
  sp."currentSemester",
  d.name as department,
  u.name as university
FROM "Student" s
JOIN "StudentProfile" sp ON s.id = sp."studentId"
JOIN "Curriculum" c ON sp."curriculumId" = c.id
JOIN "Department" d ON c."departmentId" = d.id
JOIN "University" u ON d."universityId" = u.id
WHERE s.email = 'test@example.com';
```
**Expected:**
- Row exists with all data
- `currentYear`: 3
- `currentSemester`: 1
- `department`: Software Engineering
- `university`: Addis Ababa Science and Technology University

### Step 8: Dashboard
**You should see:**
- Dashboard page loads
- User is logged in
- Can access all features

**Test Navigation:**
- ✅ Try going back to `/onboarding` → Should work (can change selections)
- ✅ Try going to `/login` → Should redirect to dashboard (already logged in)
- ✅ Refresh page → Should stay logged in

## 📝 Test Scenario 2: Invalid Verification Token

### Actions:
1. Visit: `http://localhost:5173/verify-email?token=invalid-token-123`

**Expected Behavior:**
```
Loading State (brief):
- "Verifying Your Email"

↓

Error State:
- Red X icon
- "Verification Failed"
- Error message: "Verification failed. The link may be expired or invalid."
- "Go to Login" button
- "Register Again" button
- "Contact Support" link
```

**Verify:**
- ✅ User is NOT logged in
- ✅ Cannot access protected routes
- ✅ Buttons work correctly

## 📝 Test Scenario 3: Already Onboarded User

### Setup:
Complete Scenario 1 first (user is now onboarded)

### Actions:
1. Logout
2. Register a NEW user: `test2@example.com`
3. Verify email → Complete onboarding
4. Logout
5. Use the FIRST user's verification link again

**Expected Behavior:**
```
Loading State:
- "Verifying Your Email"

↓

Success State:
- "Email Verified! 🎉"
- "Redirecting..."

↓

Auto-redirect to /dashboard (NOT /onboarding!)
```

**Why?**
- Backend checks `hasProfile`
- User already has StudentProfile
- Returns `hasProfile: true`
- Frontend redirects to dashboard

## 📝 Test Scenario 4: Back Navigation in Onboarding

### Actions:
1. Start onboarding
2. Complete Steps 1, 2, 3, 4
3. Click **Back** button on each step
4. Verify data is preserved

**Expected:**
- ✅ Step 4 → Back → Step 3 (Year & Semester still selected)
- ✅ Step 3 → Back → Step 2 (Department still selected)
- ✅ Step 2 → Back → Step 1 (University still selected)
- ✅ Can change selections
- ✅ Can go forward again

## 📝 Test Scenario 5: Error Handling

### Test 5A: Network Error During Onboarding
1. Start onboarding
2. Open DevTools → Network tab
3. Set "Offline" mode
4. Try to continue to next step

**Expected:**
- ✅ Error message shows
- ✅ User can retry when back online

### Test 5B: Invalid Course Selection
1. Complete onboarding Steps 1-3
2. Deselect ALL courses
3. Try to click "Complete Setup"

**Expected:**
- ✅ Button is disabled
- ✅ Cannot proceed without selecting at least 1 course

### Test 5C: Backend Validation
1. Use browser console to modify form data
2. Try to submit invalid data

**Expected:**
- ✅ Backend validates and rejects
- ✅ Frontend shows error message

## 🔍 Debugging Checklist

### If Registration Fails:
- [ ] Check backend is running on port 4000
- [ ] Check email service configured in `.env`
- [ ] Check database connection
- [ ] Look at backend console for errors

### If Email Verification Fails:
- [ ] Check verification link format
- [ ] Check token hasn't expired (24 hours)
- [ ] Check backend console for errors
- [ ] Verify database has the student record

### If Onboarding Fails:
- [ ] Check authentication (user logged in?)
- [ ] Check database has seed data
- [ ] Check network tab in DevTools
- [ ] Check backend API responses

### If Courses Don't Load:
- [ ] Run `node test-db-connection.js`
- [ ] Check database has courses for selected year/semester
- [ ] Check API response in Network tab
- [ ] Verify backend logs

## ✅ Success Criteria

All tests pass if:

1. **Registration:**
   - [x] User can register successfully
   - [x] Verification email is sent
   - [x] Success message shows

2. **Email Verification:**
   - [x] Link opens verification page
   - [x] Loading state shows
   - [x] Verification succeeds
   - [x] Success message shows
   - [x] User is logged in automatically
   - [x] Redirects to correct page (onboarding vs dashboard)

3. **Onboarding:**
   - [x] All 4 steps work
   - [x] Data loads from backend
   - [x] Selections persist
   - [x] Validation works
   - [x] Courses load based on selections
   - [x] Can complete successfully
   - [x] Profile is created in database

4. **Error Handling:**
   - [x] Invalid tokens show error
   - [x] Network errors are handled
   - [x] Validation prevents invalid data
   - [x] User-friendly error messages

5. **Security:**
   - [x] Tokens are secured
   - [x] Protected routes work
   - [x] Session persists correctly
   - [x] Logout works

6. **UX:**
   - [x] Loading states show
   - [x] Success states show
   - [x] Error states show
   - [x] Smooth transitions
   - [x] Clear messaging

## 🎉 You're Done!

If all tests pass, your implementation is **perfect** and **production-ready**!

---

**Testing Date**: _____________  
**Tester**: _____________  
**All Tests Passed**: ☐ YES ☐ NO  
**Notes**: _________________________________

