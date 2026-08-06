-- ===============================================
-- SQL VERIFICATION QUERIES FOR ONBOARDING
-- ===============================================
-- Run these in your PostgreSQL client or Prisma Studio
-- to verify student onboarding data is correctly linked
-- ===============================================

-- ===============================================
-- 1. CHECK STUDENT PROFILE WITH UNIVERSITY & DEPARTMENT
-- ===============================================
-- This shows the complete onboarding information for a student
-- Replace 'student@example.com' with the actual student email

SELECT 
    s.id AS student_id,
    s."firstName" || ' ' || s."lastName" AS student_name,
    s.email AS student_email,
    sp."currentYear" AS year,
    sp."currentSemester" AS semester,
    u.name AS university_name,
    u.city AS university_city,
    d.name AS department_name,
    c.label AS curriculum_name
FROM 
    "Student" s
    INNER JOIN "StudentProfile" sp ON s.id = sp."studentId"
    INNER JOIN "Curriculum" c ON sp."curriculumId" = c.id
    INNER JOIN "Department" d ON c."departmentId" = d.id
    INNER JOIN "University" u ON d."universityId" = u.id
WHERE 
    s.email = 'student@example.com';  -- Change this email


-- ===============================================
-- 2. CHECK ALL STUDENTS WITH THEIR PROFILES
-- ===============================================
-- Shows all students who have completed onboarding

SELECT 
    s.id,
    s."firstName",
    s."lastName",
    s.email,
    sp."currentYear",
    sp."currentSemester",
    u.name AS university,
    d.name AS department
FROM 
    "Student" s
    LEFT JOIN "StudentProfile" sp ON s.id = sp."studentId"
    LEFT JOIN "Curriculum" c ON sp."curriculumId" = c.id
    LEFT JOIN "Department" d ON c."departmentId" = d.id
    LEFT JOIN "University" u ON d."universityId" = u.id
ORDER BY 
    s."createdAt" DESC;


-- ===============================================
-- 3. CHECK COURSES FOR A SPECIFIC STUDENT
-- ===============================================
-- Shows all courses available for a student based on their profile
-- Replace the email with the actual student email

SELECT 
    s.email AS student_email,
    s."firstName" || ' ' || s."lastName" AS student_name,
    sp."currentYear" AS year,
    sp."currentSemester" AS semester,
    cc."courseCode",
    co.title AS course_title,
    co.description AS course_description,
    cc."creditHours",
    d.name AS department,
    u.name AS university
FROM 
    "Student" s
    INNER JOIN "StudentProfile" sp ON s.id = sp."studentId"
    INNER JOIN "Curriculum" cur ON sp."curriculumId" = cur.id
    INNER JOIN "CurriculumCourse" cc ON cur.id = cc."curriculumId"
    INNER JOIN "Course" co ON cc."courseId" = co.id
    INNER JOIN "Department" d ON cur."departmentId" = d.id
    INNER JOIN "University" u ON d."universityId" = u.id
WHERE 
    s.email = 'student@example.com'  -- Change this email
    AND cc.year = sp."currentYear"
    AND cc.semester = sp."currentSemester"
ORDER BY 
    cc."courseCode";


-- ===============================================
-- 4. CHECK COURSES BY YEAR AND SEMESTER
-- ===============================================
-- Shows all courses for a specific university, department, year, and semester

SELECT 
    u.name AS university,
    d.name AS department,
    cc.year,
    cc.semester,
    cc."courseCode",
    co.title AS course_title,
    cc."creditHours",
    co.description
FROM 
    "University" u
    INNER JOIN "Department" d ON u.id = d."universityId"
    INNER JOIN "Curriculum" cur ON d.id = cur."departmentId"
    INNER JOIN "CurriculumCourse" cc ON cur.id = cc."curriculumId"
    INNER JOIN "Course" co ON cc."courseId" = co.id
WHERE 
    u.name = 'Addis Ababa Science and Technology University'
    AND d.name = 'Software Engineering'
    AND cc.year = 3
    AND cc.semester = 1
