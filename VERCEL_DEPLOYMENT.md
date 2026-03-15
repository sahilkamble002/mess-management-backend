# Vercel Deployment Guide for Mess Management Backend

## Critical Issues Fixed

### 1. ✅ Artifacts Deployment
The Hardhat contract artifacts (like `MessAttendance.json`) are now included in the Vercel deployment via the `files` property in `vercel.json`.

### 2. ⚠️ Environment Variables Configuration (ACTION REQUIRED)

The `.env` file **cannot and should not** be deployed to Vercel for security reasons. Instead, you must set environment variables directly in Vercel project settings.

#### Steps to Configure Environment Variables in Vercel:

1. **Go to Vercel Dashboard**
   - Navigate to your project: `mess-management-backend`
   - Click on "Settings" > "Environment Variables"

2. **Add Each Variable:**
   Copy each variable from `.env.example` and set it in Vercel:

   ```
   MONGODB_URI=mongodb+srv://kamblesahil:sahil358@cluster0.st6w0sz.mongodb.net/sahilmessmanagement
   PORT=8000
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=WESDFCVBNM
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=WAEZRXCTFGBHJK
   REFRESH_TOKEN_EXPIRY=365d
   CLOUDINARY_CLOUD_NAME=messchain
   CLOUDINARY_API_KEY=716781361488536
   CLOUDINARY_API_SECRET=ijRdAPlvmh2JRvjnUdEmKKwNBoQ
   PRIVATE_KEY=332f532e3e3ab1b2929744a558fea1d9d6dd3e6bc1981f8aa2ad3fe5b84b6557
   RPC_URL=https://sepolia.infura.io/v3/b1782a3bf0b949c6897da443c98cef59
   VOTING_SYSTEM_CONTRACT_ADDRESS=0x8A6Ab5ffA761Fd7277A7EE1736E263896424C026
   MESS_ATTENDANCE_CONTRACT_ADDRESS=0xBA15f873D4a0c2682BB81CBd4aF7ef444A01249e
   COMPLAINT_SYSTEM_CONTRACT_ADDRESS=0xBd5162831f9373bE14946A5A66A8203D1bC4ed2D
   GEMINI_API_KEY=AIzaSyDkErXa5uk8pvQ38WpKR_cVR4KFQ0xIKSc
   ```

3. **Set for Production**
   - Make sure variables are set for the `Production` environment
   - Click "Redeploy" after setting env vars

4. **Verify Deployment**
   - After redeployment, check logs for:
     ```
     ✅ MongoDB connected !!
     ```

## Troubleshooting

### MongoDB Connection Fails
- Ensure `MONGODB_URI` is set exactly as shown in Vercel environment variables
- Verify the MongoDB Atlas cluster is accessible from Vercel
- Check that the IP whitelist in MongoDB Atlas includes Vercel's IPs (use 0.0.0.0/0 for testing, but restrict later)

### Missing Contract Artifacts
- Verify `artifacts/contracts/` folder is deployed
- Check Vercel build logs for any file inclusion errors

### .env file not working
- Remember: `.env` is only for local development
- For production, ALL variables must be in Vercel Settings > Environment Variables
- Never commit `.env` file to git

## Files Changed
- `vercel.json` - Added `files` array to include artifacts
- `.env.example` - Created for reference (this can be committed to git)

## Local Development
Continue using `.env` file locally:
```bash
PORT=8000
MONGODB_URI=mongodb+srv://...
# ... other vars
```

## Next Steps
1. Set all environment variables in Vercel dashboard
2. Deploy: Push to your deployment branch
3. Monitor deployment in Vercel dashboard
4. Test the API endpoint after deployment succeeds
