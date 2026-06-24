/*
 * theme.js - sets the light or dark theme before first paint (no flash).
 *
 * Loaded in <head> so it runs before the body renders. The stored preference
 * lives in the app's own localStorage record (bot.v1). When no preference is
 * stored, the theme follows the device setting and keeps following it live.
 * A manual choice from the in-app toggle pins light or dark.
 */
(function () {
  "use strict";

  var KEY = "bot.v1";
  var META_LIGHT = "#f2ead9";
  var META_DARK = "#1c1e22";

  function storedPref() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && (s.theme === "light" || s.theme === "dark")) return s.theme;
    } catch (e) {
      /* Unreadable storage just means "follow the device". */
    }
    return "auto";
  }

  function systemDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function resolve(pref) {
    if (pref === "light" || pref === "dark") return pref;
    return systemDark() ? "dark" : "light";
  }

  function apply(pref) {
    var effective = resolve(pref);
    document.documentElement.setAttribute("data-theme", effective);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", effective === "dark" ? META_DARK : META_LIGHT);
    return effective;
  }

  window.BOT_THEME = {
    apply: apply,
    resolve: resolve,
    stored: storedPref,
    current: function () {
      return document.documentElement.getAttribute("data-theme") || "light";
    },
  };

  apply(storedPref());

  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      if (storedPref() !== "auto") return;
      apply("auto");
      try {
        document.dispatchEvent(new Event("bot-theme-change"));
      } catch (e) {
        /* Engines without the Event constructor just skip the header refresh. */
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
