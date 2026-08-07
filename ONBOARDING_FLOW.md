# 📊 Onboarding Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ONBOARDING WIZARD                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   STEP 1/4       │
│   University     │
├──────────────────┤
│ Frontend calls:  │
│ GET /universities│
│                  │
│ Shows:           │
│ • AASTU          │
│ • AAU            │
│ • ASTU           │
│ • Search box     │
│                  │
│ User selects ✓   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   STEP 2/4       │
│   Department     │
├──────────────────┤
│ Frontend calls:  │
│ GET /api/        │
│ departments/     │
│ universities/    │
│ {id}/departments │
│                  │
│ Shows:           │
│ • Software Eng   │
│ • Computer Sci   │
│ • ECE            │
│                  │
│ User selects ✓   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   STEP 3/4       │
│   Year & Sem     │
├──────────────────┤
│ Shows:           │
│ Year: [1][2][3]  │
│       [4][5]     │
│                  │
│ Semester: [1][2] │
│                  │
│ User selects ✓   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   STEP 4/4       │
│   Courses        │
├──────────────────┤
│ Frontend calls:  │
│ GET /api/student/│
│ onboarding/      │
│ courses?         │
│ universityId=x&  │
│ departmentId=y&  │
│ year=3&semester=1│
│                  │
│ Shows:           │
│ ☑ SWE301 (4cr)   │
│ ☑ SWE302 (4cr)   │
│ ☑ CS301 (3cr)    │
│ ☑ SWE303 (3cr)   │
│                  │
│ [Select all]     │
│ [Deselect all]   │
│                  │
│ User clicks      │
│ "Complete setup" │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   SUBMIT         │
├──────────────────┤
│ Frontend calls:  │
│ POST /api/       │
│ student/         │
│ onboarding       │
│                  │
│ Body:            │
│ {                │
│   universityId,  │
│   departmentId,  │
│   currentYear,   │
│   currentSemester│
│   selectedCourse │
│   Ids: [...]     │
│ }                │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   BACKEND        │
│   PROCESSING     │
├──────────────────┤
│ 1. Validate user │
│    is logged in  │
│                  │
│ 2. Validate      │
│    university    │
│    exists        │
│                  │
│ 3. Validate      │
│    department    │
│    belongs to    │
│    university    │
│                  │
│ 4. Find          │
│    curriculum    │
│    for dept      │
│                  │
│ 5. Validate      │
│    selected      │
│    courses       │
│    belong to     │
│    curriculum    │
│                  │
│ 6. Create/Update │
│    StudentProfile│
│                  │
│ 7. Return        │
│    profile +     │
│    courses       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   SUCCESS        │
│   RESPONSE       │
├──────────────────┤
│ {                │
│   success: true, │
│   message: "...",│
│   data: {        │
│     profile: {}, │
│     courses: []  │
│   }              │
│ }                │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   REDIRECT       │
│   TO DASHBOARD   │
└──────────────────┘
```

## Database Query Flow

```
┌─────────────┐
│ Universities│
└──────┬──────┘
       │
       │ GET /universities
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │
│             │     │ universityService
└─────────────┘     │ .getAllUniversities()
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Database   │
                    │              │
                    │ SELECT id,   │
                    │ name, city   │
                    │ FROM         │
                    │ University   │
                    └──────┬───────┘
                           │
                           ▼
                    [{id, name, city}]


┌─────────────┐
│ Departments │
└──────┬──────┘
       │
       │ GET /api/departments/universities/{id}/departments
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │
│             │     │ departmentService
└─────────────┘     │ .getDepartmentsByUniversity()
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Database   │
                    │              │
                    │ SELECT id,   │
                    │ name         │
                    │ FROM         │
                    │ Department   │
                    │ WHERE        │
                    │ universityId │
                    │ = ?          │
                    └──────┬───────┘
                           │
                           ▼
                    [{id, name}]


