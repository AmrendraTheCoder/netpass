function autoLogin(username, password) {
  const tryFill = () => {
    const usernameInput = document.getElementById(
      "LoginUserPassword_auth_username",
    );
    const passwordInput = document.getElementById(
      "LoginUserPassword_auth_password",
    );
    const loginButton = document.getElementById("UserCheck_Login_Button");

    if (usernameInput && passwordInput && loginButton) {
      usernameInput.focus();
      usernameInput.value = username;
      usernameInput.dispatchEvent(new Event("input", { bubbles: true }));

      passwordInput.focus();
      passwordInput.value = password;
      passwordInput.dispatchEvent(new Event("input", { bubbles: true }));

      loginButton.click();

      // Notify background.js that login was attempted
      setTimeout(() => {
        notifyLoginSuccess();
      }, 3000);
    } else {
      setTimeout(tryFill, 500); // Retry until inputs appear
    }
  };

  tryFill();
}

function notifyLoginSuccess() {
  // Check if login was successful by looking for success indicators
  // or absence of the login form
  const loginForm = document.getElementById("LoginUserPassword_auth_username");
  const successIndicators = [
    () => document.body.textContent.includes("You are logged in"),
    () => document.body.textContent.includes("Logged in"),
    () => document.body.textContent.includes("successfully"),
    () => !loginForm, // Login form no longer visible
  ];

  const isSuccess = successIndicators.some((check) => {
    try {
      return check();
    } catch {
      return false;
    }
  });

  if (isSuccess) {
    try {
      chrome.runtime.sendMessage({ type: "LOGIN_SUCCESS" });
      console.log("[NetPass] Login success notification sent.");
    } catch (e) {
      console.log("[NetPass] Could not send message:", e.message);
    }
  } else {
    console.log("[NetPass] Login may not have succeeded, keeping tab open.");
  }
}

function handleLoginFlow() {
  // Check if already logged in
  const alreadyLoggedIn =
    document.body.textContent.includes("You are logged in") ||
    document.body.textContent.includes("Logged in");

  if (alreadyLoggedIn) {
    console.log("[NetPass] Already logged in. Notifying background...");
    try {
      chrome.runtime.sendMessage({ type: "LOGIN_SUCCESS" });
    } catch (e) {
      /* ignore */
    }
    return;
  }

  // Check if on logout screen
  const logoutMsg = Array.from(document.querySelectorAll("p")).find((p) =>
    p.textContent.includes("You have logged out from the network"),
  );

  if (logoutMsg) {
    const regainBtn = document.querySelector(
      "span.portal_link[onclick*='Reset']",
    );
    if (regainBtn) {
      console.log(
        "[NetPass] Detected logout screen. Clicking 'Regain access to the network'...",
      );
      regainBtn.click();

      // Observe DOM for login form after redirection
      const observer = new MutationObserver(() => {
        const usernameInput = document.getElementById(
          "LoginUserPassword_auth_username",
        );
        if (usernameInput) {
          observer.disconnect();
          chrome.storage.local.get(
            ["username", "password"],
            ({ username, password }) => {
              if (!username || !password) return;
              autoLogin(username, password);
            },
          );
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
    return;
  }

  // Normal login if not on logout screen
  chrome.storage.local.get(
    ["username", "password"],
    ({ username, password }) => {
      if (!username || !password) return;
      autoLogin(username, password);
    },
  );
}

// Run after full page load
window.addEventListener("load", () => {
  setTimeout(handleLoginFlow, 1000);
});
