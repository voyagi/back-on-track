/*
 * exercise-anim.js — looping demonstration animations for each exercise.
 *
 * Each animation is a small inline SVG with two pose groups (.pose-a / .pose-b) that
 * the CSS hard-cuts between, giving a clear two-position loop (start <-> end of the
 * movement). Stroke uses currentColor so the figure takes the section colour.
 *
 * Why drawn animations instead of video: they are accurate to each specific exercise,
 * licence-free, work offline, add no third-party tracking, and stay tiny. The exercise
 * card still supports a real <video> later (filmed clips = the above-level evidence).
 *
 * Keyed by the same ids used in content.js exercises.
 */
window.EXERCISE_ANIM = (function () {
  function seg(x1, y1, x2, y2) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
  }
  function head(cx, cy) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="currentColor" stroke="none"/>';
  }
  function back(d) {
    return '<path d="' + d + '"/>';
  }
  function svg(a, b) {
    return (
      '<svg viewBox="0 0 240 150" class="exsvg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<line class="floor" x1="24" y1="132" x2="216" y2="132"/>' +
      '<g class="pose pose-a" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
      a +
      "</g>" +
      '<g class="pose pose-b" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
      b +
      "</g>" +
      "</svg>"
    );
  }

  var A = {};

  // Walking: legs and arms swing in opposite phase between two strides.
  A.walk = svg(
    head(120, 28) + seg(120, 40, 120, 86) + seg(120, 50, 98, 76) + seg(120, 50, 142, 76) + seg(120, 86, 142, 128) + seg(120, 86, 98, 128),
    head(120, 28) + seg(120, 40, 120, 86) + seg(120, 50, 142, 76) + seg(120, 50, 98, 76) + seg(120, 86, 98, 128) + seg(120, 86, 142, 128)
  );

  // Pelvic tilt: lying with knees bent, pelvis rocks (lower back arches then flattens).
  var ptLegs = seg(150, 110, 176, 86) + seg(176, 86, 176, 122) + seg(150, 110, 166, 90) + seg(166, 90, 166, 122);
  A["pelvic-tilt"] = svg(
    head(48, 104) + seg(60, 108, 150, 114) + ptLegs,
    head(48, 108) + seg(60, 112, 150, 104) + ptLegs
  );

  // Knee to chest: one knee draws up toward the chest, the other stays bent.
  var ktcBase = head(48, 104) + seg(60, 108, 150, 108) + seg(150, 108, 168, 84) + seg(168, 84, 168, 110);
  A["knee-to-chest"] = svg(
    ktcBase + seg(150, 108, 176, 80) + seg(176, 80, 176, 110),
    ktcBase + seg(150, 108, 116, 82) + seg(116, 82, 146, 98)
  );

  // Cat and camel: on hands and knees, the back arches up then dips down.
  var quad = seg(86, 98, 74, 122) + seg(154, 98, 166, 122);
  A["cat-camel"] = svg(
    head(72, 108) + quad + back("M86 98 Q120 70 154 98"),
    head(72, 86) + quad + back("M86 96 Q120 116 154 96")
  );

  // Bridge: lying with knees bent, hips lift up off the floor and lower again.
  A["glute-bridge"] = svg(
    head(48, 110) + seg(60, 112, 120, 112) + seg(120, 112, 150, 106) + seg(150, 106, 150, 122),
    head(48, 110) + seg(60, 112, 120, 86) + seg(120, 86, 150, 104) + seg(150, 104, 150, 122)
  );

  // Bird dog: from hands and knees, one arm reaches forward and the opposite leg back.
  var bdBack = seg(98, 98, 150, 98);
  A["bird-dog"] = svg(
    head(98, 86) + bdBack + seg(98, 98, 90, 122) + seg(150, 98, 158, 122) + seg(98, 98, 66, 90) + seg(150, 98, 188, 90),
    head(94, 92) + bdBack + seg(98, 98, 88, 122) + seg(98, 98, 100, 122) + seg(150, 98, 160, 122) + seg(150, 98, 148, 122)
  );

  return A;
})();
