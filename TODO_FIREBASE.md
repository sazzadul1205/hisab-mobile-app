# TODO — Firebase Push Notifications

> Created 2026-11-04. Firebase is installed but **not configured**.
> Until the steps below are done, the notification feature is fully
> disabled by default and the UI hides itself automatically.

---

## 1. Create a Firebase project

- Go to https://console.firebase.google.com
- Click **Add project** → name it `hisab`
- Follow the wizard (analytics optional — skip if you don't want it)
- Wait for project creation

## 2. Register the web app

- In your Firebase project, click the **web icon** (</>) to add a web app
- App name: `Hisab — Personal Finance`
- Click **Register**, then **Continue**
- Copy the **config object** (apiKey, appId, projectId, storageBucket,
  messagingSenderId, measurementId, authDomain) — you'll paste it into
  `.env` below

## 3. Enable Cloud Messaging

- In the project sidebar, click **Cloud Messaging**
- Click **Web push certificates**
- Generate a key pair and copy the **VAPID public key**
  (needed if you self-host the push sender; optional otherwise)
- Note the **Sender ID** (= `messagingSenderId` from step 2)

## 4. Fill in `.env`

Copy `.env.example` → `.env` and replace the empty values:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.appspot.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX   # optional
```

## 5. Rebuild and reinstall the PWA

```bash
npm run build
# Then in your browser: install the updated PWA (or clear the
# service worker cache and reload so the new sw.js takes effect)
```

## 6. Verify it works

- Open **Settings → Reminders** — the section should now be visible
- Tap **Allow notifications** when the browser prompts
- Tap **Send test notification** — you should see an OS notification
- The green status dot confirms `permission === "granted"`

## 7. (Optional) Server-side delivery

FCM only delivers to devices that have registered a token. To send
nudges you'll need a backend that:

1. Calls `getToken()` via `onTokenRefresh` and stores the token
2. Sends a POST to `https://fcm.googleapis.com/fcm/send` with the
   server key from the Firebase Console
3. Handles the morning/evening schedule server-side (the client only
   registers; the server decides _when_ to push)

## Troubleshooting

| Symptom                                   | Likely cause                                                   |
| ----------------------------------------- | -------------------------------------------------------------- |
| Reminders section missing from Settings   | `VITE_FIREBASE_API_KEY` is empty                               |
| "Allow notifications" button does nothing | Browser blocked the prompt previously — allow in site settings |
| Test notification doesn't appear          | Service worker not updated; clear cache and reinstall PWA      |
| `firebase` import fails at runtime        | `npm install firebase` didn't complete; re-run `npm install`   |

## Files involved

- `.env` / `.env.example` — feature flag
- `src/services/firebase.js` — guarded Firebase init
- `src/services/notifications.js` — push API (short-circuits when disabled)
- `public/sw.js` — background message handler (only loads Firebase if configured)
- `vite.config.js` — replaces `__VITE_FIREBASE_*__` placeholders at build time
- `src/pages/Settings/Settings.jsx` — hides the Reminders entry when disabled
