# Bloom – Period Tracker (Android + iOS)

One codebase (Expo / React Native) for both Android and iOS. All data stays on the phone.

## Features
- **Cycle tracking**: log or type period dates (e.g. 28-01-2026, 27-02-2026). The app shows the gap between periods (30 days), your average cycle, and predicts the next period.
- **Calendar**: logged periods, predicted days, tap any day to mark a start or end.
- **Daily log**: flow (spotting → very heavy), pain 0–10, symptoms.
- **Health tips**: fruits and foods plus self-care based on flow and pain. Shows a **"see a doctor"** alert for severe pain, very heavy flow, clots, dizziness, periods longer than 7 days, or cycles shorter than 21 or longer than 35 days.
- **Pad stock**: count pads, tap "Used 1", add packs. **Push notification** when stock is low and when it runs out.
- **Period reminders**: notifications 3 days before, 1 day before, and on the predicted day. They warn you if you don't have enough pads.
- **Order in 10 min**: Blinkit, Swiggy Instamart, Zepto, BigBasket (opens the app if installed).
- **Doctors**: save name and number, then Call or WhatsApp in one tap. Also a 112 emergency button.
- **Update popup**: "Update now / Later" when you publish a new version.

## Run it on your phone (testing)
1. Install Node.js LTS on your PC.
2. In this folder: `npm install`, then `npx expo start`
3. Install **Expo Go** on your Android phone or iPhone and scan the QR code.

## Build real apps for Play Store / App Store
```
npm install -g eas-cli
eas login
eas build -p android     # .aab for Play Store (or --profile preview for an .apk)
eas build -p ios         # needs an Apple Developer account ($99/yr)
```

## Turn on the update popup
1. Host `version.json` somewhere public (e.g. a GitHub repo, then use its "raw" link).
2. Put that link in `src/config.js` → `UPDATE_CHECK_URL`, and add your real store links.
3. When you release v1.1.0: change `"version"` in `app.json` to 1.1.0, build, publish, then set `"latestVersion": "1.1.0"` in version.json.
   Set `"mandatory": true` to hide the "Later" button.

## Where things are
- `App.js`: tabs, update popup, notification scheduling
- `src/cycle.js`: cycle maths and predictions
- `src/health.js`: food tips and doctor rules
- `src/notifications.js`: reminders and pad alerts
- `src/config.js`: shop links, update URL
- `src/screens/`: Home, Calendar, Log, Pads, Doctors, Onboarding
