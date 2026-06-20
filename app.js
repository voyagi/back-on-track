/*
 * app.js — Back on Track
 *
 * Dependency-free single-page app. Hash routing (#/today) so it works on any static host
 * and offline. All state is kept on the device in localStorage (no accounts, no servers).
 *
 * Bilingual: window.CONTENT has `en` and `nl`. The chosen language is stored on the device
 * and can be switched live with the header toggle. Every visible string comes from CONTENT,
 * so adding a language never touches this file.
 *
 * Sections map one-to-one to the fridge magnets:
 *   green=today  blue=learn  amber=flare  purple=goal  red=safety
 */
(function () {
  "use strict";
  var STORE_KEY = "bot.v1";
  var ANIM = Object.freeze(window.EXERCISE_ANIM || {}); // frozen: only our static SVG strings

  /* ---------------- state ---------------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  // Coerce persisted state into the expected shape so corrupted or tampered localStorage
  // (wrong types, a non-array `done`, a non-numeric `feel`) degrades gracefully instead of
  // hard-crashing the app on load or on a tap.
  function sanitizeState(s) {
    if (!s || typeof s !== "object" || Array.isArray(s)) s = {};
    if (typeof s.goal === "string") s.goal = s.goal.slice(0, 80); else delete s.goal;
    if (typeof s.lang !== "string") delete s.lang;
    var src = s.days && typeof s.days === "object" && !Array.isArray(s.days) ? s.days : {};
    var days = {};
    Object.keys(src).forEach(function (k) {
      var d = src[k];
      if (!d || typeof d !== "object") return;
      days[k] = {
        done: Array.isArray(d.done) ? d.done.filter(function (x) { return typeof x === "string"; }) : [],
        feel: typeof d.feel === "number" && isFinite(d.feel) ? d.feel : null,
      };
    });
    s.days = days;
    return s;
  }
  function save() {
    // Guarded: Safari private mode and a full quota throw on setItem. If that happens the
    // app keeps working from in-memory state for the session instead of crashing on every save.
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function nextLang() {
    var keys = Object.keys(window.CONTENT);
    return keys[(keys.indexOf(lang) + 1) % keys.length];
  }
  var state = sanitizeState(load());

  /* ---------------- language ---------------- */
  function detectLang() {
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("nl") === 0 ? "nl" : "en";
  }
  var qLang = (location.search.match(/[?&]lang=(en|nl)\b/) || [])[1];
  var lang = qLang || state.lang || detectLang();
  if (!window.CONTENT[lang]) lang = "en";
  // A magnet QR can carry ?lang=nl so it opens (and remembers) the right language.
  if (qLang && state.lang !== qLang) { state.lang = qLang; save(); }
  var C = window.CONTENT[lang];

  function setLang(l) {
    if (!window.CONTENT[l]) return;
    lang = l;
    state.lang = l;
    save();
    C = window.CONTENT[l];
    document.documentElement.lang = lang;
    applyChrome();
    route();
  }

  /* ---------------- dates ---------------- */
  function dateKey(back) {
    var d = new Date();
    d.setDate(d.getDate() - (back || 0));
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function today() {
    var k = dateKey(0);
    if (!state.days[k]) state.days[k] = { done: [], feel: null };
    return state.days[k];
  }
  function daysMovedThisWeek() {
    var n = 0;
    for (var i = 0; i < 7; i++) {
      var d = state.days[dateKey(i)];
      if (d && d.done && d.done.length) n++;
    }
    return n;
  }

  /* ---------------- helpers ---------------- */
  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function tpl(s, map) {
    return s.replace(/\{(\w+)\}/g, function (_, k) { return k in map ? map[k] : "{" + k + "}"; });
  }
  function exerciseById(id) {
    for (var i = 0; i < C.exercises.length; i++) if (C.exercises[i].id === id) return C.exercises[i];
    return null;
  }
  // Media block: the looping animation for this exercise (falls back to a play glyph).
  function media(id, stepLabel) {
    var anim = ANIM[id] || '<span class="play">▶</span>';
    return '<div class="media">' + (stepLabel ? '<span class="stepno">' + stepLabel + "</span>" : "") + anim + "</div>";
  }

  /* ---------------- chrome (nav labels + language button) ---------------- */
  function applyChrome() {
    Array.prototype.forEach.call(document.querySelectorAll(".tabbar a"), function (a) {
      var tab = a.getAttribute("data-tab");
      var label = a.querySelector(".tl");
      if (label && C.ui.nav[tab]) label.textContent = C.ui.nav[tab];
    });
    var lb = el("langBtn");
    if (lb) {
      // Show the NEXT language's own name, so adding a third language to content.js just works.
      var nn = window.CONTENT[nextLang()].ui.langName || nextLang().toUpperCase();
      lb.textContent = "🌐 " + nn;
      lb.setAttribute("title", C.ui.switchTitle);
      lb.setAttribute("aria-label", C.ui.switchTitle);
    }
  }

  /* ---------------- routing ---------------- */
  var screens = { home: renderHome, today: renderToday, learn: renderLearn, flare: renderFlare, goal: renderGoal, safety: renderSafety, progress: renderProgress };

  function currentRoute() {
    var h = (location.hash || "#/home").replace(/^#\//, "").split("?")[0];
    return screens[h] ? h : "home";
  }

  function route() {
    var name = currentRoute();
    el("title").textContent = name === "home" ? C.ui.brand : C.ui.header[name];
    el("back").classList.toggle("show", name !== "home");
    var container = el("screen");
    container.innerHTML = "";
    screens[name](container);
    Array.prototype.forEach.call(document.querySelectorAll(".tabbar a"), function (a) {
      if (a.getAttribute("data-tab") === name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    var head = container.querySelector("h2, h1");
    if (head) { head.setAttribute("tabindex", "-1"); head.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  /* ---------------- screens ---------------- */
  function tile(color, r, ico, t, s) {
    return '<a class="tile ' + color + '" href="#/' + r + '"><span class="ico">' + ico + "</span><span>" + esc(t) + "<br><small>" + esc(s) + "</small></span></a>";
  }

  function movedMsg(moved, doneToday) {
    if (!moved) return "";
    var m = C.ui.moved;
    var base = moved === 1 ? m.one : tpl(m.many, { n: moved });
    return '<a class="today-progress" href="#/progress" style="margin-top:14px;display:block;text-decoration:none">👏 ' + esc(base) + esc(doneToday ? m.incToday : "") + "</a>";
  }

  function renderHome(c) {
    var goal = state.goal;
    var T = C.ui.tiles;
    var facesHtml = C.feelFaces.map(function (f) {
      return '<button class="face" data-feel="' + f.value + '" aria-pressed="' + (today().feel === f.value) + '"><span class="em">' + f.emoji + "</span>" + esc(f.label) + "</button>";
    }).join("");

    c.innerHTML =
      '<section class="hero">' +
      '<p class="hello">' + esc(C.ui.hello) + " 👋</p>" +
      '<p class="sub">' + esc(C.ui.tagline) + "</p>" +
      '<a class="goal-pinned' + (goal ? "" : " empty") + '" href="#/goal"><span class="star">⭐</span><span><span class="label">' +
      esc(C.ui.goalPinned.label) + '</span><br><span class="value">' + esc(goal || C.ui.goalPinned.empty) + "</span></span></a>" +
      "</section>" +
      '<div class="install-hint" id="installHint">📲 ' + esc(C.ui.install.text) + '<button id="installBtn">' + esc(C.ui.install.add) + "</button></div>" +
      '<div class="install-hint" id="iosHint"><span>📲 ' + esc(C.ui.install.ios) + "</span></div>" +
      '<h2 class="screen-title" style="font-size:20px;color:var(--ink)">' + esc(C.ui.whatNeed) + "</h2>" +
      '<div class="tiles">' +
      tile("green", "today", "🏃", T.today.t, T.today.s) +
      tile("blue", "learn", "💡", T.learn.t, T.learn.s) +
      tile("amber", "flare", "🌧️", T.flare.t, T.flare.s) +
      tile("purple", "goal", "⭐", T.goal.t, T.goal.s) +
      '<a class="tile red wide" href="#/safety"><span class="ico">🚩</span><span>' + esc(T.safety.t) + "<br><small>" + esc(T.safety.s) + "</small></span></a>" +
      "</div>" +
      '<section class="checkin"><h2>' + esc(C.ui.howFeel) + '</h2><div class="faces">' + facesHtml + "</div>" +
      movedMsg(daysMovedThisWeek(), today().done.length > 0) + "</section>" +
      '<a class="progress-link" href="#/progress">📊 ' + esc(C.ui.progress.link) + "</a>" +
      '<p class="disclaimer">' + esc(C.ui.disclaimer) + "</p>";

    Array.prototype.forEach.call(c.querySelectorAll(".face"), function (b) {
      b.addEventListener("click", function () { today().feel = parseInt(b.getAttribute("data-feel"), 10); save(); route(); });
    });
    wireInstall();
  }

  function renderToday(c) {
    var doneIds = today().done;
    var total = C.exercises.length;
    var u = C.ui.today;
    var cards = C.exercises.map(function (ex, i) {
      var isDone = doneIds.indexOf(ex.id) !== -1;
      return '<article class="card exercise">' + media(ex.id, (i + 1) + "/" + total) +
        "<h3>" + esc(ex.name) + "</h3>" +
        '<p class="cue">' + esc(ex.cue) + "</p>" +
        '<p class="reps">' + esc(ex.reps) + "</p>" +
        '<p class="why">' + esc(ex.why) + "</p>" +
        '<button class="done-btn" data-ex="' + ex.id + '" aria-pressed="' + isDone + '">' + esc(isDone ? u.done : u.markDone) + "</button></article>";
    }).join("");

    c.innerHTML =
      '<div class="screen" data-c="green">' +
      '<h2 class="screen-title">' + esc(u.title) + "</h2>" +
      '<p class="screen-intro">' + esc(u.intro) + "</p>" +
      '<div class="today-progress">' + esc(tpl(u.progress, { d: doneIds.length, t: total }) + (doneIds.length >= total ? u.complete : "")) + "</div>" +
      cards + "</div>";

    Array.prototype.forEach.call(c.querySelectorAll(".done-btn"), function (b) {
      b.addEventListener("click", function () {
        var arr = today().done, id = b.getAttribute("data-ex"), idx = arr.indexOf(id);
        if (idx === -1) arr.push(id); else arr.splice(idx, 1);
        save(); route();
      });
    });
  }

  function renderLearn(c) {
    var cards = C.lessons.map(function (l, i) {
      return '<details class="card lesson"' + (i === 0 ? " open" : "") + "><summary>" + esc(l.title) + "</summary><p>" + esc(l.body) + "</p></details>";
    }).join("");
    c.innerHTML = '<div class="screen" data-c="blue"><h2 class="screen-title">' + esc(C.ui.learn.title) + '</h2><p class="screen-intro">' + esc(C.ui.learn.intro) + "</p>" + cards + "</div>";
  }

  function renderFlare(c) {
    var u = C.ui.flare;
    var steps = C.flare.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var routine = C.flare.gentleRoutine.map(function (id) {
      var ex = exerciseById(id);
      return ex ? '<article class="card exercise">' + media(ex.id, null) + "<h3>" + esc(ex.name) + '</h3><p class="cue">' + esc(ex.cue) + '</p><p class="reps">' + esc(ex.reps) + "</p></article>" : "";
    }).join("");
    c.innerHTML =
      '<div class="screen" data-c="amber">' +
      '<h2 class="screen-title">' + esc(u.title) + "</h2>" +
      '<div class="banner">' + esc(C.flare.reassure) + "</div>" +
      '<h3 style="margin:8px 0">' + esc(u.tryThis) + '</h3><ol class="steps">' + steps + "</ol>" +
      '<h3 style="margin:8px 0">' + esc(u.easyRoutine) + "</h3>" + routine +
      '<div class="banner" style="margin-top:8px">' + esc(C.flare.seekHelp) + ' <a href="#/safety" style="color:inherit;font-weight:800;text-decoration:underline">' + esc(u.openIt) + " →</a></div></div>";
  }

  function renderGoal(c) {
    var u = C.ui.goal;
    var chips = C.goalPrompts.map(function (g) { return '<button class="chip" data-goal="' + esc(g) + '">' + esc(g) + "</button>"; }).join("");
    c.innerHTML =
      '<div class="screen" data-c="purple">' +
      '<h2 class="screen-title">' + esc(u.title) + "</h2>" +
      '<p class="screen-intro">' + esc(u.intro) + "</p>" +
      '<input class="goal-input" id="goalInput" type="text" maxlength="80" placeholder="' + esc(u.placeholder) + '" value="' + esc(state.goal || "") + '">' +
      '<div class="chips">' + chips + "</div>" +
      '<button class="primary-btn" id="saveGoal">' + esc(u.save) + "</button></div>";
    Array.prototype.forEach.call(c.querySelectorAll(".chip"), function (b) {
      b.addEventListener("click", function () { el("goalInput").value = b.getAttribute("data-goal"); });
    });
    el("saveGoal").addEventListener("click", function () {
      var v = el("goalInput").value.trim().slice(0, 80);
      state.goal = v; // an empty value clears the goal
      save();
      showToast(v ? u.saved : u.cleared);
      location.hash = "#/home";
    });
  }

  function renderSafety(c) {
    var flags = C.redFlags.flags.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    c.innerHTML =
      '<div class="screen" data-c="red">' +
      '<h2 class="screen-title">' + esc(C.ui.safety.title) + "</h2>" +
      '<p class="screen-intro">' + esc(C.redFlags.intro) + "</p>" +
      '<ul class="flags">' + flags + "</ul>" +
      '<div class="action-box">' + esc(C.redFlags.action) + "</div>" +
      '<p class="screen-intro" style="margin-top:12px">' + esc(C.redFlags.cantCatch) + "</p>" +
      '<p class="disclaimer">' + esc(C.ui.disclaimer) + "</p></div>";
  }

  /* ---------------- progress (a summary the patient can share with their physio) ---------------- */
  function progressStats() {
    var days = state.days || {};
    var exerciseDaysTotal = 0, exercises = 0, firstK = null;
    Object.keys(days).sort().forEach(function (k) {
      var d = days[k];
      var did = d.done && d.done.length > 0;
      if (did) exerciseDaysTotal++;
      if ((did || d.feel != null) && !firstK) firstK = k; // range starts at the first day of any use
      if (d.done) exercises += d.done.length;
    });
    var trend = [], exerciseDaysWeek = 0;
    for (var i = 6; i >= 0; i--) {
      var dd = days[dateKey(i)];
      if (dd && dd.done && dd.done.length > 0) exerciseDaysWeek++;
      trend.push(dd && dd.feel != null ? dd.feel : null);
    }
    return { exerciseDaysTotal: exerciseDaysTotal, exerciseDaysWeek: exerciseDaysWeek, exercises: exercises, trend: trend, firstK: firstK, todayK: dateKey(0) };
  }

  function feelEmoji(v) {
    var f = v == null ? null : C.feelFaces[v];
    return f ? f.emoji : null; // guards against an out-of-range / corrupted persisted feel value
  }
  function feelTrendHtml(trend) {
    return '<div class="feel-trend">' + trend.map(function (v) {
      var e = feelEmoji(v);
      return e ? "<span>" + e + "</span>" : '<span class="none">·</span>';
    }).join("") + "</div>";
  }

  function progressShareText(p, st) {
    var lines = [p.shareTitle];
    if (state.goal) lines.push(p.goalLabel + ": " + state.goal);
    lines.push(p.activeDays + ": " + st.exerciseDaysTotal + " (" + p.thisWeek + ": " + st.exerciseDaysWeek + ")");
    lines.push(p.exercises + ": " + st.exercises);
    lines.push(p.feeling + ": " + st.trend.map(function (v) { return feelEmoji(v) || "-"; }).join(" "));
    if (st.firstK) lines.push(tpl(p.range, { from: st.firstK, to: st.todayK }));
    return lines.join("\n");
  }

  function copyText(text, p) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast(p.copied); }, function () { legacyCopy(text, p); });
    } else {
      legacyCopy(text, p);
    }
  }
  function legacyCopy(text, p) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      showToast(p.copied);
    } catch (e) {}
  }

  function renderProgress(c) {
    var p = C.ui.progress;
    var st = progressStats();
    var hasData = st.exerciseDaysTotal > 0 || !!st.firstK || !!state.goal;
    var body =
      '<div class="stat"><div class="num">' + st.exerciseDaysTotal + '</div><div class="lbl">' + esc(p.activeDays) +
      " (" + esc(p.thisWeek) + ": " + st.exerciseDaysWeek + ")</div></div>" +
      '<div class="stat"><div class="num">' + st.exercises + '</div><div class="lbl">' + esc(p.exercises) + "</div></div>" +
      '<div class="stat"><div class="lbl" style="margin-bottom:6px">' + esc(p.feeling) + "</div>" + feelTrendHtml(st.trend) + "</div>" +
      (state.goal ? '<div class="stat"><div class="lbl">' + esc(p.goalLabel) + '</div><div style="font-weight:700">⭐ ' + esc(state.goal) + "</div></div>" : "") +
      (st.firstK ? '<p class="screen-intro" style="margin-top:4px">' + esc(tpl(p.range, { from: st.firstK, to: st.todayK })) + "</p>" : "");

    c.innerHTML =
      '<div class="screen" data-c="blue">' +
      '<h2 class="screen-title">' + esc(p.title) + "</h2>" +
      '<p class="screen-intro">' + esc(p.intro) + "</p>" +
      (hasData ? body : '<div class="banner">' + esc(p.none) + "</div>") +
      '<button class="share-btn" id="shareBtn">📤 ' + esc(p.share) + "</button>" +
      '<p class="privacy-note">🔒 ' + esc(p.privacy) + "</p></div>";

    el("shareBtn").addEventListener("click", function () {
      var text = progressShareText(p, st);
      if (navigator.share) {
        navigator.share({ title: p.shareTitle, text: text }).catch(function (err) {
          if (!err || err.name !== "AbortError") copyText(text, p); // real failure (not a user cancel) -> copy
        });
      } else {
        copyText(text, p);
      }
    });
  }

  /* ---------------- toast ---------------- */
  var toastTimer;
  function showToast(msg) {
    var t = el("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------------- PWA install ---------------- */
  var deferredPrompt = null;
  function wireInstall() {
    var hint = el("installHint"), btn = el("installBtn");
    // iOS never fires beforeinstallprompt, so show a manual "Add to Home Screen" tip there instead
    // (installing makes the on-device storage durable, which matters across a multi-week trial).
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var standalone = ("standalone" in navigator && navigator.standalone) || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    var iosHint = el("iosHint");
    if (iosHint && ios && !standalone) iosHint.classList.add("show");
    if (!hint || !btn) return;
    if (deferredPrompt) hint.classList.add("show");
    btn.addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt = null;
      hint.classList.remove("show");
    });
  }
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    var hint = el("installHint");
    if (hint) hint.classList.add("show");
  });

  /* ---------------- boot ---------------- */
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.lang = lang;
    el("back").addEventListener("click", function () { if (currentRoute() !== "home") location.hash = "#/home"; });
    var lb = el("langBtn");
    if (lb) lb.addEventListener("click", function () { setLang(nextLang()); });
    applyChrome();
    route();
    if (/[?&]from=magnet/.test(location.search)) {
      var magnetMsg = C.ui.toastMagnet; // capture by value so a fast language toggle can't swap it
      setTimeout(function () { showToast(magnetMsg); }, 500);
    }
    // Ask the browser to keep our on-device data (resists storage eviction). Chrome/Firefox
    // honour this; Safari ignores it (there, installing to the home screen is the durable path).
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  });
})();
