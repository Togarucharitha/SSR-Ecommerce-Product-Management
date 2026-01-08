# 🚂 Railway Deployment - Troubleshooting & Best Practices

**Date:** January 8, 2026  
**Application:** CDC eCommerce Dashboard  
**Deployment Platform:** Railway

---

## 🎯 Quick Troubleshooting Reference

### **Symptom: "502 Bad Gateway"**

**What It Means:** App crashed or isn't responding

**Diagnosis:**
```bash
railway logs --tail
# Look for error messages
```

**Common Causes & Fixes:**

| Cause | Symptoms | Fix |
|-------|----------|-----|
| Database connection failed | `[prisma] Failed to connect` | Verify DATABASE_URL has `.pooler.` endpoint |
| JWT_SECRET not set | `Cannot read property of undefined` | Add JWT_SECRET to Railway Variables |
| Out of memory | `FATAL: unable to allocate memory` | Upgrade Railway plan or optimize code |
| Build failed | `Build command failed` | Check build logs, verify `npm run build` works locally |

---

### **Symptom: "Login fails - 401 Unauthorized"**

**What It Means:** Token verification failed or admin not created

**Diagnosis:**

```bash
# Check if admin was created
railway logs --tail | grep "Default admin"

# Test login endpoint
curl -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Common Causes & Fixes:**

| Cause | Symptoms | Fix |
|-------|----------|-----|
| JWT_SECRET undefined | Any token fails | Verify JWT_SECRET in Variables |
| Admin not created | Login with default creds fails | Check logs, might need to reset DB |
| Wrong credentials | Correct format but "invalid" error | Verify DEFAULT_ADMIN_EMAIL/PASSWORD |
| Database connection error | Can't even check users table | Fix DATABASE_URL |

---

### **Symptom: "Too many connections"**

**What It Means:** Neon connection pool exhausted

**Diagnosis:**
```bash
# Check logs for connection errors
railway logs --tail | grep -i "connection"
```

**Fix (Priority Order):**

1. **Verify DATABASE_URL uses `.pooler.` endpoint**
   ```env
   # Check this in Railway Variables
   # Should contain: -pooler.
   DATABASE_URL=postgresql://...@ep-xxx-pooler.region.aws.neon.tech/...
   ```

2. **Ensure all API routes have `runtime = "nodejs"`**
   ```bash
   # Check locally
   grep -r "runtime.*edge" app/api/
   
   # Should return NOTHING
   # If found, fix those routes
   ```

3. **Verify Prisma singleton is working**
   ```bash
   # Check logs for multiple "[prisma] Client initialized"
   railway logs --tail | grep "Client initialized"
   
   # Should see it only ONCE at startup
   ```

4. **Scale up if necessary**
   - Go to Railway dashboard
   - Increase memory allocation
   - Add more resources

---

### **Symptom: "socket hang up"**

**What It Means:** Connection to Neon timed out

**Diagnosis:**
```bash
# Test Neon connection locally
psql "postgresql://user:pass@host/db?sslmode=require&channel_binding=require"

# Check network connectivity
ping ep-xxx-pooler.aws.neon.tech
```

**Fix (Priority Order):**

1. **Verify `channel_binding=require` in DATABASE_URL**
   ```env
   # WRONG
   DATABASE_URL=postgresql://...?sslmode=require
   
   # CORRECT
   DATABASE_URL=postgresql://...?sslmode=require&channel_binding=require
   ```

2. **Increase Railway function timeout**
   - Go to Railway settings
   - Set "Execution Timeout" to 60s

3. **Test Neon connection directly**
   ```bash
   psql "your-database-url"
   # Should connect without errors
   ```

4. **Restart Railway service**
   - Go to Railway dashboard
   - Click service → Settings → Restart

---

### **Symptom: "Build failed - TypeScript errors"**

**What It Means:** Code won't compile

**Diagnosis:**
```bash
# Try building locally
npm run build

