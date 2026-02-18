# NetPass — LNMIIT WiFi Auto Login Extension

**NetPass** is a Chrome Extension that automates your login process to the LNMIIT WiFi portal. It securely stores your credentials and logs you in instantly whenever you're disconnected or the portal requires authentication again.

---

## Features

- **Secure login** – credentials stored locally, never sent anywhere else.
- **Auto-detection** – recognizes the LNMIIT WiFi login page and logs you in.
- **Auto-reconnect** – handles auto-logouts every 4 hours and reconnects automatically.
- **Clean UI** – gradient-styled popup interface with dark/light theme support.
- **Auto-start** – optional scripts for macOS & Windows to launch Chrome on login.

---

## Installation Guide (No Chrome Web Store Needed)

To install manually for free:

1. **Download or clone** this extension folder.
2. Open Chrome and go to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked**.
5. Select the `netpass-main` folder (this project's root directory).
6. The NetPass icon will now appear in the Chrome toolbar.

---

## How to Use

1. Click the NetPass icon (you'll see a popup).
2. Enter your **WiFi username** and **password**.
3. Click **Save Credentials**.
4. From now on, whenever you connect to LNMIIT's WiFi and visit:
   ```
   https://172.22.2.6/connect/PortalMain
   ```

   - NetPass will detect the portal
   - Fill in your details
   - Log you in automatically

If you are redirected to a "Regain Access" page after logout, NetPass handles that too and brings you back to the login page.

---

## File Structure

```
netpass-main/
├── manifest.json                 # Chrome extension configuration
├── README.md                     # This file
│
├── assets/icons/                 # Extension icons (16, 32, 48, 128px)
├── css/shared.css                # Shared theme variables & base styles
│
├── src/
│   ├── background.js             # Service worker (alarms, connectivity checks)
│   └── content.js                # Auto-fill and logout detection on portal page
│
├── popup/
│   ├── popup.html                # Popup UI for credential management
│   └── popup.js                  # Popup logic (save/load/theme)
│
├── welcome/
│   ├── welcome.html              # Onboarding page (shown on first install)
│   ├── welcome.js                # Slide navigation logic
│   └── welcome.css               # Welcome page specific styles
│
└── scripts/
    ├── install_launch_agent.sh   # macOS auto-start installer
    ├── install_task_scheduler.bat # Windows auto-start installer
    └── com.autoconnect.wifi.plist# macOS LaunchAgent config
```

---

## Privacy & Security

- Credentials are stored **only in your browser's local storage**.
- No internet requests are made other than interacting with the WiFi portal.
- You can change or clear credentials anytime from the popup.

---

## FAQ

**Q: Will this work on Brave/Edge?**
Yes, as long as the browser supports Chrome extensions (Chromium-based).

**Q: Can I share it with friends?**
Absolutely. Just share the full extension folder or ZIP. They can load it using Developer Mode.

**Q: Can I publish this to the Chrome Web Store for public use?**
Yes, but you'll need to pay a one-time developer fee of $5 USD.

---

## Contribute or Suggest Improvements

If you'd like to add features like auto-disable outside campus, or import/export settings — feel free to fork and improve!

---

## © NetPass by Amrendra Vikram Singh

This project is open for personal use and modification.
