# Complete Testing Guide 🧪

## Prerequisites

1. **Start the server:**
```bash
cd backend
node server.js
```

You should see: `Server running on port 4000`

2. **Install a REST client:**
   - **Postman** (recommended): https://www.postman.com/downloads/
   - **Thunder Client** (VS Code extension)
   - **cURL** (command line)
   - **Insomnia** (alternative to Postman)

---

## Quick Test Flow (Complete User Journey)

### Step 1: Register → Step 2: Login → Step 3: Get Universities → Step 4: Onboarding → Step 5: Get Courses

---

## 📝 DETAILED TESTING STEPS

## 1️⃣ AUTH MODULE - Registration & Login

### Test 1.1: Register a New Student

**Request:**
```http
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@test.com",
  "password": "Password123"
}
```

**Expected Response (201):**
```json
{
  "message": "Registered. Check your email to verify your account.",
  "student": {
    "id": "uuid-here",
    "email": "john.doe@test.com"
  }
}
```

**What to test:**
- ✅ Valid registration works
- ❌ Weak password: `"password": "weak"` → Should fail with validation error
- ❌ Invalid email: `"email": "notanemail"` → Should fail
- ❌ Duplicate email: Register same email twice → Should return 409
- ❌ Missing fields → Should return 400

---

### Test 1.2: Verify Email (Skip for Testing)

**For testing purposes, manually verify in database:**
```sql
-- Connect to your database and run:
UPDATE "Student" SET "emailVerified" = true WHERE email = 'john.doe@test.com';
```

**OR extract token from email and use:**
```http
GET http://localhost:4000/api/auth/verify-email?token=TOKEN_FROM_EMAIL
```

---

### Test 1.3: Login

**Request:**
```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@test.com",
  "password": "Password123"
}
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": "uuid-here",
    "firstName": "John",
    "email": "john.doe@test.com"
  }
}
```

**⚠️ IMPORTANT:** Save the `accessToken` - you'll need it for authenticated requests!

**Check cookies:**
- The `refreshToken` should be in an httpOnly cookie
- In Postman: Check the "Cookies" section after the request

**What to test:**
- ✅ Correct credentials work
- ❌ Wrong password → Should return 401
- ❌ Non-existent email → Should return 401
- ❌ Unverified email → Should return 403

---

### Test 1.4: Refresh Token

**Request:**
```http
POST http://localhost:4000/api/auth/refresh
```

**Note:** No body needed - refresh token is sent via cookie automatically

**Expected Response (200):**
```json
{
  "accessToken": "new-access-token-here"
}
```

---

### Test 1.5: Logout

**Request:**
```http
POST http://localhost:4000/api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2️⃣ UNIVERSITY MODULE - Get Universities

### Test 2.1: Get All Universities

**Request:**
```http
GET http://localhost:4000/api/universities
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Addis Ababa University",
      "city": "Addis Ababa"
    },
    {
      "id": "uuid-2",
      "name": "Bahir Dar University",
      "city": "Bahir Dar"
    }
  ]
}
```

**⚠️ IMPORTANT:** Save a university `id` - you'll need it for the next step!

**What to test:**
- ✅ Returns list of universities
- ✅ Works without authentication

---

### Test 2.2: Get Single University

**Request:**
```http
GET http://localhost:4000/api/universities/UNIVERSITY_ID_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Addis Ababa University",
    "city": "Addis Ababa"
  }
}
```

**What to test:**
- ✅ Valid ID returns university
- ❌ Invalid ID → Should return 404

---

## 3️⃣ DEPARTMENT MODULE - Get Departments

### Test 3.1: Get Departments by University

**Request:**
```http
GET http://localhost:4000/api/departments/university/UNIVERSITY_ID_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept-uuid-1",
      "name": "Computer Science"
    },
    {
      "id": "dept-uuid-2",
      "name": "Electrical Engineering"
    }
  ]
}
```

**⚠️ IMPORTANT:** Save a department `id` - you'll need it for onboarding!

**What to test:**
- ✅ Valid university ID returns departments
- ❌ Invalid university ID → Should return 404 "University not found"
- ❌ Missing university ID → Should return 400

---

### Test 3.2: Get Single Department

**Request:**
```http
GET http://localhost:4000/api/departments/DEPARTMENT_ID_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "dept-uuid",
    "name": "Computer Science",
    "universityId": "university-uuid"
  }
}
```

**What to test:**
- ✅ Valid ID returns department
- ❌ Invalid ID → Should return 404

---

## 4️⃣ ONBOARDING MODULE - Complete Student Setup

### Test 4.1: Complete Onboarding

**Request:**
```http
POST http://localhost:4000/api/student/onboarding
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "universityId": "UNIVERSITY_ID_FROM_STEP_2",
  "departmentId": "DEPARTMENT_ID_FROM_STEP_3",
  "currentYear": 3,
  "currentSemester": 1
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Academic onboarding completed successfully.",
  "data": {
    "profile": {
      "id": "profile-uuid",
      "studentId": "student-uuid",
      "curriculumId": "curriculum-uuid",
      "currentYear": 3,
      "currentSemester": 1,
      "updatedAt": "2026-08-04T..."
    },
    "courses": [
      {
        "id": "curriculum-course-uuid",
        "courseCode": "CS301",
        "year": 3,
        "semester": 1,
        "course": {
          "id": "course-uuid",
          "title": "Data Structures",
          "description": "Study of data structures"
        }
      }
    ]
  }
}
```

**What to test:**
- ✅ Valid data creates profile and returns courses
- ❌ Missing Authorization header → Should return 401
- ❌ Invalid token → Should return 401
- ❌ Missing fields → Should return 400
- ❌ Invalid year (1 or 6) → Should return 400
- ❌ Invalid semester (3) → Should return 400
- ❌ Invalid university ID → Should return 404
- ❌ Invalid department ID → Should return 404
- ❌ Department doesn't belong to university → Should return 400

---

## 5️⃣ COURSE MODULE - Get Student Courses

### Test 5.1: Get My Courses (After Onboarding)

**Request:**
```http
GET http://localhost:4000/api/student/courses
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "curriculum-course-uuid",
      "courseCode": "CS301",
      "year": 3,
      "semester": 1,
      "course": {
        "id": "course-uuid",
        "title": "Data Structures",
        "description": "Study of data structures"
      }
    },
    {
      "id": "curriculum-course-uuid-2",
      "courseCode": "CS302",
      "year": 3,
      "semester": 1,
      "course": {
        "id": "course-uuid-2",
        "title": "Algorithms",
        "description": "Algorithm design and analysis"
      }
    }
  ]
}
```

**What to test:**
- ✅ Returns courses after onboarding
- ❌ Before onboarding → Should return 400 "Please complete academic onboarding first"
- ❌ Missing Authorization → Should return 401
- ❌ Invalid token → Should return 401

---

## 🧪 POSTMAN COLLECTION

Create a Postman collection with these requests in order:

### Folder Structure:
```
StudAI Backend Tests/
├── 1. Auth/
│   ├── Register
│   ├── Login (save accessToken to variable)
│   ├── Refresh Token
│   └── Logout
├── 2. Universities/
│   ├── Get All Universities (save universityId)
│   └── Get Single University
├── 3. Departments/
│   ├── Get Departments by University (save departmentId)
│   └── Get Single Department
├── 4. Onboarding/
│   └── Complete Onboarding
└── 5. Courses/
    └── Get My Courses
