# Quick Start: Production Deployment

This guide will get your app production-ready in 30 minutes.

---

## Step 1: Fix TypeScript Errors (DONE ✅)

All TypeScript errors have been resolved. The backend is now fully functional.

---

## Step 2: Configure Firebase (5 minutes)

### 2.1 Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `radbiz-sup-app`
3. Go to **Project Settings** > **General**
4. Copy your Firebase config

### 2.2 Update Environment Config
Edit `constants/environment.ts`:

```typescript
firebase: {
  apiKey: 'YOUR_PRODUCTION_API_KEY',
  authDomain: 'radbiz-sup-app.firebaseapp.com',
  projectId: 'radbiz-sup-app',
  storageBucket: 'radbiz-sup-app.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}
```

### 2.3 Download Service Account Key
1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Save as `firebase-service-account.json` in project root
4. **IMPORTANT**: Add to `.gitignore` (already done)

---

## Step 3: Initialize Firebase (2 minutes)

```bash
# Install dependencies if needed
npm install -g firebase-tools
npm install firebase-admin

# Login to Firebase
firebase login

# Run initialization script
node scripts/firebase-init.js

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

This will:
- ✅ Create all required Firestore collections
- ✅ Create storage folders
- ✅ Create admin user (admin@radbiz.app / Admin123!@#)
- ✅ Set up security rules
- ✅ Configure indexes

---

## Step 4: Configure Stripe (3 minutes)

### 4.1 Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your **Live** publishable key
3. Get your **Live** secret key

### 4.2 Update Environment Config
Edit `constants/environment.ts`:

```typescript
stripe: {
  publishableKey: 'pk_live_YOUR_LIVE_KEY',
}
```

### 4.3 Configure Webhook
1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Add endpoint: `https://your-api-url.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`

---

## Step 5: Deploy Backend (5 minutes)

### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option B: Render
1. Connect your GitHub repo
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`

### Option C: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

### Set Environment Variables
```bash
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-url.com
FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json
```

---

## Step 6: Update App Config (2 minutes)

Edit `app.json`:

```json
{
  "expo": {
    "name": "Radbiz IT-Cyber Support",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "app.radbiz.cybersupport"
    },
    "android": {
      "package": "app.radbiz.cybersupport"
    }
  }
}
```

---

## Step 7: Build Apps (10 minutes)

### iOS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android
```bash
# Build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Web
```bash
# Build
npx expo export:web

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Or deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod
```

---

## Step 8: Test Everything (5 minutes)

### Critical Tests
- [ ] User can register
- [ ] User can login
- [ ] User can create ticket
- [ ] User can chat with support
- [ ] User can purchase credits
- [ ] Security features work
- [ ] VPN connects/disconnects

### Quick Test Script
```bash
# Test backend
curl https://your-api-url.com/api

# Test tRPC endpoint
curl https://your-api-url.com/api/trpc/example.hi
```

---

## Step 9: Enable Monitoring (3 minutes)

### Firebase Performance
Already configured! Just verify in Firebase Console.

### Error Tracking (Optional but Recommended)
```bash
# Install Sentry
npm install @sentry/react-native

# Configure in app/_layout.tsx
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

---

## Step 10: Go Live! 🚀

### Pre-Launch Checklist
- [ ] All API keys are production keys
- [ ] Firebase is initialized
- [ ] Backend is deployed and accessible
- [ ] Apps are built and submitted
- [ ] Monitoring is enabled
- [ ] Support team is ready

### Launch!
1. Approve app releases in App Store Connect / Play Console
2. Monitor error rates and user feedback
3. Respond to support tickets
4. Celebrate! 🎉

---

## Troubleshooting

### Backend Not Accessible
```bash
# Check if backend is running
curl https://your-api-url.com/api

# Check logs
railway logs  # or your hosting provider's log command
```

### Firebase Connection Issues
```bash
# Verify Firebase config
firebase projects:list

# Check security rules
firebase deploy --only firestore:rules --debug
```

### Build Failures
```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
eas build --platform ios --profile production
```

### TypeScript Errors
```bash
# Check for errors
npx tsc --noEmit

# If errors persist, check:
# - All imports are correct
# - All types are defined
# - tsconfig.json is valid
```

---

## Support

If you encounter issues:

1. **Check Documentation**
   - `PRODUCTION_READY.md` - Full production guide
   - `DEPLOYMENT.md` - Detailed deployment steps
   - `BUILD_SCRIPTS.md` - Build configuration

2. **Check Logs**
   - Backend logs in your hosting provider
   - Firebase logs in Firebase Console
   - App logs in Xcode/Android Studio

3. **Common Issues**
   - API keys not updated → Check `constants/environment.ts`
   - Firebase not initialized → Run `node scripts/firebase-init.js`
   - Backend not accessible → Check deployment and environment variables

---

## Next Steps After Launch

### Week 1
- Monitor error rates daily
- Respond to user feedback
- Fix critical bugs
- Update documentation

### Month 1
- Analyze user behavior
- Plan feature updates
- Optimize performance
- Improve onboarding

### Ongoing
- Update dependencies monthly
- Security audit quarterly
- Feature releases regularly
- User surveys periodically

---

**You're ready for production! 🚀**

Last Updated: 2025-01-03
