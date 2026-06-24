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

  /*
   * Friendly inline-SVG icons. Each is paired with a word label in the UI,
   * never shown alone, so meaning never depends on the icon (WCAG 1.4.1).
   * 24x24, heavy round strokes so they stay legible for low-vision eyes.
   */
  var ICO_OPEN =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">';
  var ICONS = {
    home: ICO_OPEN + '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M9.8 19.5V14h4.4v5.5"/></svg>',
    move:
      ICO_OPEN +
      '<circle cx="14" cy="4.4" r="2.3" fill="currentColor" stroke="none"/><path d="M14 6.8 11.7 13"/><path d="M11.7 13 14 20"/><path d="M11.7 13 8 18.6"/><path d="M12.7 8.4 16.6 10.6"/><path d="M12.7 8.4 9.2 9.7"/></svg>',
    learn:
      ICO_OPEN +
      '<path d="M12 6.4C9.8 5 6.4 4.6 4 5.2v12.6c2.4-.6 5.8-.2 8 1.2"/><path d="M12 6.4C14.2 5 17.6 4.6 20 5.2v12.6c-2.4-.6-5.8-.2-8 1.2"/><path d="M12 6.4V19"/></svg>',
    goal:
      ICO_OPEN +
      '<path d="M12 20.2 5 13.5a4.4 4.4 0 0 1 6.2-6.2l.8.8.8-.8a4.4 4.4 0 0 1 6.2 6.2Z"/></svg>',
    plan:
      ICO_OPEN +
      '<circle cx="16" cy="8" r="2.7"/><path d="M16 3.4v1.3M20.6 8h-1.3M19.2 4.8l-.9.9M12.8 4.8l.9.9"/><path d="M7 18.6h7.9a3.1 3.1 0 0 0 .3-6.2 3.9 3.9 0 0 0-7.5-.7A3.2 3.2 0 0 0 7 18.6Z"/></svg>',
    safe:
      ICO_OPEN +
      '<path d="M12 3.4 5.6 5.8v5.1c0 3.9 2.7 6.8 6.4 8.3 3.7-1.5 6.4-4.4 6.4-8.3V5.8Z"/><path d="M9 11.6 11.2 13.8 15.2 9.5"/></svg>',
    back: ICO_OPEN + '<path d="M14 5.5 7.5 12 14 18.5"/><path d="M7.5 12H19"/></svg>',
    globe:
      ICO_OPEN +
      '<circle cx="12" cy="12" r="8.3"/><path d="M3.7 12h16.6"/><path d="M12 3.7c2.3 2.3 3.4 5.1 3.4 8.3s-1.1 6-3.4 8.3c-2.3-2.3-3.4-5.1-3.4-8.3S9.7 6 12 3.7Z"/></svg>',
    check: ICO_OPEN + '<circle cx="12" cy="12" r="8.6"/><path d="M8.1 12.2 11 15.1l5-5.6"/></svg>',
    share:
      ICO_OPEN +
      '<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="18" cy="18" r="2.6"/><path d="M8.3 10.8 15.7 7.2"/><path d="M8.3 13.2 15.7 16.8"/></svg>',
    phone:
      ICO_OPEN +
      '<path d="M6.4 3.8h3l1.4 4-2 1.4a11 11 0 0 0 4.8 4.8l1.4-2 4 1.4v3a1.6 1.6 0 0 1-1.8 1.6C12.5 21.3 5 16 4 7.2A1.6 1.6 0 0 1 6.4 3.8Z"/></svg>',
    chart: ICO_OPEN + '<path d="M4 4v16h16"/><path d="M8 16.5v-3.5"/><path d="M12 16.5V8"/><path d="M16 16.5v-6"/></svg>',
  };

  function svgNode(markup, className) {
    var doc = new DOMParser().parseFromString(markup, "image/svg+xml");
    var svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg") return null;
    var node = document.importNode(svg, true);
    if (className) node.setAttribute("class", className);
    node.setAttribute("aria-hidden", "true");
    node.setAttribute("focusable", "false");
    return node;
  }

  function icon(name, className) {
    if (!ICONS[name]) return null;
    return svgNode(ICONS[name], "icon" + (className ? " " + className : ""));
  }

  function iconChip(chipClass, name) {
    return E("span", { className: chipClass, attrs: { "aria-hidden": "true" }, children: [icon(name)] });
  }

  /* Five drawn mood faces replace the bare numbers 0-4. Valence is the mouth curve. */
  var FACE_MOUTHS = [
    "M16 32 Q24 24.5 32 32",
    "M16 31 Q24 27.5 32 31",
    "M16 30 H32",
    "M16 29 Q24 35 32 29",
    "M15 28 Q24 38.5 33 28",
  ];

  function faceMarkup(value) {
    var v = value >= 0 && value <= 4 ? value : 2;
    var mouth = FACE_MOUTHS[v];
    var cheeks =
      v === 4
        ? '<circle cx="12.5" cy="30" r="2" fill="currentColor" stroke="none" opacity="0.16"/><circle cx="35.5" cy="30" r="2" fill="currentColor" stroke="none" opacity="0.16"/>'
        : "";
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      '<circle class="face-bg" cx="24" cy="24" r="22"/>' +
      '<circle cx="18" cy="21" r="2.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="30" cy="21" r="2.2" fill="currentColor" stroke="none"/>' +
      cheeks +
      '<path d="' + mouth + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>"
    );
  }

  function faceNode(value, className) {
    return svgNode(faceMarkup(value), "face-graphic m" + (value >= 0 && value <= 4 ? value : 2) + (className ? " " + className : ""));
  }

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

  function token() {
    return E("span", { className: "token", attrs: { "aria-hidden": "true" }, children: [icon("goal")] });
  }

  function screenTitle(iconName, text) {
    return E("h2", {
      className: "screen-title",
      children: [iconName ? iconChip("title-icon", iconName) : null, E("span", { text: text })],
    });
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
      var lt = lb.querySelector(".lang-text");
      if (lt) lt.textContent = nn;
      else lb.textContent = nn;
      lb.setAttribute("title", C.ui.switchTitle);
      lb.setAttribute("aria-label", nn + ". " + C.ui.switchTitle);
    }
  }

  function initChromeIcons() {
    var navIcon = { home: "home", today: "move", learn: "learn", goal: "goal" };
    Array.prototype.forEach.call(document.querySelectorAll(".tabbar a"), function (a) {
      var holder = a.querySelector(".nav-code");
      var name = navIcon[a.getAttribute("data-tab")];
      if (holder && name) {
        holder.textContent = "";
        var ic = icon(name);
        if (ic) holder.appendChild(ic);
      }
    });
    var back = el("back");
    if (back) {
      back.textContent = "";
      var b = icon("back");
      if (b) back.appendChild(b);
    }
    var lb = el("langBtn");
    if (lb && !lb.querySelector(".lang-icon")) {
      var g = icon("globe", "lang-icon");
      if (g) lb.insertBefore(g, lb.firstChild);
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

  function tile(color, r, iconName, t, s) {
    return E("a", {
      className: "tile " + color,
      href: "#/" + r,
      children: [
        iconChip("tile-icon", iconName),
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
            token(),
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
          tile("move", "today", "move", T.today.t, T.today.s),
          tile("learn", "learn", "learn", T.learn.t, T.learn.s),
          tile("plan", "flare", "plan", T.flare.t, T.flare.s),
          tile("goal", "goal", "goal", T.goal.t, T.goal.s),
          E("a", {
            className: "tile safe wide",
            href: "#/safety",
            children: [
              iconChip("tile-icon", "safe"),
              E("span", {
                className: "tile-copy",
                children: [E("span", { className: "tile-title", text: T.safety.t }), E("span", { className: "tile-sub", text: T.safety.s })],
              }),
            ],
          }),
        ],
      }),
      renderCheckin(),
      E("a", {
        className: "progress-link",
        href: "#/progress",
        children: [icon("chart"), E("span", { text: C.ui.progress.link })],
      }),
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
        children: [faceNode(f.value) || E("span", { className: "face-fallback", attrs: { "aria-hidden": "true" }, text: f.mark }), E("span", { className: "face-label", text: f.label })],
      });
    });

    var wrap = section("checkin", [
      E("h2", { text: C.ui.howFeel }),
      E("div", { className: "faces", children: buttons }),
      movedMsg(daysMovedThisWeek(), today().done.length > 0),
    ]);

    Array.prototype.forEach.call(wrap.querySelectorAll(".face"), function (b) {
      b.addEventListener("click", function () {
        var v = parseInt(b.getAttribute("data-feel"), 10);
        today().feel = v;
        save();
        route();
        if (v <= 1 && C.ui.lowMood) showToast(C.ui.lowMood);
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
      screenTitle("move", u.title),
      E("p", { className: "screen-intro", text: u.intro }),
      E("div", { className: "today-progress", text: tpl(u.progress, { d: doneIds.length, t: total }) + (doneIds.length >= total ? u.complete : "") }),
    ]);

    C.exercises.forEach(function (ex, i) {
      var isDone = doneIds.indexOf(ex.id) !== -1;
      var button = E("button", {
        className: "done-btn",
        attrs: { "data-ex": ex.id, "aria-pressed": String(isDone) },
        children: [icon("check"), E("span", { text: isDone ? u.done : u.markDone })],
      });
      button.addEventListener("click", function () {
        var arr = today().done;
        var idx = arr.indexOf(ex.id);
        var added = idx === -1;
        var first = added && arr.length === 0;
        if (added) arr.push(ex.id);
        else arr.splice(idx, 1);
        save();
        route();
        if (first && u.doneToast) showToast(u.doneToast);
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
    append(wrap, [screenTitle("learn", C.ui.learn.title), E("p", { className: "screen-intro", text: C.ui.learn.intro })]);
    C.lessons.forEach(function (l, i) {
      append(wrap, [
        E("details", {
          className: "card lesson",
          attrs: i === 0 ? { open: "" } : null,
          children: [
            E("summary", {
              children: [
                iconChip("lesson-dot", "learn"),
                E("span", { className: "lesson-text", text: l.title }),
                E("span", { className: "lesson-mark", attrs: { "aria-hidden": "true" } }),
              ],
            }),
            E("p", { text: l.body }),
          ],
        }),
      ]);
    });
    c.appendChild(wrap);
  }

  function renderFlare(c) {
    var u = C.ui.flare;
    var wrap = E("div", { className: "screen-body", attrs: { "data-c": "plan" } });
    append(wrap, [
      screenTitle("plan", u.title),
      E("div", { className: "banner reassure", text: C.flare.reassure }),
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
    var saveButton = E("button", { className: "primary-btn", id: "saveGoal", children: [icon("goal"), E("span", { text: u.save })] });
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
        children: [screenTitle("goal", u.title), E("p", { className: "screen-intro", text: u.intro }), input, E("div", { className: "chips", children: chips }), saveButton],
      })
    );
  }

  function renderSafety(c) {
    c.appendChild(
      E("div", {
        className: "screen-body",
        attrs: { "data-c": "safe" },
        children: [
          screenTitle("safe", C.ui.safety.title),
          E("p", { className: "screen-intro", text: C.redFlags.intro }),
          E("ul", {
            className: "flags",
            children: C.redFlags.flags.map(function (f) {
              return E("li", { text: f });
            }),
          }),
          E("div", { className: "action-box", children: [icon("phone"), E("span", { text: C.redFlags.action })] }),
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
        if (!f) return E("span", { className: "none", attrs: { "aria-hidden": "true" }, text: "-" });
        var node = faceNode(f.value, "trend-face");
        if (!node) return E("span", { className: "none", attrs: { "aria-hidden": "true" }, text: "-" });
        node.setAttribute("role", "img");
        node.setAttribute("aria-label", f.label);
        node.removeAttribute("aria-hidden");
        return node;
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

    var shareButton = E("button", { className: "share-btn", id: "shareBtn", children: [icon("share"), E("span", { text: p.share })] });
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
        children: [screenTitle("chart", p.title), E("p", { className: "screen-intro", text: p.intro }), body, shareButton, clearButton, E("p", { className: "privacy-note", text: p.privacy })],
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
    initChromeIcons();
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
