/*
 * app.js — Back on Track
 *
 * A tiny dependency-free single-page app. Hash routing (#/today) so it works on any
 * static host and offline. All state is kept on the device in localStorage — no
 * accounts, no servers, no personal data leaves the phone (privacy by design / GDPR).
 *
 * The five sections map one-to-one to the fridge magnets:
 *   green=today  blue=learn  amber=flare  purple=goal  red=safety
 */
(function () {
  "use strict";
  var C = window.CONTENT;
  var STORE_KEY = "bot.v1";

  /* ---------------- state ---------------- */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function save(state) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }
  var state = load();
  if (!state.days) state.days = {}; // { 'YYYY-MM-DD': { done: [ids], feel: 0-4 } }

  function todayKey() {
    var d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }
  function dayKeyOffset(back) {
    var d = new Date();
    d.setDate(d.getDate() - back);
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }
  function today() {
    var k = todayKey();
    if (!state.days[k]) state.days[k] = { done: [], feel: null };
    return state.days[k];
  }
  function daysMovedThisWeek() {
    var n = 0;
    for (var i = 0; i < 7; i++) {
      var d = state.days[dayKeyOffset(i)];
      if (d && d.done && d.done.length) n++;
    }
    return n;
  }

  /* ---------------- helpers ---------------- */
  function el(id) {
    return document.getElementById(id);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function exerciseById(id) {
    for (var i = 0; i < C.exercises.length; i++) if (C.exercises[i].id === id) return C.exercises[i];
    return null;
  }

  /* ---------------- routing ---------------- */
  var screens = {
    home: renderHome,
    today: renderToday,
    learn: renderLearn,
    flare: renderFlare,
    goal: renderGoal,
    safety: renderSafety,
  };
  var titles = {
    home: "Back on Track",
    today: "Move",
    learn: "Understand",
    flare: "Bad day",
    goal: "Your goal",
    safety: "Get checked",
  };

  function currentRoute() {
    var h = (location.hash || "#/home").replace(/^#\//, "");
    h = h.split("?")[0];
    return screens[h] ? h : "home";
  }

  function route() {
    var name = currentRoute();
    // header
    el("title").textContent = titles[name];
    el("back").classList.toggle("show", name !== "home");
    // swap screens
    var container = el("screen");
    container.innerHTML = "";
    screens[name](container);
    // active tab
    Array.prototype.forEach.call(document.querySelectorAll(".tabbar a"), function (a) {
      var tab = a.getAttribute("data-tab");
      if (tab === name || (name === "home" && tab === "home")) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    // move focus to the screen heading for screen-reader + keyboard users
    var head = container.querySelector("h2, h1");
    if (head) {
      head.setAttribute("tabindex", "-1");
      head.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }

  /* ---------------- screens ---------------- */
  function renderHome(c) {
    var goal = state.goal;
    var moved = daysMovedThisWeek();
    var doneToday = today().done.length;
    var facesHtml = C.feelFaces
      .map(function (f) {
        var pressed = today().feel === f.value;
        return (
          '<button class="face" data-feel="' +
          f.value +
          '" aria-pressed="' +
          pressed +
          '"><span class="em">' +
          f.emoji +
          "</span>" +
          esc(f.label) +
          "</button>"
        );
      })
      .join("");

    c.innerHTML =
      '<section class="hero">' +
      '<p class="hello">Hello 👋</p>' +
      '<p class="sub">' + esc(C.tagline) + "</p>" +
      (goal
        ? '<a class="goal-pinned" href="#/goal"><span class="star">⭐</span><span><span class="label">My goal</span><br><span class="value">' +
          esc(goal) +
          "</span></span></a>"
        : '<a class="goal-pinned empty" href="#/goal"><span class="star">⭐</span><span><span class="label">My goal</span><br><span class="value">Tap to set the reason you are doing this</span></span></a>') +
      "</section>" +
      '<div class="install-hint" id="installHint">📲 Add this to your home screen so it is always one tap away.<button id="installBtn">Add</button></div>' +
      '<h2 class="screen-title" style="font-size:20px;color:var(--ink)">What do you need?</h2>' +
      '<div class="tiles">' +
      tile("green", "today", "🏃", "Move", "Today's exercises") +
      tile("blue", "learn", "💡", "Understand", "Hurt isn't harm") +
      tile("amber", "flare", "🌧️", "Bad day", "Your flare-up plan") +
      tile("purple", "goal", "⭐", "Your goal", "Remember your why") +
      '<a class="tile red wide" href="#/safety"><span class="ico">🚩</span><span>When to get checked<br><small>Warning signs</small></span></a>' +
      "</div>" +
      '<section class="checkin"><h2>How is your back today?</h2><div class="faces">' +
      facesHtml +
      "</div>" +
      (moved
        ? '<div class="today-progress" style="margin-top:14px">👏 You have moved on ' +
          moved +
          " day" +
          (moved === 1 ? "" : "s") +
          " this week" +
          (doneToday ? " — including today" : "") +
          ".</div>"
        : "") +
      "</section>" +
      '<p class="disclaimer">' + esc(C.disclaimer) + "</p>";

    Array.prototype.forEach.call(c.querySelectorAll(".face"), function (b) {
      b.addEventListener("click", function () {
        today().feel = parseInt(b.getAttribute("data-feel"), 10);
        save(state);
        route();
      });
    });
    wireInstall();
  }

  function tile(color, route, ico, title, sub) {
    return (
      '<a class="tile ' +
      color +
      '" href="#/' +
      route +
      '"><span class="ico">' +
      ico +
      "</span><span>" +
      esc(title) +
      "<br><small>" +
      esc(sub) +
      "</small></span></a>"
    );
  }

  function renderToday(c) {
    var doneIds = today().done;
    var doneCount = doneIds.length;
    var total = C.exercises.length;
    var cards = C.exercises
      .map(function (ex, i) {
        var isDone = doneIds.indexOf(ex.id) !== -1;
        return (
          '<article class="card exercise">' +
          '<div class="media"><span class="stepno">' +
          (i + 1) +
          "/" +
          total +
          '</span><span class="play">▶</span></div>' +
          "<h3>" + esc(ex.name) + "</h3>" +
          '<p class="cue">' + esc(ex.cue) + "</p>" +
          '<p class="reps">' + esc(ex.reps) + "</p>" +
          '<p class="why">' + esc(ex.why) + "</p>" +
          '<button class="done-btn" data-ex="' +
          ex.id +
          '" aria-pressed="' +
          isDone +
          '">' +
          (isDone ? "Done" : "Mark as done") +
          "</button>" +
          "</article>"
        );
      })
      .join("");

    c.innerHTML =
      '<div class="screen" data-c="green">' +
      '<h2 class="screen-title">Move a little, often</h2>' +
      '<p class="screen-intro">Gentle is good. Do what you can today — even a few counts help.</p>' +
      '<div class="today-progress">' +
      doneCount +
      " of " +
      total +
      " done today" +
      (doneCount >= total ? " 🎉 nice work!" : "") +
      "</div>" +
      cards +
      "</div>";

    Array.prototype.forEach.call(c.querySelectorAll(".done-btn"), function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-ex");
        var arr = today().done;
        var idx = arr.indexOf(id);
        if (idx === -1) arr.push(id);
        else arr.splice(idx, 1);
        save(state);
        route();
      });
    });
  }

  function renderLearn(c) {
    var cards = C.lessons
      .map(function (l, i) {
        return (
          '<details class="card lesson"' +
          (i === 0 ? " open" : "") +
          "><summary>" +
          esc(l.title) +
          "</summary><p>" +
          esc(l.body) +
          "</p></details>"
        );
      })
      .join("");
    c.innerHTML =
      '<div class="screen" data-c="blue">' +
      '<h2 class="screen-title">Hurt isn\'t harm</h2>' +
      '<p class="screen-intro">A few simple ideas that can change how your back feels. Tap a card to open it.</p>' +
      cards +
      "</div>";
  }

  function renderFlare(c) {
    var steps = C.flare.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var routine = C.flare.gentleRoutine
      .map(function (id) {
        var ex = exerciseById(id);
        return ex
          ? '<article class="card exercise"><h3>' +
              esc(ex.name) +
              "</h3><p class=\"cue\">" +
              esc(ex.cue) +
              '</p><p class="reps">' +
              esc(ex.reps) +
              "</p></article>"
          : "";
      })
      .join("");
    c.innerHTML =
      '<div class="screen" data-c="amber">' +
      '<h2 class="screen-title">Bad day? You have a plan</h2>' +
      '<div class="banner">' + esc(C.flare.reassure) + "</div>" +
      '<h3 style="margin:8px 0">Try this</h3>' +
      '<ol class="steps">' + steps + "</ol>" +
      '<h3 style="margin:8px 0">Your easy routine</h3>' +
      routine +
      '<div class="banner" style="margin-top:8px">' +
      esc(C.flare.seekHelp) +
      ' <a href="#/safety" style="color:inherit;font-weight:800;text-decoration:underline">Open it →</a></div>' +
      "</div>";
  }

  function renderGoal(c) {
    var goal = state.goal || "";
    var chips = C.goalPrompts
      .map(function (g) { return '<button class="chip" data-goal="' + esc(g) + '">' + esc(g) + "</button>"; })
      .join("");
    c.innerHTML =
      '<div class="screen" data-c="purple">' +
      '<h2 class="screen-title">Remember your why</h2>' +
      '<p class="screen-intro">What do you want to get back to? Pick one, or write your own. It will sit on your home screen to keep you going.</p>' +
      '<input class="goal-input" id="goalInput" type="text" maxlength="80" placeholder="I want to..." value="' +
      esc(goal) +
      '">' +
      '<div class="chips">' + chips + "</div>" +
      '<button class="primary-btn" id="saveGoal">Save my goal</button>' +
      "</div>";
    Array.prototype.forEach.call(c.querySelectorAll(".chip"), function (b) {
      b.addEventListener("click", function () {
        el("goalInput").value = b.getAttribute("data-goal");
      });
    });
    el("saveGoal").addEventListener("click", function () {
      var v = el("goalInput").value.trim();
      if (v) {
        state.goal = v;
        save(state);
        showToast("Goal saved ⭐");
        location.hash = "#/home";
      }
    });
  }

  function renderSafety(c) {
    var flags = C.redFlags.flags.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    c.innerHTML =
      '<div class="screen" data-c="red">' +
      '<h2 class="screen-title">When to get checked</h2>' +
      '<p class="screen-intro">' + esc(C.redFlags.intro) + "</p>" +
      '<ul class="flags">' + flags + "</ul>" +
      '<div class="action-box">' + esc(C.redFlags.action) + "</div>" +
      '<p class="disclaimer">' + esc(C.disclaimer) + "</p>" +
      "</div>";
  }

  /* ---------------- toast (also proves the magnet QR link worked) ---------------- */
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
    var hint = el("installHint");
    var btn = el("installBtn");
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
    el("back").addEventListener("click", function () {
      if (currentRoute() !== "home") location.hash = "#/home";
    });
    route();
    // If opened from a magnet (URL carries ?from=magnet), confirm the link worked.
    if (/[?&]from=magnet/.test(location.search)) {
      setTimeout(function () { showToast("Opened from your magnet ✓"); }, 500);
    }
    // Register the service worker for offline use (ignored on file://).
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  });
})();
