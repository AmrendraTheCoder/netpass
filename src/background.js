// Cross-browser polyfill — normalize browser namespace
if (typeof globalThis.browser === "undefined") {
  globalThis.browser = chrome;
}

const ALARM_NAME = "wifi-auto-login";
const ALARM_INTERVAL_MINUTES = 240;
const PORTAL_URL = "https://172.22.2.6/connect/PortalMain";
const CONNECTIVITY_CHECK_URL = "https://www.google.com/generate_204";
const LOG = (...args) => console.log("[NetPass]", ...args);

// ──────────────────────────────────────────────
// Alarm setup
// ──────────────────────────────────────────────

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.storage.local.get(["onboardingDone"], ({ onboardingDone }) => {
      if (!onboardingDone) {
        browser.tabs.create({
          url: browser.runtime.getURL("welcome/welcome.html"),
        });
      }
    });
  }

  browser.storage.local.get(["autoLoginEnabled"], ({ autoLoginEnabled }) => {
    if (autoLoginEnabled !== false) {
      browser.storage.local.set({ autoLoginEnabled: true });
      createAlarm();
    }
  });
});

browser.runtime.onStartup.addListener(() => {
  browser.storage.local.get(["autoLoginEnabled"], ({ autoLoginEnabled }) => {
    if (autoLoginEnabled) {
      createAlarm();
      setTimeout(() => checkAndLogin(), 5000);
    }
  });
});

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) checkAndLogin();
});

function createAlarm() {
  browser.alarms.get(ALARM_NAME, (existing) => {
    if (!existing) {
      browser.alarms.create(ALARM_NAME, {
        delayInMinutes: 1,
        periodInMinutes: ALARM_INTERVAL_MINUTES,
      });
      LOG("Alarm created: every", ALARM_INTERVAL_MINUTES, "minutes");
    }
  });
}

function removeAlarm() {
  browser.alarms.clear(ALARM_NAME, (ok) => ok && LOG("Alarm removed"));
}

// ──────────────────────────────────────────────
// Connectivity check & auto-login
// ──────────────────────────────────────────────

async function checkAndLogin() {
  LOG("Running connectivity check...");
  const isConnected = await checkConnectivity();

  if (isConnected) {
    LOG("Already connected.");
    updateStatus("Connected ✓");
    return;
  }

  LOG("Not connected. Opening portal...");
  updateStatus("Logging in...");

  browser.storage.local.get(
    ["username", "password"],
    ({ username, password }) => {
      if (!username || !password) {
        LOG("No credentials saved.");
        updateStatus("No credentials saved");
        return;
      }

      browser.tabs.query({ url: "https://172.22.2.6/*" }, (tabs) => {
        if (tabs.length > 0) {
          browser.tabs.reload(tabs[0].id);
          LOG("Portal tab exists, reloading.");
        } else {
          browser.tabs.create({ url: PORTAL_URL, active: false }, (tab) => {
            if (browser.runtime.lastError) return;
            LOG("Opened portal tab:", tab.id);
            browser.storage.local.set({ autoOpenedTabId: tab.id });
          });
        }
      });
    },
  );
}

async function checkConnectivity() {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 5000);
    await fetch(CONNECTIVITY_CHECK_URL, {
      method: "HEAD",
      mode: "no-cors",
      signal: c.signal,
    });
    clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

function updateStatus(status) {
  browser.storage.local.set({
    lastCheckTime: new Date().toLocaleString(),
    lastCheckStatus: status,
  });
}

// ──────────────────────────────────────────────
// Message listener
// ──────────────────────────────────────────────

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "LOGIN_SUCCESS") {
    LOG("Login successful!");
    updateStatus("Logged in ✓");

    browser.storage.local.get(["autoOpenedTabId"], ({ autoOpenedTabId }) => {
      if (autoOpenedTabId && sender.tab && sender.tab.id === autoOpenedTabId) {
        setTimeout(() => {
          browser.tabs.remove(sender.tab.id, () => {
            if (browser.runtime.lastError) return;
            LOG("Portal tab closed.");
            browser.storage.local.remove("autoOpenedTabId");
          });
        }, 2000);
      }
    });

    sendResponse({ received: true });
    return true; // Keep message channel open for async response
  }

  if (message.type === "TOGGLE_AUTO_LOGIN") {
    message.enabled ? createAlarm() : removeAlarm();
    sendResponse({ received: true });
  }
});

// ──────────────────────────────────────────────
// Content script injection (programmatic — Chromium)
// Firefox uses content_scripts in manifest.json instead
// ──────────────────────────────────────────────

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab.url || !tab.url.includes("172.22.2.6")) return;

  // Check if scripting API is available (Chromium browsers)
  if (browser.scripting && browser.scripting.executeScript) {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ["src/content.js"],
      });
      LOG("content.js injected into tab", tabId);
    } catch (err) {
      LOG("Injection skipped:", err.message);

      // Close auto-opened error tabs
      browser.storage.local.get(["autoOpenedTabId"], ({ autoOpenedTabId }) => {
        if (autoOpenedTabId && autoOpenedTabId === tabId) {
          LOG("Closing unreachable auto-opened tab.");
          updateStatus("Portal unreachable");
          browser.tabs.remove(tabId, () => {
            if (browser.runtime.lastError) return;
            browser.storage.local.remove("autoOpenedTabId");
          });
        }
      });
    }
  } else {
    // Firefox: content script is injected via manifest.json content_scripts
    // Just handle the error-tab cleanup here
    LOG(
      "Programmatic injection not available (Firefox). Using manifest content_scripts.",
    );
  }
});
