# 🎓 StudAI Onboarding System

## Overview

A complete 4-step onboarding wizard that allows students to set up their academic profile by selecting:
1. **University** from a searchable database
2. **Department** within their university
3. **Academic Year** (1-5) and **Semester** (1-2)
4. **Courses** for that specific year/semester

## ✨ Features

### Student Experience
- 🏫 Select from real universities in the database
- 🔍 Search functionality for finding universities
- 📚 Department selection based on university
- 📅 Year and semester picker
- ✅ Course selection with checkboxes
- 🎯 Auto-selects all available courses (customizable)
- 💾 Saves profile and courses to database
- 🚀 Redirects to dashboard when complete

### Technical Features
- ✅ Full TypeScript support
- ✅ Real-time data fetching from backend
- ✅ Comprehensive validation (frontend + backend)
- ✅ Error handling with user-friendly messages
- ✅ Loading states during API calls
- ✅ Empty state handling
- ✅ Responsive design
- ✅ JWT authentication
- ✅ RESTful API design

## 🚀 Quick Start

```bash
# 1. Setup database
cd backend
npx prisma migrate reset --force
npm run prisma:seed

# 2. Start backend
npm run dev

# 3. Start frontend (new terminal)
cd ../Frontend
npm run dev

# 4. Test
Open http://localhost:5173
Login/Register → Go to onboarding
Follow the 4 steps
```

## 📋 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | 30-second setup guide |
| [ONBOARDING_INTEGRATION.md](./ONBOARDING_INTEGRATION.md) | Complete API documentation |
| [TEST_ONBOARDING.md](./TEST_ONBOARDING.md) | Testing checklist |
| [ONBOARDING_FLOW.md](./ONBOARDING_FLOW.md) | Visual flow diagrams |
| [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) | Technical summary |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

## 🗂️ Project Structure

```
StudAI/
├── Frontend/
│   └── src/
│       ├── api/
│       │   └── onboardingapi.ts          # API calls & types
│       └── pages/
│           └── OnboardingPage.tsx         # 4-step wizard UI
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma                  # Database schema
    │   └── seed.js                        # Sample data
    └── src/
        └── modules/
            └── onboarding/
                ├── onboarding.routes.js   # API routes
                ├── onboarding.controller.js # Request handling
                └── onboarding.service.js  # Business logic
```

## 🔌 API Endpoints

### Get Universities
```
GET /universities
Response: {
  success: true,
  data: [
    { id: "uuid", name: "AASTU", city: "Addis Ababa" }
  ]
}
```

### Get Departments
```
GET /api/departments/universities/:universityId/departments
Response: {
  success: true,
  data: [
    { id: "uuid", name: "Software Engineering" }
  ]
}
```

### Get Available Courses
```
GET /api/student/onboarding/courses?universityId=x&departmentId=y&year=3&semester=1
Authorization: Bearer <token>
Response: {
  success: true,
  data: [
    {
      id: "uuid",
      courseCode: "SWE301",
      title: "Software Architecture",
      description: "...",
      creditHours: 4,
      year: 3,
      semester: 1
    }
  ]
}
```

### Submit Onboarding
```
POST /api/student/onboarding
Authorization: Bearer <token>
Body: {
  universityId: "uuid",
  departmentId: "uuid",
  currentYear: 3,
  currentSemester: 1,
  selectedCourseIds: ["uuid1", "uuid2"]
}
Response: {
  success: true,
  message: "Academic onboarding completed successfully.",
  data: {
    profile: {...},
    courses: [...]
  }
}
```

## 🧪 Testing

### Test Scenario 1: Software Engineering Year 3
```
University: Addis Ababa Science and Technology University
Department: Software Engineering
Year: 3, Semester: 1

Expected Courses:
✅ SWE301 - Software Architecture (4 credits)
✅ SWE302 - Mobile Application Development (4 credits)
✅ CS301 - Machine Learning (3 credits)
✅ SWE303 - Human-Computer Interaction (3 credits)
```

### Test Scenario 2: First Year Students
```
University: AASTU
Department: Software Engineering
Year: 1, Semester: 1

Expected Courses:
✅ SWE101 - Introduction to Programming (4 credits)
✅ MAT101 - Discrete Mathematics (3 credits)
✅ CS101 - Introduction to Computer Science (3 credits)
✅ ENG101 - Communicative English I (3 credits)
```