ORDER BY 
    cc."courseCode";


-- ===============================================
-- 5. VERIFY UNIVERSITY -> DEPARTMENT RELATIONSHIP
-- ===============================================
-- Shows which departments belong to which universities

SELECT 
    u.id AS university_id,
    u.name AS university_name,
    u.city,
    d.id AS department_id,
    d.name AS department_name,
    COUNT(cur.id) AS curriculum_count
FROM 
    "University" u
    INNER JOIN "Department" d ON u.id = d."universityId"
    LEFT JOIN "Curriculum" cur ON d.id = cur."departmentId"
GROUP BY 
    u.id, u.name, u.city, d.id, d.name
ORDER BY 
    u.name, d.name;


-- ===============================================
-- 6. VERIFY DEPARTMENT -> CURRICULUM -> COURSES
-- ===============================================
-- Shows the complete hierarchy: Department -> Curriculum -> Courses

SELECT 
    d.name AS department,
    cur.label AS curriculum,
    cc.year,
    cc.semester,
    COUNT(cc.id) AS course_count,
    SUM(cc."creditHours") AS total_credits
FROM 
    "Department" d
    INNER JOIN "Curriculum" cur ON d.id = cur."departmentId"
    INNER JOIN "CurriculumCourse" cc ON cur.id = cc."curriculumId"
WHERE 
    d.name = 'Software Engineering'
GROUP BY 
    d.name, cur.label, cc.year, cc.semester
ORDER BY 
    cc.year, cc.semester;


-- ===============================================
-- 7. CHECK IF SPECIFIC STUDENT HAS COURSES
-- ===============================================
-- Detailed view of a student's course enrollment
-- This mimics what the backend returns after onboarding

SELECT 
    s.email,
    s."firstName" || ' ' || s."lastName" AS student_name,
    u.name AS university,
    d.name AS department,
    sp."currentYear" AS enrolled_year,
    sp."currentSemester" AS enrolled_semester,
    json_agg(
        json_build_object(
            'courseCode', cc."courseCode",
            'title', co.title,
            'description', co.description,
            'creditHours', cc."creditHours",
            'year', cc.year,
            'semester', cc.semester
        ) ORDER BY cc."courseCode"
    ) AS courses
FROM 
    "Student" s
    INNER JOIN "StudentProfile" sp ON s.id = sp."studentId"
    INNER JOIN "Curriculum" cur ON sp."curriculumId" = cur.id
    INNER JOIN "Department" d ON cur."departmentId" = d.id
    INNER JOIN "University" u ON d."universityId" = u.id
    INNER JOIN "CurriculumCourse" cc ON cur.id = cc."curriculumId"
        AND cc.year = sp."currentYear"
        AND cc.semester = sp."currentSemester"
    INNER JOIN "Course" co ON cc."courseId" = co.id
WHERE 
    s.email = 'student@example.com'  -- Change this email
GROUP BY 
    s.email, s."firstName", s."lastName", u.name, d.name, 
    sp."currentYear", sp."currentSemester";


-- ===============================================
-- 8. COUNT STATISTICS
-- ===============================================
-- Overall system statistics

SELECT 
    'Universities' AS entity,
    COUNT(*) AS count
FROM "University"

UNION ALL

SELECT 
    'Departments' AS entity,
    COUNT(*) AS count
FROM "Department"

UNION ALL

SELECT 
    'Curricula' AS entity,
    COUNT(*) AS count
FROM "Curriculum"

UNION ALL

SELECT 
    'Courses' AS entity,
    COUNT(*) AS count
FROM "Course"

UNION ALL

SELECT 
    'Students' AS entity,
    COUNT(*) AS count
FROM "Student"

UNION ALL

SELECT 
    'Students with Profiles' AS entity,
    COUNT(*) AS count
FROM "StudentProfile"

ORDER BY entity;


-- ===============================================
-- 9. FIND STUDENT BY ID AND SHOW FULL DETAILS
-- ===============================================
-- Replace 'student-uuid-here' with actual student ID

