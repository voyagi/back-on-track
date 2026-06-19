/*
 * content.js — all patient-facing text for the Back on Track toolkit.
 *
 * Written for LOW HEALTH LITERACY: short sentences, plain words, one idea per line
 * (aim ~grade 6 reading level). Evidence base: pain neuroscience education (PNE) +
 * "stay active" first-line guidance for chronic non-specific low back pain.
 *
 * All copy lives here so the content can be edited (or translated) without touching
 * app logic. The colour for each section is set in styles.css and matches the magnets.
 */
const CONTENT = {
  appName: "Back on Track",
  tagline: "Look after your back, your way.",
  condition: "low back pain",

  disclaimer:
    "This app helps you look after your back. It does not replace advice from your own " +
    "physiotherapist or doctor. If you feel worse or worried, talk to them.",

  // PURPLE — example quality-of-life goals the patient can pick or type their own
  goalPrompts: [
    "Play with my grandchildren",
    "Sleep through the night",
    "Walk to the shops and back",
    "Get back to gardening",
    "Sit through a whole film",
    "Return to my work",
  ],

  // GREEN — Today's gentle exercises (safe, common, self-manageable for CLBP)
  exercises: [
    {
      id: "pelvic-tilt",
      name: "Pelvic tilts",
      cue: "Lie on your back, knees bent. Gently flatten your back into the floor, then relax.",
      reps: "10 slow times",
      why: "Wakes up your low back and tummy muscles.",
    },
    {
      id: "knee-to-chest",
      name: "Knee to chest",
      cue: "Lie down. Pull one knee gently toward your chest. Hold for a breath, then swap.",
      reps: "5 each leg",
      why: "Eases tight muscles in your low back.",
    },
    {
      id: "cat-camel",
      name: "Cat and camel",
      cue: "On hands and knees, slowly arch your back up like a cat, then let it dip down.",
      reps: "10 slow times",
      why: "Helps your back move freely.",
    },
    {
      id: "glute-bridge",
      name: "Bridge",
      cue: "Lie on your back, knees bent. Lift your hips up, squeeze, then lower slowly.",
      reps: "10 times",
      why: "Builds strong hip and back muscles.",
    },
    {
      id: "bird-dog",
      name: "Bird dog",
      cue: "On hands and knees, reach one arm forward and the opposite leg back. Hold, then swap.",
      reps: "5 each side",
      why: "Teaches your back to stay steady.",
    },
    {
      id: "walk",
      name: "Go for a walk",
      cue: "A short, easy walk. Start with what feels okay and build up a little each week.",
      reps: "5 to 10 minutes",
      why: "Walking is one of the best things for your back.",
    },
  ],

  // BLUE — Understand your back (pain neuroscience education, one card per idea)
  lessons: [
    {
      id: "hurt-harm",
      title: "Hurt isn't harm",
      body: "Pain is your body's alarm. It is not always a sign of damage. A sore back can still be a strong, healthy back.",
    },
    {
      id: "strong-back",
      title: "Your back is strong",
      body: "Your spine is one of the strongest parts of your body. It is built to bend, lift and move every day.",
    },
    {
      id: "movement-medicine",
      title: "Movement is medicine",
      body: "Moving gently feeds your back and helps it settle. Resting too long can actually make pain last longer.",
    },
    {
      id: "more-than-back",
      title: "More than your back",
      body: "Poor sleep, stress and worry can turn your pain up. Good sleep, calm and staying active can turn it down.",
    },
    {
      id: "flares-normal",
      title: "Flare-ups are normal",
      body: "Most people get bad days now and then. A flare-up does not mean you have hurt yourself again. It will settle.",
    },
  ],

  // AMBER — Bad day / flare-up plan. gentleRoutine references exercise ids above.
  flare: {
    reassure: "This will pass. A bad day does not mean you have done any damage.",
    steps: [
      "Keep moving gently. Try not to stay in bed.",
      "Do the easy routine below.",
      "Use heat: a warm shower or a heat pack can relax your muscles.",
      "Slow your day down, but keep doing small bits of activity.",
      "Breathe slowly and let your shoulders and back relax.",
    ],
    gentleRoutine: ["pelvic-tilt", "knee-to-chest", "walk"],
    seekHelp:
      "If it does not start to settle within a couple of weeks, or you notice any warning sign, " +
      "open the red 'When to get checked' card.",
  },

  // RED — Red flags / when to get checked. Standard CLBP safety-netting.
  redFlags: {
    intro:
      "Most back pain is not dangerous and gets better. But contact a doctor straight away if you notice any of these:",
    flags: [
      "You cannot control your bladder or bowels.",
      "Numbness or tingling around your bottom or private area.",
      "Sudden weakness or numbness in both legs.",
      "Your pain started after a hard fall or accident.",
      "You feel very unwell, have a fever, or are losing weight without trying.",
      "Strong pain that is worse at night and will not ease.",
    ],
    action:
      "If any of these happen, call your doctor or go to urgent care now. This is not a moment to wait.",
  },

  // Home check-in: five faces, stored 0 (worst) to 4 (best)
  feelFaces: [
    { value: 0, emoji: "😖", label: "Awful" },
    { value: 1, emoji: "🙁", label: "Sore" },
    { value: 2, emoji: "😐", label: "Okay" },
    { value: 3, emoji: "🙂", label: "Good" },
    { value: 4, emoji: "😄", label: "Great" },
  ],
};

// Make available to app.js (plain global; no build step / modules on purpose).
window.CONTENT = CONTENT;
