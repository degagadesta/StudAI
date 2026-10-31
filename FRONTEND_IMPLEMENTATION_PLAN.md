# Frontend Implementation Plan - Study Features

## 📋 Overview

This document outlines the complete frontend implementation for the three new study features:
1. **Study Sessions & Pomodoro Timer**
2. **PDF Bookmarks**
3. **Study Groups**

Backend is 100% complete. This plan is for the frontend team.

---

## 🎯 Phase 1: Study Sessions & Pomodoro Timer

### 1.1 API Service Layer

**File:** `Frontend/src/api/studySessionApi.ts`

```typescript
// API calls for study sessions
- startStudySession(type, courseId?, materialId?)
- endStudySession(sessionId)
- getActiveSession()
- incrementPomodoro(sessionId)
- getStudyHistory(page, limit)
- getStudyStats()
- getStudyStreak()
- getStudyCalendar(startDate, endDate)
```

### 1.2 Custom Hooks

**File:** `Frontend/src/hooks/useStudySession.ts`
- Manages active session state
- Auto-saves session state to localStorage
- Provides session controls (start, pause, end)
- Calculates elapsed time

**File:** `Frontend/src/hooks/usePomodoro.ts`
- Pomodoro timer logic (25 min work, 5 min break)
- Sound notifications for break/work transitions
- Pomodoro count tracking

### 1.3 Components

**1.3.1 Study Timer Widget**
```
Frontend/src/components/StudySession/StudyTimer.tsx
- Floating timer button (bottom-right corner)
- Shows elapsed time when active
- Click to expand full controls
- Start/Pause/End buttons
- Current activity display (course/material name)
```

**1.3.2 Pomodoro Mode**
```
Frontend/src/components/StudySession/PomodoroTimer.tsx
- 25-minute countdown timer
- Visual progress ring
- Break timer (5 min)
- Auto-switch between work/break
- Pomodoro count display
- Sound toggle
```

**1.3.3 Study Statistics Dashboard**
```
Frontend/src/components/StudySession/StudyStats.tsx
- Today's study time
- This week's total
- This month's total
- Average session length
- Most productive time of day
- Bar chart for daily breakdown
```

**1.3.4 Study Streak Display**
```
Frontend/src/components/StudySession/StreakDisplay.tsx
- Current streak badge (🔥 icon + number)
- Longest streak record
- Motivational message
- Total study hours
- Total sessions count
```

**1.3.5 Study Calendar Heatmap**
```
Frontend/src/components/StudySession/StudyCalendar.tsx
- GitHub-style heatmap
- Color intensity by study minutes
- Hover shows exact time studied
- Shows last 12 months
- Legend for color scale
```

**1.3.6 Study History Table**
```
Frontend/src/components/StudySession/StudyHistory.tsx
- Paginated list of past sessions
- Date, duration, type, course
- Filter by date range
- Export to CSV option
```

### 1.4 Pages

**File:** `Frontend/src/pages/StudySessionsPage.tsx`
- Main study tracking page
- Layout:
  - Top: Streak display + Start session button
  - Middle: Statistics cards (today, week, month)
  - Calendar heatmap
  - Bottom: Study history table

### 1.5 Integration Points

- Add timer widget to all pages (global component)
- Add "Start Study Session" button in:
  - Course page (study specific course)
  - PDF viewer (study with material)
  - Dashboard (general study)

### 1.6 State Management

Use React Context or add to existing context:
```typescript
StudySessionContext:
  - activeSession
  - isStudying
  - elapsedTime
  - startSession()
  - endSession()
  - isPomodoroMode
```

---

## 🎯 Phase 2: PDF Bookmarks

### 2.1 API Service Layer

**File:** `Frontend/src/api/bookmarkApi.ts`

```typescript
// API calls for bookmarks
- createBookmark(materialId, data)
- getBookmarksForMaterial(materialId)
- getAllBookmarks()
- getBookmarkById(id)
- updateBookmark(id, data)
- deleteBookmark(id)
```

