# Deploy Migration to Production

Since your local machine cannot connect to the database but your production server can, we'll run the migration in production.

## Option 1: Run Migration on Render (RECOMMENDED)

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Add study features: sessions, bookmarks, and groups"
git push origin main
```

### Step 2: Deploy to Render

Render will automatically deploy when you push to GitHub.

### Step 3: Access Render Shell

1. Go to your Render dashboard: https://dashboard.render.com/
2. Click on your backend service
3. Click **"Shell"** tab in the top menu
4. This opens a terminal connected to your server

### Step 4: Run Migration in Render Shell

In the Render shell, run:

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

This will:
- Add all new tables to your production database
- Generate the Prisma client with new models
- Skip the problematic migration

### Step 5: Restart Service

Render will auto-restart after the command completes.

---

## Option 2: Use Render Deploy Hook

### Create a one-time migration script:

Create `backend/migrate-prod.sh`:

```bash
#!/bin/bash
npx prisma db push --accept-data-loss
npx prisma generate
echo "Migration complete!"
```

Then in Render:
1. Go to your service settings
2. Change Start Command temporarily to: `bash migrate-prod.sh && npm start`
3. Save and deploy
4. After successful deployment, change back to: `npm start`

---

## Option 3: Direct SQL Execution (Advanced)

If Render shell doesn't work, you can run the SQL directly in Neon:

### Step 1: Generate SQL from Schema

Run locally (this doesn't need DB connection):

```bash
node node_modules/prisma/build/index.js migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

### Step 2: Execute in Neon Console

1. Go to Neon console: https://console.neon.tech/
2. Open your database
3. Go to SQL Editor
4. Copy/paste the SQL from `migration.sql`
5. Execute

---

## What Will Be Created

The migration adds these tables:

```sql
-- Study Sessions
CREATE TABLE "StudySession" (...)
CREATE TABLE "StudyStreak" (...)

-- Bookmarks  
CREATE TABLE "Bookmark" (...)

-- Study Groups
CREATE TABLE "StudyGroup" (...)
CREATE TABLE "StudyGroupMember" (...)
CREATE TABLE "GroupMessage" (...)
CREATE TABLE "GroupSharedNote" (...)

-- Enums
CREATE TYPE "SessionType" AS ENUM ('REGULAR', 'POMODORO');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "GroupMemberRole" AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'NOTE_SHARE', 'FLASHCARD_SHARE');

-- Relations
ALTER TABLE "Student" ADD COLUMNS for study features
ALTER TABLE "Note" ADD relations for sharing
```

---

## Verification After Deployment

### Test in Render Shell:

```bash
npx prisma studio
```

Or check tables exist:

```bash
npx prisma db execute --stdin <<EOF
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('StudySession', 'StudyStreak', 'Bookmark', 'StudyGroup');
EOF
```

### Test API Endpoints:

```bash
# Test Study Session
curl -X POST https://studai-52kh.onrender.com/api/v1/student/study-sessions/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"REGULAR"}'

# Test Bookmark
curl -X GET https://studai-52kh.onrender.com/api/v1/student/bookmarks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Study Group
curl -X POST https://studai-52kh.onrender.com/api/v1/student/study-groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group","subject":"Math"}'
```

---

## Troubleshooting

### If `prisma db push` fails in Render:

Try the migration command instead:

```bash
npx prisma migrate deploy
```

This will apply pending migrations without the shadow database issue.

### If you see "type does not exist" error:

The old migration `20260101000000_add_payment_and_subscription_tracking` is the problem.

Delete it before deploying:

```bash
rm -rf backend/prisma/migrations/20260101000000_add_payment_and_subscription_tracking
git add .
git commit -m "Remove problematic migration"
git push
```

Then run `prisma db push` in Render shell.

---

## Quick Fix Script

Save this as `backend/quick-migrate.js`:

```javascript
const { execSync } = require('child_process');

try {
  console.log('Running db push...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Migration complete!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
```

Run in Render shell:

```bash
node quick-migrate.js
```

---

## Why Local Connection Fails

Your local machine can't connect to Neon database because:

1. **Neon uses connection pooling** - may have IP restrictions
2. **Your ISP might block port 5432** (PostgreSQL)
3. **Firewall/VPN** blocking the connection
4. **Neon free tier** may limit concurrent connections

But your **deployed backend on Render CAN connect** because:
- Render is in a data center with reliable network
- No firewall restrictions
- Proper connection pooling setup

**Solution:** Always run database operations from your production server, not locally.

---

## Final Steps After Migration

1. ✅ Code pushed to GitHub
2. ✅ Deployed to Render  
3. ✅ Migration run in Render shell
4. ✅ Service restarted
5. ✅ Test endpoints with Postman
6. ✅ Verify tables in Neon console

Your new features will be live! 🎉
