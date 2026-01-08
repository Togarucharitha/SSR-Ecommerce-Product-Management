# ✅ Railway Deployment Checklist - CDC eCommerce Dashboard

**Project:** CDC eCommerce Dashboard  
**Platform:** Railway  
**Database:** Neon PostgreSQL (External)  
**Last Updated:** January 8, 2026

---

## 📋 Pre-Deployment (Local Setup)

### **1. Application Readiness**

- [ ] Code compiles locally: `npm run build` ✅
- [ ] No TypeScript errors
- [ ] All tests pass (if applicable)
- [ ] Dev server works: `npm run dev` ✅
- [ ] Authentication tested locally ✅
- [ ] Database queries tested locally ✅

### **2. Database Preparation**

- [ ] Neon project running at https://console.neon.tech
- [ ] Connection string copied (includes `.pooler.` endpoint)
- [ ] SSL options verified (`sslmode=require&channel_binding=require`)
- [ ] Migrations ready: `npx prisma migrate deploy` works locally
- [ ] Schema valid: `npx prisma generate` succeeds
- [ ] Sample data seeded (if needed)

### **3. Environment Configuration**

- [ ] `.env` file created locally (NOT in Git)
- [ ] All variables configured:
  - [ ] `DATABASE_URL` (Neon with SSL)
  - [ ] `JWT_SECRET` (strong, random)
  - [ ] `JWT_EXPIRES_IN` (7d)
  - [ ] `DEFAULT_ADMIN_EMAIL` (your email)
  - [ ] `DEFAULT_ADMIN_PASSWORD` (strong)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `NODE_ENV` (production for testing)

- [ ] `.env` is in `.gitignore`
- [ ] Verify with: `git check-ignore .env` (should output `.env`)

### **4. Package & Build Configuration**

- [ ] `package.json` has correct scripts:
  - [ ] `"build": "next build"` ✅
  - [ ] `"start": "next start"` ✅
  - [ ] `"dev": "next dev"` ✅

- [ ] `tsconfig.json` has correct paths:
  - [ ] `"baseUrl": "."` ✅
  - [ ] `"@/*": ["./app/*", "./lib/*"]` ✅

- [ ] `next.config.js` configured properly:
  - [ ] Image domains set (cloudinary.com)
  - [ ] No conflicting settings

- [ ] `railway.json` created in root:
  ```json
  {
    "preDeployCommands": [
      "npx prisma generate",
      "npx prisma migrate deploy"
    ]
  }
  ```

### **5. Git Repository**

- [ ] Repository is public or Railway has access
- [ ] All changes committed: `git status` shows clean ✅
- [ ] `.env` NOT committed
- [ ] `node_modules/` NOT committed
- [ ] All code pushed to main branch: `git push origin main` ✅
- [ ] No uncommitted changes: `git log --oneline -1` shows latest

### **6. Prisma Configuration**

- [ ] Prisma client generated: `npx prisma generate` ✅
- [ ] Schema valid: `npx prisma validate` ✅
- [ ] Migrations created: `ls prisma/migrations/` shows migrations
- [ ] Migrations apply: `npx prisma migrate deploy` works ✅
- [ ] Default admin created: `CREATE TABLE` should create users table
- [ ] Ready for Railway: `npm run build` + `npm start` works ✅

---

## 🚂 Railway Setup (Create Project)

### **7. Railway Account & Project**

- [ ] Railway account created at https://railway.app
- [ ] GitHub account connected to Railway
- [ ] New project created
- [ ] GitHub repository selected
- [ ] Railway detected Next.js framework

### **8. Service Configuration**

- [ ] Next.js service created automatically
- [ ] Service name visible in dashboard
- [ ] Build command set: `npm run build` ✅
- [ ] Start command set: `npm start` ✅
- [ ] Watch paths configured (optional):
  - [ ] `src,lib,app,prisma,package.json,next.config.js`

### **9. Environment Variables Setup**

In Railway Dashboard → Variables tab:

**Database (CRITICAL)**
- [ ] `DATABASE_URL` = `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require&channel_binding=require`
  - Verified: `.pooler.` present ✅
  - Verified: `sslmode=require` present ✅
  - Verified: `channel_binding=require` present ✅

