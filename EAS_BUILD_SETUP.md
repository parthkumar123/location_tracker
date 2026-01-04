# EAS Build Setup - Environment Variables

## Problem
The `.env` file is not included in production builds, causing the app to crash because Firebase configuration is missing.

## Solution: Use EAS Secrets

You need to set environment variables as EAS Secrets so they're injected during the build process.

## Steps to Set EAS Secrets

Run these commands to set your Firebase configuration as secrets:

```bash
# Set Firebase configuration secrets
npm run eas -- secret:create --scope project --name FIREBASE_API_KEY --value "YOUR_FIREBASE_API_KEY" --type string
npm run eas -- secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "YOUR_FIREBASE_AUTH_DOMAIN" --type string
npm run eas -- secret:create --scope project --name FIREBASE_PROJECT_ID --value "YOUR_FIREBASE_PROJECT_ID" --type string
npm run eas -- secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value "YOUR_FIREBASE_STORAGE_BUCKET" --type string
npm run eas -- secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "YOUR_FIREBASE_MESSAGING_SENDER_ID" --type string
npm run eas -- secret:create --scope project --name FIREBASE_APP_ID --value "YOUR_FIREBASE_APP_ID" --type string
```

Replace the values with your actual Firebase configuration from your `.env` file.

## Update eas.json to Use Secrets

The `eas.json` file has been updated to include `NODE_ENV`. The secrets will automatically be available as environment variables during the build.

## Alternative: Embed in app.json (Less Secure)

If you prefer not to use EAS Secrets, you can embed the values directly in `app.json` under `extra`, but this is less secure:

```json
"extra": {
  "eas": {
    "projectId": "008ff613-6a17-4c20-9946-dcbc4eed897f"
  },
  "firebase": {
    "apiKey": "YOUR_API_KEY",
    "authDomain": "YOUR_AUTH_DOMAIN",
    // ... etc
  }
}
```

Then update `src/config/constants.ts` to read from `Constants.expoConfig.extra.firebase`.

## After Setting Secrets

1. Rebuild your APK:
   ```bash
   npm run build:apk
   ```

2. The environment variables will be injected during the build process.

## Verify Secrets

To list all your secrets:
```bash
npm run eas -- secret:list
```

