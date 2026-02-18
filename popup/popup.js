// Cross-browser polyfill — normalize browser namespace
if (typeof globalThis.browser === "undefined") {
  globalThis.browser = chrome;
}

document.addEventListener("DOMContentLoaded", () => {
  // ── Helpers ──
  const $ = (id) => document.getElementById(id);
  let passwordVisible = false;
  let statusInterval = null;

  // ── Password visibility toggle ──
  const togglePwdBtn = $("togglePassword");
  if (togglePwdBtn) {
    togglePwdBtn.addEventListener("click", () => {
      const pwdInput = $("password");
      const eyeO = $("eyeOpen");
      const eyeC = $("eyeClosed");
      if (!pwdInput) return;
      passwordVisible = !passwordVisible;
      pwdInput.type = passwordVisible ? "text" : "password";
      if (eyeO) eyeO.style.display = passwordVisible ? "none" : "block";
      if (eyeC) eyeC.style.display = passwordVisible ? "block" : "none";
      togglePwdBtn.title = passwordVisible ? "Hide password" : "Show password";
    });
  }

  // ── Help button ──
  const helpBtn = $("helpBtn");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      browser.tabs.create({
        url: browser.runtime.getURL("welcome/welcome.html"),
      });
    });
  }

  // ── Check if credentials saved ──
  browser.storage.local.get(["username", "password"], (data) => {
    try {
      const f = $("form");
      const o = $("options");
      if (data.username && data.password && f && o) {
        f.style.display = "none";
        o.classList.remove("hidden-section");
        o.style.display = "flex";
      }
    } catch (e) {
      /* ignore */
    }
  });

  // ── Auto-login toggle ──
  browser.storage.local.get(["autoLoginEnabled"], (data) => {
    try {
      const toggle = $("autoLoginToggle");
      if (toggle) toggle.checked = data.autoLoginEnabled !== false;
    } catch (e) {
      /* ignore */
    }
  });

  const autoToggle = $("autoLoginToggle");
  if (autoToggle) {
    autoToggle.addEventListener("change", () => {
      const enabled = autoToggle.checked;
      browser.storage.local.set({ autoLoginEnabled: enabled });
      browser.runtime.sendMessage(
        { type: "TOGGLE_AUTO_LOGIN", enabled },
        () => {
          // Consume response to prevent "Error handling response" messages
          if (browser.runtime.lastError) {
            /* ignore */
          }
        },
      );
      updateStatus();
    });
  }

  // ── Status display ──
  function updateStatus() {
    try {
      const info = $("statusInfo");
      const dot = $("statusDot");
      if (!info || !dot) return;

      browser.storage.local.get(
        ["lastCheckTime", "lastCheckStatus", "autoLoginEnabled"],
        (data) => {
          try {
            // Re-query inside callback to ensure elements still exist
            const si = $("statusInfo");
            const sd = $("statusDot");
            if (!si || !sd) return;

            if (!data.autoLoginEnabled && data.autoLoginEnabled !== undefined) {
              si.textContent = "Auto-login disabled";
              sd.className = "status-dot dot-disabled";
              return;
            }

            if (data.lastCheckTime) {
              const s = data.lastCheckStatus || "Checked";
              si.textContent = s + "  ·  " + data.lastCheckTime;
              if (
                s.includes("✓") ||
                s.includes("Connected") ||
                s.includes("Logged in")
              ) {
                sd.className = "status-dot dot-connected";
              } else if (
                s.includes("unreachable") ||
                s.includes("No credentials")
              ) {
                sd.className = "status-dot dot-warning";
              } else {
                sd.className = "status-dot dot-pending";
              }
            } else {
              si.textContent = "Waiting for first check...";
              sd.className = "status-dot dot-pending";
            }
          } catch (e) {
            /* popup may have closed */
          }
        },
      );
    } catch (e) {
      /* ignore */
    }
  }

  updateStatus();
  statusInterval = setInterval(updateStatus, 2000);

  // ── Save button ──
  const saveBtn = $("save");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const uInput = $("username");
      const pInput = $("password");
      const errDiv = $("formError");
      const sTxt = $("saveText");
      const sSpn = $("saveSpinner");
      if (!uInput || !pInput) return;

      const u = uInput.value.trim();
      const p = pInput.value.trim();

      if (errDiv) errDiv.classList.add("hidden");

      if (!u && !p) {
        showErr("Please enter username and password");
        shake(uInput);
        shake(pInput);
        return;
      }
      if (!u) {
        showErr("Please enter your username");
        shake(uInput);
        return;
      }
      if (!p) {
        showErr("Please enter your password");
        shake(pInput);
        return;
      }

      saveBtn.disabled = true;
      if (sTxt) sTxt.textContent = "Saving...";
      if (sSpn) sSpn.classList.remove("hidden");
      saveBtn.classList.add("saving");

      setTimeout(() => {
        browser.storage.local.set({ username: u, password: p }, () => {
          try {
            if (sTxt) sTxt.textContent = "Saved";
            if (sSpn) sSpn.classList.add("hidden");
            saveBtn.classList.remove("saving");
            saveBtn.classList.add("saved");

            const toast = $("toast");
            if (toast) {
              toast.classList.remove("hidden");
              toast.classList.add("show");
            }

            setTimeout(() => {
              try {
                if (toast) {
                  toast.classList.remove("show");
                  toast.classList.add("hidden");
                }
                saveBtn.disabled = false;
                if (sTxt) sTxt.textContent = "Save Credentials";
                saveBtn.classList.remove("saved");

                const f = $("form");
                const o = $("options");
                if (f) f.style.display = "none";
                if (o) {
                  o.classList.remove("hidden-section");
                  o.style.display = "flex";
                }
              } catch (e) {
                /* ignore */
              }
            }, 1200);
          } catch (e) {
            /* ignore */
          }
        });
      }, 600);
    });
  }

  function showErr(msg) {
    const e = $("formError");
    if (e) {
      e.textContent = msg;
      e.classList.remove("hidden");
    }
  }

  function shake(el) {
    if (el && el.parentElement) {
      el.parentElement.classList.add("shake");
      setTimeout(() => {
        try {
          el.parentElement.classList.remove("shake");
        } catch (e) {}
      }, 400);
    }
  }

  // ── Connect ──
  const connBtn = $("connect");
  if (connBtn) {
    connBtn.addEventListener("click", () => {
      browser.tabs.create({ url: "https://172.22.2.6/connect/PortalMain" });
    });
  }

  // ── Change Details ──
  const chgBtn = $("change");
  if (chgBtn) {
    chgBtn.addEventListener("click", () => {
      browser.storage.local.get(["username", "password"], (data) => {
        try {
          const uI = $("username");
          const pI = $("password");
          if (data.username && uI) uI.value = data.username;
          if (data.password && pI) pI.value = data.password;
        } catch (e) {
          /* ignore */
        }
      });

      const f = $("form");
      const o = $("options");
      const err = $("formError");
      if (f) f.style.display = "flex";
      if (o) {
        o.style.display = "none";
        o.classList.add("hidden-section");
      }
      if (err) err.classList.add("hidden");

      passwordVisible = false;
      const pI = $("password");
      const eO = $("eyeOpen");
      const eC = $("eyeClosed");
      if (pI) pI.type = "password";
      if (eO) eO.style.display = "block";
      if (eC) eC.style.display = "none";
    });
  }

  // ── Theme ──
  const SUN_SVG =
    '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  const MOON_SVG =
    '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';

  browser.storage.local.get(["theme"], (data) => {
    try {
      if (data.theme === "light") {
        document.body.classList.add("light");
        const t = $("themeSwitcher");
        const i = $("themeIcon");
        if (t) t.checked = true;
        if (i) i.innerHTML = SUN_SVG;
      }
    } catch (e) {
      /* ignore */
    }
  });

  const themeSwitch = $("themeSwitcher");
  if (themeSwitch) {
    themeSwitch.addEventListener("change", () => {
      try {
        const isLight = themeSwitch.checked;
        document.body.classList.toggle("light", isLight);
        browser.storage.local.set({ theme: isLight ? "light" : "dark" });
        const i = $("themeIcon");
        if (i) i.innerHTML = isLight ? SUN_SVG : MOON_SVG;
      } catch (e) {
        /* ignore */
      }
    });
  }
});
