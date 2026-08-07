# Authentication Flow Diagrams

## Complete Authentication & Routing System

---

## 🔄 Email Registration & Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

User fills form at /register
         ↓
    Click "Create account"
         ↓
┌────────────────────────────────┐
│ Frontend: register()           │
│ - Validates input              │
│ - Sends to backend             │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│ Backend: auth.service.register │
│                                │
│ DEV MODE (SKIP_EMAIL=true):    │
│ 1. Create student account      │
│ 2. Log link to console ✅      │
│                                │
│ PROD MODE (SKIP_EMAIL=false):  │
│ 1. Send email FIRST            │
│ 2. Create account if success   │
│ 3. Rollback if email fails     │
└────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│ User receives:                 │
│ - Email in inbox (prod) OR     │
│ - Link in console (dev)        │
└────────────────────────────────┘
         ↓
    User clicks verification link
         ↓
    Opens /verify-email?token=xxx
         ↓
┌────────────────────────────────────────────────┐
│ CRITICAL: Race Condition Prevention            │
│                                                 │
│ T=0ms:   Page loads                            │
│ T=10ms:  useAuth starts background refresh ⏳  │
│ T=50ms:  VerifyEmail component calls API       │
│          Backend returns tokens + hasProfile   │
│          setUser() called → TIMESTAMP RECORDED │
│ T=100ms: Background refresh completes          │
│          Checks timestamp → Sees explicit auth │
│          DOES NOT OVERWRITE ✅                  │
└────────────────────────────────────────────────┘
         ↓
    Email verified + Auto-login
         ↓
    Check: hasProfile?
         ↓
    ┌────────────┴────────────┐
    ↓                         ↓
hasProfile = false      hasProfile = true
    ↓                         ↓
/onboarding              /dashboard
```

---

## 🎯 Google Sign-In Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE SIGN-IN FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User clicks "Sign in with Google"
         ↓
    Google OAuth popup
         ↓
    User authorizes
         ↓
    Google returns idToken
         ↓
┌────────────────────────────────┐
│ Frontend: googleSignIn()       │
│ - Sends idToken to backend     │
└────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│ Backend: auth.service.googleSignIn         │
│                                             │
│ 1. Verify idToken with Google              │
│ 2. Find user by googleId                   │
│ 3. If not found → Find by email            │
│ 4. If not found → Create new user          │
│ 5. Check if StudentProfile exists ✅        │
│ 6. Return: tokens + hasProfile ✅          │
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│ Frontend receives:             │
│ - accessToken                  │
│ - student info                 │
│ - hasProfile (NEW!) ✅         │
└────────────────────────────────┘
         ↓
    setUser() → Marks explicit auth
         ↓
┌────────────────────────────────────────────┐
│ routeAfterAuth() - Centralized Routing     │
│                                             │
│ Priority 1: requestedPath?                 │
│    YES → Go there                          │
│    NO  → Continue to priority 2            │
│                                             │
│ Priority 2: hasProfile check               │
│    false/undefined → /onboarding           │
│    true → /dashboard                       │
└────────────────────────────────────────────┘
         ↓
    ┌────────────┴────────────┐
    ↓                         ↓
First Time               Returning User
hasProfile=false         hasProfile=true
    ↓                         ↓
/onboarding              /dashboard
    ↓
Complete wizard
    ↓
/dashboard
```

---

## 🔐 Regular Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      REGULAR LOGIN FLOW                          │
└─────────────────────────────────────────────────────────────────┘

User enters email + password
         ↓
    Click "Sign in"
         ↓
┌────────────────────────────────┐
│ Frontend: login()              │
│ - Validates input              │
│ - Sends credentials            │
└────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│ Backend: auth.service.login                │
│                                             │
│ 1. Find student by email                   │
│ 2. Check password with bcrypt              │
│ 3. Check emailVerified = true              │
│ 4. Include StudentProfile in query ✅       │
│ 5. Generate tokens                         │
│ 6. Return: tokens + hasProfile ✅          │
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────┐
│ Frontend receives:             │
│ - accessToken                  │
│ - student info                 │
│ - hasProfile (NEW!) ✅         │
└────────────────────────────────┘
         ↓
    setUser() → Marks explicit auth
         ↓
    routeAfterAuth() → Smart routing
         ↓
    ┌────────────┴────────────┐
    ↓                         ↓
hasProfile=false         hasProfile=true
    ↓                         ↓