**Authentication**
- [ ] `JWT_SECRET` = [strong random string 32+ chars]
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `NEXTAUTH_SECRET` = [strong random string]

**Admin**
- [ ] `DEFAULT_ADMIN_EMAIL` = [your email]
- [ ] `DEFAULT_ADMIN_PASSWORD` = [strong password]
- [ ] `DEFAULT_ADMIN_NAME` = `Administrator`

**External Services**
- [ ] `CLOUDINARY_CLOUD_NAME` = [from Cloudinary]
- [ ] `CLOUDINARY_API_KEY` = [from Cloudinary]
- [ ] `CLOUDINARY_API_SECRET` = [from Cloudinary]
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = [Cloud name]

**URLs & Environment**
- [ ] `NEXT_PUBLIC_SITE_URL` = [to be filled after deployment]
- [ ] `NODE_ENV` = `production`

### **10. Regional Settings**

- [ ] Region selected (closest to Neon: ap-south1 or us-east1)
- [ ] Memory allocated: 512MB (sufficient)
- [ ] CPU allocation: default
- [ ] Auto-deploy enabled (recommended)

---

## 🚀 Deployment Phase

### **11. Trigger Deployment**

- [ ] Push code to GitHub:
  ```bash
  git push origin main
  ```
  
- OR manually trigger via Railway:
  - [ ] Go to Deployments tab
  - [ ] Click "Deploy" button
  - [ ] Select branch: main
  - [ ] Click "Deploy Now"

- [ ] Deployment started (visible in dashboard)

### **12. Monitor Build Phase**

Watch logs in Railway dashboard:

```
⏳ Installing dependencies...
✅ npm install complete

⏳ Running pre-deploy commands...
✅ npx prisma generate complete
✅ npx prisma migrate deploy complete

⏳ Building application...
✅ npm run build complete
✅ Build artifact created

⏳ Preparing deployment...
✅ Ready to start
```

- [ ] No build errors
- [ ] No dependency issues
- [ ] No TypeScript errors
- [ ] Prisma generate succeeded
- [ ] Migrations deployed successfully

### **13. Monitor Startup Phase**

Watch logs as app starts:

```
⏳ Starting application...
✅ [prisma] Client initialized successfully
✅ [createDefaultAdminIfMissing] Default admin created: admin@example.com
✅ ready - started server on 0.0.0.0:PORT

✅ DEPLOYMENT COMPLETE
```

- [ ] Prisma client initialized
- [ ] Default admin created
- [ ] Server started successfully
- [ ] No startup errors
- [ ] No connection errors
- [ ] App listening on PORT

### **14. Get Railway App URL**

- [ ] Go to your Next.js service
- [ ] Find "Service URL" or "Domain"
- [ ] Copy the URL: `https://your-app.up.railway.app`
- [ ] Update `NEXT_PUBLIC_SITE_URL` variable with this URL
- [ ] Save (Railway auto-redeploys)

---

## ✅ Post-Deployment Testing

### **15. Basic App Health Checks**

```bash
# Get your Railway URL
RAILWAY_URL="https://your-app.up.railway.app"

# Test 1: App responds
curl $RAILWAY_URL

# Expected: HTML response, no 502/503 error

# Test 2: Homepage loads
curl -s $RAILWAY_URL | grep -i "title" | head -1

# Expected: Page title in HTML
```

- [ ] App responds to HTTP requests
- [ ] No 502 Bad Gateway errors
- [ ] No 503 Service Unavailable
- [ ] HTML page loads

### **16. Authentication Testing**

```bash
RAILWAY_URL="https://your-app.up.railway.app"

# Test login with default admin
curl -X POST $RAILWAY_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Expected response:
# {
#   "success": true,
#   "token": "eyJhbGc...",
#   "user": {
#     "id": "...",
#     "email": "admin@example.com",
#     "role": "admin"
#   }
# }
```

- [ ] Login endpoint responds
- [ ] Returns success: true
- [ ] JWT token generated
- [ ] User role: admin
- [ ] Can copy token for further testing

### **17. Dashboard Access Testing**

```bash
# With token from previous test
TOKEN="your-jwt-token-here"

curl -X GET $RAILWAY_URL/dashboard \
  -H "Cookie: auth-token=$TOKEN"

# Expected: HTML page with dashboard content
```