### Test Scenario 3: Computer Science
```
University: AASTU
Department: Computer Science
Year: 3, Semester: 1

Expected Courses:
✅ CS301 - Advanced Algorithms (4 credits)
✅ CS302 - Compiler Design (4 credits)
✅ CS303 - Theory of Computation (3 credits)
✅ CS304 - Computer Graphics (3 credits)
```

## 🗄️ Database Schema

### Key Models

**University**
- id, name, city

**Department**
- id, name, universityId (FK)

**Curriculum**
- id, label, departmentId (FK)

**Course**
- id, title, description

**CurriculumCourse** (Junction)
- id, curriculumId (FK), courseId (FK)
- courseCode, creditHours, year, semester

**StudentProfile**
- id, studentId (FK), curriculumId (FK)
- currentYear, currentSemester

## 📊 Sample Data

After running `npm run prisma:seed`:

- **3** Universities (AASTU, AAU, ASTU)
- **3** Departments (Software Eng, Computer Sci, ECE)
- **2** Curricula (SWE 2024, CS 2024)
- **35** Courses total
  - 31 for Software Engineering (Years 1-4)
  - 4 for Computer Science (Year 3)

## 🔧 Configuration

### Backend Environment Variables
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
PORT=5000
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Issue: "No courses found"
**Solution**: Run `npm run prisma:seed` in backend directory

### Issue: CORS errors
**Solution**: Check backend CORS configuration allows frontend URL

### Issue: 401 Unauthorized
**Solution**: Ensure user is logged in and JWT token is valid

### Issue: TypeScript errors
**Solution**: Run `npm install` in Frontend directory

### Issue: Database connection failed
**Solution**: Check `DATABASE_URL` in `.env` file

## 🔒 Security

- ✅ JWT authentication required for onboarding submission
- ✅ Backend validates all inputs
- ✅ SQL injection protection via Prisma
- ✅ XSS protection via React
- ✅ CORS configuration
- ✅ Input sanitization

## ⚡ Performance

- ✅ Efficient database queries with indexes
- ✅ Lazy loading of data
- ✅ Optimized React re-renders
- ✅ Query result caching in Prisma

## 📱 Responsive Design

Works on:
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024+)
- ✅ Mobile (375x667+)

## 🎨 UI Components

### Step 1: University Selection
- Suggested universities (3 cards)
- "More" button to show all
- Search input with real-time filtering
- University cards with city info

### Step 2: Department Selection
- List of departments
- Radio-style selection
- Loading state
- Empty state if no departments

### Step 3: Year & Semester
- Year buttons (1-5)
- Semester buttons (1-2)
- Visual selection feedback

### Step 4: Course Selection
- Course cards with details
- Checkboxes for selection
- Select all / Deselect all
- Counter showing X of Y selected
- Course code, title, credits, description

## 🔄 State Management

**React State:**
- Current step (1-4)
- Selected university, department, year, semester
- Selected course IDs (Set)
- Available data (universities, departments, courses)
- Loading state
- Error state

**Effects:**
- Fetch universities on mount
- Fetch departments when university changes
- Fetch courses when year/semester changes
- Auto-select all courses when loaded

## ✅ Validation Rules

### Frontend
- Step 1: University required
- Step 2: Department required
- Step 3: Year AND semester required
- Step 4: At least 1 course required

### Backend
- University must exist in DB
- Department must belong to university
- Year must be 1-5
- Semester must be 1 or 2
- Courses must belong to curriculum
- Courses must match year/semester
- User must be authenticated

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (not logged in) |
| 404 | Not found |
| 500 | Server error |

## 📈 Future Enhancements

- [ ] Course prerequisites
- [ ] Credit hour limits
- [ ] Course recommendations
- [ ] Elective vs required marking
- [ ] Course conflict detection
- [ ] Multi-curriculum support
- [ ] Bulk operations
- [ ] Course ratings

## 🤝 Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test on different browsers
5. Check for TypeScript errors
6. Verify backend validation

## 📄 License

[Your License Here]

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review test checklist
3. Check console for errors
4. Verify database seed data
5. Contact development team

---

**Version**: 2.0.0  
**Last Updated**: August 5, 2026  
**Status**: ✅ Production Ready  
**Maintainer**: Development Team

