# Database Migration Fix Guide

## Issue
Migration `20260101000000_add_payment_and_subscription_tracking` is failing because it references an enum that doesn't exist in the shadow database.

## Current Error
```
Error: P3006
Migration `20260101000000_add_payment_and_subscription_tracking` failed to apply cleanly
Database error: ERROR: type "subscriptionPlan" does not exist
```

## Root Cause
The migration tries to alter the `subscriptionPlan` enum, but Prisma's shadow database doesn't have this enum created yet, causing the migration to fail.

## Solutions (Try in Order)

### Solution 1: Fix Database Connection First

The database at `ep-damp-dawn-azsikabb-pooler.c-3.ap-southeast-1.aws.neon.tech` is not reachable.

**Check:**
1. Is your internet connection working?
2. Is the Neon database running?
3. Is the DATABASE_URL correct in `.env`?
4. Try accessing the database from Neon dashboard

**Test connection:**
```bash
cd backend
node node_modules/prisma/build/index.js db execute --stdin < nul
```

If connection fails, check your Neon dashboard and ensure the database is active.

---

### Solution 2: Use `db push` Instead of Migrate (RECOMMENDED)

Once database is accessible, bypass migration issues with:

```bash
cd backend
node node_modules/prisma/build/index.js db push --skip-generate
node node_modules/prisma/build/index.js generate
```

This will:
- Sync your schema directly to the database
- Skip the problematic migration
- Work with existing data

**Advantages:**
- No migration files needed
- Fixes enum issues automatically
- Safe for development

**Note:** This is perfect for development. For production, use proper migrations.

---

### Solution 3: Delete Problematic Migration (If Solution 2 Doesn't Work)

If `db push` still fails, delete the bad migration and recreate:

```bash
# 1. Delete the problematic migration folder
rmdir /s backend\prisma\migrations\20260101000000_add_payment_and_subscription_tracking

# 2. Create a new baseline migration
cd backend
node node_modules/prisma/build/index.js migrate dev --name baseline
```

This creates a fresh migration from your current schema.

---

### Solution 4: Reset and Rebuild (LAST RESORT - DELETES DATA)

**⚠️ WARNING: This will delete all data in your database!**

Only use if database is empty or you have backups:

```bash
cd backend
node node_modules/prisma/build/index.js migrate reset
node node_modules/prisma/build/index.js migrate dev --name init
```

---

## Recommended Approach for Your Situation

### Step 1: Fix Database Connection

1. Open Neon dashboard: https://console.neon.tech/
2. Check if your database is active
3. If suspended, wake it up
4. Verify connection string in `backend/.env`

### Step 2: Use `db push`

Once connected, run:

```bash
cd backend
node node_modules/prisma/build/index.js db push
node node_modules/prisma/build/index.js generate
```

### Step 3: Verify

```bash
node node_modules/prisma/build/index.js studio
```

Check that all new tables exist:
- StudySession
- StudyStreak
- Bookmark
- StudyGroup
- StudyGroupMember
- GroupMessage
- GroupSharedNote

### Step 4: Start Backend

```bash
npm start
```

---

## Alternative: Deploy to Production Without Local Migration

If local database is inaccessible, you can deploy directly to production:

### For Render Deployment

1. Push code to GitHub:
```bash
git add .
git commit -m "Add study features"
git push
```

2. In Render dashboard, trigger manual deploy

3. Render will automatically run:
```bash
npm install
npx prisma generate
```

4. After deployment, run migration in Render shell:
```bash
npx prisma db push
```

---

## Verification Checklist

After successful migration:

- [ ] Database connection works
- [ ] All new tables created
- [ ] All new enums exist (GroupMemberRole, MessageType, SessionType, SessionStatus)
- [ ] Student model has new relations
- [ ] Note model has sharedInGroups relation
- [ ] Prisma client generated successfully
- [ ] Backend starts without errors
- [ ] Can create a study session via API
- [ ] Can create a bookmark via API
- [ ] Can create a study group via API

---

## Testing New Features

### Test Study Sessions
```bash
# Using PowerShell
$token = "your-jwt-token"
$headers = @{ "Authorization" = "Bearer $token" }
$body = @{ type = "POMODORO" } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/student/study-sessions/start" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Test Bookmarks
```bash
$body = @{ 
    name = "Test Bookmark"
    pageNumber = 5
    color = "yellow"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/student/materials/{materialId}/bookmarks" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Test Study Groups
```bash
$body = @{ 
    name = "Test Group"
    subject = "Mathematics"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/student/study-groups" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## If All Else Fails

Contact me with:
1. Full error message
2. Database provider (Neon, Supabase, etc.)
3. Whether database is accessible
4. Output of: `node node_modules/prisma/build/index.js --version`

---

## Quick Reference

**Check connection:**
```bash
node node_modules/prisma/build/index.js db execute --stdin < nul
```

**Sync schema (RECOMMENDED):**
```bash
node node_modules/prisma/build/index.js db push
```

**Generate client:**
```bash
node node_modules/prisma/build/index.js generate
```

**View database:**
```bash
node node_modules/prisma/build/index.js studio
```

**Create migration (if db push works):**
```bash
node node_modules/prisma/build/index.js migrate dev --name add_study_features
```
