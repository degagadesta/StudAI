# Dashboard API Testing Guide

## Endpoints Implemented

### 1. Get Student Name (for greeting)
```
GET /api/dashboard
Authorization: Bearer {your-access-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "name": "Amanuel"
    }
  }
}
```

---

### 2. Get Paginated PDFs (Initial Load)
```
GET /api/dashboard/pdfs?limit=3&offset=0
Authorization: Bearer {your-access-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfs": [
      {
        "id": "uuid-1",
        "title": "Operating Systems Lecture 3",
        "progress": 72,
        "courseId": "course-uuid-1",
        "courseName": "Operating Systems"
      },
      {
        "id": "uuid-2",
        "title": "Database Management Notes",
        "progress": 45,
        "courseId": "course-uuid-2",
        "courseName": "Database Systems"
      },
      {
        "id": "uuid-3",
        "title": "Algorithms Chapter 5",
        "progress": 0,
        "courseId": "course-uuid-3",
        "courseName": "Data Structures & Algorithms"
      }
    ],
    "total": 12,
    "hasMore": true
  }
}
```

---

### 3. Load More PDFs
```
GET /api/dashboard/pdfs?limit=3&offset=3
Authorization: Bearer {your-access-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfs": [
      {
        "id": "uuid-4",
        "title": "Data Structures",
        "progress": 20
      },
      {
        "id": "uuid-5",
        "title": "Computer Networks",
        "progress": 88
      },
      {
        "id": "uuid-6",
        "title": "Software Engineering",
        "progress": 15
      }
    ],
    "total": 12,
    "hasMore": true
  }
}
```

---

### 4. Search PDFs by Title
```
GET /api/dashboard/pdfs?limit=3&offset=0&search=operating
Authorization: Bearer {your-access-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfs": [
      {
        "id": "uuid-1",
        "title": "Operating Systems Lecture 3",
        "progress": 72,
        "courseId": "course-uuid-1",
        "courseName": "Operating Systems"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

---

### 5. Search PDFs by Course Name
```
GET /api/dashboard/pdfs?limit=3&offset=0&search=database
Authorization: Bearer {your-access-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfs": [
      {
        "id": "uuid-2",
        "title": "Database Management Notes",
        "progress": 45,
        "courseId": "course-uuid-2",
        "courseName": "Database Systems"
      },
      {
        "id": "uuid-5",
        "title": "SQL Tutorial",
        "progress": 20,
        "courseId": "course-uuid-2",
        "courseName": "Database Systems"
      }
    ],
    "total": 2,
    "hasMore": false
  }
}
```

---

### 6. Empty State (No PDFs)
```
GET /api/dashboard/pdfs?limit=3&offset=0
Authorization: Bearer {your-access-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfs": [],
    "total": 0,
    "hasMore": false
  }
}
```

---

### 7. Search with No Results
```
GET /api/dashboard/pdfs?limit=3&offset=0&search=nonexistent
Authorization: Bearer {your-access-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfs": [],
    "total": 0,
    "hasMore": false
  }
}
```

---

## Query Parameters

### `/api/dashboard/pdfs`

| Parameter | Type   | Required | Default | Description                              |
|-----------|--------|----------|---------|------------------------------------------|
| limit     | number | No       | 3       | Number of PDFs per page (min: 1, max: 50)|
| offset    | number | No       | 0       | Starting position (min: 0)               |
| search    | string | No       | null    | Search term for PDF title OR course name (case-insensitive) |

---

## Testing Scenarios

### Scenario 1: Dashboard Load
1. Call `GET /api/dashboard` → Get student name
2. Call `GET /api/dashboard/pdfs?limit=3&offset=0` → Get first 3 PDFs

### Scenario 2: Progressive Loading
1. User clicks "See More"
2. Call `GET /api/dashboard/pdfs?limit=3&offset=3` → Get next 3
3. User clicks "See More" again
4. Call `GET /api/dashboard/pdfs?limit=3&offset=6` → Get next 3
5. Continue until `hasMore: false`

### Scenario 3: Search by Title or Course
1. User types "operating" in search
2. Call `GET /api/dashboard/pdfs?limit=3&offset=0&search=operating`
3. Display results matching either PDF title OR course name
4. User types "database"
5. Call `GET /api/dashboard/pdfs?limit=3&offset=0&search=database`
6. Display all PDFs with "database" in title OR course name
7. User clears search
8. Call `GET /api/dashboard/pdfs?limit=3&offset=0` → Back to full list

### Scenario 4: Empty State
1. New user with no PDFs
2. Call `GET /api/dashboard/pdfs?limit=3&offset=0`
3. Response: `{ pdfs: [], total: 0, hasMore: false }`
4. Display "Upload your first PDF" message

---

## Frontend Implementation Notes

### Time-based Greeting
Frontend should generate greeting based on local time:
- 5:00 - 11:59: "Good Morning"
- 12:00 - 16:59: "Good Afternoon"
- 17:00 - 4:59: "Good Evening"

### Progressive Loading Logic
```javascript
let offset = 0;
const limit = 3;

// Initial load
fetchPDFs(limit, offset);

// Load more
function loadMore() {
  offset += limit;
  fetchPDFs(limit, offset); // Append to existing list
}

// Stop when hasMore === false
```

### Search with Debounce
```javascript
// Wait 500ms after user stops typing
debounce(() => {
  fetchPDFs(3, 0, searchQuery); // Reset to offset 0
}, 500);
```

---

## Error Handling

All endpoints return standard error format:
```json
{
  "error": "User-friendly error message"
}
```

Common errors:
- 401: "Please log in to continue"
- 404: "Account not found. Please log in again"
- 500: "Something went wrong. Please try again"

---

## Implementation Complete ✅

- [x] Simplified dashboard endpoint (returns only student name)
- [x] Created paginated PDFs endpoint
- [x] Added search functionality for both PDF title AND course name (case-insensitive)
- [x] Returns course information with each PDF
- [x] Added validation for query params
- [x] Returns `hasMore` flag for frontend
- [x] Proper error handling
- [x] User-friendly error messages

## Response Structure

Each PDF includes:
- `id` - PDF unique identifier
- `title` - PDF file name
- `progress` - Reading progress percentage (0-100)
- `courseId` - Associated course ID
- `courseName` - Associated course name

This allows the frontend to:
1. Display course name alongside PDF
2. Group PDFs by course if needed
3. Filter/search by course name
4. Navigate to course-specific pages
