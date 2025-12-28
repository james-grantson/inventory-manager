#  EXTERNAL SERVICES SETUP GUIDE

##  Estimated Time: 15-20 minutes

## 1.  SUPABASE DATABASE (FREE)
**Link:** https://app.supabase.com/sign-up
**Steps:**
1. Click "Sign up with GitHub"
2. Click "New Project"
3. Name: "inventory-ghana"
4. Password: [Generate strong password - save it!]
5. Region: "West Africa (AF-West-1)" - closest to Ghana
6. Click "Create new project"

**After Creation:**
1. Go to Project Settings  Database
2. Find "Connection string"
3. Click "URI" to copy
4. Use "Connection pooler" version for better performance

## 2.  CLOUDFLARE R2 STORAGE (FREE)
**Link:** https://dash.cloudflare.com/sign-up
**Steps:**
1. Sign up with email
2. Verify email
3. Skip payment (free tier is fine)
4. Go to R2  Create bucket
5. Name: "inventory-ghana-assets"
6. Create bucket

**Get Credentials:**
1. R2 Dashboard  Manage R2 API Tokens
2. Create new token
3. Name: "inventory-manager"
4. Permissions: "Object Read & Write"
5. Copy: Account ID, Access Key ID, Secret Access Key

## 3.  RAILWAY DEPLOYMENT
**Link:** https://railway.app/new
**Steps:**
1. Login with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your inventory-manager repo
5. Railway will auto-detect Node.js

##  QUICK CHECKLIST:
- [ ] Supabase account created
- [ ] Supabase project created (West Africa region)
- [ ] Database connection string copied
- [ ] Cloudflare account created
- [ ] R2 bucket created: "inventory-ghana-assets"
- [ ] R2 API token created with credentials saved
- [ ] Railway account connected to GitHub
