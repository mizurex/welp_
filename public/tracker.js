(function () {
  "use strict";

  /* ------------------ CONFIG ------------------ */

  // Auto-detect endpoint
  const scriptSrc = document.currentScript && document.currentScript.src;
  const ENDPOINT = scriptSrc 
    ? new URL(scriptSrc).origin + "/api/track"
    : "https://www.trywelp.live/api/track";
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min

  const doc = document;
  const loc = window.location;
  const script = doc.currentScript;
  const DOMAIN = script && script.getAttribute("data-domain");
  const PROJECT_ID = script && script.getAttribute("data-project-id");

  /* ------------------ UTILITIES ------------------ */

  const now = () => Date.now();

  function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
      const t = now();
      if (t - last >= delay) {
        last = t;
        fn.apply(this, args);
      }
    };
  }

  /* ------------------ VISITOR ------------------ */

  function getVisitorId() {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = "v_" + Math.random().toString(36).slice(2);
      localStorage.setItem("visitor_id", id);
    }
    return id;
  }

  /* ------------------ SESSION ------------------ */

  function createSession() {
    const sessionId = "s_" + Math.random().toString(36).slice(2);
    const expiresAt = now() + SESSION_TIMEOUT;

    sessionStorage.setItem("session_id", sessionId);
    sessionStorage.setItem("session_expires", expiresAt);

    track("session_start", {
      landing_page: loc.href,
      referrer: doc.referrer || null,
    });

    return sessionId;
  }

  function getSessionId() {
    const id = sessionStorage.getItem("session_id");
    const expires = Number(sessionStorage.getItem("session_expires"));

    if (!id || now() > expires) {
      return createSession();
    }

    // extend session
    sessionStorage.setItem(
      "session_expires",
      now() + SESSION_TIMEOUT,
    );

    return id;
  }

  /* ------------------ PAYLOAD ------------------ */

  function basePayload(event, data) {
    return {
      event,
      url: loc.href,
      path: loc.pathname,
      domain: DOMAIN,
      project_id: PROJECT_ID,
      title: doc.title,
      referrer: doc.referrer || "direct",
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
      screen: {
        w: window.innerWidth,
        h: window.innerHeight,
      },
      language: navigator.language,
      user_agent: navigator.userAgent,
      data: data || {},
    };
  }

  

  /* ------------------ HEARTBEAT ------------------ */
  // Track active time every 30 seconds to get accurate "Average Time"
  setInterval(() => {
    if (document.visibilityState === "visible") {
      track("heartbeat");
    }
  }, 30000);

  /* ------------------ NETWORK ------------------ */

  function send(payload, forceXHR = false) {
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon && !forceXHR) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", ENDPOINT, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(body);
  }

  function track(event, data, opts = {}) {
    if (!PROJECT_ID) return;
    send(basePayload(event, data), opts.forceXHR);
  }

  /* ------------------ PUBLIC API ------------------ */

  window.your_tracking = function (event, data) {
    track(event, data);
  };

  window.your_tracking.pageview = () => track("pageview");

  /* ------------------ AUTO TRACKING ------------------ */

  // Activity refresh
  ["click", "scroll", "keydown", "touchstart"].forEach((e) =>
    doc.addEventListener(e, throttle(getSessionId, 5000), {
      passive: true,
    }),
  );

  // Initial pageview
  track("pageview");

  // SPA navigation
  let lastPath = loc.pathname;
  const handleNav = () => {
    if (loc.pathname !== lastPath) {
      lastPath = loc.pathname;
      track("pageview");
    }
  };

  ["pushState", "replaceState"].forEach((type) => {
    const orig = history[type];
    history[type] = function () {
      orig.apply(this, arguments);
      handleNav();
    };
  });

  window.addEventListener("popstate", handleNav);

  // Final ping on close
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      track("session_ping", {}, { forceXHR: true });
    }
  });

})();

