# this, Arrow Functions & the Bugs in Between

A browser-based teaching deck. You present from it like slides, but every code example
runs live, the key ideas are animated, and the bugs break for real on screen.

No build step and nothing to install: plain HTML, CSS and JavaScript.

```
this-and-arrow-functions/
├── index.html        ← all 32 slides (open this)
├── css/deck.css      all styles (light + dark, scales for a projector)
└── js/
    ├── common.js     run mode, syntax highlighter, value formatter, the "fly" animation
    ├── runner.js     runnable code blocks (▶ Run / ✎ Edit / tabs for Bug vs Fix)
    ├── visuals.js    call-site machine, scope demo, syntax morph, `new` demo, flip cards
    └── deck.js       navigation, step reveals, overview, theme, keyboard shortcuts
```

## Running it

Double-click `index.html`, or serve it:

```bash
cd this-and-arrow-functions
python3 -m http.server 8000
# open http://localhost:8000
```

Both work. Errors from click handlers and timers are caught and shown even from `file://`.

## Controls

| Key | Does |
|---|---|
| `→` `Space` `PageDown` | next step, then next slide (a dot on the → button means steps remain) |
| `←` `PageUp` | back one step / slide |
| `O` | overview of all slides (click to jump) |
| `M` | switch **Run as: Module ↔ Classic script** |
| `R` | run the first code block on the current slide |
| `T` / `F` | light/dark theme / fullscreen |
| `Ctrl/⌘ + Enter` | run while editing code |

The URL keeps the slide number (`#23`), so a refresh keeps your place.

### The "Run as" switch: use it

This is the most useful teaching tool in the deck. The same bug shows **different
symptoms** depending on where the code runs:

- **Module** (default): ES modules, classes, `"use strict"`, Vite/React. A plain call gets
  `this = undefined`, so the bug **crashes loudly** with a `TypeError`.
- **Classic script**: an old `<script>` in sloppy mode. `this = window`, so you get
  `undefined`, `NaN` and **accidental global variables** (the console flags these
  in yellow: `⚠ Accidental global variable: window.total = NaN`).

Run Bug 1 and Bug 2 once in each mode. Students who have only seen one symptom will
recognise the other.

## How the runnable code works

- The code on screen is the code that runs (`new Function`). No hidden demo code.
- **✎ Edit** turns the block into an editor. Change it live when a student asks
  "what if…?". **↺ Reset code** puts it back.
- **Tabs** switch between `🐞 Bug` and one or more `✅ Fix` versions.
- Bugs 3, 4, 6, 7 have a **Live page** box with real buttons. Run the code, *then*
  click the buttons. The stopwatch (Bug 3) ticks or freezes for real. **■ Stop** or
  changing slide stops its timer.

## Slide map

| # | Slide | What to do |
|---|---|---|
| 1–2 | Title, agenda | Agenda cards jump to each part |
| **Part 1: what is `this`** | | |
| 4 | `this` is like the word "I" | Reveal the bubbles with →. Run both tabs |
| 5 | Look left of the dot | **Machine:** click `cat.speak()` then `dog.speak()`. Watch the owner fly into the `this` box |
| 6 | No dot = no owner | Machine: `speak()`, `const f = cat.speak; f()`, `setTimeout(cat.speak, 1000)`. Flip the run mode and replay |
| 7 | undefined or window? | Run `whoAmI()` in both modes |
| 8 | call / apply / bind | Mnemonic: **C**all = **C**ommas, **A**pply = **A**rray, bind = later |
| 9 | `new` | Press **Next step** five times: the object is built, then lands in `rex` |
| 10 | The rules, in order | Reveal row by row. The arrow row is the bridge to Part 2 |
| 11 | Quiz | Students answer first, then click to flip |
| **Part 2: arrow vs normal** | | |
| 13 | Function → arrow | **Morph:** each step strikes out the removed code, then adds the new code in green |
| 14 | Arrow syntax shapes | Run it. The "Forgot return" tab previews Bug 9 |
| 15 | Lexical `this` | **Scope demo:** play with `function`, then switch to `=>` and play again. The core idea of the session |
| 16 | Arrows ignore call/bind | Tab 2 shows the same fact as a feature |
| 17–18 | Comparison table, which one to write | Reveal row by row |
| **Part 3: bugs** | | |
| 19 | Bug index | Each entry jumps to its bug |
| 20–29 | Bugs 1–10 | See the routine below |
| 30 | Debugging checklist | |
| 31 | Final quiz: will it work? | |
| 32 | Cheat sheet | Good last screen for photos |

### The bug routine (slides 20–29)

1. Read the code together. Ask: **"what will this print?"**
2. Press **▶ Run** (or `R`). For live-page bugs, click the buttons.
3. Read the error message out loud. Ask: **"why?"**
4. Press `→` to reveal the explanation one line at a time.
5. Switch to the `✅ Fix` tabs and run each one. Ask which fix they'd choose.
6. Optional: flip **Run as** and run the bug again to show the other symptom.

| Bug | Name | Root cause |
|---|---|---|
| 01 | Arrow function method | Arrow ignores `obj.` and takes the top-level `this` |
| 02 | Callback inside a method | `function` callback gets its own `this`; `forEach` calls it plainly |
| 03 | Frozen stopwatch | `setInterval(function…)`: timers call with `this = window` |
| 04 | Like button crashes | `addEventListener('click', this.like)`: `this` = the button |
| 05 | Extracted method | `const { getTotal } = cart` / passing `cart.getTotal` |
| 06 | Arrow can't find the button | Arrow in a listener ignores the element; use `event.currentTarget` |
| 07 | Listener won't go away | `bind()` returns a new function every time, so remove finds nothing |
| 08 | Arrows aren't full functions | `new` on an arrow; arrow uses the outer `arguments` |
| 09 | Object that disappears | `=> { a: 1 }` is a body with a label, not an object |
| 10 | "It worked before the arrow" | `const` arrow isn't hoisted like a `function` declaration |

## Suggested run-of-show (~90 min)

| Time | Block |
|---|---|
| 0–5 | Title, agenda |
| 5–30 | **Part 1**: analogy, machine (slides 5–6, let students predict before each click), strict vs sloppy, call/apply/bind, `new`, rules, quiz |
| 30–50 | **Part 2**: morph, shapes, **scope demo** (spend time here), call/bind proof, table, guide |
| 50–55 | Break |
| 55–85 | **Part 3**: bugs 1–7 in full (≈4 min each); bugs 8–10 quickly |
| 85–90 | Checklist, final quiz, cheat sheet |

Short on time? Bugs 1, 2, 3 and 4 cover about 80% of real-world `this` bugs.

## Editing the deck

- **Add a slide:** copy a `<section class="slide">` in `index.html`. `data-title` shows
  in the overview; `data-part` (1–3) sets the accent colour.
- **Reveal step by step:** add `class="step"` to any element.
- **Add a runnable example:** inside `<div class="runner">`, add
  `<script type="text/x-snippet" data-label="🐞 Bug" data-kind="bug">…</script>`
  (`data-kind="fix"` for green tabs). Put `❌` or `✅` in a comment to tint that line.
  For a live page, give the runner `data-stage="#id"`; that element is reset on every run.
- **Add a machine scenario:** add it to `SCENARIOS` in `js/visuals.js`, then list it in
  `data-scenarios="a|b|c"` on a `.machine`.