### 2.2 Custom Hooks

**File:** `Frontend/src/hooks/useBookmarks.ts`
- Fetch bookmarks for current PDF
- Add/update/delete bookmark
- Sort bookmarks by page number
- Filter bookmarks by color

### 2.3 Components

**2.3.1 Bookmark Sidebar**
```
Frontend/src/components/PDF/BookmarkSidebar.tsx
- Sidebar on right side of PDF viewer
- List of all bookmarks for current PDF
- Click bookmark to jump to page
- Color-coded indicators
- Search/filter bookmarks
- Add new bookmark button
```

**2.3.2 Bookmark Card**
```
Frontend/src/components/PDF/BookmarkCard.tsx
- Bookmark name
- Page number
- Color indicator
- Preview of note (if exists)
- Edit/Delete buttons
- Click to navigate to page
```

**2.3.3 Create/Edit Bookmark Modal**
```
Frontend/src/components/PDF/BookmarkModal.tsx
- Form fields:
  - Name (required)
  - Page number (auto-filled)
  - Color picker (6 colors)
  - Note textarea (optional)
  - Selected text (if any)
- Save/Cancel buttons
```

**2.3.4 Bookmark Button (PDF Toolbar)**
```
Frontend/src/components/PDF/BookmarkButton.tsx
- Button in PDF viewer toolbar
- Icon changes if current page has bookmark
- Click to add bookmark on current page
- Shows count badge (e.g., "5 bookmarks")
```

**2.3.5 Bookmark List Page**
```
Frontend/src/components/Bookmarks/BookmarkList.tsx
- All user bookmarks across all PDFs
- Group by material/PDF
- Filter by color/date
- Search by name
- Click to open PDF at bookmarked page
```

### 2.4 Pages

**Update:** `Frontend/src/pages/workspacepage.tsx` (PDF Viewer)
- Add bookmark sidebar toggle
- Show bookmark indicators on page thumbnails
- Add bookmark creation shortcut (Ctrl+B)

**New:** `Frontend/src/pages/BookmarksPage.tsx`
- View all bookmarks across all materials
- Navigate to any bookmarked section

### 2.5 Integration Points

- Modify existing PDF viewer to include:
  - Bookmark sidebar toggle button
  - Bookmark indicators on pages
  - Right-click menu: "Add Bookmark"
  - Text selection: "Bookmark Selection"

### 2.6 UI/UX Considerations

- Color palette: yellow, green, blue, red, purple, orange
- Bookmark icon style: consistent with app design
- Smooth scrolling to bookmarked pages
- Bookmark indicators don't obstruct PDF content
- Keyboard shortcuts: 
  - Ctrl+B: Add bookmark
  - Ctrl+Shift+B: Show bookmarks sidebar

---

## 🎯 Phase 3: Study Groups

### 3.1 API Service Layer

**File:** `Frontend/src/api/studyGroupApi.ts`

```typescript
// API calls for study groups
- createGroup(name, subject, courseId)
- getMyGroups()
- joinGroup(inviteCode)
- getGroupById(groupId)
- updateGroup(groupId, data)
- deleteGroup(groupId)
- leaveGroup(groupId)
- updateMemberRole(groupId, memberId, role)
- removeMember(groupId, memberId)
- getGroupMessages(groupId, page, limit)
- shareNote(groupId, noteId)
- getSharedNotes(groupId)
```

### 3.2 Socket.IO Integration

**File:** `Frontend/src/services/studyGroupSocket.ts`

```typescript
// Socket events for real-time features
Client Emits:
- join:group(groupId)
- leave:group(groupId)
- group:message({ groupId, content, type })
- group:typing({ groupId, isTyping })

Client Listens:
- group:member-joined
- group:new-message
- group:member-typing
- group:member-left
```

### 3.3 Custom Hooks

**File:** `Frontend/src/hooks/useStudyGroup.ts`
- Fetch group data
- Manage group members
- CRUD operations for groups

