# 🚂 Railway Deployment - Quick Reference Card

**Print this or save to phone for quick lookup during deployment**

---

## 📋 Pre-Deployment Checklist (5 min)

```
☐ npm run build (works locally)
☐ npm start (works locally)
☐ .env file created (NOT in Git)
☐ railway.json created in root
☐ All code pushed to GitHub
☐ No .env file committed
```

---

## 🚀 Deployment Checklist (Step by Step)

### **Step 1: Create Railway Project**
```
1. Go to https://railway.app
2. Click "New Project"
3. Select "GitHub Repo"
4. Select your repository
5. Click "Deploy Now"
```

### **Step 2: Add Environment Variables**
```
In Railway Dashboard → Variables tab

DATABASE_URL = postgresql://...@ep-xxx-pooler...?sslmode=require&channel_binding=require
JWT_SECRET = [generate random 32+ chars]
JWT_EXPIRES_IN = 7d
DEFAULT_ADMIN_EMAIL = admin@example.com
DEFAULT_ADMIN_PASSWORD = [strong password]
CLOUDINARY_CLOUD_NAME = [from Cloudinary]
CLOUDINARY_API_KEY = [from Cloudinary]
CLOUDINARY_API_SECRET = [from Cloudinary]
NODE_ENV = production
NEXT_PUBLIC_SITE_URL = [update after deploy gets URL]
```

### **Step 3: Configure Build/Start**
```
Build Command:  npm run build
Start Command:  npm start
```

### **Step 4: Deploy**
```
Option A: Push to GitHub
  git push origin main
  (Railway auto-deploys)

Option B: Manual trigger
  Railway Dashboard → Deployments → Deploy Now
```

### **Step 5: Wait for Completion**
```
Watch logs for:
✅ npm install complete
✅ npx prisma generate complete
✅ npx prisma migrate deploy complete
✅ npm run build complete
✅ [prisma] Client initialized successfully
✅ Default admin created: admin@example.com
✅ ready - started server

Expected time: 3-5 minutes
```

---

## 🔍 Testing Checklist (After Deploy)

```
☐ App loads: https://your-app.up.railway.app
☐ Login page appears
☐ Login works: admin@example.com / admin123
☐ Dashboard loads
☐ Products display
☐ Can create product (admin)
☐ No 502 errors in browser
☐ Logs show no errors
```

---

## 📊 Critical Configuration

### **DATABASE_URL Must Have:**
```
✅ postgresql://user:pass@
✅ ep-xxx-pooler.region.aws.neon.tech
✅ ?sslmode=require&channel_binding=require
```

### **Build/Start Commands:**
```
✅ Build: npm run build
✅ Start: npm start
❌ NOT: npm run dev
```

### **railway.json (Project Root):**
```json
{
  "preDeployCommands": [
    "npx prisma generate",
    "npx prisma migrate deploy"
  ]
}
```

---

## 🚨 Troubleshooting Quick Reference

| Problem | Symptom | Quick Fix |
|---------|---------|-----------|
| DB Connection Error | `[prisma] Failed to connect` | Check DATABASE_URL has `.pooler.` and SSL |
| Login Fails (401) | Token verification error | Verify JWT_SECRET is set |
| Too Many Connections | `FATAL: too many connections` | Verify DATABASE_URL has `.pooler.` |
| 502 Bad Gateway | App crashed | Check logs: `railway logs --tail` |
| Migrations Failed | `Relation does not exist` | Verify `railway.json` created with migrations |
| Socket Timeout | `socket hang up` | Add `&channel_binding=require` to DATABASE_URL |

---

## 🛠️ Common Commands

```bash
# View logs
railway logs --tail

# View all variables
railway variables

# Set a variable
railway variables set VAR_NAME=value

# Check status
railway status

# Restart app
railway restart

# View deployments
railway logs --deployment

# Rollback to previous
railway rollback <deployment-id>
```

---

## ✅ Success Indicators

```
✅ App loads without 502 errors
✅ Login works with default credentials
✅ Dashboard shows products
✅ Logs show [prisma] Client initialized
✅ No error messages in logs
✅ Database tables exist
✅ Default admin created
✅ Can perform CRUD operations
```

---

## 🚫 Common Mistakes to Avoid

```
❌ Using localhost in DATABASE_URL
   → Fix: Use Neon pooler endpoint

❌ Removing SSL options from DATABASE_URL
   → Fix: Keep ?sslmode=require&channel_binding=require

❌ Setting NODE_ENV=development
   → Fix: Set NODE_ENV=production

❌ Using npm run dev for start command
   → Fix: Use npm start

❌ Forgetting railway.json
   → Fix: Create with migration commands

❌ Committing .env to Git
   → Fix: Add to .gitignore

❌ Using development secrets in production
   → Fix: Generate new strong secrets
```

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Can't remember commands | `railway --help` |
| Need to see all variables | `railway variables` |
| App crashed, check logs | `railway logs --tail` |
| Want to rollback | `railway logs --deployment` then `railway rollback <id>` |
| Stuck? | Read RAILWAY_TROUBLESHOOTING.md |

---

## 🎯 Expected Timeline

| Step | Time | Status |
|------|------|--------|
| Setup Railway Project | 2 min | Quick |
| Add Variables | 3 min | Easy |
| Push to GitHub | 1 min | Instant |
| Build & Deploy | 3-5 min | Automatic |
| Initial Testing | 5 min | Manual |
| **Total** | **~15 min** | ✅ Live |

---

## 🔑 Key URLs

```
Railway Dashboard: https://railway.app
Your App: https://your-app.up.railway.app
Neon Console: https://console.neon.tech
Cloudinary: https://cloudinary.com
```

---

## 📝 Post-Deploy

```
☐ Save Railway app URL
☐ Update NEXT_PUBLIC_SITE_URL if needed
☐ Monitor logs first week
☐ Test all features manually
☐ Share URL with team
```

---

## 🎉 Done!

App is live when:
- ✅ No 502 errors
- ✅ Login works
- ✅ Dashboard loads
- ✅ Logs look healthy

---

**Print this page for reference during deployment!**

*Generated: January 8, 2026*
