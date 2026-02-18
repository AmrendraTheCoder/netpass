/**
 * NetPass — Cross-Browser Polyfill
 *
 * Normalizes browser extension APIs across all Chromium-based browsers
 * (Chrome, Edge, Brave, Opera, Vivaldi, Arc) and Firefox.
 *
 * Usage: Include this script before any other scripts that use browser APIs.
 *        After loading, use `browser.*` instead of `chrome.*` everywhere.
 */

// Normalize the browser namespace
// Firefox natively provides `browser.*`, Chromium provides `chrome.*`
if (typeof globalThis.browser === "undefined") {
  globalThis.browser = chrome;
}

/**
 * Detect which browser is running this extension.
 * @returns {{ name: string, isChromium: boolean, isFirefox: boolean }}
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;

  if (typeof InstallTrigger !== "undefined" || ua.includes("Firefox")) {
    return { name: "Firefox", isChromium: false, isFirefox: true };
  }

  // Order matters — more specific checks first
  if (ua.includes("Edg/")) {
    return { name: "Microsoft Edge", isChromium: true, isFirefox: false };
  }

  if (ua.includes("Brave") || (navigator.brave && navigator.brave.isBrave)) {
    return { name: "Brave", isChromium: true, isFirefox: false };
  }

  if (ua.includes("OPR/") || ua.includes("Opera")) {
    return { name: "Opera", isChromium: true, isFirefox: false };
  }

  if (ua.includes("Vivaldi")) {
    return { name: "Vivaldi", isChromium: true, isFirefox: false };
  }

  if (ua.includes("Arc")) {
    return { name: "Arc", isChromium: true, isFirefox: false };
  }

  if (ua.includes("Chrome/")) {
    return { name: "Google Chrome", isChromium: true, isFirefox: false };
  }

  // Fallback — assume Chromium-based
  return { name: "Browser", isChromium: true, isFirefox: false };
}

// Make getBrowserInfo available globally
globalThis.getBrowserInfo = getBrowserInfo;
