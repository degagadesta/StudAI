# Onboarding Integration Test Checklist

## ✅ Pre-Test Setup Complete

- ✅ Database seeded with test data
- ✅ 3 Universities created (AASTU, AAU, ASTU)
- ✅ 3 Departments created (Software Engineering, Computer Science, ECE)
- ✅ 31 Software Engineering courses across Years 1-4
- ✅ 4 Computer Science courses for Year 3

## 🧪 Manual Testing Steps

### 1. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### 2. Test Flow

#### Step 1: University Selection
- [ ] Page loads without errors
- [ ] See 3 suggested universities (AASTU, AAU, ASTU)
- [ ] Click "More" button to see full list
- [ ] Search functionality works
- [ ] Select "Addis Ababa Science and Technology University"
- [ ] "Continue" button becomes enabled
- [ ] Click "Continue"

#### Step 2: Department Selection
- [ ] Loading state shows briefly
- [ ] See 3 departments:
  - Software Engineering
  - Computer Science
  - Electrical & Computer Engineering
- [ ] Select "Software Engineering"
- [ ] "Continue" button becomes enabled
- [ ] Click "Continue"

#### Step 3: Year & Semester Selection
- [ ] See year buttons (1-5)
- [ ] See semester buttons (1-2)
- [ ] Select Year: 3
- [ ] Select Semester: 1
- [ ] Both selections highlighted
- [ ] "Continue" button becomes enabled
- [ ] Click "Continue"

#### Step 4: Course Selection
- [ ] Loading state shows briefly
- [ ] See 4 courses auto-selected:
  1. ✅ SWE301 - Software Architecture (4 credits)
  2. ✅ SWE302 - Mobile Application Development (4 credits)
  3. ✅ CS301 - Machine Learning (3 credits)
  4. ✅ SWE303 - Human-Computer Interaction (3 credits)
- [ ] Counter shows "4 of 4 selected"
- [ ] Can deselect individual courses
- [ ] Can use "Deselect all" button
- [ ] Can use "Select all" button
- [ ] "Complete setup" button enabled when ≥1 course selected
- [ ] Click "Complete setup"

#### Step 5: Submission
- [ ] Button shows "Saving setup..."
- [ ] No errors appear
- [ ] Redirects to dashboard
- [ ] Onboarding data saved successfully

### 3. Test Different Scenarios

#### Test Year 2, Semester 1
- [ ] Go back to onboarding
- [ ] Select: AASTU → Software Engineering → Year 2 → Semester 1
- [ ] Should see 4 courses:
  - SWE201 - Algorithms
  - SWE202 - Database Systems
  - CS201 - Computer Organization
  - MAT201 - Probability and Statistics

#### Test Year 1, Semester 1
- [ ] Select: AASTU → Software Engineering → Year 1 → Semester 1
- [ ] Should see 4 courses:
  - SWE101 - Introduction to Programming
  - MAT101 - Discrete Mathematics
  - CS101 - Introduction to Computer Science
  - ENG101 - Communicative English I

#### Test Computer Science Department
- [ ] Select: AASTU → Computer Science → Year 3 → Semester 1
- [ ] Should see 4 courses:
  - CS301 - Advanced Algorithms
  - CS302 - Compiler Design
  - CS303 - Theory of Computation
  - CS304 - Computer Graphics

#### Test Empty Result
- [ ] Select: AASTU → Electrical & Computer Engineering → Year 1 → Semester 1
- [ ] Should show "No courses found" message
- [ ] Should suggest contacting support

### 4. Test Error Handling

#### Test No Selection
- [ ] Try advancing without selecting university → Button disabled
- [ ] Try advancing without selecting department → Button disabled
- [ ] Try advancing without selecting year AND semester → Button disabled
- [ ] Try completing without selecting courses → Button disabled

#### Test Network Error (Optional)
- [ ] Stop backend server
- [ ] Try to load universities
- [ ] Should show error message
- [ ] Start backend server
- [ ] Refresh page
- [ ] Should work again

### 5. Test Back Navigation
- [ ] Complete all steps
- [ ] Click "Back" from Step 4 → Returns to Step 3
- [ ] Click "Back" from Step 3 → Returns to Step 2
- [ ] Click "Back" from Step 2 → Returns to Step 1
- [ ] Selections should be preserved

## 🔍 Browser Console Checks

Open Developer Tools (F12) and check:

- [ ] No JavaScript errors in console
- [ ] Network tab shows successful API calls:
  - GET `/universities` → 200
  - GET `/api/departments/universities/{id}/departments` → 200
  - GET `/api/student/onboarding/courses?...` → 200
  - POST `/api/student/onboarding` → 200
- [ ] All API responses have correct structure
- [ ] Loading states work properly

## 🎨 UI/UX Checks

- [ ] All text is readable
- [ ] Buttons have hover states
- [ ] Selected items are clearly highlighted
- [ ] Loading spinners/text appear during API calls
- [ ] Error messages are red and visible
- [ ] Layout doesn't break on different screen sizes
- [ ] Course cards show all information (code, title, credits, description)
- [ ] Checkboxes work correctly
- [ ] Progress indicator shows current step (1-4)

## 📊 Backend Validation

Check that backend validates:
- [ ] University ID exists
- [ ] Department belongs to university
- [ ] Year is 1-5
- [ ] Semester is 1 or 2
- [ ] Selected courses are valid for curriculum/year/semester

## ✅ Success Criteria

All tests pass if:
1. ✅ No console errors
2. ✅ All API calls return 200 OK
3. ✅ Data displays correctly at each step
4. ✅ Course selection works smoothly
5. ✅ Submission succeeds
6. ✅ Redirects to dashboard after onboarding
7. ✅ Student profile is created in database
8. ✅ Selected courses are associated with student

## 🐛 Common Issues & Solutions

### Issue: "No courses found"
**Solution**: Run `npm run prisma:seed` in backend

### Issue: "University not found"
**Solution**: Check seed data ran successfully, verify database connection

### Issue: CORS error
**Solution**: Check backend CORS configuration allows frontend URL

### Issue: 401 Unauthorized
**Solution**: Ensure user is logged in, check auth token

### Issue: TypeScript errors in frontend
**Solution**: Run `npm install` in Frontend directory

---

## 📝 Test Results

**Date**: _____________  
**Tester**: _____________  
**Result**: ⬜ PASS | ⬜ FAIL  
**Notes**:

_______________________________________________________
_______________________________________________________
_______________________________________________________

