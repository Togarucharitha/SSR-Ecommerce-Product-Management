# Railway Environment Variables - Complete Setup Guide

**Date:** January 8, 2026  
**Application:** CDC eCommerce Dashboard  
**Database:** External Neon PostgreSQL

---

## 🔑 All Required Environment Variables

Copy and paste these into Railway's Variables dashboard. Replace placeholder values with your actual values.

### **Group 1: Database Connection (CRITICAL)**

```env
DATABASE_URL=postgresql://neondb_owner:npg_FV7bWdwRGtE3@ep-mute-leaf-a1xheitt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**How to Get This:**
1. Log into https://console.neon.tech
2. Select your project
3. Click "Connection String"
4. Copy "Connection string with pooling"
5. Ensure it includes `?sslmode=require&channel_binding=require`

**Verify:**
- ✅ Starts with: `postgresql://`
- ✅ Contains: `@ep-` (Neon endpoint)
- ✅ Contains: `-pooler.` (connection pooling)
- ✅ Ends with: `?sslmode=require&channel_binding=require`

**NEVER:**
- ❌ Use localhost (won't work on Railway)
- ❌ Remove SSL options (Neon requires SSL)
- ❌ Use direct endpoint (use `.pooler.` instead)

---

### **Group 2: Authentication - JWT**

```env
JWT_SECRET=my-super-secret-jwt-key-123456789
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=8y4KUSzFxIIxqDkFv15r5GsEBOZaqkTIK+DMO5UKT5U=
```

**JWT_SECRET:**
- Used to sign/verify JWT tokens
- Should be long and random
- **For production, change to a strong secret:**
  ```bash
  openssl rand -base64 32
  # Output: KL9dK2pX8q+Z3mNbL8vK9jK2pL8+Z3mNbL8vK9jK2pL8=
  ```

**JWT_EXPIRES_IN:**
- How long tokens are valid
- Format: `7d` (7 days), `24h` (24 hours), `60m` (60 minutes)
- Recommended: `7d` for users, shorter for admin sessions

**NEXTAUTH_SECRET:**
- Used by NextAuth (if using it)
- Can generate: `openssl rand -base64 32`
- Or use existing value from `.env`

---

### **Group 3: Default Admin User**

```env
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Administrator
```

**DEFAULT_ADMIN_EMAIL:**
- Email of first admin user
- Created automatically on first app startup
- **Change to your email in production**

**DEFAULT_ADMIN_PASSWORD:**
- Password for default admin
- Used only on first startup
- **Change to strong password in production:**
  - Min 8 characters
  - Mix uppercase, lowercase, numbers, symbols
  - Never use: "admin123", "password", "12345678"

**DEFAULT_ADMIN_NAME:**
- Display name of default admin
- Can be anything
- Change to your name in production

**How It Works:**
1. App starts on Railway
2. Checks if any admin user exists in database
3. If no admin: creates default user with these credentials
4. If admin exists: does nothing (idempotent)
5. You can change password after first login

---

### **Group 4: Public URLs**

```env
NEXT_PUBLIC_SITE_URL=https://your-app.up.railway.app
```

**How to Get:**
1. After deployment, Railway assigns a URL
2. Format: `https://[your-app-name].up.railway.app`
3. Copy and paste here
4. Update after first deployment (Railway tells you the URL)

**Why Needed:**
- Used for redirects after login
- Used in email links (if implementing email features)
- Used for OAuth callbacks

**Example Values:**
```env
# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Railway Production
NEXT_PUBLIC_SITE_URL=https://cdc-dashboard.up.railway.app
```

---

### **Group 5: Cloudinary (Image Hosting)**

```env
CLOUDINARY_CLOUD_NAME=dpqdqsovs
CLOUDINARY_API_KEY=676544137754932
CLOUDINARY_API_SECRET=VthTjJmTEtxa5ZsxoyCP40kCapo
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpqdqsovs
```

**How to Get These:**
1. Log into https://cloudinary.com
2. Go to "Account Settings" → "API Keys"
3. Copy: `Cloud Name`, `API Key`, `API Secret`
4. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = `Cloud Name`

**Why Needed:**
- Uploading product images
- Transforming/optimizing images
- Serving images from CDN

**Important:**
- ⚠️ `API_KEY` and `API_SECRET` are sensitive
- ✅ Store safely in Railway Variables
- ❌ Never commit to Git
- ❌ Never expose in frontend code

---

### **Group 6: Node.js Runtime**

```env
NODE_ENV=production
```

**Values:**
- `production` - For Railway (optimized, no logging)
- `development` - Only for local `npm run dev`

**Never:**
- ❌ Set to `development` on Railway (wastes resources, verbose logs)
- ❌ Set to `test` on Railway

---

## 📋 Complete Environment Variable Template

Copy this entire block and paste into Railway Variables dashboard:

```env
# ===========================
# DATABASE (CRITICAL)
# ===========================
DATABASE_URL=postgresql://neondb_owner:npg_FV7bWdwRGtE3@ep-mute-leaf-a1xheitt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ===========================
# JWT AUTHENTICATION
# ===========================
JWT_SECRET=my-super-secret-jwt-key-123456789
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=8y4KUSzFxIIxqDkFv15r5GsEBOZaqkTIK+DMO5UKT5U=

# ===========================
# DEFAULT ADMIN USER
# ===========================
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Administrator

# ===========================
# PUBLIC URLs
# ===========================
NEXT_PUBLIC_SITE_URL=https://your-app.up.railway.app

# ===========================
# CLOUDINARY (Image Hosting)
# ===========================
CLOUDINARY_CLOUD_NAME=dpqdqsovs
CLOUDINARY_API_KEY=676544137754932
CLOUDINARY_API_SECRET=VthTjJmTEtxa5ZsxoyCP40kCapo
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpqdqsovs

# ===========================
# RUNTIME
# ===========================
NODE_ENV=production
```

---

## ✅ Variable Entry Checklist

When adding each variable to Railway, verify:

- [ ] **DATABASE_URL**
  - [ ] Starts with `postgresql://`
  - [ ] Contains `.pooler.` (not direct endpoint)
  - [ ] Ends with `?sslmode=require&channel_binding=require`
  - [ ] No typos in password/host

- [ ] **JWT_SECRET**
  - [ ] Long string (30+ characters)
  - [ ] Random (not sequential like "123456")
  - [ ] Different from local development
  - [ ] Saved securely (not shared)

- [ ] **JWT_EXPIRES_IN**
  - [ ] Value: `7d`
  - [ ] Correct format

- [ ] **DEFAULT_ADMIN_EMAIL**
  - [ ] Valid email format
  - [ ] Your actual email (not `admin@example.com`)

- [ ] **DEFAULT_ADMIN_PASSWORD**
  - [ ] Strong password (8+ chars, mixed case, numbers, symbols)
  - [ ] Not common passwords like "admin123"
  - [ ] Different from development

- [ ] **CLOUDINARY_CLOUD_NAME**
  - [ ] Your actual cloud name from Cloudinary
  - [ ] Not placeholder value

- [ ] **CLOUDINARY_API_KEY**
  - [ ] From Cloudinary account
  - [ ] Not placeholder value

- [ ] **CLOUDINARY_API_SECRET**
  - [ ] From Cloudinary account
  - [ ] NOT exposed in frontend code
  - [ ] NOT committed to Git

- [ ] **NEXT_PUBLIC_SITE_URL**
  - [ ] Updated after Railway deployment
  - [ ] Format: `https://[app-name].up.railway.app`
  - [ ] HTTPS (not HTTP)

- [ ] **NODE_ENV**
  - [ ] Value: `production`

---

## 🔒 Security Best Practices

### **DO:**
- ✅ Use strong, random secrets for production
- ✅ Store sensitive variables in Railway dashboard
- ✅ Use different secrets per environment (dev/staging/prod)
- ✅ Rotate secrets periodically (especially JWT_SECRET)
- ✅ Use HTTPS URLs (not HTTP)
- ✅ Change default admin password after first login

### **DON'T:**
- ❌ Commit `.env` file to Git
- ❌ Use example values in production ("admin123", "example.com")
- ❌ Share secrets via email/chat
- ❌ Use same secrets across environments
- ❌ Expose API secrets in frontend code
- ❌ Use `development` NODE_ENV on Railway

---

## 🔄 How to Update Variables on Railway

### **Option 1: Railway Dashboard (Recommended)**

1. Go to https://railway.app
2. Click on your project
3. Click on your Next.js service
4. Click "Variables" tab
5. Click on each variable field
6. Update the value
7. Press Enter or click outside field
8. Railway auto-redeploys with new variables

### **Option 2: Railway CLI**

```bash
# View all variables
railway variables

# Set a variable
railway variables set DATABASE_URL=postgresql://...

# Delete a variable
railway variables unset JWT_SECRET

# View specific variable (hidden for security)
railway variables get JWT_SECRET
```

### **Option 3: .railway Environment File**

Create `.railway/variables.json`:

```json
{
  "DATABASE_URL": "postgresql://...",
  "JWT_SECRET": "...",
  "NODE_ENV": "production"
}
```

**Note:** Still need to add sensitive values manually via dashboard.

---

## 🧪 Testing Variables After Setting Them

### **Check App Logs**

```bash
railway logs --tail

# Look for:
# ✅ [prisma] Client initialized successfully
# ✅ Default admin created: admin@example.com
# ✅ ready - started server on 0.0.0.0:PORT

# Or errors:
# ❌ [prisma] Failed to connect to database
# ❌ Cannot read property 'JWT_SECRET' of undefined
```

### **Test Login Endpoint**

```bash
# Get your Railway app URL
RAILWAY_URL="https://your-app.up.railway.app"

# Test login with default admin credentials
curl -X POST $RAILWAY_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Expected response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "...",
#     "email": "admin@example.com",
#     "role": "admin"
#   }
# }
```

### **Test Database Connection**

```bash
# From your local machine, test if you can connect to Neon
psql "postgresql://neondb_owner:npg_FV7bWdwRGtE3@ep-mute-leaf-a1xheitt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# If successful: psql prompt appears
# If failed: connection timeout or authentication error
```

---

## 🚨 Common Variable Mistakes

### ❌ Mistake: Wrong DATABASE_URL

```env
# WRONG - localhost won't work on Railway
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# CORRECT - use Neon endpoint with pooling
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require&channel_binding=require
```

**Fix:** Copy DATABASE_URL directly from Neon console

---

### ❌ Mistake: Missing SSL Options

```env
# WRONG - Neon requires SSL
DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/db

# CORRECT - always include SSL options
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.aws.neon.tech/db?sslmode=require&channel_binding=require
```

**Fix:** Add `?sslmode=require&channel_binding=require` to end of URL

---

### ❌ Mistake: Using Development Secrets in Production

```env
# WRONG - insecure in production
JWT_SECRET=test-secret-12345
DEFAULT_ADMIN_PASSWORD=admin123
NODE_ENV=development

# CORRECT - strong secrets for production
JWT_SECRET=KL9dK2pX8q+Z3mNbL8vK9jK2pL8+Z3mNbL8vK9jK2pL8=
DEFAULT_ADMIN_PASSWORD=Tr0pic@lThund3r$tr0ng
NODE_ENV=production
```

**Fix:** Generate new strong secrets for production

---

### ❌ Mistake: Using Placeholder Values

```env
# WRONG - placeholder values
CLOUDINARY_CLOUD_NAME=dpqdqsovs
CLOUDINARY_API_KEY=676544137754932

# CORRECT - your actual values from Cloudinary
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
```

**Fix:** Replace with your actual Cloudinary credentials

---

### ❌ Mistake: Wrong URL Format

```env
# WRONG - HTTP (insecure)
NEXT_PUBLIC_SITE_URL=http://your-app.up.railway.app

# CORRECT - HTTPS
NEXT_PUBLIC_SITE_URL=https://your-app.up.railway.app
```

**Fix:** Always use HTTPS for production URLs

---

## 📊 Variable Security Level

| Variable | Visibility | Sensitivity | Action |
|----------|------------|-------------|--------|
| `DATABASE_URL` | Hidden in logs | 🔴 CRITICAL | Store in Railway Variables only |
| `JWT_SECRET` | Hidden in logs | 🔴 CRITICAL | Store in Railway Variables only |
| `CLOUDINARY_API_SECRET` | Hidden in logs | 🔴 CRITICAL | Store in Railway Variables only |
| `CLOUDINARY_API_KEY` | Hidden in logs | 🟠 HIGH | Store in Railway Variables only |
| `NEXTAUTH_SECRET` | Hidden in logs | 🟠 HIGH | Store in Railway Variables only |
| `DEFAULT_ADMIN_PASSWORD` | Hidden in logs | 🟠 HIGH | Store in Railway Variables only |
| `DEFAULT_ADMIN_EMAIL` | Visible in logs | 🟡 MEDIUM | Can be public |
| `CLOUDINARY_CLOUD_NAME` | Visible in frontend | 🟢 LOW | Can be public (prefixed with NEXT_PUBLIC_) |
| `NODE_ENV` | Visible in logs | 🟢 LOW | Can be public |

---

## 🔄 Rotating Secrets (Security Best Practice)

### **Every 90 Days: Rotate JWT_SECRET**

```bash
# 1. Generate new secret
openssl rand -base64 32

# 2. Update on Railway Variables
# (Old tokens will become invalid - users need to login again)

# 3. Monitor logs for any issues
railway logs --tail

# 4. Users will be logged out automatically
# (They need to login again with new JWT)
```

### **Every 6 Months: Rotate Database Password (via Neon)**

1. Go to https://console.neon.tech
2. Select project
3. Go to "Database roles"
4. Create new password for user
5. Update `DATABASE_URL` on Railway
6. Redeploy

### **Annually: Full Secret Refresh**

- [ ] Rotate JWT_SECRET
- [ ] Rotate DATABASE password
- [ ] Rotate CLOUDINARY API credentials
- [ ] Change DEFAULT_ADMIN_PASSWORD

---

## 📝 Variable Documentation Template

Save this for your team:

```markdown
# Production Environment Variables

## Database
- **DATABASE_URL**: Neon PostgreSQL connection string with external pooling
  - Format: postgresql://user:pass@host:port/db?sslmode=require&channel_binding=require
  - Source: https://console.neon.tech → Connection String
  - Last rotated: [DATE]

## Authentication
- **JWT_SECRET**: Token signing secret (30+ chars, random)
  - Last rotated: [DATE]
  - Valid for: [TIME PERIOD]
  
- **JWT_EXPIRES_IN**: Token validity duration
  - Value: 7d (7 days)
  
## Admin
- **DEFAULT_ADMIN_EMAIL**: Initial admin email
  - Value: [YOUR EMAIL]
  
- **DEFAULT_ADMIN_PASSWORD**: Initial admin password
  - Last changed: [DATE]
  - Requirements: 8+ chars, mixed case, numbers, symbols

## External Services
- **CLOUDINARY_CLOUD_NAME**: Cloud name
- **CLOUDINARY_API_KEY**: API key
- **CLOUDINARY_API_SECRET**: API secret
  - Source: https://cloudinary.com → Account Settings → API Keys

## URLs
- **NEXT_PUBLIC_SITE_URL**: App URL for redirects
  - Value: https://[app-name].up.railway.app
  - Updated: [DATE]

## Runtime
- **NODE_ENV**: Node.js environment
  - Value: production
```

---

## ✨ Summary

**All variables configured?** Check this list:

- [ ] DATABASE_URL (with pooling + SSL)
- [ ] JWT_SECRET (strong, random)
- [ ] JWT_EXPIRES_IN
- [ ] DEFAULT_ADMIN_EMAIL
- [ ] DEFAULT_ADMIN_PASSWORD (strong)
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] NEXT_PUBLIC_SITE_URL (after deployment)
- [ ] NODE_ENV=production

**All secure?**
- [ ] No secrets in Git
- [ ] No localhost URLs
- [ ] SSL enabled on database
- [ ] Strong passwords used
- [ ] Secrets stored in Railway only

**Ready to deploy?** ✅ YES!

---

*Generated: January 8, 2026*  
*Platform: Railway*  
*Database: Neon PostgreSQL (External)*
