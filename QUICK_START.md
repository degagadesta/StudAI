# 🚀 Quick Start Guide - Onboarding Integration

## 30-Second Setup

```bash
# 1. Setup Database
cd backend
npx prisma migrate reset --force && npm run prisma:seed

# 2. Start Backend (in one terminal)
npm run dev

# 3. Start Frontend (in another terminal)
cd ../Frontend
npm run dev
```

## 2-Minute Test

1. Open browser to `http://localhost:5173` (or your frontend URL)
2. Register/Login as a student
3. Go to onboarding page
4. Follow these selections:
   - **University**: Addis Ababa Science and Technology University
   - **Department**: Software Engineering
   - **Year**: 3
   - **Semester**: 1
5. You'll see **4 courses** auto-selected
6. Click **"Complete setup"**
7. ✅ Done! You should be redirected to dashboard

## What to Expect

### Step 1: University
- 3 suggested universities
- Search functionality
- Select AASTU

### Step 2: Department
- 3 departments loaded from backend
- Select Software Engineering

### Step 3: Year & Semester
- Select Year 3, Semester 1

### Step 4: Courses
- **SWE301** - Software Architecture (4 credits)
- **SWE302** - Mobile Application Development (4 credits)
- **CS301** - Machine Learning (3 credits)
- **SWE303** - Human-Computer Interaction (3 credits)

All courses are pre-selected. Deselect if needed, then complete!

## Troubleshooting

### No courses showing?
```bash
cd backend
npm run prisma:seed
```

### CORS errors?
Check that backend allows your frontend URL in CORS config

### 401 Unauthorized?
Make sure you're logged in as a student

## Test Different Scenarios

### Year 1, Semester 1 (Beginner courses)
- Select: AASTU → Software Engineering → Year 1 → Semester 1
- Expect: 4 courses (Introduction to Programming, etc.)

### Year 2, Semester 1 (Intermediate courses)
- Select: AASTU → Software Engineering → Year 2 → Semester 1
- Expect: 4 courses (Algorithms, Database Systems, etc.)

### Computer Science Department
- Select: AASTU → Computer Science → Year 3 → Semester 1
- Expect: 4 courses (Advanced Algorithms, Compiler Design, etc.)

## Success Indicators

- ✅ No console errors
- ✅ All API calls return 200 OK
- ✅ Courses load based on selections
- ✅ Can select/deselect courses
- ✅ Submission succeeds
- ✅ Redirects to dashboard

## Need Help?

- Check **ONBOARDING_INTEGRATION.md** for full documentation
- Check **TEST_ONBOARDING.md** for comprehensive testing guide
- Check **INTEGRATION_SUMMARY.md** for technical details

---

**Ready to test?** Just run the commands above and follow the test steps! 🎉
