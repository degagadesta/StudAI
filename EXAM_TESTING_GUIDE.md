# COMPLETE END-TO-END TESTING GUIDE: PAST EXAMS FEATURE

## PART 1: PREREQUISITES & SETUP

### Step 1.1: Verify Backend is Running
```bash
# Check if backend is running on port 4000
curl http://localhost:4000/health

# Expected: 404 error (endpoint doesn't exist, but server responds)
# If nothing happens or connection refused, backend is down
```

### Step 1.2: Start Frontend Dev Server
```bash
# Terminal 1: Start backend (if not already running)
cd c:\Users\hp\StudAI\backend
npm run start

# Terminal 2: Start frontend
cd c:\Users\hp\StudAI\Frontend
npm run dev

# Frontend will be at http://localhost:5173 (or similar)
```

### Step 1.3: Have Test Data Ready
You'll need:
- ✅ Valid student account (username/email and password)
- ✅ A course enrolled in
- ✅ A PDF file to upload as past exam (can be any PDF)

---

## PART 2: ADMIN UPLOADS PAST EXAM

### Step 2.1: Navigate to Admin Dashboard
1. Open browser: `http://localhost:5173/admin/exams`
2. If prompted to login, use your test account credentials
3. You should see the **Admin Exam Dashboard** with two tabs:
   - Upload Exam (default active)
   - Review Questions

### Step 2.2: Upload Exam PDF
1. In the **Upload Exam** tab:
   - Click the **blue dashed upload area** (with Upload icon)
   - Select any PDF file from your computer
   - You should see: "Selected: [filename]"

2. Fill in the form fields:
   - **Curriculum Course ID**: Copy a course ID from your enrolled courses
     - You can check this from the Courses page (check network tab in DevTools)
     - Or use any valid UUID from your database
   - **Exam Year**: e.g., `2024`
   - **Exam Type**: Select "Mid-term Exam" or "Final Exam"

3. Click **Upload Exam** button
   - You should see loading spinner with "Uploading..."
   - After success: Green checkmark message appears

### Step 2.3: Verify Backend Processing (Check Logs)
In your backend terminal, you should see logs like:
```
[Processing] Starting processing for material {id}
[Processing] Extracting text from PDF {id}
[Processing] Extracted {X} characters from {Y} pages
[Processing] Splitting text into chunks
[Processing] Created {Z} chunks
[Processing] Generating embeddings for {Z} chunks in batches of 32
[Processing] Generated embeddings {processed}/{total}
[Processing] All embeddings generated, saving to database...
[Processing] Saved chunks {saved}/{total}
[Processing] ✓ Material {id} processing complete - {Z} chunks ready
```

---

## PART 3: ADMIN REVIEWS & FINALIZES EXAM

### Step 3.1: Load Exam for Review
1. In Admin Dashboard, click **Review Questions** tab
2. You should see: "Load an exam to review questions"
3. Enter the **Exam ID** (from the upload response or check database)
   - You can get it from browser DevTools Network tab when uploading
4. Press Enter or click to load

### Step 3.2: Review Questions
1. The exam loads with:
   - **Exam Type & Year** header
   - **Status**: Should show "NEEDS_REVIEW"
   - List of extracted questions

2. Each question shows:
   - Question text
   - Question type (TRUE_FALSE, MULTIPLE_CHOICE, etc.)
   - Options (if applicable)
   - Correct answer
   - Explanation
   - Topic
   - Marks

3. You can **Edit** questions by clicking the edit icon:
   - Modify question text
   - Change question type
   - Update correct answer
   - Edit explanation
   - Click **Save** button

### Step 3.3: Finalize Exam
1. After reviewing questions (or without changes), click **Finalize Exam** button
2. Confirm the prompt: "Mark this exam as READY for students?"
3. Button shows "Finalizing..." then success message
4. Exam status changes to **READY**

---

## PART 4: STUDENT ACCESSES PAST EXAMS IN WORKSPACE

### Step 4.1: Log in as Student
1. Navigate to `http://localhost:5173/login`
2. Enter student credentials
3. After login, you're on the dashboard

### Step 4.2: Open a Course Workspace
1. Go to **Courses** tab
2. Select any course you're enrolled in
3. Click to open the course workspace
   - You should see PDF viewer in center
   - Left sidebar with tabs: AI Chat, Summary, Notes, **Previous Exams**, Quiz, Flash Cards, Upload
   - PDF should be open (or select one from Upload materials)

