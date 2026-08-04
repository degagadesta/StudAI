# Migration Instructions - Add Refresh Token

## Quick Start

Run this command in the `backend` directory:

```bash
node migrate-refresh-token.js
```

## Alternative: Manual Prisma Migration

If the script doesn't work, run:

```bash
npx prisma migrate dev --name add_refresh_token
npx prisma generate
```

## Alternative: Direct SQL (if Prisma commands hang)

Connect to your PostgreSQL database and run:

```sql
ALTER TABLE "Student" 
ADD COLUMN IF NOT EXISTS "refreshToken" TEXT,
ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Student_refreshToken_key" 
ON "Student"("refreshToken");
```

## After Migration

Once the migration is complete, regenerate the Prisma client:

```bash
npx prisma generate
```

Then restart your server:

```bash
node server.js
```

## Verify Migration

You can verify the migration worked by checking if the error about `refreshToken` is gone when you try to login.

The error should change from:
```
Unknown argument `refreshToken`. Available options are marked with ?.
```

To successful login with accessToken and refreshToken returned.