/onboarding              /dashboard
```

---

## 🎓 Complete Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    4-STEP ONBOARDING FLOW                        │
└─────────────────────────────────────────────────────────────────┘

New user lands on /onboarding
         ↓
┌────────────────────────────────┐
│ STEP 1: University Selection   │
│                                 │
│ - Search/filter universities   │
│ - Select from dropdown          │
│ - Fetched from backend          │
└────────────────────────────────┘
         ↓
    Click "Next"
         ↓
┌────────────────────────────────┐
│ STEP 2: Department Selection   │
│                                 │
│ - Dynamic based on university  │
│ - Fetched from backend          │
│ - Filtered by universityId     │
└────────────────────────────────┘
         ↓
    Click "Next"
         ↓
┌────────────────────────────────┐
│ STEP 3: Year & Semester        │
│                                 │
│ - Year: 1-5 (dropdown)         │
│ - Semester: 1-2 (dropdown)     │
└────────────────────────────────┘
         ↓
    Click "Next"
         ↓
┌────────────────────────────────┐
│ STEP 4: Course Selection ✅    │
│ (NEW FEATURE)                  │
│                                 │
│ - Multi-select checkboxes      │
│ - Dynamic based on year        │
│ - Fetched from backend          │
│ - Can select multiple courses  │
└────────────────────────────────┘
         ↓
    Click "Complete Setup"
         ↓
┌────────────────────────────────────────────┐
│ Backend: onboarding.service                │
│                                             │
│ 1. Create StudentProfile:                  │
│    - universityId                          │
│    - departmentId                          │
│    - year                                  │
│    - semester                              │
│                                             │
│ 2. Create StudentCourse records ✅:        │
│    - For each selected course              │
│    - Links student to courses              │
└────────────────────────────────────────────┘
         ↓
    Profile created successfully
         ↓
    Redirect to /dashboard
         ↓
┌────────────────────────────────┐
│ Dashboard shows:               │
│ - University name              │
│ - Department name              │
│ - Year & Semester              │
│ - Enrolled courses ✅          │
└────────────────────────────────┘
```

---

## ⚡ Session Priority System (Race Condition Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│              SESSION PRIORITY SYSTEM - HOW IT WORKS             │
└─────────────────────────────────────────────────────────────────┘

                    SCENARIO: Email Verification

T=0ms
┌────────────────────────────────┐
│ Page loads from email link     │
│ /verify-email?token=xxx        │
└────────────────────────────────┘
         ↓
T=10ms
┌────────────────────────────────────────────┐
│ useAuth Hook Initialization                │
│                                             │
│ - isLoading = true                         │
│ - lastExplicitAuthTime = 0                 │
│ - Starts background refresh ⏳             │
│   (slow network call)                      │
└────────────────────────────────────────────┘
         ↓
T=50ms
┌────────────────────────────────────────────┐
│ VerifyEmail Component                      │
│                                             │
│ 1. Calls /auth/verify-email API            │
│ 2. Gets response: tokens + user + profile  │
│ 3. Calls setUser(user)                     │
│    → lastExplicitAuthTime = 50 ✅          │
│    → isAuthenticated = true                │
│    → isLoading = false                     │
└────────────────────────────────────────────┘
         ↓
T=100ms
┌────────────────────────────────────────────┐
│ Background Refresh Completes               │
│                                             │
│ 1. POST /auth/refresh succeeds             │
│ 2. Gets new access token                   │
│ 3. BEFORE updating state:                  │
│    Check: Is this stale?                   │
│    → Current time: 100                     │
│    → lastExplicitAuthTime: 50              │
│    → 100 - 50 = 50ms ago                   │
│    → Within 1000ms threshold               │
│    → RECENT EXPLICIT AUTH EXISTS           │
│    → SKIP UPDATE ✅                         │
└────────────────────────────────────────────┘
         ↓
T=150ms
┌────────────────────────────────┐
│ ProtectedRoute checks auth     │
│ - isAuthenticated: true ✅     │
│ - Allows access                │
│ - No redirect to login         │
└────────────────────────────────┘
         ↓
T=2000ms
┌────────────────────────────────┐
│ routeAfterAuth() executes      │
│ - Checks hasProfile            │
│ - Routes to correct destination│
└────────────────────────────────┘


                    WITHOUT FIX (BUG):
