# ✅ Deployment Checklist

## Pre-Deployment Verification

### Backend Checks
- [ ] All environment variables set in `.env`
- [ ] Database connection working
- [ ] All migrations applied
- [ ] Seed data loaded
- [ ] All API endpoints tested
- [ ] CORS configured correctly
- [ ] Email service working
- [ ] Google OAuth configured
- [ ] JWT secrets are secure
- [ ] Refresh tokens working
- [ ] Error handling tested

### Frontend Checks
- [ ] Environment variables set
- [ ] API base URL configured
- [ ] Google Client ID set
- [ ] All pages render correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Routing works
- [ ] Authentication works
- [ ] Protected routes work
- [ ] Email verification works
- [ ] Onboarding works
- [ ] Course selection works

### Security Checks
- [ ] Passwords are hashed
- [ ] Tokens are secured
- [ ] httpOnly cookies enabled
- [ ] CORS properly configured
- [ ] Input validation working
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] No secrets in code
- [ ] Environment variables used
- [ ] HTTPS in production

### Database Checks
- [ ] All tables exist
- [ ] Indexes created
- [ ] Relationships correct
- [ ] Sample data loaded
- [ ] Backup strategy in place
- [ ] Connection pooling enabled

## Deployment Steps

### 1. Backend Deployment

#### Option A: Vercel
```bash
cd backend
npm install -g vercel
vercel
```

#### Option B: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway up
```

#### Option C: Render
1. Go to render.com
2. New → Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables

### 2. Frontend Deployment

#### Option A: Vercel
```bash
cd Frontend
npm run build
vercel --prod
```

#### Option B: Netlify
```bash
cd Frontend
npm run build
netlify deploy --prod --dir=dist
```

#### Option C: Cloudflare Pages
1. Go to Cloudflare Dashboard
2. Pages → Create Project
3. Connect GitHub
4. Build command: `npm run build`
5. Build output: `dist`

### 3. Database (Neon)
- [ ] Already deployed ✅
- [ ] Connection string in backend env
- [ ] Backups enabled
- [ ] Monitoring enabled

### 4. Environment Variables

#### Backend Production
```env
DATABASE_URL=your-production-db-url
DIRECT_URL=your-production-direct-url
JWT_SECRET=your-secure-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_EXPIRES_IN=15m
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-app-password
EMAIL_FROM=StudAI <no-reply@studai.et>
GOOGLE_CLIENT_ID=your-google-client-id
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

#### Frontend Production
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 5. Post-Deployment

#### Backend Health Check
```bash
curl https://your-backend-domain.com/health
```

#### Frontend Health Check
- Visit: https://your-frontend-domain.com
- Check: All pages load
- Check: Assets load correctly

#### Database Health Check
```bash
# Run migrations
npx prisma migrate deploy

# Check connection
npx prisma studio
```

## Testing in Production

### 1. Registration Flow
- [ ] Can register new user
- [ ] Verification email received
- [ ] Email link works
- [ ] Auto-login works
- [ ] Redirects correctly

### 2. Onboarding Flow
- [ ] Step 1: Universities load
- [ ] Step 2: Departments load
- [ ] Step 3: Year/Semester selection works
- [ ] Step 4: Courses load
- [ ] Submission works
- [ ] Profile created
- [ ] Redirects to dashboard

### 3. Authentication
- [ ] Login works
- [ ] Google OAuth works
- [ ] Logout works
- [ ] Token refresh works
- [ ] Session persists

### 4. Security
- [ ] HTTPS enabled
- [ ] Tokens secured
- [ ] Cookies httpOnly
- [ ] CORS configured
- [ ] No sensitive data in logs

## Monitoring Setup

### Backend Monitoring
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring
- [ ] API response times
- [ ] Database query performance
- [ ] Email delivery rates

### Frontend Monitoring
- [ ] Error tracking
- [ ] Page load times
- [ ] User flows
- [ ] Browser console errors

### Database Monitoring
- [ ] Connection pool usage
- [ ] Query performance
- [ ] Storage usage
- [ ] Backup status

## Rollback Plan

### If Deployment Fails

1. **Backend Issues:**
   ```bash
   # Rollback to previous version
   git revert HEAD
   git push
   ```

2. **Frontend Issues:**
   ```bash
   # Rollback deployment
   vercel rollback
   # or
   netlify rollback
   ```

3. **Database Issues:**
   ```bash
   # Restore from backup
   # Contact Neon support if needed
   ```

## Success Criteria

Deployment is successful if:
- [ ] All endpoints return 200 OK
- [ ] No 500 errors in logs
- [ ] Users can register
- [ ] Email verification works
- [ ] Onboarding completes
- [ ] Authentication works
- [ ] Performance is acceptable
- [ ] No security issues
- [ ] Mobile responsive
- [ ] Cross-browser compatible

## Post-Deployment Tasks

### Immediate (First 24 Hours)
- [ ] Monitor error logs
- [ ] Check email delivery
- [ ] Test all user flows
- [ ] Verify database performance
- [ ] Check API response times

### Short Term (First Week)
- [ ] Collect user feedback
- [ ] Monitor analytics
- [ ] Fix any issues
- [ ] Optimize performance
- [ ] Update documentation

### Long Term (First Month)
- [ ] Review usage patterns
- [ ] Optimize database
- [ ] Add new features
- [ ] Scale if needed
- [ ] Update dependencies

## Emergency Contacts

- **Backend Issues:** [Your contact]
- **Frontend Issues:** [Your contact]
- **Database Issues:** Neon Support
- **Email Issues:** SMTP Provider Support
- **Domain Issues:** Domain Registrar

## Maintenance Schedule

- **Daily:** Check logs for errors
- **Weekly:** Review performance metrics
- **Monthly:** Update dependencies
- **Quarterly:** Security audit

---

**Prepared By:** Development Team  
**Date:** August 5, 2026  
**Version:** 1.0
