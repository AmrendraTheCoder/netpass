// Safely get elements (prevents null errors if DOM changes)
const $ = (id) => document.getElementById(id);

const formDiv = $("form");
const optionsDiv = $("options");
const usernameInput = $("username");
const passwordInput = $("password");
const themeToggle = $("themeSwitcher");
const autoLoginToggle = $("autoLoginToggle");
const statusInfo = $("statusInfo");
const statusDot = $("statusDot");
const saveBtn = $("save");
const saveText = $("saveText");
const saveSpinner = $("saveSpinner");
const formError = $("formError");
const togglePasswordBtn = $("togglePassword");
const helpBtn = $("helpBtn");
const eyeOpen = $("eyeOpen");
const eyeClosed = $("eyeClosed");

// ── Password visibility toggle ──

let passwordVisible = false;

if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? "text" : "password";
    if (eyeOpen) eyeOpen.style.display = passwordVisible ? "none" : "block";
    if (eyeClosed) eyeClosed.style.display = passwordVisible ? "block" : "none";
    togglePasswordBtn.title = passwordVisible
      ? "Hide password"
      : "Show password";
  });
}

// ── Help button ──

if (helpBtn) {
  helpBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
  });
}

// ── Check if credentials saved ──

chrome.storage.local.get(["username", "password"], ({ username, password }) => {
  if (username && password && formDiv && optionsDiv) {
    formDiv.style.display = "none";
    optionsDiv.classList.remove("hidden-section");
    optionsDiv.style.display = "flex";
  }
});

// ── Auto-login toggle ──

chrome.storage.local.get(["autoLoginEnabled"], ({ autoLoginEnabled }) => {
  if (autoLoginToggle) autoLoginToggle.checked = autoLoginEnabled !== false;
});

if (autoLoginToggle) {
  autoLoginToggle.addEventListener("change", () => {
    const enabled = autoLoginToggle.checked;
    chrome.storage.local.set({ autoLoginEnabled: enabled });
    chrome.runtime.sendMessage({ type: "TOGGLE_AUTO_LOGIN", enabled });
    updateStatusDisplay();
  });
}

// ── Status display ──

function updateStatusDisplay() {
  if (!statusInfo || !statusDot) return;

  chrome.storage.local.get(
    ["lastCheckTime", "lastCheckStatus", "autoLoginEnabled"],
    ({ lastCheckTime, lastCheckStatus, autoLoginEnabled }) => {
      if (!statusInfo || !statusDot) return;

      if (!autoLoginEnabled && autoLoginEnabled !== undefined) {
        statusInfo.textContent = "Auto-login disabled";
        statusDot.className = "status-dot dot-disabled";
        return;
      }

      if (lastCheckTime) {
        const status = lastCheckStatus || "Checked";
        statusInfo.textContent = `${status}  ·  ${lastCheckTime}`;

        if (
          status.includes("✓") ||
          status.includes("Connected") ||
          status.includes("Logged in")
        ) {
          statusDot.className = "status-dot dot-connected";
        } else if (
          status.includes("unreachable") ||
          status.includes("No credentials")
        ) {
          statusDot.className = "status-dot dot-warning";
        } else {
          statusDot.className = "status-dot dot-pending";
        }
      } else {
        statusInfo.textContent = "Waiting for first check...";
        statusDot.className = "status-dot dot-pending";
      }
    },
  );
}

updateStatusDisplay();
setInterval(updateStatusDisplay, 2000);

// ── Save with loading animation ──

if (saveBtn) {
  saveBtn.addEventListener("click", function () {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (formError) formError.classList.add("hidden");

    if (!username && !password) {
      showFormError("Please enter your username and password");
      shakeInput(usernameInput);
      shakeInput(passwordInput);
      return;
    }
    if (!username) {
      showFormError("Please enter your username");
      shakeInput(usernameInput);
      return;
    }
    if (!password) {
      showFormError("Please enter your password");
      shakeInput(passwordInput);
      return;
    }

    saveBtn.disabled = true;
    if (saveText) saveText.textContent = "Saving...";
    if (saveSpinner) saveSpinner.classList.remove("hidden");
    saveBtn.classList.add("saving");

    setTimeout(() => {
      chrome.storage.local.set({ username, password }, function () {
        if (saveText) saveText.textContent = "Saved";
        if (saveSpinner) saveSpinner.classList.add("hidden");
        saveBtn.classList.remove("saving");
        saveBtn.classList.add("saved");

        const toast = $("toast");
        if (toast) {
          toast.classList.remove("hidden");
          toast.classList.add("show");
        }

        setTimeout(() => {
          if (toast) {
            toast.classList.remove("show");
            toast.classList.add("hidden");
          }

          saveBtn.disabled = false;
          if (saveText) saveText.textContent = "Save Credentials";
          saveBtn.classList.remove("saved");

          if (formDiv) formDiv.style.display = "none";
          if (optionsDiv) {
            optionsDiv.classList.remove("hidden-section");
            optionsDiv.style.display = "flex";
          }
        }, 1200);
      });
    }, 600);
  });
}

function showFormError(msg) {
  if (formError) {
    formError.textContent = msg;
    formError.classList.remove("hidden");
  }
}

function shakeInput(el) {
  if (el && el.parentElement) {
    el.parentElement.classList.add("shake");
    setTimeout(() => el.parentElement.classList.remove("shake"), 400);
  }
}

// ── Connect ──

const connectBtn = $("connect");
if (connectBtn) {
  connectBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://172.22.2.6/connect/PortalMain" });
  });
}

// ── Change Details ──

const changeBtn = $("change");
if (changeBtn) {
  changeBtn.addEventListener("click", () => {
    chrome.storage.local.get(
      ["username", "password"],
      ({ username, password }) => {
        if (username && usernameInput) usernameInput.value = username;
        if (password && passwordInput) passwordInput.value = password;
      },
    );

    if (formDiv) formDiv.style.display = "flex";
    if (optionsDiv) {
      optionsDiv.style.display = "none";
      optionsDiv.classList.add("hidden-section");
    }
    if (formError) formError.classList.add("hidden");

    passwordVisible = false;
    if (passwordInput) passwordInput.type = "password";
    if (eyeOpen) eyeOpen.style.display = "block";
    if (eyeClosed) eyeClosed.style.display = "none";
  });
}

// ── Theme ──

chrome.storage.local.get(["theme"], ({ theme }) => {
  if (theme === "light") {
    document.body.classList.add("light");
    if (themeToggle) themeToggle.checked = true;
    const icon = $("themeIcon");
    if (icon) {
      icon.innerHTML =
        '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    }
  }
});

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    const isLight = themeToggle.checked;
    document.body.classList.toggle("light", isLight);
    chrome.storage.local.set({ theme: isLight ? "light" : "dark" });

    const icon = $("themeIcon");
    if (icon) {
      icon.innerHTML = isLight
        ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  });
}
