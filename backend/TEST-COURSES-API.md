# Courses API Documentation

## Endpoint

```
GET /api/student/courses
Authorization: Bearer {access-token}
```

## Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": "course-uuid-1",
      "code": "CS301",
      "name": "Operating Systems",
      "description": "Introduction to operating system concepts",
      "pdfs": [
        {
          "id": "pdf-uuid-1",
          "title": "OS Lecture 3.pdf",
          "progress": 72,
          "uploadedAt": "2026-08-01T10:30:00.000Z"
        },
        {
          "id": "pdf-uuid-2",
          "title": "Process Management Notes.pdf",
          "progress": 45,
          "uploadedAt": "2026-07-28T14:20:00.000Z"
        }
      ],
      "pdfCount": 2
    },
    {
      "id": "course-uuid-2",
      "code": "CS302",
      "name": "Database Systems",
      "description": "Database design and management",
      "pdfs": [
        {
          "id": "pdf-uuid-3",
          "title": "Database Chapter 5.pdf",
          "progress": 0,
          "uploadedAt": "2026-08-05T09:15:00.000Z"
        }
      ],
      "pdfCount": 1
    },
    {
      "id": "course-uuid-3",
      "code": "CS303",
      "name": "Data Structures & Algorithms",
      "description": "Fundamental data structures and algorithms",
      "pdfs": [],
      "pdfCount": 0
    }
  ]
}
```

---

## Response Fields

### Course Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique course identifier |
| `code` | string | Course code (e.g., "CS301") |
| `name` | string | Course title |
| `description` | string | Course description (can be null) |
| `pdfs` | array | Array of PDFs uploaded for this course |
| `pdfCount` | number | Total number of PDFs for this course |

### PDF Object (inside `pdfs` array)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique PDF identifier |
| `title` | string | PDF filename |
| `progress` | number | Reading progress (0-100) |
| `uploadedAt` | string | ISO timestamp when PDF was uploaded |

---

## Features

### Enrolled Courses Only
- Returns only courses for the student's current year and semester
- Based on their curriculum from onboarding

### Student's PDFs Only
- Only shows PDFs uploaded by the authenticated student
- PDFs are filtered by course
- Only shows PDFs with `READY` status

### Ordered Data
- Courses ordered by course code (ascending)
- PDFs within each course ordered by upload date (newest first)

---

## Use Cases

### Course List Page
Display all enrolled courses with their materials:

```
📚 Your Courses (8)

┌─────────────────────────────────┐
│ CS301 - Operating Systems       │
│ 2 PDFs                          │
│ • OS Lecture 3.pdf (72%)       │
│ • Process Management (45%)      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ CS302 - Database Systems        │
│ 1 PDF                           │
│ • Database Chapter 5.pdf (0%)   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ CS303 - Data Structures         │
│ No materials yet                │
│ [+ Upload PDF]                  │
└─────────────────────────────────┘
```

### Course Detail Page
When user clicks a course:

```
Operating Systems (CS301)
Introduction to operating system concepts

Study Materials (2)
• OS Lecture 3.pdf
  Progress: ████████████░░░░░░░░ 72%
  Uploaded: Aug 1, 2026
  [Continue Reading]

• Process Management Notes.pdf
  Progress: █████████░░░░░░░░░░░ 45%
  Uploaded: Jul 28, 2026
  [Continue Reading]

[+ Upload New PDF]
```

### Empty State
```
No materials uploaded for this course yet.
[Upload Your First PDF]
```

---

## Frontend Implementation

### Display Course Grid
```javascript
courses.forEach(course => {
  console.log(`${course.code} - ${course.name}`);
  console.log(`${course.pdfCount} materials`);
  
  course.pdfs.forEach(pdf => {
    console.log(`  • ${pdf.title} (${pdf.progress}%)`);
  });
});
```

### Filter Courses with Materials
```javascript
const coursesWithPdfs = courses.filter(c => c.pdfCount > 0);
const coursesWithoutPdfs = courses.filter(c => c.pdfCount === 0);
```

### Calculate Total Materials
```javascript
const totalPdfs = courses.reduce((sum, c) => sum + c.pdfCount, 0);
```

### Group by Progress
```javascript
courses.forEach(course => {
  const inProgress = course.pdfs.filter(pdf => pdf.progress > 0 && pdf.progress < 100);
  const notStarted = course.pdfs.filter(pdf => pdf.progress === 0);
  const completed = course.pdfs.filter(pdf => pdf.progress === 100);
});
```

---

## Error Handling

### 404 - Student Not Found
```json
{
  "error": "Account not found. Please log in again"
}
```

### 400 - Onboarding Not Complete
```json
{
  "error": "Please complete your profile setup to view your courses"
}
```

---

## Related Endpoints

### Upload PDF to Course
```
POST /api/pdfs
Body: { courseId, pdf (file) }
```

### Get PDF File
```
GET /api/pdfs/:id/file
```

### Update PDF Progress
```
PATCH /api/pdfs/:id/progress
Body: { progress }
```

---

## Implementation Details

### Query Optimization
- Uses `Promise.all()` to fetch PDFs for all courses in parallel
- Only selects necessary fields to reduce data transfer
- Efficient indexing on `courseId` and `uploadedBy`

### Consistency
- Always shows current enrolled courses (based on profile)
- PDFs are always linked to valid courses
- Progress is always up-to-date

---

## Implementation Complete ✅

- [x] Returns all enrolled courses for current semester
- [x] Includes course details (code, name, description)
- [x] Includes all PDFs for each course
- [x] Shows PDF progress and upload date
- [x] Returns PDF count for easy display
- [x] Ordered by course code and upload date
- [x] Optimized with parallel queries
- [x] Proper error handling
