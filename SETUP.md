# Setup guide – Greenhouse Security Code Helper

## 1. Build the extension

From the project root, run:

```bat
build.bat
```

Or in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

This creates the **build/** folder with the extension and copies **assets/logo/greenhouse.jpg** to **build/icons/icon.jpg** for the extension icon. If the icon file is missing, the build still succeeds but the extension will use the default icon until you add it and rebuild.

## 2. Load the extension in Chrome

1. Open **chrome://extensions**.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the **build** folder inside this project (the one that contains `manifest.json`, `background.js`, `popup/`, etc.).

## 3. Configure Gmail (OAuth)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable the **Gmail API** (APIs & Services → Library → search “Gmail API” → Enable).
4. Create OAuth credentials:
   - **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
   - Application type: **Chrome extension**.
   - Name: e.g. “Greenhouse Security Code Helper”.
   - **Application ID**: copy your extension ID from **chrome://extensions** (click the extension card to see the ID).
5. Copy the **Client ID** (e.g. `xxxxx.apps.googleusercontent.com`).

## 4. Set the Client ID in the extension

1. Open **src/manifest.json** in this project.
2. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` in `oauth2.client_id` with your actual Client ID.
3. Save the file and run **build.bat** again so the **build/** folder has the updated manifest.
4. In **chrome://extensions**, click the refresh icon on the extension to reload it.

## 5. Connect Gmail in the extension

1. Right-click the extension icon → **Options** (or open the options page from the extension card on **chrome://extensions**).
2. Click **Connect Gmail** and sign in with the Google account that receives Greenhouse security code emails.
3. Adjust preferences if desired (desktop notification, in-page toast, toast position, check interval).
4. Click **Save options**.

## 6. Optional: in-page toast on any tab

If you enable **Show in-page toast on the current tab when a new code arrives**, Chrome will ask for permission to run on all sites. Grant it so the toast can appear on whichever tab is active when a new code is detected.

---

After setup, when a new Greenhouse security code email arrives, you’ll get a desktop notification (and optionally an in-page toast) with a **Copy** button. You can also click the extension icon to see the last code and use **Copy** or **Check for new code**.