### Step 4.3: Access Previous Exams Tab
1. In the left sidebar, click **Previous Exams** tab
   - Tab should highlight in blue
   - A **draggable modal window** appears on right side
   - Modal title: "Previous Exams Viewer"

2. The modal shows:
   - Progress bar (0% initially)
   - Question counter (e.g., "Question 1 of 3")
   - First question displayed
   - Answer input area (button type depends on question type)
   - Submit Answer button
   - Previous/Next navigation at bottom

### Step 4.4: Interact with Question (Answer & Submit)

#### For TRUE_FALSE Questions:
1. Two buttons appear: "True" and "False"
2. Click one button to select
3. Button should highlight blue when selected
4. Click **Submit Answer** button
5. Response shows:
   - ✅ Checkmark if correct / ❌ X if incorrect
   - Correct answer displayed
   - Detailed explanation
   - Score: X / Y marks

#### For MULTIPLE_CHOICE Questions:
1. List of options appears as clickable buttons
2. Click an option to select (should highlight)
3. Click **Submit Answer**
4. Get feedback with explanation

#### For SHORT_ANSWER / ESSAY Questions:
1. Text area appears with placeholder "Enter your answer here..."
2. Type your answer
3. Click **Submit Answer**
4. Get feedback (exact match evaluation)

### Step 4.5: Navigate Questions
1. After answering, click **Next Question** button
   - Question counter updates (e.g., "Question 2 of 3")
   - Progress bar advances
   - New question loads
   - Answer input resets

2. Use **Previous/Next navigation buttons** at bottom to jump between questions

3. **Progress bar** shows how many questions you've answered

---

## PART 5: VERIFY DATA IN DATABASE

### Step 5.1: Check PastExam Records
```bash
# Using psql (if connected to your database)
SELECT id, year, type, status, curriculumCourseId 
FROM "PastExam" 
ORDER BY createdAt DESC 
LIMIT 5;

# Expected output:
# id | year | type  | status      | curriculumCourseId
# ---|------|-------|-------------|------------------
# ... (your uploaded exams)
```

### Step 5.2: Check PastExamChunk Records
```bash
SELECT id, pastExamId, question, questionType, status 
FROM "PastExamChunk" 
WHERE pastExamId = '{EXAM_ID}' 
ORDER BY createdAt;

# Expected output:
# id | pastExamId | question | questionType | status
# ---|------------|----------|--------------|--------
# ... (extracted questions)
```

### Step 5.3: Check Student Answers (if tracking)
```bash
# If you have answer tracking implemented
SELECT * FROM "ExamAttempt" WHERE studentId = '{STUDENT_ID}';
```

---

## PART 6: COMMON ISSUES & SOLUTIONS

### Issue 1: "No practice questions available for this course"
**Cause**: Exam not finalized (still in EXTRACTED or NEEDS_REVIEW status)
**Solution**: 
- Go to Admin Dashboard
- Finalize the exam (status must be READY)
- Only questions with status VERIFIED show up

### Issue 2: Modal doesn't open when clicking "Previous Exams"
**Cause**: Missing material/curriculumCourseId
**Solution**:
- Make sure a material is selected (open a PDF first)
- Check browser console for errors
- Verify material has curriculumCourseId property

### Issue 3: Questions don't load in workspace
**Cause**: API endpoint not responding
**Solution**:
- Check backend is running: `curl http://localhost:4000/health`
- Check browser DevTools Network tab for failed requests
- Verify curriculumCourseId is correct
- Check backend logs for errors

### Issue 4: "Evaluation failed" error
**Cause**: Backend evaluation endpoint error
**Solution**:
- Check backend logs for details
- Verify questionId is valid
- Make sure answer format matches expected

### Issue 5: Draggable modal is stuck/not moveable
**Cause**: Mouse event not captured
**Solution**:
- Click on the modal header (where grip icon is)
- Try dragging from the "grip" icon specifically
- Make sure modal has focus

---

## PART 7: TESTING CHECKLIST

Copy this checklist and mark off as you complete each step:

### Admin Upload:
- [ ] Can navigate to /admin/exams
- [ ] Can select PDF file
- [ ] Can fill in curriculum course ID
- [ ] Can fill in exam year
- [ ] Can select exam type
- [ ] Upload succeeds with green message
- [ ] Backend logs show processing starting
- [ ] Processing completes successfully

