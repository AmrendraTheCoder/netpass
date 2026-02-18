# NetPass — LNMIIT WiFi Auto Login Extension

**NetPass** is a cross-browser extension that automates your login to the LNMIIT WiFi portal. It securely stores your credentials and logs you in instantly whenever you're disconnected or the portal requires re-authentication.

---

## Supported Browsers

| Browser            | Status          | Install URL             |
| ------------------ | --------------- | ----------------------- |
| **Google Chrome**  | ✅ Full Support | `chrome://extensions/`  |
| **Microsoft Edge** | ✅ Full Support | `edge://extensions/`    |
| **Brave**          | ✅ Full Support | `brave://extensions/`   |
| **Opera**          | ✅ Full Support | `opera://extensions/`   |
| **Vivaldi**        | ✅ Full Support | `vivaldi://extensions/` |
| **Arc**            | ✅ Full Support | `arc://extensions/`     |
| **Firefox**        | ✅ Supported    | `about:debugging`       |

---

## Features

- **Secure login** – credentials stored locally, never sent anywhere else.
- **Auto-detection** – recognizes the LNMIIT WiFi login page and logs you in.
- **Auto-reconnect** – handles auto-logouts every 4 hours and reconnects automatically.
- **Clean UI** – gradient-styled popup interface with dark/light theme support.
- **Auto-start** – optional scripts for macOS & Windows to launch your browser on login.
- **Cross-browser** – works on Chrome, Edge, Brave, Opera, Firefox, Vivaldi, Arc, and more.

---

## Installation Guide

### Chromium-Based Browsers (Chrome, Edge, Brave, Opera, Vivaldi, Arc)

1. **Download or clone** this extension folder.
2. Open your browser's extension page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
   - **Opera**: `opera://extensions/`
   - **Vivaldi**: `vivaldi://extensions/`
   - **Arc**: `arc://extensions/`
3. Enable **Developer Mode** (top right toggle).
4. Click **Load unpacked**.
5. Select the `netpass-main` folder (this project's root directory).
6. The NetPass icon will now appear in your browser toolbar.

### Firefox

1. **Download or clone** this extension folder.
2. Open Firefox and go to:
   ```
   about:debugging#/runtime/this-firefox
   ```
3. Click **Load Temporary Add-on**.
4. Select the `manifest.json` file inside the `netpass-main` folder.
5. The NetPass icon will now appear in your toolbar.

> **Note:** In Firefox, temporary add-ons are removed when the browser closes. For permanent installation, the extension needs to be signed via [addons.mozilla.org](https://addons.mozilla.org/).

---

## How to Use

1. Click the NetPass icon in your browser toolbar (you'll see a popup).
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

## Auto-Start Setup (Optional)

Want your browser to launch automatically at login so NetPass is always active?

### macOS

```bash
cd ~/Downloads/netpass-main/scripts
chmod +x install_launch_agent.sh
./install_launch_agent.sh
```

The script will:

- Detect all installed browsers (Chrome, Brave, Edge, Firefox, Opera, Arc, Vivaldi)
- Let you choose which one to auto-start
- Install a macOS Launch Agent to start your browser at login

### Windows

```powershell
cd ~\Downloads\netpass-main\scripts
.\install_task_scheduler.bat
```

The script will:

- Detect all installed browsers (Chrome, Brave, Edge, Firefox, Opera, Vivaldi)
- Let you choose which one to auto-start
- Create a Windows Scheduled Task to start your browser at login

---

## File Structure

```
netpass-main/
├── manifest.json                 # Extension configuration (MV3, cross-browser)
├── README.md                     # This file
│
├── assets/icons/                 # Extension icons (16, 32, 48, 128px)
├── css/shared.css                # Shared theme variables & base styles
│
├── src/
│   ├── browser_polyfill.js       # Cross-browser API compatibility layer
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
    ├── install_launch_agent.sh   # macOS auto-start installer (multi-browser)
    ├── install_task_scheduler.bat # Windows auto-start installer (multi-browser)
    └── com.autoconnect.wifi.plist# macOS LaunchAgent config (template)
```

---

## Privacy & Security

- Credentials are stored **only in your browser's local storage**.
- No internet requests are made other than interacting with the WiFi portal.
- You can change or clear credentials anytime from the popup.

---

## FAQ

**Q: Which browsers are supported?**
Chrome, Edge, Brave, Opera, Vivaldi, Arc (all Chromium-based), and Firefox. Any Chromium-based browser that supports Manifest V3 will work.

**Q: Will this work on Brave/Edge?**
Yes! Full support. Just load it from your browser's extensions page using Developer Mode.

**Q: Does it work on Firefox?**
Yes, with full support. Load it as a temporary add-on via `about:debugging`. For permanent install, the extension would need to be signed via Mozilla's add-on store.

**Q: Can I share it with friends?**
Absolutely. Just share the full extension folder or ZIP. They can load it using Developer Mode in any supported browser.

**Q: Can I publish this to the Chrome Web Store?**
Yes, but you'll need to pay a one-time developer fee of $5 USD.

**Q: Does Safari work?**
Safari requires wrapping the extension in an Xcode project. Manual unpacked loading is not supported. If there's demand, this can be added in a future version.

---

## Contribute or Suggest Improvements

If you'd like to add features like auto-disable outside campus, import/export settings, or native Firefox add-on packaging — feel free to fork and improve!

---

## © NetPass by Amrendra Vikram Singh

This project is open for personal use and modification.