┌─────────────┐
│   Courses   │
└──────┬──────┘
       │
       │ GET /api/student/onboarding/courses?...
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │
│             │     │ onboardingService
└─────────────┘     │ .getAvailableCourses()
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Database   │
                    │              │
                    │ 1. Find      │
                    │    Curriculum│
                    │    by deptId │
                    │              │
                    │ 2. Find      │
                    │    Curriculum│
                    │    Courses   │
                    │    by year & │
                    │    semester  │
                    │              │
                    │ 3. Join with │
                    │    Course    │
                    │    details   │
                    └──────┬───────┘
                           │
                           ▼
                    [{
                      id,
                      courseCode,
                      title,
                      description,
                      creditHours,
                      year,
                      semester
                    }]


┌─────────────┐
│   Submit    │
└──────┬──────┘
       │
       │ POST /api/student/onboarding
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │
│             │     │ onboardingService
└─────────────┘     │ .completeOnboarding()
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Database   │
                    │              │
                    │ 1. Validate  │
                    │    University│
                    │              │
                    │ 2. Validate  │
                    │    Department│
                    │              │
                    │ 3. Find      │
                    │    Curriculum│
                    │              │
                    │ 4. Validate  │
                    │    Courses   │
                    │              │
                    │ 5. UPSERT    │
                    │    Student   │
                    │    Profile   │
                    │              │
                    │ 6. RETURN    │
                    │    Profile + │
                    │    Courses   │
                    └──────┬───────┘
                           │
                           ▼
                    {
                      profile: {...},
                      courses: [...]
                    }
```

## State Management Flow

```
Frontend State:
┌────────────────────────────────────────┐
│ step: 1 | 2 | 3 | 4                    │
│                                        │
│ university: University | null          │
│ department: Department | null          │
│ year: number | null                    │
│ semester: number | null                │
│ selectedCourses: Set<string>           │
│                                        │
│ universities: University[]             │
│ departments: Department[]              │
│ availableCourses: Course[]             │
│                                        │
│ isLoading: boolean                     │
│ error: string | null                   │
│ isSubmitting: boolean                  │
└────────────────────────────────────────┘

Navigation Logic:
┌────────────────────────────────────────┐
│ Step 1: canContinue = university !== null
│ Step 2: canContinue = department !== null
│ Step 3: canContinue = year && semester
│ Step 4: canFinish = selectedCourses.size > 0
└────────────────────────────────────────┘

Effects (useEffect):
┌────────────────────────────────────────┐
│ On Mount:                              │
│   └─ Fetch universities                │
│                                        │
│ When university changes:               │
│   └─ Fetch departments                 │
│                                        │
│ When year OR semester changes:         │
│   └─ Fetch available courses           │
│   └─ Auto-select all courses           │
└────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│ API Call Failed │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Catch in        │
│ try-catch       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ getApiError     │
│ Message()       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ setError(msg)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display red     │
│ error banner    │
└─────────────────┘
```

## Validation Flow

```
Frontend Validation:
┌───────────────────────┐
│ Button Disabled When: │
├───────────────────────┤
│ Step 1: !university   │
│ Step 2: !department   │
│ Step 3: !year||!sem   │
│ Step 4: courses===0   │
└───────────────────────┘

Backend Validation:
┌───────────────────────────┐
│ 1. Auth middleware        │
│    ├─ Check JWT token     │
│    └─ Attach user to req  │
│                           │
│ 2. Check university       │
│    ├─ Exists in DB?       │
│    └─ Error if not        │
│                           │
│ 3. Check department       │
│    ├─ Exists in DB?       │
│    ├─ Belongs to univ?    │
│    └─ Error if not        │
│                           │
│ 4. Validate year          │
│    ├─ Between 1-5?        │
│    └─ Error if not        │
│                           │
│ 5. Validate semester      │
│    ├─ 1 or 2?             │
│    └─ Error if not        │
│                           │
│ 6. Validate courses       │
│    ├─ All exist?          │
│    ├─ Belong to curric?   │
│    ├─ Match year/sem?     │
│    └─ Error if not        │
│                           │
│ 7. ✅ All valid           │
│    └─ Create profile      │
└───────────────────────────┘
```

---

This diagram shows the complete flow from user interaction to database operations! 🎯