```

### Postman Environment Variables:
```json
{
  "baseUrl": "http://localhost:4000/api",
  "accessToken": "",
  "universityId": "",
  "departmentId": ""
}
```

---

## 🔧 TESTING WITH CURL (Command Line)

### 1. Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@test.com",
    "password": "Password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@test.com",
    "password": "Password123"
  }' \
  -c cookies.txt
```

### 3. Get Universities
```bash
curl http://localhost:4000/api/universities
```

### 4. Get Departments
```bash
curl http://localhost:4000/api/departments/university/UNIVERSITY_ID
```

### 5. Complete Onboarding
```bash
curl -X POST http://localhost:4000/api/student/onboarding \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "universityId": "UNIVERSITY_ID",
    "departmentId": "DEPARTMENT_ID",
    "currentYear": 3,
    "currentSemester": 1
  }'
```

### 6. Get My Courses
```bash
curl http://localhost:4000/api/student/courses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## ✅ SUCCESS CHECKLIST

Go through this checklist to ensure everything works:

### Authentication
- [ ] Can register with valid data
- [ ] Registration validates password strength
- [ ] Can login with correct credentials
- [ ] Login returns accessToken
- [ ] Login sets refreshToken cookie
- [ ] Can refresh access token
- [ ] Can logout

### Universities
- [ ] Can get all universities
- [ ] Can get single university
- [ ] Returns 404 for invalid university ID

### Departments
- [ ] Can get departments by university
- [ ] Returns 404 for invalid university
- [ ] Can get single department
- [ ] Returns 404 for invalid department ID

### Onboarding
- [ ] Can complete onboarding with valid data
- [ ] Requires authentication
- [ ] Validates all fields
- [ ] Returns 404 for invalid university/department
- [ ] Returns 400 for mismatched department/university
- [ ] Returns courses for current year/semester

### Courses
- [ ] Can get courses after onboarding
- [ ] Requires authentication
- [ ] Returns 400 before onboarding
- [ ] Returns 404 for non-existent student

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot POST /api/auth/register"
**Solution:** Server might not be running or wrong URL
```bash
# Check if server is running
node server.js
```

### Issue 2: "Invalid or expired token"
**Solution:** Token might be expired (15 min). Get a new one:
```http
POST /api/auth/login
```

### Issue 3: "University not found"
**Solution:** Get valid university IDs first:
```http
GET /api/universities
```

### Issue 4: "Student has not completed academic onboarding"
**Solution:** Complete onboarding first:
```http
POST /api/student/onboarding
```

### Issue 5: Database connection errors
**Solution:** Check .env file has correct DATABASE_URL

---

## 📊 EXPECTED ERROR RESPONSES

All errors follow this format:
```json
{
  "message": "Error description here",
  "statusCode": 400
}
```

### Common Status Codes:
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (email not verified)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email)
- `500` - Server Error (something went wrong)

---

## 🎯 NEXT STEPS

After testing the backend:
1. ✅ Verify all endpoints work correctly
2. ✅ Document any issues found
3. ✅ Share working endpoints with frontend team
4. ✅ Provide example requests/responses
5. ✅ Set up environment variables for frontend

**Backend is ready for frontend integration!** 🚀