### Admin Review:
- [ ] Can switch to Review Questions tab
- [ ] Can load exam by ID
- [ ] Exam shows all questions
- [ ] Can edit questions
- [ ] Edit saves successfully
- [ ] Can finalize exam
- [ ] Status changes to READY

### Student Workspace:
- [ ] Can log in as student
- [ ] Can open course workspace
- [ ] Can see "Previous Exams" tab in sidebar
- [ ] Clicking tab opens draggable modal
- [ ] Modal title shows "Previous Exams Viewer"
- [ ] Questions load (or shows "no questions" message if none)

### Question Answering (if questions loaded):
- [ ] Progress bar displays correctly
- [ ] Question counter shows (X of Y)
- [ ] Question text displays clearly
- [ ] Answer input area renders (correct type for question)
- [ ] Can select/enter answer
- [ ] Submit Answer button works
- [ ] Evaluation returns immediately
- [ ] Feedback shows (correct/incorrect, explanation, score)

### Navigation:
- [ ] Next Question button works
- [ ] Previous Question button works
- [ ] Progress bar updates when moving between questions
- [ ] All question data loads correctly

### Error Handling:
- [ ] Shows loading spinner while fetching
- [ ] Shows error message if no questions
- [ ] Shows error message if API fails
- [ ] Gracefully handles network errors

---

## PART 8: DEBUG TIPS

### View Browser Console
- Open DevTools: F12
- Go to **Console** tab
- Look for any red errors
- Check Network tab to see API calls

### View Backend Logs
- Terminal where backend is running
- Look for `[Processing]`, `[Exam]`, `[PDF]` logs
- Check for errors in red text

### Check API Calls
1. Open DevTools → Network tab
2. Filter by "XHR" (XMLHttpRequest)
3. Perform action (e.g., click Previous Exams)
4. Look for requests:
   - `GET /student/exams/student/exams/questions?curriculumCourseId=...`
   - `POST /student/exams/student/exams/evaluate`
5. Click request to see:
   - Request body/params
   - Response data
   - Status code

### Check Database Directly
```bash
# Connect to your database
psql -U {user} -d {database}

# Check if exam was created
SELECT * FROM "PastExam" ORDER BY createdAt DESC LIMIT 1;

# Check if questions were extracted
SELECT * FROM "PastExamChunk" ORDER BY createdAt DESC LIMIT 1;

# Check if answers were tracked
SELECT * FROM "ExamAttempt" ORDER BY createdAt DESC LIMIT 1;
```

---

## PART 9: COMPLETE WORKFLOW EXAMPLE

### Full Test Scenario:

**Time: ~10 minutes**

1. **Admin uploads exam** (2 min)
   - Go to /admin/exams
   - Upload physics_midterm_2024.pdf
   - Fill: curriculumCourseId, year=2024, type=MID
   - Click Upload
   - See success message

2. **Wait for processing** (3 min)
   - Watch backend logs
   - Wait for "processing complete" message

3. **Admin reviews and finalizes** (2 min)
   - Switch to Review tab
   - Load exam by ID
   - Scroll through questions
   - Click Finalize Exam
   - Confirm

4. **Student accesses in workspace** (2 min)
   - Log out, log in as student
   - Go to Courses
   - Open a course with materials
   - Click "Previous Exams" tab
   - Wait for questions to load

5. **Student practices** (1 min)
   - Answer a few questions
   - Submit answers
   - See feedback
   - Navigate between questions

6. **Verify success** (1 min)
   - Check database for exam and answers
   - Check browser console (no errors)
   - Check backend logs (no errors)

**Total: ~11 minutes for complete cycle**

---

## EXPECTED SUCCESS INDICATORS

✅ **Admin can upload exams** without errors
✅ **Backend processes PDFs** successfully
✅ **Questions are extracted** and stored
✅ **Admin can review** and finalize exams
✅ **Student can see** "Previous Exams" tab
✅ **Student can open** practice modal
✅ **Questions load** in the modal
✅ **Student can answer** all 4 question types
✅ **Evaluation works** and shows feedback
✅ **Navigation** works smoothly
✅ **No console errors** in browser
✅ **No backend errors** in logs

---

## IF EVERYTHING WORKS:

🎉 **Past Exams feature is fully operational!**

Students can now:
- Practice with real past exam questions
- Get instant feedback on their answers
- See detailed explanations
- Track their progress
- Navigate through all available questions
- Experience seamless integration within the workspace

