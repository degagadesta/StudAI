# Quick Testing Guide 🚀

## Method 1: Using Postman (Recommended)

### Step 1: Import Collection
1. Open Postman
2. Click "Import" button
3. Select `StudAI-Postman-Collection.json` file
4. Collection will appear in left sidebar

### Step 2: Set Up Environment
1. Click "Environments" (left sidebar)
2. Create new environment: "StudAI Local"
3. Add variable:
   - `baseUrl` = `http://localhost:4000/api`
4. Save and select this environment

### Step 3: Start Server
```bash
cd backend
node server.js
```

### Step 4: Run Tests in Order
1. **Auth → Register** (skip if you have account)
2. **Auth → Login** ✅ (saves accessToken automatically)
3. **Universities → Get All Universities** ✅ (saves universityId)
4. **Departments → Get Departments by University** ✅ (saves departmentId)
5. **Onboarding → Complete Onboarding** ✅
6. **Courses → Get My Courses** ✅

---

## Method 2: Using Node Test Script

### Step 1: Start Server
```bash
cd backend
node server.js
```

### Step 2: Update Test Credentials
Open `test-api.js` and update line 71:
```javascript
email: 'your-test-email@test.com',  // Your test email
password: 'YourPassword123'          // Your password
```

### Step 3: Run Tests
```bash
node test-api.js
```

---

## Method 3: Using Browser/Fetch

### Step 1: Start Server
```bash
node server.js
```

### Step 2: Open Browser Console
Press F12 → Go to Console tab

### Step 3: Run This Code
```javascript
const BASE_URL = 'http://localhost:4000/api';

// 1. Login
const login = await fetch(`${BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'your-email@test.com',
    password: 'YourPassword123'
  })
}).then(r => r.json());

console.log('Login:', login);
const token = login.accessToken;

// 2. Get Universities
const universities = await fetch(`${BASE_URL}/universities`)
  .then(r => r.json());
console.log('Universities:', universities);
const universityId = universities.data[0].id;

// 3. Get Departments
const departments = await fetch(`${BASE_URL}/departments/university/${universityId}`)
  .then(r => r.json());
console.log('Departments:', departments);
const departmentId = departments.data[0].id;

// 4. Complete Onboarding
const onboarding = await fetch(`${BASE_URL}/student/onboarding`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    universityId,
    departmentId,
    currentYear: 3,
    currentSemester: 1
  })
}).then(r => r.json());

console.log('Onboarding:', onboarding);

// 5. Get Courses
const courses = await fetch(`${BASE_URL}/student/courses`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log('Courses:', courses);
```

---

## Method 4: Using cURL (Linux/Mac)

```bash
# 1. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123"}' \
  -c cookies.txt

# Save the accessToken from response, then:

# 2. Get Universities
curl http://localhost:4000/api/universities

# 3. Get Departments (replace UNIVERSITY_ID)
curl http://localhost:4000/api/departments/university/UNIVERSITY_ID

# 4. Complete Onboarding (replace IDs and TOKEN)
curl -X POST http://localhost:4000/api/student/onboarding \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "universityId": "UNIVERSITY_ID",
    "departmentId": "DEPARTMENT_ID",
    "currentYear": 3,
    "currentSemester": 1
  }'

# 5. Get Courses
curl http://localhost:4000/api/student/courses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## ✅ Quick Checklist

Before testing, ensure:
- [ ] Server is running on port 4000
- [ ] Database is connected (check .env)
- [ ] You have test data (universities, departments, curricula)
- [ ] You have a verified user account (or can register)

---

## 🐛 Troubleshooting

### "Cannot connect to server"
```bash
# Make sure server is running:
cd backend
node server.js
# Should see: "Server running on port 4000"
```

### "Email not verified"
```sql
-- Manually verify in database:
UPDATE "Student" SET "emailVerified" = true 
WHERE email = 'your-email@test.com';
```

### "No universities found"
You need to seed the database with test data. Create universities, departments, curricula, and courses first.

### "Invalid token"
Tokens expire after 15 minutes. Login again to get a new token.

---

## 📊 Expected Results

### After Login:
```json
{
  "accessToken": "eyJhbGc...",
  "student": {
    "id": "uuid",
    "firstName": "John",
    "email": "john@test.com"
  }
}
```

### After Onboarding:
```json
{
  "success": true,
  "message": "Academic onboarding completed successfully.",
  "data": {
    "profile": { ... },
    "courses": [ ... ]
  }
}
```

### Get Courses:
```json
{
  "success": true,
  "data": [
    {
      "courseCode": "CS301",
      "course": {
        "title": "Data Structures",
        "description": "..."
      }
    }
  ]
}
```

---

## 🎯 Next Steps

Once all tests pass:
1. ✅ Backend is working correctly
2. ✅ Share API endpoints with frontend team
3. ✅ Provide Postman collection to frontend
4. ✅ Document any custom behavior
5. ✅ Begin frontend integration

**Happy Testing!** 🎉
