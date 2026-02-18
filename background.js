const ALARM_NAME = "wifi-auto-login";
const ALARM_INTERVAL_MINUTES = 240;
const PORTAL_URL = "https://172.22.2.6/connect/PortalMain";
const CONNECTIVITY_CHECK_URL = "https://www.google.com/generate_204";
const LOG = (...args) => console.log("[NetPass]", ...args);

// ──────────────────────────────────────────────
// Alarm setup
// ──────────────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.get(["onboardingDone"], ({ onboardingDone }) => {
      if (!onboardingDone) {
        chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
      }
    });
  }

  chrome.storage.local.get(["autoLoginEnabled"], ({ autoLoginEnabled }) => {
    if (autoLoginEnabled !== false) {
      chrome.storage.local.set({ autoLoginEnabled: true });
      createAlarm();
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["autoLoginEnabled"], ({ autoLoginEnabled }) => {
    if (autoLoginEnabled) {
      createAlarm();
      setTimeout(() => checkAndLogin(), 5000);
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) checkAndLogin();
});

function createAlarm() {
  chrome.alarms.get(ALARM_NAME, (existing) => {
    if (!existing) {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: 1,
        periodInMinutes: ALARM_INTERVAL_MINUTES,
      });
      LOG("Alarm created: every", ALARM_INTERVAL_MINUTES, "minutes");
    }
  });
}

function removeAlarm() {
  chrome.alarms.clear(ALARM_NAME, (ok) => ok && LOG("Alarm removed"));
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

  chrome.storage.local.get(
    ["username", "password"],
    ({ username, password }) => {
      if (!username || !password) {
        LOG("No credentials saved.");
        updateStatus("No credentials saved");
        return;
      }

      chrome.tabs.query({ url: "https://172.22.2.6/*" }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.reload(tabs[0].id);
          LOG("Portal tab exists, reloading.");
        } else {
          chrome.tabs.create({ url: PORTAL_URL, active: false }, (tab) => {
            if (chrome.runtime.lastError) return;
            LOG("Opened portal tab:", tab.id);
            chrome.storage.local.set({ autoOpenedTabId: tab.id });
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
  chrome.storage.local.set({
    lastCheckTime: new Date().toLocaleString(),
    lastCheckStatus: status,
  });
}

// ──────────────────────────────────────────────
// Message listener
// ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "LOGIN_SUCCESS") {
    LOG("Login successful!");
    updateStatus("Logged in ✓");

    chrome.storage.local.get(["autoOpenedTabId"], ({ autoOpenedTabId }) => {
      if (autoOpenedTabId && sender.tab && sender.tab.id === autoOpenedTabId) {
        setTimeout(() => {
          chrome.tabs.remove(sender.tab.id, () => {
            if (chrome.runtime.lastError) return;
            LOG("Portal tab closed.");
            chrome.storage.local.remove("autoOpenedTabId");
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
// Content script injection (programmatic only)
// Using async listener + try/catch to fully
// suppress errors on unreachable/error pages
// ──────────────────────────────────────────────

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab.url || !tab.url.includes("172.22.2.6")) return;

  try {
    // This will throw if the page is an error page
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
    LOG("content.js injected into tab", tabId);
  } catch (err) {
    // Fully caught — no unhandled rejection
    LOG("Injection skipped:", err.message);

    // Close auto-opened error tabs
    chrome.storage.local.get(["autoOpenedTabId"], ({ autoOpenedTabId }) => {
      if (autoOpenedTabId && autoOpenedTabId === tabId) {
        LOG("Closing unreachable auto-opened tab.");
        updateStatus("Portal unreachable");
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) return;
          chrome.storage.local.remove("autoOpenedTabId");
        });
      }
    });
  }
});
