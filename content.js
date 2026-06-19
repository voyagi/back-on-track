/*
 * content.js — all patient-facing text in English (en) and Dutch (nl).
 *
 * Written for LOW HEALTH LITERACY: short sentences, plain words, one idea per line.
 * Evidence base: pain neuroscience education (PNE) + "stay active" first-line guidance
 * for chronic non-specific low back pain.
 *
 * Both languages share the SAME structure and the SAME exercise ids, so the app can swap
 * languages live and the animations / flare routine keep matching. Edit or add a language
 * here without touching app logic.
 */
window.CONTENT = {
  en: {
    ui: {
      brand: "Back on Track",
      tagline: "Look after your back, your way.",
      hello: "Hello",
      whatNeed: "What do you need?",
      howFeel: "How is your back today?",
      moved: {
        one: "You moved on 1 day this week.",
        many: "You moved on {n} days this week.",
        incToday: " Including today.",
      },
      install: { text: "Add this to your home screen so it is always one tap away.", add: "Add" },
      tiles: {
        today: { t: "Move", s: "Today's exercises" },
        learn: { t: "Understand", s: "Hurt isn't harm" },
        flare: { t: "Bad day", s: "Your flare-up plan" },
        goal: { t: "Your goal", s: "Remember your why" },
        safety: { t: "When to get checked", s: "Warning signs" },
      },
      nav: { home: "Home", today: "Move", learn: "Learn", goal: "Goal" },
      header: { today: "Move", learn: "Understand", flare: "Bad day", goal: "Your goal", safety: "Get checked" },
      goalPinned: { label: "My goal", empty: "Tap to set the reason you are doing this" },
      today: {
        title: "Move a little, often",
        intro: "Gentle is good. Do what you can today, even a few movements help.",
        progress: "{d} of {t} done today",
        complete: " 🎉 nice work!",
        markDone: "Mark as done",
        done: "Done",
      },
      learn: {
        title: "Hurt isn't harm",
        intro: "A few simple ideas that can change how your back feels. Tap a card to open it.",
      },
      flare: { title: "Bad day? You have a plan", tryThis: "Try this", easyRoutine: "Your easy routine", openIt: "Open it" },
      goal: {
        title: "Remember your why",
        intro: "What do you want to get back to? Pick one, or write your own. It will sit on your home screen to keep you going.",
        placeholder: "I want to...",
        save: "Save my goal",
        saved: "Goal saved ⭐",
      },
      safety: { title: "When to get checked" },
      toastMagnet: "Opened from your magnet ✓",
      disclaimer:
        "This app helps you look after your back. It does not replace advice from your own physiotherapist or doctor. If you feel worse or worried, talk to them.",
      langName: "EN",
      switchTitle: "Schakel naar Nederlands",
    },
    exercises: [
      { id: "pelvic-tilt", name: "Pelvic tilts", cue: "Lie on your back, knees bent. Gently flatten your back into the floor, then relax.", reps: "10 slow times", why: "Wakes up your low back and tummy muscles." },
      { id: "knee-to-chest", name: "Knee to chest", cue: "Lie down. Pull one knee gently toward your chest. Hold for a breath, then swap.", reps: "5 each leg", why: "Eases tight muscles in your low back." },
      { id: "cat-camel", name: "Cat and camel", cue: "On hands and knees, slowly arch your back up like a cat, then let it dip down.", reps: "10 slow times", why: "Helps your back move freely." },
      { id: "glute-bridge", name: "Bridge", cue: "Lie on your back, knees bent. Lift your hips up, squeeze, then lower slowly.", reps: "10 times", why: "Builds strong hip and back muscles." },
      { id: "bird-dog", name: "Bird dog", cue: "On hands and knees, reach one arm forward and the opposite leg back. Hold, then swap.", reps: "5 each side", why: "Teaches your back to stay steady." },
      { id: "walk", name: "Go for a walk", cue: "A short, easy walk. Start with what feels okay and build up a little each week.", reps: "5 to 10 minutes", why: "Walking is one of the best things for your back." },
    ],
    lessons: [
      { id: "hurt-harm", title: "Hurt isn't harm", body: "Pain is your body's alarm. It is not always a sign of damage. A sore back can still be a strong, healthy back." },
      { id: "strong-back", title: "Your back is strong", body: "Your spine is one of the strongest parts of your body. It is built to bend, lift and move every day." },
      { id: "movement-medicine", title: "Movement is medicine", body: "Moving gently feeds your back and helps it settle. Resting too long can actually make pain last longer." },
      { id: "more-than-back", title: "More than your back", body: "Poor sleep, stress and worry can turn your pain up. Good sleep, calm and staying active can turn it down." },
      { id: "flares-normal", title: "Flare-ups are normal", body: "Most people get bad days now and then. A flare-up does not mean you have hurt yourself again. It will settle." },
    ],
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
      seekHelp: "If it does not start to settle within a couple of weeks, or you notice any warning sign, open the red 'When to get checked' card.",
    },
    redFlags: {
      intro: "Most back pain is not dangerous and gets better. But contact a doctor straight away if you notice any of these:",
      flags: [
        "You cannot control your bladder or bowels.",
        "Numbness or tingling around your bottom or private area.",
        "Sudden weakness or numbness in both legs.",
        "Your pain started after a hard fall or accident.",
        "You feel very unwell, have a fever, or are losing weight without trying.",
        "Strong pain that is worse at night and will not ease.",
      ],
      action: "If any of these happen, call your doctor or go to urgent care now. This is not a moment to wait.",
    },
    goalPrompts: ["Play with my grandchildren", "Sleep through the night", "Walk to the shops and back", "Get back to gardening", "Sit through a whole film", "Return to my work"],
    feelFaces: [
      { value: 0, emoji: "😖", label: "Awful" },
      { value: 1, emoji: "🙁", label: "Sore" },
      { value: 2, emoji: "😐", label: "Okay" },
      { value: 3, emoji: "🙂", label: "Good" },
      { value: 4, emoji: "😄", label: "Great" },
    ],
  },

  nl: {
    ui: {
      brand: "Back on Track",
      tagline: "Zorg voor je rug, op jouw manier.",
      hello: "Hallo",
      whatNeed: "Wat heb je nodig?",
      howFeel: "Hoe gaat het met je rug vandaag?",
      moved: {
        one: "Je hebt deze week op 1 dag bewogen.",
        many: "Je hebt deze week op {n} dagen bewogen.",
        incToday: " Ook vandaag.",
      },
      install: { text: "Zet dit op je beginscherm, zo is het altijd één tik weg.", add: "Toevoegen" },
      tiles: {
        today: { t: "Bewegen", s: "Oefeningen van vandaag" },
        learn: { t: "Begrijpen", s: "Pijn is geen schade" },
        flare: { t: "Slechte dag", s: "Je opvlamming-plan" },
        goal: { t: "Jouw doel", s: "Weet weer waarom" },
        safety: { t: "Wanneer naar de dokter", s: "Waarschuwingstekens" },
      },
      nav: { home: "Start", today: "Bewegen", learn: "Leren", goal: "Doel" },
      header: { today: "Bewegen", learn: "Begrijpen", flare: "Slechte dag", goal: "Jouw doel", safety: "Naar de dokter" },
      goalPinned: { label: "Mijn doel", empty: "Tik om in te stellen waarom je dit doet" },
      today: {
        title: "Beweeg een beetje, vaak",
        intro: "Rustig is goed. Doe wat je vandaag kunt, ook een paar bewegingen helpen.",
        progress: "{d} van {t} gedaan vandaag",
        complete: " 🎉 goed gedaan!",
        markDone: "Markeer als gedaan",
        done: "Gedaan",
      },
      learn: {
        title: "Pijn is geen schade",
        intro: "Een paar simpele ideeën die kunnen veranderen hoe je rug voelt. Tik op een kaart om hem te openen.",
      },
      flare: { title: "Slechte dag? Je hebt een plan", tryThis: "Probeer dit", easyRoutine: "Je rustige routine", openIt: "Open het" },
      goal: {
        title: "Weet weer waarom",
        intro: "Wat wil je weer kunnen doen? Kies er één, of schrijf je eigen. Het komt op je beginscherm om je te motiveren.",
        placeholder: "Ik wil...",
        save: "Bewaar mijn doel",
        saved: "Doel bewaard ⭐",
      },
      safety: { title: "Wanneer naar de dokter" },
      toastMagnet: "Geopend via je magneet ✓",
      disclaimer:
        "Deze app helpt je om voor je rug te zorgen. Hij vervangt geen advies van je eigen fysiotherapeut of dokter. Als je je slechter voelt of zorgen hebt, bespreek het dan met hen.",
      langName: "NL",
      switchTitle: "Switch to English",
    },
    exercises: [
      { id: "pelvic-tilt", name: "Bekkenkanteling", cue: "Lig op je rug, knieën gebogen. Druk je onderrug zachtjes in de vloer, ontspan dan.", reps: "10 keer rustig", why: "Maakt je onderrug- en buikspieren wakker." },
      { id: "knee-to-chest", name: "Knie naar borst", cue: "Lig op je rug. Trek één knie zachtjes naar je borst. Houd even vast, wissel dan.", reps: "5 per been", why: "Ontspant strakke spieren in je onderrug." },
      { id: "cat-camel", name: "Kat en kameel", cue: "Op handen en knieën: maak langzaam een bolle rug omhoog, laat hem dan zakken.", reps: "10 keer rustig", why: "Helpt je rug soepel te bewegen." },
      { id: "glute-bridge", name: "Bruggetje", cue: "Lig op je rug, knieën gebogen. Til je heupen op, knijp, en zak langzaam terug.", reps: "10 keer", why: "Bouwt sterke heup- en rugspieren op." },
      { id: "bird-dog", name: "Vogel-hond", cue: "Op handen en knieën: strek één arm naar voren en het andere been naar achteren. Houd vast, wissel dan.", reps: "5 per kant", why: "Leert je rug stabiel te blijven." },
      { id: "walk", name: "Maak een wandeling", cue: "Een korte, rustige wandeling. Begin met wat goed voelt en bouw langzaam op.", reps: "5 tot 10 minuten", why: "Wandelen is een van de beste dingen voor je rug." },
    ],
    lessons: [
      { id: "hurt-harm", title: "Pijn is geen schade", body: "Pijn is het alarm van je lichaam. Het betekent niet altijd schade. Een pijnlijke rug kan nog steeds een sterke, gezonde rug zijn." },
      { id: "strong-back", title: "Je rug is sterk", body: "Je ruggengraat is een van de sterkste delen van je lichaam. Hij is gemaakt om te buigen, tillen en bewegen." },
      { id: "movement-medicine", title: "Bewegen is medicijn", body: "Rustig bewegen voedt je rug en helpt hem tot rust te komen. Te lang rusten kan de pijn juist langer laten duren." },
      { id: "more-than-back", title: "Meer dan je rug", body: "Slecht slapen, stress en zorgen kunnen je pijn versterken. Goede slaap, rust en bewegen kunnen hem verminderen." },
      { id: "flares-normal", title: "Opvlammingen zijn normaal", body: "Bijna iedereen heeft af en toe een slechte dag. Een opvlamming betekent niet dat je jezelf opnieuw bezeerd hebt. Het zakt weer." },
    ],
    flare: {
      reassure: "Dit gaat voorbij. Een slechte dag betekent niet dat je schade hebt aangericht.",
      steps: [
        "Blijf rustig bewegen. Probeer niet in bed te blijven.",
        "Doe de rustige routine hieronder.",
        "Gebruik warmte: een warme douche of een warmtekompres ontspant je spieren.",
        "Doe het rustiger aan, maar blijf kleine dingen doen.",
        "Adem langzaam en laat je schouders en rug ontspannen.",
      ],
      gentleRoutine: ["pelvic-tilt", "knee-to-chest", "walk"],
      seekHelp: "Zakt het niet binnen een paar weken, of merk je een waarschuwingsteken? Open dan de rode kaart 'Wanneer naar de dokter'.",
    },
    redFlags: {
      intro: "De meeste rugpijn is niet gevaarlijk en gaat over. Maar neem meteen contact op met een dokter als je een van deze dingen merkt:",
      flags: [
        "Je kunt je plas of ontlasting niet meer ophouden.",
        "Een doof gevoel of tintelingen rond je zitvlak of geslachtsdelen.",
        "Plotselinge zwakte of een doof gevoel in beide benen.",
        "Je pijn begon na een harde val of een ongeluk.",
        "Je voelt je erg ziek, hebt koorts, of valt af zonder reden.",
        "Hevige pijn die 's nachts erger is en niet zakt.",
      ],
      action: "Gebeurt een van deze dingen? Bel dan je dokter of ga nu naar de spoedeisende hulp. Dit is geen moment om te wachten.",
    },
    goalPrompts: ["Spelen met mijn kleinkinderen", "Doorslapen 's nachts", "Naar de winkel lopen en terug", "Weer kunnen tuinieren", "Een hele film uitzitten", "Terug naar mijn werk"],
    feelFaces: [
      { value: 0, emoji: "😖", label: "Slecht" },
      { value: 1, emoji: "🙁", label: "Pijnlijk" },
      { value: 2, emoji: "😐", label: "Gaat wel" },
      { value: 3, emoji: "🙂", label: "Goed" },
      { value: 4, emoji: "😄", label: "Top" },
    ],
  },
};
