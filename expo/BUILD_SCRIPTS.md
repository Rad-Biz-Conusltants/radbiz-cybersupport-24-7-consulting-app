# Build Scripts Guide

This document explains all available build scripts and how to use them for production deployment.

## Available Scripts

### Development Scripts

```bash
# Start development server with tunnel
npm start

# Start web development server
npm run start-web

# Start web with debug logging
npm run start-web-dev

# Run linter
npm run lint
```

### Prebuild Scripts

Generate native projects before building:

```bash
# Generate Android native project
npm run prebuild:android

# Generate iOS native project  
npm run prebuild:ios

# Generate both platforms
npm run prebuild:all
```

### Build Scripts

#### Android Builds

```bash
# Build Android debug APK (for testing)
npm run build:android:dev

# Build Android release APK (for production)
npm run build:android:prod

# Manual build process:
expo prebuild --platform android --clean
cd android
./gradlew assembleDebug    # Debug build
./gradlew assembleRelease  # Release build
./gradlew bundleRelease    # AAB for Play Store
```

**Output Locations:**
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

#### iOS Builds

```bash
# Build iOS debug (for testing)
npm run build:ios:dev

# Build iOS release (for production)
npm run build:ios:prod

# Manual build process:
expo prebuild --platform ios --clean
cd ios
pod install
open *.xcworkspace
# Then build in Xcode
```

**Build in Xcode:**
1. Open the `.xcworkspace` file
2. Select your team and signing certificate
3. Product > Archive
4. Distribute App > App Store Connect

#### Web Build

```bash
# Build web production bundle
npm run build:web

# Output will be in web-build/
```

### Firebase Scripts

```bash
# Initialize Firebase (create collections, storage, admin user)
npm run firebase:init

# Deploy Firestore security rules
npm run firebase:deploy-rules

# Deploy Firestore indexes
npm run firebase:deploy-indexes

# Deploy everything (rules, indexes, functions, hosting)
npm run firebase:deploy-all
```

## Build Configurations

### Android Build Configuration

**File: `android/app/build.gradle`**

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "app.radbiz.cybersupport_24_7_consulting_app"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
        }
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

### iOS Build Configuration

**File: `ios/[AppName]/Info.plist`**

Key configurations:
- Bundle Identifier: `app.radbiz.cybersupport-24-7-consulting-app`
- Version: `1.0.0`
- Build Number: `1`

### Web Build Configuration

**File: `app.json`**

```json
{
  "expo": {
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro"
    }
  }
}
```

## Build Optimization

### Android Optimization

```gradle
// Enable ProGuard/R8 for release builds
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        }
    }
}

// Enable multidex if needed
android {
    defaultConfig {
        multiDexEnabled true
    }
}
```

### iOS Optimization

In Xcode:
1. Build Settings > Optimization Level > Fastest, Smallest [-Os]
2. Build Settings > Strip Debug Symbols During Copy > Yes
3. Build Settings > Dead Code Stripping > Yes

### Web Optimization

```bash
# Optimize bundle size
expo export:web

# Analyze bundle
npx webpack-bundle-analyzer web-build/static/js/*.js
```

## Platform-Specific Notes

### Android

**Minimum Requirements:**
- Android 6.0 (API 23) or higher
- 100MB free space
- Internet connection

**Permissions Required:**
- Camera (for photo capture)
- Storage (for file access)
- Internet (for app functionality)

**Build Variants:**
- `debug`: Development build with debugging enabled
- `release`: Production build, optimized and signed

### iOS

**Minimum Requirements:**
- iOS 13.0 or higher
- 100MB free space
- Internet connection

**Capabilities Required:**
- Camera
- Photo Library
- Push Notifications
- Background Modes (if needed)

**Build Configurations:**
- `Debug`: Development build
- `Release`: Production build for App Store

### Web

**Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features:**
- Progressive Web App (PWA) ready
- Responsive design
- Offline support (with service worker)

## Signing Configuration

### Android Signing

**Generate Keystore:**
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Configure Signing:**

`android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=****
MYAPP_RELEASE_KEY_PASSWORD=****
```

`android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
```

### iOS Signing

**Automatic Signing (Recommended):**
1. Open project in Xcode
2. Select target
3. Signing & Capabilities tab
4. Enable "Automatically manage signing"
5. Select your team

**Manual Signing:**
1. Create App ID in Apple Developer Portal
2. Create Distribution Certificate
3. Create Provisioning Profile
4. Download and install in Xcode
5. Select in Signing & Capabilities

## Troubleshooting

### Build Fails

```bash
# Clear all caches
expo prebuild --clean
cd android && ./gradlew clean
cd ios && pod deintegrate && pod install

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Android Build Issues

```bash
# Check Java version
java -version  # Should be 17+

# Check Gradle version
cd android && ./gradlew --version

# Clean and rebuild
./gradlew clean
./gradlew assembleRelease --stacktrace
```

### iOS Build Issues

```bash
# Update CocoaPods
pod repo update
cd ios && pod install

# Clean build
cd ios && xcodebuild clean

# Check for issues
cd ios && pod install --verbose
```

### Web Build Issues

```bash
# Clear Metro cache
expo start --clear

# Clear web build
rm -rf web-build
expo export:web
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run prebuild:android
      - run: cd android && ./gradlew assembleRelease

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run prebuild:ios
      - run: cd ios && pod install
      - run: cd ios && xcodebuild -workspace *.xcworkspace -scheme * archive

  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build:web
      - run: firebase deploy --only hosting
```

## Performance Tips

1. **Enable Hermes** (Android):
   ```gradle
   project.ext.react = [
       enableHermes: true
   ]
   ```

2. **Optimize Images**:
   - Use WebP format
   - Compress images
   - Use appropriate resolutions

3. **Code Splitting**:
   - Lazy load screens
   - Dynamic imports
   - Route-based splitting

4. **Bundle Size**:
   - Remove unused dependencies
   - Use production builds
   - Enable minification

5. **Caching**:
   - Enable asset caching
   - Use service workers (web)
   - Implement offline support

## Support

For build issues:
1. Check this documentation
2. Review DEPLOYMENT.md
3. Check Expo documentation
4. Contact support@radbiz.app

---

**Last Updated**: 2025-01-02
**Version**: 1.0.0
