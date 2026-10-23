# Migration Guide - Study Features Implementation

## Overview
This guide helps you apply the database migrations for the three new features:
1. Study Sessions & Pomodoro Timer
2. PDF Bookmarks
3. Study Groups

## Prerequisites
- Ensure your database is running and accessible
- Backend environment variables are configured in `backend/.env`
- Node.js and npm are installed

## Step 1: Apply Database Migration

Open a terminal/command prompt and run:

```bash
cd backend
npx prisma migrate dev --name add_study_features
```

If npx doesn't work due to PowerShell execution policy, use:

```bash
node node_modules/prisma/build/index.js migrate dev --name add_study_features
```

This will:
- Create new tables: `StudySession`, `StudyStreak`, `Bookmark`, `StudyGroup`, `StudyGroupMember`, `GroupMessage`, `GroupSharedNote`
- Add new enums: `SessionType`, `SessionStatus`, `GroupMemberRole`, `MessageType`
- Add relations to existing `Student` and `Note` models

## Step 2: Generate Prisma Client

After migration succeeds, generate the updated Prisma client:

```bash
npx prisma generate
```

Or:

```bash
node node_modules/prisma/build/index.js generate
```

## Step 3: Verify Migration

Check that all tables were created:

```bash
npx prisma studio
```

You should see the new tables in Prisma Studio.

## Step 4: Restart Your Backend

After migration, restart your backend server:

```bash
npm start
```

Or if using nodemon:

```bash
npm run dev
```

## Step 5: Test the New Endpoints

### Test Study Sessions

**Start a session:**
```bash
POST /api/v1/student/study-sessions/start
{
  "type": "POMODORO",
  "courseId": "your-course-id"
}
```

**Get active session:**
```bash
GET /api/v1/student/study-sessions/active
```

**Get streak:**
```bash
GET /api/v1/student/study-sessions/streak
```

### Test Bookmarks

**Create bookmark:**
```bash
POST /api/v1/student/materials/:materialId/bookmarks
{
  "name": "Important Section",
  "pageNumber": 5,
  "color": "yellow"
}
```

**Get bookmarks:**
```bash
GET /api/v1/student/materials/:materialId/bookmarks
```

### Test Study Groups

**Create group:**
```bash
POST /api/v1/student/study-groups
{
  "name": "Calculus Study Group",
  "subject": "Mathematics"
}
```

**Join group:**
```bash
POST /api/v1/student/study-groups/join
{
  "inviteCode": "ABC12345"
}
```

**Get my groups:**
```bash
GET /api/v1/student/study-groups
```

## Step 6: Test Socket.IO Events

Connect to Socket.IO and test group messaging:

**Join group room:**
```javascript
socket.emit('join:group', groupId);
```

**Send message:**
```javascript
socket.emit('group:message', {
  groupId: 'group-id',
  content: 'Hello everyone!'
});
```

**Listen for new messages:**
```javascript
socket.on('group:new-message', (message) => {
  console.log('New message:', message);
});
```

## Troubleshooting

### Migration Fails
- Check database connection in `.env`
- Ensure DATABASE_URL is correct
- Verify database is running

### Prisma Client Not Found
- Run `npx prisma generate` again
- Restart your IDE/editor
- Clear node_modules and reinstall

### Socket.IO Not Working
- Verify Redis is running (required for Socket.IO adapter)
- Check REDIS_URL in `.env`
- Ensure JWT_SECRET is configured

### Rate Limiting Issues
- Study groups have rate limiting: 10 messages per minute per user
- If testing, wait 1 minute between bursts of messages

## Performance Notes

### Redis Caching
These features use Redis for caching:
- Active sessions: 1 hour TTL
- Streak data: 5 minutes TTL
- Bookmarks: 5 minutes TTL (per material)
- Study groups: 5 minutes TTL

Ensure Redis is running for optimal performance.

### Database Indexes
The migration adds indexes on:
- `StudySession`: `(studentId, status)`, `(studentId, startTime)`
- `StudyStreak`: `(studentId)`
- `Bookmark`: `(studentId, materialId)`, `(materialId)`
- `StudyGroup`: `(inviteCode)`, `(createdById)`
- `StudyGroupMember`: `(studyGroupId, studentId)`, `(studentId)`
- `GroupMessage`: `(studyGroupId, createdAt)`, `(senderId)`

## Deployment to Production

### 1. Update Production Database

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Run migration
npx prisma migrate deploy
```

### 2. Verify Environment Variables

Ensure these are set in production:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- All other existing variables

### 3. Restart Production Server

After migration, restart your production server (Render, Railway, etc.)

### 4. Monitor Logs

Watch for:
- Socket.IO connection logs
- Redis connection status
- Migration success messages
- Any Prisma client errors

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
npx prisma migrate resolve --rolled-back add_study_features
```

Then fix issues and re-run the migration.

## Next Steps

1. Update frontend to consume new APIs
2. Build UI components for:
   - Study timer with Pomodoro mode
   - Bookmark management
   - Study group chat interface
3. Add analytics tracking for new features
4. Monitor performance and cache hit rates

## Support

If you encounter issues:
1. Check logs in `backend/logs`
2. Verify database connection
3. Ensure Redis is running
4. Review Prisma schema for conflicts
5. Check that all imports are correct in new modules
