# 🚀 Vercel Environment Variables Setup Guide

## ❌ **Error You're Seeing:**
```
Environment Variable "DB_HOST" references Secret "db_host", which does not exist.
```

## 🔧 **Root Cause:**
The `vercel.json` file was incorrectly configured to use Vercel Secrets instead of Environment Variables.

## ✅ **Fixed:** 
Removed the problematic `env` section from `vercel.json`. Now Vercel will use Environment Variables you set in the dashboard.

### **Step 1: Go to Your Vercel Dashboard**
1. Visit [vercel.com](https://vercel.com)
2. Log in and select your `OmkarShinde_SQL_Project`
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add These Environment Variables**
Click **"Add New"** for each variable:

| **Variable Name** | **Value** | **Environment** |
|-------------------|-----------|-----------------|
| `DB_HOST` | `sql.freedb.tech` | Production, Preview, Development |
| `DB_PORT` | `3306` | Production, Preview, Development |
| `DB_USER` | `freedb_roomlyroot` | Production, Preview, Development |
| `DB_PASSWORD` | `8*f$9mmXBgKJ?46` | Production, Preview, Development |
| `DB_NAME` | `freedb_HospitalityDB` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production, Preview |
| `PORT` | `3000` | Production, Preview, Development |

### **Step 3: Select Environments**
For each variable, make sure to check:
- ✅ **Production** (for live site)
- ✅ **Preview** (for preview deployments)
- ✅ **Development** (for local development)

### **Step 4: Redeploy Your Application**
After adding variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on your latest deployment
3. Or push a new commit to trigger auto-deployment

## 🔒 **Security Note:**
Never commit your `.env` file to GitHub! Your database credentials are sensitive.

### **Add .env to .gitignore:**
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development

# Dependencies
node_modules/

# Logs
*.log
```

## 🔧 **Alternative: Use Vercel CLI**
You can also set variables via command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel env add NODE_ENV
```

## 📱 **Testing After Setup:**
1. **Check deployment logs** in Vercel dashboard
2. **Test database connection** by visiting your deployed URL
3. **Monitor for errors** in Functions tab

## 🚨 **Common Issues & Solutions:**

### **Issue: "Cannot connect to database"**
- ✅ Verify all environment variables are set correctly
- ✅ Check database host allows external connections
- ✅ Ensure database name matches exactly: `freedb_HospitalityDB`

### **Issue: "Function timeout"**
- ✅ Database queries might be slow on free tier
- ✅ Add connection pooling (already implemented)

### **Issue: "Module not found"**
- ✅ Run `npm install` locally first
- ✅ Ensure `package.json` has all dependencies

## 🎯 **Quick Verification:**
After setting up, your Vercel environment should show:
```
✅ DB_HOST: sql.freedb.tech
✅ DB_PORT: 3306  
✅ DB_USER: freedb_roomlyroot
✅ DB_PASSWORD: [REDACTED]
✅ DB_NAME: freedb_HospitalityDB
✅ NODE_ENV: production
```

Your Roomly app should now deploy successfully! 🎉