Or via browser:
- [ ] Go to `https://your-app.up.railway.app/login`
- [ ] Enter: email = `admin@example.com`, password = `admin123`
- [ ] Click "Login"
- [ ] Should redirect to `/dashboard`
- [ ] Dashboard displays with:
  - [ ] Products list
  - [ ] Create product button
  - [ ] Metrics section
  - [ ] Admin links

### **18. Database & Prisma Testing**

```bash
# Check logs for any database errors
railway logs --tail | grep -i "error"

# Should be empty or only non-critical warnings
```

In-app verification:
- [ ] Products load on dashboard
- [ ] Can create new product
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] All operations persist (refresh and verify)

### **19. Authorization Testing**

Test that unauthorized users are blocked:

```bash
# Test without token (should 401)
curl -X GET $RAILWAY_URL/api/admin/users

# Expected: 401 Unauthorized
```

In browser:
- [ ] Without login, cannot access `/dashboard` (redirects to `/login`)
- [ ] Without login, `/api/admin/*` returns 401
- [ ] With user token (not admin), cannot access admin endpoints

### **20. Cloudinary Integration Testing** (if images feature exists)

- [ ] Try uploading a product image
- [ ] Image uploads successfully
- [ ] Image displays in product detail
- [ ] Image serves from cloudinary.com CDN

### **21. API Endpoints Testing**

```bash
TOKEN="your-jwt-token"
RAILWAY_URL="https://your-app.up.railway.app"

# Test 1: Get current user
curl $RAILWAY_URL/api/auth/me \
  -H "Cookie: auth-token=$TOKEN"

# Expected: Current user details

# Test 2: Get all products
curl $RAILWAY_URL/api/products

# Expected: Array of products (no auth needed)

# Test 3: Create product (admin only)
curl -X POST $RAILWAY_URL/api/products \
  -H "Cookie: auth-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test",
    "price": 99.99,
    "stock": 10,
    "category": "electronics"
  }'

# Expected: Product created successfully
```

- [ ] GET /api/products - Works
- [ ] POST /api/products - Works (admin)
- [ ] GET /api/auth/me - Works (with auth)
- [ ] GET /dashboard - Works (redirects if not auth)
- [ ] All endpoints respond correctly

---

## 🛡️ Production Readiness Checks

### **22. Security Verification**

- [ ] No secrets exposed in logs:
  ```bash
  railway logs --tail | grep -i "password\|secret\|key"
  
  # Should return NOTHING or only non-sensitive values
  ```

- [ ] HTTPS only (no HTTP):
  ```bash
  # Verify all URLs use https://
  # Check browser shows padlock icon
  ```

- [ ] Authentication secure:
  - [ ] Passwords hashed (bcryptjs) ✅
  - [ ] JWT tokens signed ✅
  - [ ] HTTP-only cookies ✅
  - [ ] CORS configured if needed ✅

- [ ] Environment variables secure:
  - [ ] Secrets NOT in code
  - [ ] Secrets NOT in logs
  - [ ] Secrets stored in Railway Variables only
  - [ ] .env NOT committed

- [ ] Database secure:
  - [ ] Connection uses SSL ✅
  - [ ] Channel binding required ✅
  - [ ] Using connection pooling ✅

### **23. Error Handling Verification**

- [ ] 404 errors are friendly
- [ ] 401 errors don't expose sensitive info
- [ ] 403 errors are clear
- [ ] 500 errors show generic message (not stack trace)
- [ ] Logs don't contain stack traces (production level)

### **24. Performance Check**

```bash
# Test response times
time curl $RAILWAY_URL/api/products

# Should be < 1 second for most endpoints
```

- [ ] Home page loads < 2s
- [ ] API responses < 1s
- [ ] Dashboard loads < 3s
- [ ] No obvious performance issues

### **25. Data Persistence Check**

- [ ] Create a test product
- [ ] Refresh browser (F5)
- [ ] Product still exists ✅
- [ ] Login, logout, login again
- [ ] Data preserved ✅

### **26. Monitoring & Logging**

```bash
# Check logs are healthy
railway logs --tail

# Expected:
# - Only errors/important messages (not debug spam)
# - No repeated error patterns
# - Server stable (no random crashes)
```

- [ ] Logs are accessible
- [ ] No error loops
- [ ] No memory leaks (memory usage stable)
- [ ] No connection pool warnings