┌────────────────────────────────────────────┐
│ T=100ms: Background refresh completes      │
│ → NO timestamp check                       │
│ → Blindly overwrites state:                │
│   isAuthenticated = true (from refresh)    │
│   user = null (refresh doesn't set user)   │
│ → ProtectedRoute sees no user              │
│ → Redirects to /login ❌                   │
└────────────────────────────────────────────┘
```

---

## 🎯 Centralized Routing Logic

```
┌─────────────────────────────────────────────────────────────────┐
│         routeAfterAuth() - Single Source of Truth               │
└─────────────────────────────────────────────────────────────────┘

                      Entry Point:
    ┌─────────────────────────────────────┐
    │ User authenticated via:             │
    │ - Email verification                │
    │ - Regular login                     │
    │ - Google sign-in                    │
    └─────────────────────────────────────┘
                    ↓
         routeAfterAuth(navigate, hasProfile, requestedPath)
                    ↓
    ┌───────────────────────────────────────────┐
    │ Priority 1: Requested Path Check          │
    │                                            │
    │ if (requestedPath) {                      │
    │   navigate(requestedPath, {replace:true}) │
    │   return; // User was trying to access    │
    │            // specific page before auth   │
    │ }                                          │
    └───────────────────────────────────────────┘
                    ↓
    ┌───────────────────────────────────────────┐
    │ Priority 2: Onboarding Check              │
    │                                            │
    │ if (hasProfile === false ||               │
    │     hasProfile === undefined) {           │
    │   // SAFE FALLBACK:                       │
    │   // If backend fails to check or         │
    │   // returns undefined, default to        │
    │   // onboarding rather than risk          │
    │   // broken dashboard                     │
    │   navigate("/onboarding", {replace:true}) │
    │   return;                                  │
    │ }                                          │
    └───────────────────────────────────────────┘
                    ↓
    ┌───────────────────────────────────────────┐
    │ Priority 3: Dashboard                     │
    │                                            │
    │ // User has completed onboarding          │
    │ navigate("/dashboard", {replace:true})    │
    └───────────────────────────────────────────┘


                CONSISTENCY ACHIEVED:
┌────────────────────────────────────────────────────┐
│ BEFORE (Inconsistent):                             │
│ - VerifyEmail.tsx: custom routing logic            │
│ - LoginPage.tsx: different routing logic           │
│ - Register.tsx: yet another routing logic          │
│ Result: 3 different implementations ❌              │
└────────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────┐
│ AFTER (Consistent):                                │
│ - All auth pages use routeAfterAuth()              │
│ - Single source of truth                           │
│ - Same behavior everywhere                         │
│ Result: 1 centralized implementation ✅             │
└────────────────────────────────────────────────────┘
```

---

## 🔄 Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPLETE AUTH SYSTEM FLOW                      │
└─────────────────────────────────────────────────────────────────┘

    User Entry Points:
    ┌──────────────┬──────────────┬──────────────┐
    │   Register   │    Login     │ Google OAuth │
    └──────────────┴──────────────┴──────────────┘
            ↓              ↓              ↓
    ┌──────────────┬──────────────┬──────────────┐
    │ Email Verify │ Credentials  │  idToken     │
    │   + Token    │   + Check    │   + Verify   │
    └──────────────┴──────────────┴──────────────┘
            ↓              ↓              ↓
    ┌─────────────────────────────────────────────┐
    │      Backend Auth Service                   │
    │                                              │
    │  1. Authenticate user                       │
    │  2. Include StudentProfile in query ✅       │
    │  3. Generate tokens                         │
    │  4. Return: tokens + hasProfile ✅          │
    └─────────────────────────────────────────────┘
            ↓              ↓              ↓
    ┌─────────────────────────────────────────────┐
    │      Frontend Auth Handler                  │
    │                                              │
    │  1. Receive auth response                   │
    │  2. setUser() → Mark explicit auth ✅        │
    │  3. Store tokens                            │
    │  4. Call routeAfterAuth() ✅                │
    └─────────────────────────────────────────────┘
                         ↓
    ┌─────────────────────────────────────────────┐
    │      Centralized Routing                    │
    │                                              │
    │  Check hasProfile:                          │
    │  - false/undefined → /onboarding            │
    │  - true → /dashboard                        │
    └─────────────────────────────────────────────┘
                         ↓
            ┌────────────┴────────────┐
            ↓                         ↓
    New User Flow            Returning User Flow
    hasProfile=false         hasProfile=true
            ↓                         ↓
    /onboarding                  /dashboard
            ↓                         ↓
    4-Step Wizard            Full Features
            ↓
    Complete Setup
            ↓
    /dashboard
```

---

**All flows converge to consistent, reliable authentication with smart routing!** ✅
