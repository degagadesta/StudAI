# Analytics API Documentation

## Endpoint

```
GET /api/analytics
Authorization: Bearer {access-token}
```

## Response Structure

```json
{
  "success": true,
  "data": {
    "enrolledCourses": 8,
    "totalPdfsUploaded": 24,
    "totalEvents": 5,
    "activity": {
      "daily": [
        {
          "date": "2026-08-02",
          "day": "Sun",
          "hours": 3
        },
        {
          "date": "2026-08-03",
          "day": "Mon",
          "hours": 5
        },
        {
          "date": "2026-08-04",
          "day": "Tue",
          "hours": 4
        },
        {
          "date": "2026-08-05",
          "day": "Wed",
          "hours": 6
        },
        {
          "date": "2026-08-06",
          "day": "Thu",
          "hours": 2
        },
        {
          "date": "2026-08-07",
          "day": "Fri",
          "hours": 7
        },
        {
          "date": "2026-08-08",
          "day": "Sat",
          "hours": 4
        }
      ],
      "weekly": [
        {
          "weekStart": "2026-07-12",
          "weekEnd": "2026-07-18",
          "weekLabel": "Week 1",
          "days": 6
        },
        {
          "weekStart": "2026-07-19",
          "weekEnd": "2026-07-25",
          "weekLabel": "Week 2",
          "days": 7
        },
        {
          "weekStart": "2026-07-26",
          "weekEnd": "2026-08-01",
          "weekLabel": "Week 3",
          "days": 5
        },
        {
          "weekStart": "2026-08-02",
          "weekEnd": "2026-08-08",
          "weekLabel": "Week 4",
          "days": 7
        }
      ],
      "monthly": [
        {
          "month": "Sep 2025",
          "year": 2025,
          "monthNumber": 9,
          "days": 18
        },
        {
          "month": "Oct 2025",
          "year": 2025,
          "monthNumber": 10,
          "days": 22
        },
        {
          "month": "Nov 2025",
          "year": 2025,
          "monthNumber": 11,
          "days": 20
        },
        {
          "month": "Dec 2025",
          "year": 2025,
          "monthNumber": 12,
          "days": 15
        },
        {
          "month": "Jan 2026",
          "year": 2026,
          "monthNumber": 1,
          "days": 23
        },
        {
          "month": "Feb 2026",
          "year": 2026,
          "monthNumber": 2,
          "days": 19
        },
        {
          "month": "Mar 2026",
          "year": 2026,
          "monthNumber": 3,
          "days": 25
        },
        {
          "month": "Apr 2026",
          "year": 2026,
          "monthNumber": 4,
          "days": 21
        },
        {
          "month": "May 2026",
          "year": 2026,
          "monthNumber": 5,
          "days": 24
        },
        {
          "month": "Jun 2026",
          "year": 2026,
          "monthNumber": 6,
          "days": 22
        },
        {
          "month": "Jul 2026",
          "year": 2026,
          "monthNumber": 7,
          "days": 26
        },
        {
          "month": "Aug 2026",
          "year": 2026,
          "monthNumber": 8,
          "days": 8
        }
      ]
    }
  }
}
```

---

## Response Fields

### Top-level Metrics

| Field | Type | Description |
|-------|------|-------------|
| `enrolledCourses` | number | Total courses student is enrolled in current semester |
| `totalPdfsUploaded` | number | Total PDFs uploaded (READY status only) |
| `totalEvents` | number | Total upcoming events saved |

---

### Activity Object

#### `activity.daily` (Last 7 Days)
**Purpose:** Show hours of usage per day for the past 7 days including today

Each day object contains:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `date` | string | ISO date (YYYY-MM-DD) | "2026-08-08" |
| `day` | string | Abbreviated day name | "Sat" |
| `hours` | number | Hours app was used that day | 4 |

**Usage:** Display bar chart or line graph showing daily usage pattern

---

#### `activity.weekly` (Last 4 Weeks)
**Purpose:** Show number of active days per week for the past 4 weeks