---

## 🎯 Sign-Off Checklist

### **27. Final Verification**

- [ ] **All tests passed** ✅
- [ ] **No 502 errors** ✅
- [ ] **Login works** ✅
- [ ] **Dashboard accessible** ✅
- [ ] **Database connected** ✅
- [ ] **Secrets secure** ✅
- [ ] **Performance acceptable** ✅

### **28. Documentation**

- [ ] Deployment documented
- [ ] Environment variables documented
- [ ] Railway project URL documented
- [ ] Troubleshooting guide available
- [ ] Team notified of deployment

### **29. Post-Deployment Monitoring** (First Week)

- [ ] Day 1: Check logs multiple times
- [ ] Day 1: Test all features
- [ ] Day 2-3: Monitor for any issues
- [ ] Day 4-7: Regular check-ins
- [ ] Report any issues to team

---

## 🚨 If Something Goes Wrong

### **Immediate Actions**

1. **Check Logs**
   ```bash
   railway logs --tail | grep -i "error"
   ```

2. **Identify Issue**
   - Use troubleshooting guide: `RAILWAY_TROUBLESHOOTING.md`
   - Match error to common causes

3. **Fix Locally**
   ```bash
   npm run build
   npm start
   # Verify fix works
   ```

4. **Deploy Fix**
   ```bash
   git commit -m "fix: [description]"
   git push origin main
   # Monitor new deployment
   ```

5. **Monitor**
   ```bash
   railway logs --tail
   # Wait for app to stabilize (2-3 mins)
   ```

### **Rollback if Critical**

If deployment is broken beyond quick fix:

```bash
# Rollback to previous deployment
railway logs --deployment

# Find previous working deployment ID
railway rollback <deployment-id>

# Verify app works
# Then: Fix issue locally and redeploy
```

---

## 📊 Success Metrics

**Your deployment is successful if:**

| Metric | Status | Notes |
|--------|--------|-------|
| **App Responds** | ✅ | No 502/503 errors |
| **Database Connected** | ✅ | Can query tables |
| **Login Works** | ✅ | JWT generated |
| **Dashboard Loads** | ✅ | Products display |
| **Admin Features** | ✅ | Create/edit/delete work |
| **Unauthorized Protected** | ✅ | 401 for unauthenticated |
| **Secrets Secure** | ✅ | None exposed in logs |
| **Performance OK** | ✅ | Response times < 2s |
| **Logs Healthy** | ✅ | No error loops |
| **Data Persists** | ✅ | Survives refresh/restart |

---

## 🎉 You're Live!

```
✅ Deployment Complete
✅ Tests Passed
✅ App Running on Railway
✅ Database Connected (Neon)
✅ Authentication Working
✅ All Systems Operational

🚀 CDC eCommerce Dashboard is LIVE on Railway!
```

**Next Steps:**
1. ✅ Share app URL with team
2. ✅ Monitor logs daily (first week)
3. ✅ Set up regular backups (handled by Neon)
4. ✅ Plan for scaling (if needed)
5. ✅ Schedule security reviews

---

## 📞 Support Resources

**Stuck?**
1. Check `RAILWAY_TROUBLESHOOTING.md`
2. Review `RAILWAY_ENVIRONMENT_VARIABLES.md`
3. Check `RAILWAY_DEPLOYMENT_GUIDE.md`
4. Review logs: `railway logs --tail`

**Railway Docs:** https://docs.railway.app  
**Railway Discord:** https://discord.gg/railway  
**Neon Docs:** https://neon.tech/docs  
**Next.js Docs:** https://nextjs.org/docs  
**Prisma Docs:** https://prisma.io/docs

---

## 📝 Deployment Record

| Item | Value | Status |
|------|-------|--------|
| **Project** | CDC eCommerce Dashboard | ✅ |
| **Platform** | Railway | ✅ |
| **Database** | Neon PostgreSQL | ✅ |
| **URL** | https://[your-app].up.railway.app | 📝 Update |
| **Deploy Date** | [Date] | 📝 Update |
| **Deployed By** | [Name] | 📝 Update |
| **Initial Status** | Live | ✅ |

---

*This checklist was last updated: January 8, 2026*  
*Next review: [Set date for first week post-deployment]*
