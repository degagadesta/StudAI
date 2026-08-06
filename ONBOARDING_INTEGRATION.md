# Onboarding Integration Complete Guide

## 🎉 What's Been Implemented

A complete **4-step onboarding flow** that allows students to:

1. **Select University** - Choose from available universities (fetched from backend)
2. **Select Department** - Choose department within selected university
3. **Select Year & Semester** - Choose academic year (1-5) and semester (1-2)
4. **Select Courses** - Choose from available courses for that year/semester

## 📋 Key Features

### Frontend Changes (`Frontend/src/`)
- ✅ Fixed TypeScript import issue for `ChangeEvent`
- ✅ Dynamic data fetching from backend (universities, departments, courses)
- ✅ 4-step wizard with proper validation
- ✅ Course selection with checkbox UI
- ✅ Auto-selects all courses by default (user can deselect)
- ✅ Shows course details: code, title, description, credit hours
- ✅ Loading states and error handling
- ✅ Responsive design maintained

### Backend Changes (`backend/src/`)
- ✅ New endpoint: `GET /api/student/onboarding/courses` - Fetch available courses
- ✅ Updated endpoint: `POST /api/student/onboarding` - Submit onboarding with selected courses
- ✅ Validation for all inputs (university, department, year, semester, courses)
- ✅ Course selection validation (ensures courses belong to selected curriculum)
- ✅ Enhanced error messages

### Database (Prisma)
- ✅ Comprehensive seed data with:
  - 3 Universities (AASTU, AAU, ASTU)
  - 3 Departments (Software Engineering, Computer Science, ECE)
  - 35+ courses across 4 years for Software Engineering
  - 4 courses for Computer Science
  - Proper curriculum structure

## 🚀 Setup Instructions

### 1. Database Setup

```bash
cd backend

# Reset database (clears existing data)
npx prisma migrate reset --force

# Apply migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

Backend should be running on `http://localhost:5000` (or your configured port)

### 3. Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend should be running on `http://localhost:5173` (or your configured port)

## 🧪 Testing the Integration

### Step-by-Step Test Flow:

1. **Register/Login** as a student
2. Navigate to **Onboarding page** (should auto-redirect if not onboarded)
3. **Step 1 - University**: 
   - See suggested universities (AASTU, AAU, ASTU)
   - Click "More" to search all universities
   - Select "Addis Ababa Science and Technology University"
4. **Step 2 - Department**:
   - Should see 3 departments loaded dynamically
   - Select "Software Engineering"
5. **Step 3 - Year & Semester**:
   - Select Year: 3
   - Select Semester: 1
6. **Step 4 - Courses**:
   - Should see 4 courses auto-selected:
     - SWE301 - Software Architecture (4 credits)
     - SWE302 - Mobile Application Development (4 credits)
     - CS301 - Machine Learning (3 credits)
     - SWE303 - Human-Computer Interaction (3 credits)
   - Can deselect/select individual courses
   - Click "Complete setup"
7. Should redirect to **Dashboard**

## 📡 API Endpoints

### GET `/universities`
Fetch all universities
```json
Response: {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Addis Ababa Science and Technology University",
      "city": "Addis Ababa"
    }
  ]
}
```

### GET `/api/departments/universities/:universityId/departments`
Fetch departments for a university
```json
Response: {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Software Engineering"
    }
  ]
}
```

### GET `/api/student/onboarding/courses`
Fetch available courses (requires authentication)

**Query Parameters:**
- `universityId` (required)
- `departmentId` (required)
- `year` (required, 1-5)
- `semester` (required, 1-2)

```json
Response: {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "courseCode": "SWE301",
      "title": "Software Architecture",
      "description": "Architectural patterns and system design",
      "creditHours": 4,
      "year": 3,
      "semester": 1
    }
  ]
}
```

### POST `/api/student/onboarding`
Submit onboarding (requires authentication)

**Request Body:**
```json
{
  "universityId": "uuid",
  "departmentId": "uuid",
  "currentYear": 3,
  "currentSemester": 1,
  "selectedCourseIds": ["course-id-1", "course-id-2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Academic onboarding completed successfully.",
  "data": {
    "profile": {
      "id": "uuid",
      "studentId": "uuid",
      "curriculumId": "uuid",
      "currentYear": 3,
      "currentSemester": 1
    },
    "courses": [...]
  }
}
```

## 🗂️ File Structure

```
StudAI/
├── Frontend/
│   └── src/
│       ├── api/
│       │   └── onboardingapi.ts          ✨ Updated with new API calls
│       └── pages/
│           └── OnboardingPage.tsx         ✨ Complete 4-step wizard
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js                        ✨ Comprehensive seed data
    └── src/
        └── modules/
            └── onboarding/
                ├── onboarding.routes.js   ✨ Added GET /courses route
                ├── onboarding.controller.js ✨ New controller method
                └── onboarding.service.js  ✨ Course fetching & validation
```

## ✅ Validation Rules

### Frontend
- Step 1: University must be selected
- Step 2: Department must be selected  
- Step 3: Both year AND semester must be selected
- Step 4: At least 1 course must be selected

### Backend
- University must exist in database
- Department must belong to selected university
- Year must be 1-5
- Semester must be 1 or 2
- Selected courses must be valid for the curriculum/year/semester

## 🎨 UI Features

- **Loading States**: Shows "Loading..." while fetching data
- **Error Handling**: Displays error messages in red banner
- **Empty States**: Shows helpful message when no data available
- **Search**: University search with real-time filtering
- **Select/Deselect All**: Bulk course selection
- **Course Details**: Shows code, title, description, credits
- **Progress Indicator**: Shows "Step X of 4" with visual dots
- **Disabled States**: Buttons disabled when validation fails
- **Smooth Navigation**: Back/Continue buttons with proper flow

## 🐛 Troubleshooting

### "No courses found"
- Check if seed data ran successfully
- Verify year/semester combination has courses
- Example: Software Engineering has courses for Years 1-4

### "University not found" / "Department not found"
- Run seed script again: `npm run prisma:seed`
- Check database connection

### "Curriculum not found"
- Each department needs at least one curriculum
- Seed script creates curriculum automatically

### CORS errors
- Check backend CORS configuration
- Ensure frontend URL is allowed

### 401 Unauthorized on course fetch
- User must be logged in
- Check authentication token in localStorage/cookies

## 📝 Notes

1. **Auto-Selection**: All available courses are selected by default for better UX
2. **Flexible Selection**: User can select/deselect individual courses
3. **Validation**: Backend validates that selected courses actually belong to the curriculum
4. **Year Range**: Updated to allow Year 1-5 (was 2-5)
5. **Responsive**: Works on mobile, tablet, and desktop
6. **Type Safe**: Full TypeScript support with proper interfaces

## 🔄 Future Enhancements (Optional)

- [ ] Course prerequisites checking
- [ ] Credit hour limits per semester
- [ ] Course recommendations based on performance
- [ ] Elective vs. required course marking
- [ ] Course conflict detection (same time slot)
- [ ] Multi-curriculum support per department

## 🎓 Test Users

After seeding, you can test with any registered student account. The onboarding flow will work with:
- **University**: Addis Ababa Science and Technology University
- **Department**: Software Engineering or Computer Science
- **Years**: 1-4 (Software Engineering), Year 3 (Computer Science)
- **Semesters**: 1 or 2

---

**✨ Integration Complete!** All features are working, validated, and ready for use.