Each week object contains:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `weekStart` | string | Week start date (YYYY-MM-DD) | "2026-08-02" |
| `weekEnd` | string | Week end date (YYYY-MM-DD) | "2026-08-08" |
| `weekLabel` | string | Week identifier | "Week 4" |
| `days` | number | Number of active days in the week (0-7) | 5 |

**Usage:** Display bar chart comparing weekly engagement (days active)

---

#### `activity.monthly` (Last 12 Months)
**Purpose:** Show number of active days per month for the past 12 months

Each month object contains:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `month` | string | Month name and year | "Aug 2026" |
| `year` | number | Year | 2026 |
| `monthNumber` | number | Month number (1-12) | 8 |
| `days` | number | Number of days app was used | 8 |

**Usage:** Display calendar heatmap or bar chart showing monthly engagement

---

## How Activity Tracking Works

### Activity Logger Middleware
- Records one entry per hour when student uses the app
- Automatically throttled to prevent duplicate entries within same hour
- Non-blocking (runs after response is sent)

### Calculation Logic

#### Daily (Hours)
```
For each of the last 7 days:
  Count ActivityLog entries for that day
  Result = number of hours used
```

#### Weekly (Days)
```
For each of the last 4 weeks:
  Get all ActivityLog entries in that 7-day period
  Count unique dates
  Result = number of days user was active (0-7)
```

#### Monthly (Days)
```
For each of the last 12 months:
  Get all ActivityLog entries for that month
  Count unique dates
  Result = number of days user was active
```

---

## Frontend Implementation Examples

### Daily Activity Chart (7 days)
```javascript
// Bar chart showing hours per day
const dailyLabels = data.activity.daily.map(d => d.day);
const dailyValues = data.activity.daily.map(d => d.hours);

// Chart: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
// Values: [3, 5, 4, 6, 2, 7, 4]
```

### Weekly Activity Chart (4 weeks)
```javascript
// Bar chart showing days active per week
const weeklyLabels = data.activity.weekly.map(w => w.weekLabel);
const weeklyValues = data.activity.weekly.map(w => w.days);

// Chart: ["Week 1", "Week 2", "Week 3", "Week 4"]
// Values: [6, 7, 5, 7]
```

### Monthly Activity Chart (12 months)
```javascript
// Bar chart or heatmap showing days active per month
const monthlyLabels = data.activity.monthly.map(m => m.month);
const monthlyValues = data.activity.monthly.map(m => m.days);

// Chart: ["Sep 2025", "Oct 2025", ..., "Aug 2026"]
// Values: [18, 22, 20, 15, 23, 19, 25, 21, 24, 22, 26, 8]
```

### Calculating Totals
```javascript
// Total hours last 7 days
const totalHoursWeek = data.activity.daily.reduce((sum, d) => sum + d.hours, 0);

// Average hours per day
const avgHoursPerDay = totalHoursWeek / 7;

// Total active days last 4 weeks
const totalActiveDaysWeeks = data.activity.weekly.reduce((sum, w) => w.days, 0);

// Total active days last 12 months
const totalActiveDays = data.activity.monthly.reduce((sum, m) => sum + m.days, 0);
```

---

## Use Cases

### Dashboard Analytics Card
```
📊 Your Activity
- Last 7 days: 31 hours
- Active days this week: 7/7
- Active days this month: 8/31
```

### Detailed Analytics Page
```
Daily Activity (Last Week)
[Bar Chart: Hours per day]

Weekly Engagement (Last 4 Weeks)
[Bar Chart: Days active per week]

Monthly Engagement (Last Year)
[Calendar Heatmap: Active days per month]
```

### Insights
```
- Most productive day: Friday (7 hours)
- Most consistent week: Week 2 (active all 7 days)
- Longest streak: 15 consecutive days
```

---

## Implementation Complete ✅

- [x] Returns enrolled courses count
- [x] Returns total PDFs uploaded (READY only)
- [x] Returns total events count (instead of events themselves)
- [x] Daily activity: hours per day for last 7 days
- [x] Weekly activity: **days active** per week for last 4 weeks
- [x] Monthly activity: **days active** per month for last 12 months
- [x] Optimized queries with proper date filtering
- [x] User-friendly data structure for frontend charts