# If fails locally, fix before deploying
```

**Common Issues & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` | Missing import path | Check `@/` aliases in tsconfig.json |
| `Type error in Prisma` | Schema mismatch | Run `npx prisma generate` locally |
| `Import of prisma fails` | Prisma client not generated | Add `npx prisma generate` to preDeployCommands |

**Fix:**
1. Build locally: `npm run build`
2. Fix errors
3. Commit: `git commit -m "fix: typescript errors"`
4. Push: `git push origin main`
5. Railway redeploys automatically

---

### **Symptom: "Relation does not exist"**

**What It Means:** Migrations didn't run; database tables missing

**Diagnosis:**
```bash
# Check if migrations ran
railway logs --tail | grep -i "migrate"

# Expected: "Running migrations..." or "Migrations complete"
# Missing: Migration didn't run
```

**Fix:**

1. **Verify `railway.json` exists in root:**
   ```bash
   ls railway.json
   
   # If not found, create it with:
   cat > railway.json << 'EOF'
   {
     "preDeployCommands": [
       "npx prisma generate",
       "npx prisma migrate deploy"
     ]
   }
   EOF
   ```

2. **Commit and push:**
   ```bash
   git add railway.json
   git commit -m "add: prisma migrations config"
   git push origin main
   ```

3. **Force redeploy:**
   - Go to Railway dashboard
   - Click "Deployments"
   - Click "Deploy" → "main" → "Deploy Now"

4. **Monitor logs:**
   ```bash
   railway logs --tail
   ```

---

## ✅ Railway Deployment Checklist

### **Before Deployment (Local Verification)**

- [ ] **Code Quality**
  - [ ] No TypeScript errors: `npm run build` succeeds
  - [ ] No console.error in initialization
  - [ ] All imports resolve correctly

- [ ] **Database**
  - [ ] Login works locally: `npm run dev` → test login
  - [ ] Products load: navigate to `/dashboard`
  - [ ] Migrations run: `npx prisma migrate deploy`
  - [ ] No hardcoded credentials in code

- [ ] **Environment**
  - [ ] `.env` file exists (NOT in Git)
  - [ ] `.env` has all required variables
  - [ ] `DATABASE_URL` tested and works
  - [ ] `JWT_SECRET` is strong and random

- [ ] **Git Repository**
  - [ ] All code committed: `git status` is clean
  - [ ] `.env` is in `.gitignore`
  - [ ] `node_modules/` is in `.gitignore`
  - [ ] Latest pushed: `git push origin main`

---

### **Railway Setup Phase**

- [ ] **Project Created**
  - [ ] Railway account active
  - [ ] Project created
  - [ ] GitHub repository connected
  - [ ] Next.js service detected

- [ ] **Configuration**
  - [ ] Build command: `npm run build`
  - [ ] Start command: `npm start`
  - [ ] `railway.json` created in repo root
  - [ ] `preDeployCommands` includes migrations

- [ ] **Environment Variables**
  - [ ] DATABASE_URL (with `.pooler.` and SSL)
  - [ ] JWT_SECRET (strong, unique)
  - [ ] JWT_EXPIRES_IN
  - [ ] DEFAULT_ADMIN_EMAIL
  - [ ] DEFAULT_ADMIN_PASSWORD (strong)
  - [ ] CLOUDINARY variables
  - [ ] NODE_ENV=production
  - [ ] NEXT_PUBLIC_SITE_URL (to be updated)

---

### **Deployment Phase**

- [ ] **Trigger Deployment**
  - [ ] Push to GitHub: `git push origin main`
  - [ ] Deployment starts automatically
  - [ ] No manual intervention needed

- [ ] **Build Phase**
  - [ ] npm install completes ✅
  - [ ] preDeployCommands run ✅
  - [ ] npm run build completes ✅
  - [ ] No build errors in logs ✅