SELECT 
    s.id AS student_id,
    s."firstName",
    s."lastName",
    s.email,
    s."emailVerified",
    s."createdAt" AS student_created_at,
    sp.id AS profile_id,
    sp."currentYear",
    sp."currentSemester",
    sp."updatedAt" AS profile_updated_at,
    cur.id AS curriculum_id,
    cur.label AS curriculum_label,
    d.id AS department_id,
    d.name AS department_name,
    u.id AS university_id,
    u.name AS university_name,
    u.city AS university_city
FROM 
    "Student" s
    LEFT JOIN "StudentProfile" sp ON s.id = sp."studentId"
    LEFT JOIN "Curriculum" cur ON sp."curriculumId" = cur.id
    LEFT JOIN "Department" d ON cur."departmentId" = d.id
    LEFT JOIN "University" u ON d."universityId" = u.id
WHERE 
    s.id = 'student-uuid-here';  -- Change this UUID


-- ===============================================
-- 10. CHECK ALL COURSES IN SOFTWARE ENGINEERING
-- ===============================================
-- Complete list of all Software Engineering courses by year/semester

SELECT 
    cc.year,
    cc.semester,
    cc."courseCode",
    co.title,
    cc."creditHours",
    co.description,
    d.name AS department,
    cur.label AS curriculum
FROM 
    "Department" d
    INNER JOIN "Curriculum" cur ON d.id = cur."departmentId"
    INNER JOIN "CurriculumCourse" cc ON cur.id = cc."curriculumId"
    INNER JOIN "Course" co ON cc."courseId" = co.id
WHERE 
    d.name = 'Software Engineering'
ORDER BY 
    cc.year, cc.semester, cc."courseCode";


-- ===============================================
-- 11. VERIFY ONBOARDING DATA INTEGRITY
-- ===============================================
-- Checks for any orphaned or invalid relationships

-- Students without profiles
SELECT 
    'Students without profiles' AS issue,
    COUNT(*) AS count
FROM 
    "Student" s
    LEFT JOIN "StudentProfile" sp ON s.id = sp."studentId"
WHERE 
    sp.id IS NULL

UNION ALL

-- Departments without curricula
SELECT 
    'Departments without curricula' AS issue,
    COUNT(*) AS count
FROM 
    "Department" d
    LEFT JOIN "Curriculum" c ON d.id = c."departmentId"
WHERE 
    c.id IS NULL

UNION ALL

-- Curricula without courses
SELECT 
    'Curricula without courses' AS issue,
    COUNT(*) AS count
FROM 
    "Curriculum" c
    LEFT JOIN "CurriculumCourse" cc ON c.id = cc."curriculumId"
WHERE 
    cc.id IS NULL;


-- ===============================================
-- 12. GET LATEST ONBOARDED STUDENTS
-- ===============================================
-- Shows the most recently onboarded students

SELECT 
    s."firstName" || ' ' || s."lastName" AS student_name,
    s.email,
    u.name AS university,
    d.name AS department,
    sp."currentYear" AS year,
    sp."currentSemester" AS semester,
    sp."updatedAt" AS onboarded_at,
    COUNT(cc.id) AS available_courses
FROM 
    "Student" s
    INNER JOIN "StudentProfile" sp ON s.id = sp."studentId"
    INNER JOIN "Curriculum" cur ON sp."curriculumId" = cur.id
    INNER JOIN "Department" d ON cur."departmentId" = d.id
    INNER JOIN "University" u ON d."universityId" = u.id
    LEFT JOIN "CurriculumCourse" cc ON cur.id = cc."curriculumId"
        AND cc.year = sp."currentYear"
        AND cc.semester = sp."currentSemester"
GROUP BY 
    s.id, s."firstName", s."lastName", s.email,
    u.name, d.name, sp."currentYear", sp."currentSemester", sp."updatedAt"
ORDER BY 
    sp."updatedAt" DESC
LIMIT 10;
