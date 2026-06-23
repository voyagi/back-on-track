/*
 * app.js - Back on Track
 *
 * Dependency-free single-page app. Hash routing works on static hosts and offline.
 * State stays on the device in localStorage. Stored values are treated as untrusted
 * and sanitized before use.
 */
(function () {
  "use strict";

  var STORE_KEY = "bot.v1";
  var ANIM = Object.freeze(window.EXERCISE_ANIM || {});

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function sanitizeState(s) {
    if (!s || typeof s !== "object" || Array.isArray(s)) s = {};
    if (typeof s.goal === "string") s.goal = s.goal.slice(0, 80);
    else delete s.goal;
    if (typeof s.lang !== "string") delete s.lang;

    var src = s.days && typeof s.days === "object" && !Array.isArray(s.days) ? s.days : {};
    var days = Object.create(null);
    Object.keys(src).forEach(function (k) {
      if (k === "__proto__" || k === "constructor" || k === "prototype") return;
      var d = src[k];
      if (!d || typeof d !== "object") return;
      days[k] = {
        done: Array.isArray(d.done)
          ? d.done.filter(function (x) {
              return typeof x === "string";
            })
          : [],
        feel: typeof d.feel === "number" && isFinite(d.feel) ? d.feel : null,
      };
    });
    s.days = days;
    return s;
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* Local storage can fail in private mode or when quota is full. */
    }
  }

  var state = sanitizeState(load());

  function detectLang() {
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("nl") === 0 ? "nl" : "en";
  }

  var qLang = (location.search.match(/[?&]lang=(en|nl)\b/) || [])[1];
  var lang = qLang || state.lang || detectLang();
  if (!window.CONTENT[lang]) lang = "en";
  if (qLang && state.lang !== qLang) {
    state.lang = qLang;
    save();
  }
  var C = window.CONTENT[lang];

  function nextLang() {
    var keys = Object.keys(window.CONTENT);
    return keys[(keys.indexOf(lang) + 1) % keys.length];
  }

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

  function dateKey(back) {
    var d = new Date();
    d.setDate(d.getDate() - (back || 0));
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
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

  function el(id) {
    return document.getElementById(id);
  }

  function tpl(s, map) {
    return s.replace(/\{(\w+)\}/g, function (_, k) {
      return k in map ? map[k] : "{" + k + "}";
    });
  }

  function E(tag, opts) {
    var n = document.createElement(tag);
    opts = opts || {};
    if (opts.className) n.className = opts.className;
    if (opts.text != null) n.textContent = opts.text;
    if (opts.href) n.setAttribute("href", opts.href);
    if (opts.id) n.id = opts.id;
    if (opts.type) n.type = opts.type;
    if (opts.maxLength) n.maxLength = opts.maxLength;
    if (opts.placeholder) n.placeholder = opts.placeholder;
    if (opts.value != null) n.value = opts.value;
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) {
        n.setAttribute(k, opts.attrs[k]);
      });
    }
    if (opts.dataset) {
      Object.keys(opts.dataset).forEach(function (k) {
        n.dataset[k] = opts.dataset[k];
      });
    }
    if (opts.children) append(n, opts.children);
    return n;
  }

  function append(parent, children) {
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (child) {
      if (child == null) return;
      if (Array.isArray(child)) append(parent, child);
      else parent.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return parent;
  }

  function section(className, children) {
    return E("section", { className: className, children: children });
  }

  function token(label) {
    return E("span", { className: "token", attrs: { "aria-hidden": "true" }, text: label });
  }

  function exerciseById(id) {
    for (var i = 0; i < C.exercises.length; i++) {
      if (C.exercises[i].id === id) return C.exercises[i];
    }
    return null;
  }

  function animationNode(id) {
    var anim = ANIM[id];
    if (!anim) return E("span", { className: "demo-fallback", text: "Demo" });
    var doc = new DOMParser().parseFromString(anim, "image/svg+xml");
    var svg = doc.documentElement && doc.documentElement.nodeName.toLowerCase() === "svg" ? doc.documentElement : null;
    return svg ? document.importNode(svg, true) : E("span", { className: "demo-fallback", text: "Demo" });
  }

  function media(id, stepLabel) {
    var box = E("div", { className: "media", children: [animationNode(id)] });
    if (stepLabel) box.prepend(E("span", { className: "stepno", text: stepLabel }));
    return box;
  }

  function applyChrome() {
    Array.prototype.forEach.call(document.querySelectorAll(".tabbar a"), function (a) {
      var tab = a.getAttribute("data-tab");
      var label = a.querySelector(".tl");
      if (label && C.ui.nav[tab]) label.textContent = C.ui.nav[tab];
    });
    var lb = el("langBtn");
    if (lb) {
      var nn = window.CONTENT[nextLang()].ui.langName || nextLang().toUpperCase();
      lb.textContent = nn;
      lb.setAttribute("title", C.ui.switchTitle);
      lb.setAttribute("aria-label", nn + ". " + C.ui.switchTitle);
    }
  }

  var screens = {
    home: renderHome,
    today: renderToday,
    learn: renderLearn,
    flare: renderFlare,
    goal: renderGoal,
    safety: renderSafety,
    progress: renderProgress,
  };

  function currentRoute() {
    var h = (location.hash || "#/home").replace(/^#\//, "").split("?")[0];
    return screens[h] ? h : "home";
  }

  function route() {
    var name = currentRoute();
    el("title").textContent = name === "home" ? C.ui.brand : C.ui.header[name];
    el("back").classList.toggle("show", name !== "home");

    var container = el("screen");
    container.className = "screen screen-" + name;
    container.replaceChildren();
    screens[name](container);

    if (iosNeedsHint()) {
      container.prepend(installHint(C.ui.install.ios, null, true));
    }

    Array.prototype.forEach.call(document.querySelectorAll(".tabbar a"), function (a) {
      if (a.getAttribute("data-tab") === name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }

  function tile(color, r, code, t, s) {
    return E("a", {
      className: "tile " + color,
      href: "#/" + r,
      children: [
        E("span", { className: "tile-code", text: code }),
        E("span", {
          className: "tile-copy",
          children: [
            E("span", { className: "tile-title", text: t }),
            E("span", { className: "tile-sub", text: s }),
          ],
        }),
      ],
    });
  }

  function movedMsg(moved, doneToday) {
    if (!moved) return null;
    var m = C.ui.moved;
    var base = moved === 1 ? m.one : tpl(m.many, { n: moved });
    return E("a", {
      className: "today-progress home-progress",
      href: "#/progress",
      text: base + (doneToday ? m.incToday : ""),
    });
  }

  function installHint(message, buttonLabel, primary) {
    var children = [E("span", { text: message })];
    if (buttonLabel) children.push(E("button", { id: "installBtn", text: buttonLabel }));
    return E("div", { className: "install-hint" + (primary ? " show" : ""), id: primary ? "" : "installHint", children: children });
  }

  function renderHome(c) {
    var goal = state.goal;
    var T = C.ui.tiles;

    append(c, [
      section("hero", [
        E("p", { className: "hello", text: C.ui.hello }),
        E("p", { className: "sub", text: C.ui.tagline }),
        E("a", {
          className: "goal-pinned" + (goal ? "" : " empty"),
          href: "#/goal",
          children: [
            token("G"),
            E("span", {
              className: "goal-copy",
              children: [
                E("span", { className: "label", text: C.ui.goalPinned.label }),
                E("span", { className: "value", text: goal || C.ui.goalPinned.empty }),
              ],
            }),
          ],
        }),
      ]),
      installHint(C.ui.install.text, C.ui.install.add, false),
      E("h2", { className: "home-heading", text: C.ui.whatNeed }),
      E("div", {
        className: "tiles",
        children: [
          tile("move", "today", "MOVE", T.today.t, T.today.s),
          tile("learn", "learn", "LEARN", T.learn.t, T.learn.s),
          tile("plan", "flare", "PLAN", T.flare.t, T.flare.s),
          tile("goal", "goal", "WHY", T.goal.t, T.goal.s),
          E("a", {
            className: "tile safe wide",
            href: "#/safety",
            children: [
              E("span", { className: "tile-code", text: "SAFE" }),
              E("span", {
                className: "tile-copy",
                children: [E("span", { className: "tile-title", text: T.safety.t }), E("span", { className: "tile-sub", text: T.safety.s })],
              }),
            ],
          }),
        ],
      }),
      renderCheckin(),
      E("a", { className: "progress-link", href: "#/progress", text: C.ui.progress.link }),
      E("p", { className: "disclaimer", text: C.ui.disclaimer }),
    ]);

    wireInstall();
  }

  function renderCheckin() {
    var buttons = C.feelFaces.map(function (f) {
      return E("button", {
        className: "face",
        attrs: {
          "data-feel": String(f.value),
          "aria-pressed": String(today().feel === f.value),
        },
        children: [E("span", { className: "face-mark", text: f.mark }), E("span", { className: "face-label", text: f.label })],
      });
    });

    var wrap = section("checkin", [
      E("h2", { text: C.ui.howFeel }),
      E("div", { className: "faces", children: buttons }),
      movedMsg(daysMovedThisWeek(), today().done.length > 0),
    ]);

    Array.prototype.forEach.call(wrap.querySelectorAll(".face"), function (b) {
      b.addEventListener("click", function () {
        today().feel = parseInt(b.getAttribute("data-feel"), 10);
        save();
        route();
      });
    });
    return wrap;
  }

  function renderToday(c) {
    var doneIds = today().done;
    var total = C.exercises.length;
    var u = C.ui.today;
    var wrap = E("div", { className: "screen-body", attrs: { "data-c": "move" } });

    append(wrap, [
      E("h2", { className: "screen-title", text: u.title }),
      E("p", { className: "screen-intro", text: u.intro }),
      E("div", { className: "today-progress", text: tpl(u.progress, { d: doneIds.length, t: total }) + (doneIds.length >= total ? u.complete : "") }),
    ]);

    C.exercises.forEach(function (ex, i) {
      var isDone = doneIds.indexOf(ex.id) !== -1;
      var button = E("button", {
        className: "done-btn",
        attrs: { "data-ex": ex.id, "aria-pressed": String(isDone) },
        text: isDone ? u.done : u.markDone,
      });
      button.addEventListener("click", function () {
        var arr = today().done;
        var idx = arr.indexOf(ex.id);
        if (idx === -1) arr.push(ex.id);
        else arr.splice(idx, 1);
        save();
        route();
      });

      append(wrap, [
        E("article", {
          className: "card exercise",
          children: [
            media(ex.id, i + 1 + " of " + total),
            E("h3", { text: ex.name }),
            E("p", { className: "cue", text: ex.cue }),
            E("p", { className: "reps", text: ex.reps }),
            E("p", { className: "why", text: ex.why }),
            button,
          ],
        }),
      ]);
    });
    c.appendChild(wrap);
  }

  function renderLearn(c) {
    var wrap = E("div", { className: "screen-body", attrs: { "data-c": "learn" } });
    append(wrap, [E("h2", { className: "screen-title", text: C.ui.learn.title }), E("p", { className: "screen-intro", text: C.ui.learn.intro })]);
    C.lessons.forEach(function (l, i) {
      append(wrap, [
        E("details", {
          className: "card lesson",
          attrs: i === 0 ? { open: "" } : null,
          children: [E("summary", { text: l.title }), E("p", { text: l.body })],
        }),
      ]);
    });
    c.appendChild(wrap);
  }

  function renderFlare(c) {
    var u = C.ui.flare;
    var wrap = E("div", { className: "screen-body", attrs: { "data-c": "plan" } });
    append(wrap, [
      E("h2", { className: "screen-title", text: u.title }),
      E("div", { className: "banner", text: C.flare.reassure }),
      E("h3", { className: "section-heading", text: u.tryThis }),
      E("ol", {
        className: "steps",
        children: C.flare.steps.map(function (s) {
          return E("li", { text: s });
        }),
      }),
      E("h3", { className: "section-heading", text: u.easyRoutine }),
    ]);

    C.flare.gentleRoutine.forEach(function (id) {
      var ex = exerciseById(id);
      if (!ex) return;
      wrap.appendChild(
        E("article", {
          className: "card exercise",
          children: [media(ex.id, null), E("h3", { text: ex.name }), E("p", { className: "cue", text: ex.cue }), E("p", { className: "reps", text: ex.reps })],
        })
      );
    });

    append(wrap, [
      E("div", {
        className: "banner action-link",
        children: [E("span", { text: C.flare.seekHelp + " " }), E("a", { href: "#/safety", text: u.openIt })],
      }),
    ]);
    c.appendChild(wrap);
  }

  function renderGoal(c) {
    var u = C.ui.goal;
    var input = E("input", { className: "goal-input", id: "goalInput", type: "text", maxLength: 80, placeholder: u.placeholder, value: state.goal || "" });
    var chips = C.goalPrompts.map(function (g) {
      var b = E("button", { className: "chip", text: g, attrs: { "data-goal": g } });
      b.addEventListener("click", function () {
        input.value = b.getAttribute("data-goal");
      });
      return b;
    });
    var saveButton = E("button", { className: "primary-btn", id: "saveGoal", text: u.save });
    saveButton.addEventListener("click", function () {
      var v = input.value.trim().slice(0, 80);
      state.goal = v;
      save();
      showToast(v ? u.saved : u.cleared);
      location.hash = "#/home";
    });

    c.appendChild(
      E("div", {
        className: "screen-body",
        attrs: { "data-c": "goal" },
        children: [E("h2", { className: "screen-title", text: u.title }), E("p", { className: "screen-intro", text: u.intro }), input, E("div", { className: "chips", children: chips }), saveButton],
      })
    );
  }

  function renderSafety(c) {
    c.appendChild(
      E("div", {
        className: "screen-body",
        attrs: { "data-c": "safe" },
        children: [
          E("h2", { className: "screen-title", text: C.ui.safety.title }),
          E("p", { className: "screen-intro", text: C.redFlags.intro }),
          E("ul", {
            className: "flags",
            children: C.redFlags.flags.map(function (f) {
              return E("li", { text: f });
            }),
          }),
          E("div", { className: "action-box", text: C.redFlags.action }),
          E("p", { className: "screen-intro safety-net", text: C.redFlags.cantCatch }),
          E("p", { className: "disclaimer", text: C.ui.disclaimer }),
        ],
      })
    );
  }

  function progressStats() {
    var days = state.days || {};
    var exerciseDaysTotal = 0;
    var exercises = 0;
    var firstK = null;
    Object.keys(days)
      .sort()
      .forEach(function (k) {
        var d = days[k];
        var did = d.done && d.done.length > 0;
        if (did) exerciseDaysTotal++;
        if ((did || d.feel != null) && !firstK) firstK = k;
        if (d.done) exercises += d.done.length;
      });

    var trend = [];
    var exerciseDaysWeek = 0;
    for (var i = 6; i >= 0; i--) {
      var dd = days[dateKey(i)];
      if (dd && dd.done && dd.done.length > 0) exerciseDaysWeek++;
      trend.push(dd && dd.feel != null ? dd.feel : null);
    }
    return { exerciseDaysTotal: exerciseDaysTotal, exerciseDaysWeek: exerciseDaysWeek, exercises: exercises, trend: trend, firstK: firstK, todayK: dateKey(0) };
  }

  function feelItem(v) {
    if (v == null) return null;
    for (var i = 0; i < C.feelFaces.length; i++) {
      if (C.feelFaces[i].value === v) return C.feelFaces[i];
    }
    return null;
  }

  function feelTrendNode(trend) {
    return E("div", {
      className: "feel-trend",
      children: trend.map(function (v) {
        var f = feelItem(v);
        return E("span", { className: f ? "" : "none", text: f ? f.mark : "-" });
      }),
    });
  }

  function progressShareText(p, st) {
    var lines = [p.shareTitle];
    if (state.goal) lines.push(p.goalLabel + ": " + state.goal);
    lines.push(p.activeDays + ": " + st.exerciseDaysTotal + " (" + p.thisWeek + ": " + st.exerciseDaysWeek + ")");
    lines.push(p.exercises + ": " + st.exercises);
    lines.push(
      p.feeling +
        ": " +
        st.trend
          .map(function (v) {
            var f = feelItem(v);
            return f ? f.label : "-";
          })
          .join(" ")
    );
    if (st.firstK) lines.push(tpl(p.range, { from: st.firstK, to: st.todayK }));
    return lines.join("\n");
  }

  function copyText(text, p) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          showToast(p.copied);
        },
        function () {
          legacyCopy(text, p);
        }
      );
    } else {
      legacyCopy(text, p);
    }
  }

  function legacyCopy(text, p) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.className = "copy-buffer";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(p.copied);
    } catch (e) {
      /* Clipboard fallback failed. The app stays usable. */
    }
  }

  function renderProgress(c) {
    var p = C.ui.progress;
    var st = progressStats();
    var hasData = st.exerciseDaysTotal > 0 || !!st.firstK || !!state.goal;
    var body = hasData
      ? [
          statNode(String(st.exerciseDaysTotal), p.activeDays + " (" + p.thisWeek + ": " + st.exerciseDaysWeek + ")"),
          statNode(String(st.exercises), p.exercises),
          E("div", { className: "stat", children: [E("div", { className: "lbl", text: p.feeling }), feelTrendNode(st.trend)] }),
          state.goal ? E("div", { className: "stat", children: [E("div", { className: "lbl", text: p.goalLabel }), E("div", { className: "goal-stat", text: state.goal })] }) : null,
          st.firstK ? E("p", { className: "screen-intro", text: tpl(p.range, { from: st.firstK, to: st.todayK }) }) : null,
        ]
      : [E("div", { className: "banner", text: p.none })];

    var shareButton = E("button", { className: "share-btn", id: "shareBtn", text: p.share });
    shareButton.addEventListener("click", function () {
      var text = progressShareText(p, st);
      if (navigator.share) {
        navigator.share({ title: p.shareTitle, text: text }).catch(function (err) {
          if (!err || err.name !== "AbortError") copyText(text, p);
        });
      } else {
        copyText(text, p);
      }
    });
    var clearButton = E("button", { className: "secondary-btn", text: p.clear });
    clearButton.addEventListener("click", function () {
      if (!window.confirm(p.clearConfirm)) return;
      var preferredLang = lang;
      state = sanitizeState({ lang: preferredLang });
      save();
      showToast(p.cleared);
      route();
    });

    c.appendChild(
      E("div", {
        className: "screen-body",
        attrs: { "data-c": "learn" },
        children: [E("h2", { className: "screen-title", text: p.title }), E("p", { className: "screen-intro", text: p.intro }), body, shareButton, clearButton, E("p", { className: "privacy-note", text: p.privacy })],
      })
    );
  }

  function statNode(num, label) {
    return E("div", { className: "stat", children: [E("div", { className: "num", text: num }), E("div", { className: "lbl", text: label })] });
  }

  var toastTimer;
  function showToast(msg) {
    var t = el("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("show");
    }, 2600);
  }

  var deferredPrompt = null;

  function iosNeedsHint() {
    var ua = navigator.userAgent || "";
    var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var standalone = ("standalone" in navigator && navigator.standalone) || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    return ios && !standalone;
  }

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

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.lang = lang;
    el("back").addEventListener("click", function () {
      if (currentRoute() !== "home") location.hash = "#/home";
    });
    var lb = el("langBtn");
    if (lb) {
      lb.addEventListener("click", function () {
        setLang(nextLang());
      });
    }
    applyChrome();
    route();
    if (/[?&]from=magnet/.test(location.search)) {
      var magnetMsg = C.ui.toastMagnet;
      setTimeout(function () {
        showToast(magnetMsg);
      }, 500);
    }
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  });
})();