**File:** `Frontend/src/hooks/useGroupChat.ts`
- Real-time message handling
- Send/receive messages via Socket.IO
- Typing indicators
- Message pagination
- Optimistic UI updates

### 3.4 Components

**3.4.1 Study Groups List**
```
Frontend/src/components/StudyGroups/GroupsList.tsx
- Grid/List view of all user's groups
- Group card shows:
  - Group name
  - Subject
  - Member count
  - Last activity
  - Unread message badge
- Create new group button
- Join with code button
```

**3.4.2 Create Group Modal**
```
Frontend/src/components/StudyGroups/CreateGroupModal.tsx
- Form fields:
  - Group name (required)
  - Subject (optional)
  - Associated course (optional)
- Generate invite code automatically
- Create button
```

**3.4.3 Join Group Modal**
```
Frontend/src/components/StudyGroups/JoinGroupModal.tsx
- Invite code input field
- Validation feedback
- Join button
- Shows preview after valid code entered
```

**3.4.4 Group Chat Interface**
```
Frontend/src/components/StudyGroups/GroupChat.tsx
- Message list (scrollable)
- Message bubble (left: others, right: you)
- Timestamp on messages
- Sender name and avatar
- Message input at bottom
- Send button
- Typing indicator ("John is typing...")
- Auto-scroll to newest message
```

**3.4.5 Group Members Sidebar**
```
Frontend/src/components/StudyGroups/MembersSidebar.tsx
- List of all members
- Show online status (green dot)
- Member role badge (Admin/Member)
- For admins:
  - Promote to admin button
  - Remove member button
- Group settings button (admin only)
```

**3.4.6 Message Bubble**
```
Frontend/src/components/StudyGroups/MessageBubble.tsx
- User avatar
- User name
- Message content
- Timestamp
- Different styling for:
  - Regular text messages
  - Shared notes (special card)
  - System messages (member joined/left)
```

**3.4.7 Share Note Modal**
```
Frontend/src/components/StudyGroups/ShareNoteModal.tsx
- List of user's notes
- Course filter
- Search notes
- Preview note content
- Share button
```

**3.4.8 Shared Notes List**
```
Frontend/src/components/StudyGroups/SharedNotesList.tsx
- List of notes shared in group
- Note preview
- Shared by (user name)
- Shared date
- Click to view full note
- Course name
```

**3.4.9 Group Settings Modal**
```
Frontend/src/components/StudyGroups/GroupSettingsModal.tsx
- Update group name
- Update subject
- Show invite code (copy button)
- Leave group button
- Delete group button (creator only)
```

**3.4.10 Invite Code Display**
```
Frontend/src/components/StudyGroups/InviteCodeCard.tsx
- Large display of invite code
- Copy to clipboard button
- QR code (optional)
- "Valid indefinitely" text
```

### 3.5 Pages

**File:** `Frontend/src/pages/StudyGroupsPage.tsx`
- Layout:
  - Left sidebar: List of groups
  - Main area: Active group chat
  - Right sidebar: Members list
- Empty state when no group selected
- Create/Join buttons in header

**File:** `Frontend/src/pages/StudyGroupDetailPage.tsx`
- Single group view (alternative layout)
- Tabs:
  - Chat
  - Shared Notes
  - Members
  - Settings

### 3.6 State Management

Add to existing Socket context or create new:
```typescript
StudyGroupContext:
  - currentGroup
  - messages
  - members
  - sendMessage()
  - typingUsers
  - unreadCounts
```

### 3.7 Real-Time Features Implementation

**3.7.1 Message Handling:**
```typescript
- Optimistic updates (add message immediately)
- Socket confirmation (mark as delivered)
- Error handling (show retry button)
- Message queuing (send when back online)
```

**3.7.2 Typing Indicators:**
```typescript
- Debounce typing events (send after 500ms of typing)
- Stop indicator after 3 seconds of no typing
- Show "User is typing..." at bottom of chat
```

