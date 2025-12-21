;(function () {
  try {
    var path = window.location.pathname || "/";
    var referrer = document.referrer || "";
    var userAgent = navigator.userAgent || "";

    if (!navigator.sendBeacon) {
      // Fallback for very old browsers
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ path: path, referrer: referrer, userAgent: userAgent }),
      }).catch(function () {});
      return;
    }

    var blob = new Blob(
      [
        JSON.stringify({
          path: path,
          referrer: referrer,
          userAgent: userAgent,
        }),
      ],
      { type: "application/json" }
    );

    navigator.sendBeacon("/api/track", blob);
  } catch (e) {
    // swallow errors – tracker should never break the page
  }
})();