- [ ] **Start Phase**
  - [ ] npm start runs ✅
  - [ ] Prisma client initializes ✅
  - [ ] Admin created (if first run) ✅
  - [ ] App listening on PORT ✅

---

### **Post-Deployment Testing**

- [ ] **App Health**
  - [ ] Homepage loads: `https://your-app.up.railway.app`
  - [ ] No 502 errors
  - [ ] No console errors

- [ ] **Authentication**
  - [ ] Login page appears
  - [ ] Login works with default credentials
  - [ ] JWT token generated successfully
  - [ ] Logout clears cookie

- [ ] **Core Features**
  - [ ] Dashboard loads with products
  - [ ] Can view product details
  - [ ] Create product works (admin only)
  - [ ] Edit product works (admin only)
  - [ ] Delete product works (admin only)
  - [ ] Unauthorized users get 401

- [ ] **Database**
  - [ ] Data persists (refresh and verify)
  - [ ] Tables exist: users, products, orders
  - [ ] No connection errors in logs

- [ ] **Cloudinary Integration**
  - [ ] Image upload works (if implemented)
  - [ ] Images display from Cloudinary CDN
  - [ ] No 403 errors from Cloudinary

---

### **Production Safety**

- [ ] **Security**
  - [ ] No secrets in logs
  - [ ] HTTPS only (no HTTP)
  - [ ] AUTH tokens HTTP-only cookies ✅
  - [ ] Admin endpoints protected ✅
  - [ ] Passwords hashed (bcrypt) ✅

- [ ] **Error Handling**
  - [ ] 404 for missing resources
  - [ ] 401 for unauthorized access
  - [ ] 403 for forbidden access
  - [ ] 500 with generic message (no stack trace)

- [ ] **Monitoring**
  - [ ] Check logs daily first week
  - [ ] Set up alerts (optional)
  - [ ] Monitor Neon connection count
  - [ ] Monitor Railway resource usage

---

## 🛠️ Common Railway Operations

### **View Logs in Real-Time**

```bash
# Install Railway CLI if not already
npm install -g @railway/cli

# Login
railway login

# Go to your project directory
cd "c:\Users\CHARITHA VARMA\Downloads\CDC Project"

# Tail logs (live updates)
railway logs --tail

# View last 100 lines
railway logs | tail -100

# Filter by keyword
railway logs --tail | grep -i "error"
```

---

### **Update Environment Variables**

**Via CLI:**
```bash
# View all variables
railway variables

# Set new variable
railway variables set JWT_SECRET=new-secret-here

# Remove variable
railway variables unset OLD_VAR_NAME

# View specific variable (masked)
railway variables get DATABASE_URL
```

**Via Dashboard:**
1. Go to https://railway.app
2. Click your project
3. Click your Next.js service
4. Go to "Variables" tab
5. Edit inline
6. Changes auto-deploy

---

### **Restart the Service**

```bash
# Via CLI
railway restart

# Via Dashboard
# 1. Click service
# 2. Settings → Restart
```

---

### **Redeploy Latest Code**

```bash
# Option 1: Push to GitHub (auto-redeploys)
git push origin main

# Option 2: Manual redeploy via CLI
railway redeploy

# Option 3: Via Dashboard
# 1. Go to Deployments tab
# 2. Click "Deploy" button
# 3. Select branch
# 4. Click "Deploy Now"
```

---

### **Check Service Status**

```bash
# Via CLI
railway status

# Via Dashboard
# Look for:
# ✅ Running (green)
# 🟡 Building (yellow)
# ❌ Failed (red)
```

---

### **Rollback to Previous Deployment**

```bash
# View deployment history
railway logs --deployment

# Rollback to specific deployment
railway rollback <deployment-id>
```

---

## 📚 Best Practices for Production

### **1. Never Commit Secrets**

```bash
# Verify .gitignore has .env
cat .gitignore | grep ".env"

# Should output: .env

# If not, add it:
echo ".env" >> .gitignore
git add .gitignore
git commit -m "add: .env to gitignore"
```