**3.7.3 Online Status:**
```typescript
- Track online members via Socket.IO
- Green dot for online users
- Grey dot for offline users
- "Last seen" timestamp
```

**3.7.4 Notifications:**
```typescript
- Browser notifications for new messages
- Play sound on new message (toggle-able)
- Badge count on group list
- Red dot on app icon
```

---

## 📦 Shared Components & Utilities

### Utilities

**File:** `Frontend/src/utils/timeFormatter.ts`
```typescript
- formatDuration(minutes) // "2h 30m"
- formatTime(date) // "10:30 AM"
- formatRelativeTime(date) // "2 hours ago"
```

**File:** `Frontend/src/utils/colors.ts`
```typescript
- bookmarkColors: { yellow, green, blue, red, purple, orange }
- getColorHex(colorName)
```

**File:** `Frontend/src/utils/notifications.ts`
```typescript
- requestNotificationPermission()
- showNotification(title, body)
- playSound(soundType)
```

### Shared Components

**File:** `Frontend/src/components/common/Timer.tsx`
- Reusable countdown/countup timer component

**File:** `Frontend/src/components/common/ColorPicker.tsx`
- Color selection for bookmarks

**File:** `Frontend/src/components/common/ConfirmDialog.tsx`
- Reusable confirmation modal

**File:** `Frontend/src/components/common/EmptyState.tsx`
- Empty state placeholder with icon and message

---

## 🎨 UI/UX Design Guidelines

### Design Principles
1. **Consistency**: Match existing StudAI design system
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Responsiveness**: Mobile-first approach
4. **Performance**: Lazy load components, virtualize long lists

### Color Palette
- Primary: Use existing app primary color
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Streak Fire: #FF6B6B

### Typography
- Use existing font family
- Timer: Large, bold, monospace
- Stats: Medium weight
- Messages: Regular weight

### Spacing
- Use Tailwind spacing scale
- Consistent padding/margins
- Card elevation: shadow-md

### Icons
- Use existing icon library (lucide-react or heroicons)
- 24px default size
- Consistent stroke width

---

## 🔧 Technical Implementation Details

### State Management Strategy

**Option 1: React Context (Recommended)**
- Lightweight, built-in
- Good for app-wide state
- Use separate contexts for each feature

**Option 2: Zustand**
- If already using it in project
- Better performance for complex state
- Easier testing

**Option 3: Redux**
- If already implemented
- Overkill for these features

### Data Fetching Strategy

**React Query (Recommended)**
```typescript
- useQuery for GET requests
- useMutation for POST/PATCH/DELETE
- Automatic caching and refetching
- Optimistic updates
- Error retry logic
```

**Example:**
```typescript
const { data: sessions } = useQuery({
  queryKey: ['studySessions', 'history'],
  queryFn: () => studySessionApi.getHistory(page, limit)
});
```

### Socket.IO Setup

```typescript
// Reuse existing Socket context
// Add study group event handlers
socket.on('group:new-message', handleNewMessage);
socket.on('group:member-typing', handleTyping);
```

### Local Storage Strategy

Store session state locally for persistence:
```typescript
localStorage:
  - activeSession: { id, startTime, type, courseId }
  - pomodoroSettings: { soundEnabled, workDuration, breakDuration }
  - chatDrafts: { [groupId]: messageText }
```

### Performance Optimizations

1. **Virtualization**: Use react-window for long lists
2. **Lazy Loading**: Code-split pages and heavy components
3. **Memoization**: Memo expensive calculations
4. **Debouncing**: Search, typing indicators
5. **Throttling**: Scroll events, resize events
6. **Image Optimization**: Compress avatars, lazy load

---

## 📱 Responsive Design Breakpoints

