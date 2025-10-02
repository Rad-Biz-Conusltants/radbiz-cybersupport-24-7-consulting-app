# RadBiz IT-Cyber Support App - Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Building for Production](#building-for-production)
5. [Platform-Specific Builds](#platform-specific-builds)
6. [Deployment Checklist](#deployment-checklist)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- **Node.js**: v18+ (LTS recommended)
- **Bun**: Latest version
- **Expo CLI**: v53+
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git**: For version control

### Platform-Specific Requirements

#### Android
- **Android Studio**: Latest stable version
- **Java JDK**: 17+
- **Android SDK**: API Level 34+
- **Gradle**: 8.0+

#### iOS
- **macOS**: Required for iOS builds
- **Xcode**: 15.0+
- **CocoaPods**: Latest version
- **Apple Developer Account**: For distribution

#### Web
- **Modern browser**: For testing
- **Web hosting**: Firebase Hosting, Vercel, or similar

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `radbiz-sup-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firebase Services

#### Authentication
```bash
# Enable Email/Password authentication
1. Go to Authentication > Sign-in method
2. Enable "Email/Password"
3. Save changes
```

#### Firestore Database
```bash
# Create Firestore database
1. Go to Firestore Database
2. Click "Create database"
3. Start in production mode
4. Choose location (us-central1 recommended)
```

#### Storage
```bash
# Enable Firebase Storage
1. Go to Storage
2. Click "Get started"
3. Use default security rules (we'll update them)
```

### 3. Get Firebase Configuration

```bash
# Web configuration
1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click "Add app" > Web
4. Register app
5. Copy configuration object
```

Update `constants/environment.ts`:
```typescript
firebase: {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 4. Download Service Account Key

```bash
# For server-side operations
1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save as firebase-service-account.json in project root
4. Add to .gitignore (NEVER commit this file!)
```

### 5. Initialize Firebase

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Run initialization script
node scripts/firebase-init.js

# This will:
# - Create all required collections
# - Set up storage folders
# - Create admin user
# - Verify connections
```

### 6. Deploy Security Rules

```bash
# Initialize Firebase in project
firebase login
firebase init

# Select:
# - Firestore
# - Storage
# - Hosting (optional)

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

## Environment Configuration

### 1. Update Environment Variables

Create `.env.production`:
```bash
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_secret_key

# App
APP_ENV=production
```

### 2. Update app.json

```json
{
  "expo": {
    "name": "Radbiz IT-Cyber Support",
    "slug": "cybersupport-24-7-consulting-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "app.radbiz.cybersupport-24-7-consulting-app",
      "buildNumber": "1"
    },
    "android": {
      "package": "app.radbiz.cybersupport_24_7_consulting_app",
      "versionCode": 1
    }
  }
}
```

---

## Building for Production

### Web Build

```bash
# Export web build
expo export:web

# Output will be in web-build/
# Deploy to Firebase Hosting, Vercel, or your preferred host

# Firebase Hosting deployment
firebase deploy --only hosting
```

### Android Build

#### Option 1: Using Expo Prebuild (Recommended)

```bash
# Generate native Android project
expo prebuild --platform android --clean

# Navigate to android directory
cd android

# Build debug APK (for testing)
./gradlew assembleDebug

# Build release APK (for production)
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Output locations:
# Debug APK: android/app/build/outputs/apk/debug/app-debug.apk
# Release APK: android/app/build/outputs/apk/release/app-release.apk
# Release AAB: android/app/build/outputs/bundle/release/app-release.aab
```

#### Option 2: Using EAS Build (Cloud Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS Build

#### Option 1: Using Expo Prebuild

```bash
# Generate native iOS project
expo prebuild --platform ios --clean

# Navigate to ios directory
cd ios

# Install pods
pod install

# Open in Xcode
open *.xcworkspace

# In Xcode:
# 1. Select your team
# 2. Update bundle identifier
# 3. Configure signing
# 4. Archive for distribution
# 5. Upload to App Store Connect
```

#### Option 2: Using EAS Build

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## Platform-Specific Builds

### Android Signing Configuration

Create `android/app/my-release-key.keystore`:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Update `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### iOS Code Signing

1. **Create App ID** in Apple Developer Portal
2. **Create Provisioning Profile** for distribution
3. **Configure in Xcode**:
   - Select your team
   - Choose provisioning profile
   - Enable automatic signing (recommended)

---

## Deployment Checklist

### Pre-Deployment

- [ ] Update version numbers in `app.json`
- [ ] Test all features thoroughly
- [ ] Run security audit
- [ ] Update Firebase security rules
- [ ] Configure production environment variables
- [ ] Test payment integration (Stripe)
- [ ] Verify all API endpoints
- [ ] Check analytics integration
- [ ] Review app permissions
- [ ] Test on multiple devices/platforms

### Firebase

- [ ] Deploy Firestore rules
- [ ] Deploy Storage rules
- [ ] Deploy Firestore indexes
- [ ] Set up Firebase Functions (if any)
- [ ] Configure Firebase Hosting (for web)
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy

### App Stores

#### Google Play Store
- [ ] Create app listing
- [ ] Upload screenshots (phone, tablet, TV)
- [ ] Write app description
- [ ] Set content rating
- [ ] Configure pricing
- [ ] Upload signed AAB
- [ ] Submit for review

#### Apple App Store
- [ ] Create app in App Store Connect
- [ ] Upload screenshots (all required sizes)
- [ ] Write app description
- [ ] Set age rating
- [ ] Configure pricing
- [ ] Upload build via Xcode or Transporter
- [ ] Submit for review

### Web Deployment

- [ ] Build production bundle
- [ ] Optimize assets
- [ ] Configure CDN
- [ ] Set up SSL certificate
- [ ] Configure domain
- [ ] Deploy to hosting
- [ ] Test production URL

---

## Post-Deployment

### Monitoring

```bash
# Set up Firebase Performance Monitoring
1. Go to Firebase Console > Performance
2. Enable Performance Monitoring
3. Monitor app performance metrics

# Set up Crashlytics
1. Go to Firebase Console > Crashlytics
2. Enable Crashlytics
3. Monitor crash reports
```

### Analytics

```bash
# Firebase Analytics
1. Go to Firebase Console > Analytics
2. Set up custom events
3. Monitor user engagement

# Track key metrics:
- Daily/Monthly Active Users
- Session duration
- Screen views
- Conversion rates
- Retention rates
```

### Maintenance

- **Regular Updates**: Keep dependencies updated
- **Security Patches**: Apply security updates promptly
- **Performance Monitoring**: Track app performance
- **User Feedback**: Monitor reviews and ratings
- **Bug Fixes**: Address issues quickly
- **Feature Updates**: Plan and release new features

---

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
expo prebuild --clean
cd android && ./gradlew clean
cd ios && pod deintegrate && pod install

# Update dependencies
npm install
expo install --fix
```

#### Firebase Connection Issues

```bash
# Verify Firebase configuration
node scripts/firebase-init.js

# Check security rules
firebase deploy --only firestore:rules --debug

# Test Firestore connection
firebase firestore:indexes
```

#### Signing Issues (Android)

```bash
# Verify keystore
keytool -list -v -keystore android/app/my-release-key.keystore

# Check gradle configuration
cd android && ./gradlew signingReport
```

#### Signing Issues (iOS)

```bash
# Clean build folder
cd ios && xcodebuild clean

# Update provisioning profiles
# In Xcode: Preferences > Accounts > Download Manual Profiles

# Verify code signing
codesign -dv --verbose=4 path/to/app
```

### Getting Help

- **Expo Documentation**: https://docs.expo.dev/
- **Firebase Documentation**: https://firebase.google.com/docs
- **React Native Documentation**: https://reactnative.dev/
- **Community Forums**: 
  - Expo Forums: https://forums.expo.dev/
  - Stack Overflow: Tag with `expo`, `react-native`, `firebase`

---

## Security Best Practices

1. **Never commit sensitive data**:
   - Service account keys
   - API keys
   - Passwords
   - Signing keys

2. **Use environment variables** for all sensitive configuration

3. **Enable Firebase App Check** to prevent abuse

4. **Implement rate limiting** on API endpoints

5. **Regular security audits** of code and dependencies

6. **Keep dependencies updated** to patch vulnerabilities

7. **Use HTTPS** for all network requests

8. **Implement proper authentication** and authorization

9. **Encrypt sensitive data** at rest and in transit

10. **Monitor for suspicious activity** using Firebase Analytics

---

## Support

For issues or questions:
- Email: support@radbiz.app
- Documentation: See FIREBASE_BEST_PRACTICES.md
- GitHub Issues: (if applicable)

---

**Last Updated**: 2025-01-02
**Version**: 1.0.0