---

### **2. Use Strong Credentials**

```bash
# Generate strong JWT_SECRET
openssl rand -base64 32

# Generate strong DEFAULT_ADMIN_PASSWORD
# Requirements: 8+ chars, mixed case, numbers, symbols
# Examples:
# ✅ Tr0p!c@lThund3r
# ✅ M00nL!ght$Encrypt
# ❌ admin123 (too weak)
# ❌ password (too common)
```

---

### **3. Monitor First Week Closely**

```bash
# Check logs multiple times per day
railway logs --tail

# Look for:
# ✅ [prisma] Client initialized successfully
# ✅ ready - started server on
# ❌ Error messages
# ❌ Connection failures
```

---

### **4. Test Login Flow Often**

```bash
# During development, test frequently
npm run dev
# Manual test in browser

# After deployment, test immediately
curl -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

### **5. Plan for Growth**

| Metric | Alert Level | Action |
|--------|-------------|--------|
| Memory Usage | > 80% | Upgrade Railway plan |
| CPU Usage | > 90% | Optimize code or scale |
| DB Connections | > 80% | Monitor Neon connections |
| Response Time | > 2s | Check database queries |

---

### **6. Regular Maintenance**

**Weekly:**
- [ ] Check logs for errors
- [ ] Verify login still works
- [ ] Test create/edit/delete features

**Monthly:**
- [ ] Review error logs
- [ ] Update dependencies (carefully)
- [ ] Check Neon connection count

**Quarterly:**
- [ ] Rotate JWT_SECRET
- [ ] Review security settings
- [ ] Test backup/recovery

---

## 🎯 Success Indicators

Your Railway deployment is successful when:

✅ **App Starts**
- Logs show `[prisma] Client initialized successfully`
- Logs show `ready - started server`
- No errors in console

✅ **Database Connected**
- Can query users/products table
- Migrations applied without errors
- Default admin created

✅ **Authentication Works**
- Login endpoint responds with JWT
- JWT tokens are valid
- Logout clears cookies

✅ **Features Work**
- Dashboard loads
- Products display
- Admin operations work
- Unauthorized users get 401

✅ **No Critical Errors**
- No 502 Bad Gateway
- No database connection errors
- No JWT verification errors
- No 500 errors in logs

---

## 🚀 Performance Optimization Tips

### **Reduce Build Time**
```bash
# Use npm ci instead of npm install (faster)
# Create .railwayignore to skip unnecessary files
node_modules/
.git/
.next/
*.md
```

### **Reduce Runtime Memory**
```bash
# Ensure Prisma singleton is working
# One connection per app instance

# Check logs don't show multiple "initialized"
railway logs --tail | grep "Client initialized"
# Should show: 1 message
```

### **Improve Response Time**
```bash
# Cache database queries where appropriate
# Use Prisma's findUnique for primary keys (faster)
# Index frequently-queried columns (already done in schema)
```

---

## 📞 When to Contact Railway Support

**Contact Railway if:**
- Infrastructure issues (502, timeouts)
- Billing/payment problems
- Account/authentication issues
- Platform-specific bugs

**Don't contact Railway for:**
- Application logic errors (contact your development team)
- Database schema issues (contact database admin)
- Code compilation errors (fix in your code)

**Railway Support:**
- Email: support@railway.app
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

---

## 📝 Deployment Summary

```
CDC eCommerce Dashboard on Railway
├─ Next.js 14 with TypeScript
├─ Prisma 5.7 ORM
├─ Neon PostgreSQL (External)
├─ JWT Authentication
├─ Cloudinary Images
├─ Admin-only features
└─ Production Ready ✅

Status: 🟢 Ready for Production
Last Updated: January 8, 2026
```

---

*Generated: January 8, 2026*  
*Platform: Railway*  
*Database: Neon PostgreSQL (External Connection Pooling)*