```css
Mobile: < 640px
  - Stack timer controls vertically
  - Hide sidebar, use drawer
  - Collapse statistics cards

Tablet: 640px - 1024px
  - Two-column layout
  - Collapsible sidebars
  - Touch-friendly buttons

Desktop: > 1024px
  - Three-column layout
  - Persistent sidebars
  - Hover interactions
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] API service functions
- [ ] Custom hooks logic
- [ ] Utility functions
- [ ] Component rendering

### Integration Tests
- [ ] Timer start/stop flow
- [ ] Bookmark CRUD operations
- [ ] Group chat message flow
- [ ] Socket.IO connection

### E2E Tests
- [ ] Start study session → view stats
- [ ] Create bookmark → navigate to it
- [ ] Create group → send message → receive message

### Manual Testing
- [ ] Timer accuracy over long durations
- [ ] Socket reconnection after network loss
- [ ] Concurrent group chats
- [ ] Mobile device testing

---

## 📊 Analytics Tracking

Track these events for product insights:

### Study Sessions
- `study_session_started` (type, courseId)
- `study_session_ended` (duration, type)
- `pomodoro_completed` (count)
- `streak_achieved` (days)

### Bookmarks
- `bookmark_created` (color, hasNote)
- `bookmark_navigated` (materialId)
- `bookmark_deleted`

### Study Groups
- `group_created` (memberCount)
- `group_joined` (viaInviteCode)
- `message_sent` (groupId, messageLength)
- `note_shared` (groupId, noteId)

---

## 🚀 Implementation Timeline

### Week 1: Study Sessions
- **Day 1-2**: API integration + hooks
- **Day 3-4**: Timer components + UI
- **Day 5**: Stats dashboard + calendar

### Week 2: Bookmarks
- **Day 1-2**: API integration + hooks
- **Day 3-4**: PDF viewer integration
- **Day 5**: Bookmark list page + polish

### Week 3: Study Groups
- **Day 1-2**: API + Socket.IO integration
- **Day 3-4**: Chat interface
- **Day 5**: Members management + settings

### Week 4: Polish & Testing
- **Day 1-2**: Bug fixes + edge cases
- **Day 3**: Testing + accessibility
- **Day 4-5**: Performance optimization + deployment

---

## 📚 Dependencies to Install

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",  // Data fetching
    "react-hot-toast": "^2.4.1",         // Notifications
    "recharts": "^2.10.0",               // Charts for stats
    "date-fns": "^3.0.0",                // Date formatting
    "react-window": "^1.8.10",           // List virtualization
    "lucide-react": "^0.300.0"           // Icons (if not already installed)
  }
}
```

---

## 🎯 Success Metrics

After implementation, track:

1. **Study Sessions**
   - Daily active sessions
   - Average session duration
   - Streak retention rate

2. **Bookmarks**
   - Bookmarks per user
   - Navigation to bookmarks (usage)
   - Bookmark notes ratio

3. **Study Groups**
   - Groups created per day
   - Messages per group
   - Active groups ratio
   - Member retention

---

## 📞 Support & Questions

For implementation questions:
1. Review `IMPLEMENTATION_SUMMARY.md` for backend API details
2. Test endpoints with `backend/StudAI-New-Features-Postman.json`
3. Check backend logs for Socket.IO connection issues

API Base URL:
- Development: `http://localhost:3000`
- Production: `https://studai-52kh.onrender.com`

---

## ✅ Pre-Implementation Checklist

Before starting frontend work:
- [ ] Backend deployed and accessible
- [ ] Database migration completed
- [ ] API endpoints tested via Postman
- [ ] Socket.IO connection working
- [ ] JWT authentication understood
- [ ] Design mockups reviewed
- [ ] Component library decisions made
- [ ] State management strategy agreed
- [ ] Team roles assigned

---

## 🎉 Post-Implementation

After all features are complete:
1. Update main README with new features
2. Record demo videos for each feature
3. Update user documentation
4. Create feature announcement
5. Monitor analytics for adoption
6. Gather user feedback
7. Plan iterations based on feedback

---

**Good luck with the implementation! 🚀**

For questions or clarifications, refer to the backend implementation files or reach out to the backend team.
