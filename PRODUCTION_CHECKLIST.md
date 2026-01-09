# Production Deployment Checklist

## Pre-Deployment Setup

### Backend Configuration
- [ ] Set all required environment variables in production:
  - `DATABASE_URL` - PostgreSQL connection string with SSL
  - `BOT_TOKEN` - Telegram bot token
  - `NODE_ENV=production`
  - `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend origins
  - `PORT` (optional, defaults to 3001)

- [ ] Database Setup:
  - [ ] Run database migrations/schema setup
  - [ ] Verify database indexes are created
  - [ ] Test database connection with SSL
  - [ ] Set up database backups

- [ ] Security Verification:
  - [ ] Verify CORS origins are correctly configured (no wildcards in production)
  - [ ] Test rate limiting is working (100 req/15min, 60 taps/min)
  - [ ] Verify Telegram authentication is working
  - [ ] Test error handler doesn't leak sensitive information

### Frontend Configuration
- [ ] Set environment variables in deployment platform:
  - `NEXT_PUBLIC_BACKEND_URL` - Production backend API URL
  - `NEXT_PUBLIC_APP_URL` - Production frontend URL

- [ ] Build Verification:
  - [ ] Run `npm run build` locally to verify no build errors
  - [ ] Check build output for warnings
  - [ ] Verify all environment variables are being used correctly

### Telegram Bot Setup
- [ ] Configure bot with BotFather
- [ ] Set up Telegram Mini App:
  - [ ] Configure Web App URL
  - [ ] Set up bot commands
  - [ ] Configure bot description and about text
  - [ ] Upload bot profile picture

### TON Wallet Integration
- [ ] Verify TonConnect manifest is accessible at `/api/manifest`
- [ ] Test wallet connection flow
- [ ] Verify wallet addresses are being saved to database

## Deployment Steps

### Backend Deployment (Render/Railway/etc.)
1. [ ] Push code to Git repository
2. [ ] Connect repository to deployment platform
3. [ ] Configure environment variables
4. [ ] Deploy and verify logs
5. [ ] Test `/health` endpoint
6. [ ] Test API endpoints with production auth

### Frontend Deployment (Vercel/Netlify/etc.)
1. [ ] Push code to Git repository
2. [ ] Connect repository to deployment platform
3. [ ] Configure environment variables
4. [ ] Configure build settings (Next.js)
5. [ ] Deploy and verify build logs
6. [ ] Test deployed application

## Post-Deployment Verification

### Functional Testing
- [ ] Test user authentication via Telegram
- [ ] Test tap/mining functionality
- [ ] Test wallet connection and linking
- [ ] Test leaderboard loading
- [ ] Test profile page
- [ ] Verify data persistence across sessions

### Performance Testing
- [ ] Check page load times
- [ ] Verify API response times
- [ ] Test with multiple concurrent users
- [ ] Monitor database connection pool

### Security Testing
- [ ] Verify HTTPS is enforced
- [ ] Check security headers in browser DevTools
- [ ] Test CORS from unauthorized origins (should be blocked)
- [ ] Verify rate limiting kicks in
- [ ] Test with invalid Telegram auth data (should be rejected)

### Monitoring Setup
- [ ] Set up error logging/monitoring (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure database monitoring
- [ ] Set up alerts for critical errors

## Rollback Plan
- [ ] Document rollback procedure
- [ ] Keep previous deployment accessible
- [ ] Have database backup ready

## Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Document environment variables
- [ ] Create runbook for common issues

## Final Checks
- [ ] All tests passing
- [ ] No console errors in production
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed
- [ ] Performance metrics acceptable
- [ ] Security scan completed
