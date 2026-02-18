# 🔗 AutoConnect – LNMIIT WiFi Auto Login Extension

**AutoConnect** is a Chrome Extension that automates your login process to the LNMIIT WiFi portal. It securely stores your credentials and logs you in instantly whenever you're disconnected or the portal requires authentication again.

---

## ✅ Features

- 🔐 **Secure login** – credentials stored locally, never sent anywhere else.
- ⚡ **Auto-detection** – recognizes the LNMIIT WiFi login page and logs you in.
- 🔄 **Auto-reconnect** – handles auto-logouts every 3 hours and reconnects automatically.
- 🖼️ **Clean UI** – gradient-styled popup interface for login credential management.

---

## 📦 Installation Guide (No Chrome Web Store Needed)

To install manually for free:

1. **Download or clone** this extension folder.
2. Open Chrome and go to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked**.
5. Select the `AutoConnect` folder (this project's root directory).
6. The AutoConnect icon will now appear in the Chrome toolbar.

---

## ⚙️ How to Use

1. Click the AutoConnect icon (you’ll see a popup).
2. Enter your **WiFi username** and **password**.
3. Click **Save**.
4. From now on, whenever you connect to LNMIIT’s WiFi and visit:
   ```
   https://172.22.2.6/connect/PortalMain
   ```
   - AutoConnect will detect the portal
   - Fill in your details
   - Log you in automatically

If you are redirected to a "Regain Access" page after logout, AutoConnect handles that too and brings you back to the login page.

---

## 🗂️ File Structure

```
AutoConnect/
├── manifest.json          # Chrome extension configuration
├── popup.html             # User interface for input
├── popup.js               # Logic for saving/loading credentials
├── content.js             # Autofill and logout detection
├── background.js          # Injects content script when needed
├── icon.png               # Extension icon (used in Chrome toolbar)
└── README.md              # This file
```

---





## 🔐 Privacy & Security

- Credentials are stored **only in your browser's local storage**.
- No internet requests are made other than interacting with the WiFi portal.
- You can clear credentials anytime from the popup.

---

## ❓ FAQ

**Q: Will this work on Brave/Edge?**  
Yes, as long as the browser supports Chrome extensions (Chromium-based).

**Q: Can I share it with friends?**  
Absolutely. Just share the full extension folder or ZIP. They can load it using Developer Mode.

**Q: Can I publish this to the Chrome Web Store for public use?**  
Yes, but you’ll need to pay a one-time developer fee of $5 USD.

---

## 📩 Contribute or Suggest Improvements

If you'd like to add features like auto-disable outside campus, or import/export settings — feel free to fork and improve!

---

## © AutoConnect by [Tanishq Gangwani]

This project is open for personal use and modification.