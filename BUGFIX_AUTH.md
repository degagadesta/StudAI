# 🐛 Bug Fix: Authentication Error

## Issue

When clicking "Complete Setup" on the onboarding page, got the following error:

```
TypeError: Cannot read properties of undefined (reading 'id')
at onboarding (file:///C:/Users/hp/StudAI/backend/src/modules/onboarding/onboarding.controller.js:41:22)
```

## Root Cause

The authentication middleware (`authenticate.js`) sets `req.studentId`, but the controllers were trying to access `req.user.id`.

**Middleware Code:**
```javascript
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }
  try {
    const payload = verifyToken(header.split(" ")[1]);
    req.studentId = payload.studentId;  // ✅ Sets req.studentId
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
```

**Controller Code (WRONG):**
```javascript
const result = await onboardingService.completeOnboarding(
    req.user.id,  // ❌ req.user doesn't exist!
    // ...
);
```

## Fix Applied

### 1. Fixed `onboarding.controller.js`

**Before:**
```javascript
const result = await onboardingService.completeOnboarding(
    req.user.id,
    universityId,
    departmentId,
    currentYear,
    currentSemester,
    selectedCourseIds
);
```

**After:**
```javascript
const result = await onboardingService.completeOnboarding(
    req.studentId,  // ✅ Fixed
    universityId,
    departmentId,
    currentYear,
    currentSemester,
    selectedCourseIds
);
```

### 2. Fixed `course.controller.js`

**Before:**
```javascript
const courses = await courseService.getStudentCourses(req.user.id);
```

**After:**
```javascript
const courses = await courseService.getStudentCourses(req.studentId);  // ✅ Fixed
```

## Files Modified

1. ✅ `backend/src/modules/onboarding/onboarding.controller.js`
2. ✅ `backend/src/modules/course/course.controller.js`

## Verification

Checked all controllers that use authentication:
- ✅ `auth.controller.js` - Already uses `req.studentId` correctly
- ✅ `course.controller.js` - Fixed
- ✅ `onboarding.controller.js` - Fixed

## Testing

No need to restart the backend if you're using `nodemon`. The changes should be automatically reloaded.

If the backend didn't auto-reload:
```bash
# Stop the backend (Ctrl+C)
# Start it again
cd backend
npm run dev
```

Then test the onboarding flow again:
1. Select University
2. Select Department
3. Select Year & Semester
4. Select Courses
5. Click "Complete Setup" ✅

## Status

✅ **FIXED** - The error should no longer occur when submitting the onboarding form.

---

**Bug Fixed**: August 5, 2026  
**Severity**: High (blocked onboarding completion)  
**Resolution Time**: Immediate
