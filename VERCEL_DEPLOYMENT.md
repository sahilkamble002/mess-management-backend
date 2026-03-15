# Vercel Deployment Guide for Mess Management Backend

## Status: ✅ Deployment ready with environment variable configuration required

## What's Working
- ✅ Express app starts successfully
- ✅ Root route handler added (`/`)
- ✅ Health check endpoint (`/api/health`)
- ✅ Contract artifacts deployed
- ✅ All API routes available

## What Needs Configuration
- ⚠️ **Environment Variables** (CRITICAL) - NOT set in Vercel yet

---

## CRITICAL: Set Environment Variables in Vercel

Your app currently returns 404 because **environment variables are not configured in Vercel**. The app runs but uses `undefined` values.

### Step-by-Step Setup:

#### 1. **Log in to Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project: `mess-management-backend`

#### 2. **Navigate to Environment Variables**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

#### 3. **Add Each Variable One by One**

| Variable | Value from your .env |
|----------|--------|
| `MONGODB_URI` | `mongodb+srv://kamblesahil:sahil358@cluster0.st6w0sz.mongodb.net` |
| `PORT` | `8000` |
| `CORS_ORIGIN` | `*` |
| `ACCESS_TOKEN_SECRET` | `WESDFCVBNM` |
| `ACCESS_TOKEN_EXPIRY` | `1d` |
| `REFRESH_TOKEN_SECRET` | `WAEZRXCTFGBHJK` |
| `REFRESH_TOKEN_EXPIRY` | `365d` |
| `CLOUDINARY_CLOUD_NAME` | `messchain` |
| `CLOUDINARY_API_KEY` | `716781361488536` |
| `CLOUDINARY_API_SECRET` | `ijRdAPlvmh2JRvjnUdEmKKwNBoQ` |
| `PRIVATE_KEY` | `332f532e3e3ab1b2929744a558fea1d9d6dd3e6bc1981f8aa2ad3fe5b84b6557` |
| `RPC_URL` | `https://sepolia.infura.io/v3/b1782a3bf0b949c6897da443c98cef59` |
| `VOTING_SYSTEM_CONTRACT_ADDRESS` | `0x8A6Ab5ffA761Fd7277A7EE1736E263896424C026` |
| `MESS_ATTENDANCE_CONTRACT_ADDRESS` | `0xBA15f873D4a0c2682BB81CBd4aF7ef444A01249e` |
| `COMPLAINT_SYSTEM_CONTRACT_ADDRESS` | `0xBd5162831f9373bE14946A5A66A8203D1bC4ed2D` |
| `GEMINI_API_KEY` | `AIzaSyDkErXa5uk8pvQ38WpKR_cVR4KFQ0xIKSc` |

#### 4. **For Each Variable:**
   - Click **Add (or Edit)**
   - Name: `VARIABLE_NAME`
   - Value: Copy the value from the table above
   - Environment: Select **Production**
   - Click **Save**

#### 5. **Redeploy After Adding Variables**
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**
   - Wait for deployment to complete

---

## Testing After Deployment

### Check if working:
```bash
curl https://mess-management-backend-xxx.vercel.app/api/health
# Should return:
# {"status":"ok","message":"Backend is healthy",...}
```

### Expected Response:
```bash
curl https://mess-management-backend-xxx.vercel.app/
# Should return:
# {
#   "message": "Mess Management System Backend API",
#   "status": "running",
#   "endpoints": {
#     "health": "/api/health",
#     "api": "/api/v1"
#   }
# }
```

---

## Common Issues & Solutions

### Issue: Still getting 404 or "Endpoint not found"
**Solution:** 
- Verify all environment variables are set in Vercel dashboard
- Click **Redeploy** after adding variables
- Check deployment logs for any error messages

### Issue: MongoDB Connection Fails (500 error)
**Solution:**
- Verify `MONGODB_URI` is exact and working locally
- Check MongoDB Atlas IP whitelist includes Vercel:
  - Go to MongoDB Atlas → Network Access
  - Click "Edit"
  - Add IP: `0.0.0.0/0` (temporary for testing, restrict later)
- Ensure database user credentials are correct

### Issue: "Cannot find module" errors
**Solution:**
- All artifacts and contracts are now included
- If persists, check build logs in Vercel dashboard

---

## Changes Made to Fix Issues

### 1. `vercel.json`
- Removed invalid `files` property
- Using standard Vercel Node.js configuration
- Artifacts deploy automatically (they're committed to git)

### 2. `src/app.js`
- Added root route handler (`GET /`)
- Added 404 handler for undefined routes
- Proper error responses

### 3. `.env.example`
- Template file for reference (safe to commit)
- Shows all required variables
- Never commit actual `.env` file

---

## Local Development

Continue using `.env` file locally:
```bash
# .env (never commit this)
MONGODB_URI=mongodb+srv://...
PORT=8000
# ... other variables
```

Run locally:
```bash
npm install
npm start
# or
npm run dev
```

---

## Security Notes

✅ **DO:**
- Store secrets in Vercel Environment Variables
- Keep `.env` file in `.gitignore`
- Use `.env.example` for documentation

❌ **DON'T:**
- Commit `.env` to git repository
- Share environment variables in chat/email
- Use weak secrets (change these after testing!)

---

## Next Steps

1. ✅ Code changes completed
2. ⏳ **Set environment variables in Vercel dashboard** ← YOU ARE HERE
3. ⏳ Redeploy from Vercel dashboard
4. ⏳ Test endpoints
5. ⏳ Update frontend API URL if needed (point to your Vercel backend URL)
