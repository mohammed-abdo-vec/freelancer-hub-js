# React from the Inside

A browser-based teaching deck for React. You present from it like slides, but every
example is **real React running in the page**: students see the code, the live app, and
its console side by side. The key ideas are animated, and 14 common bugs break for real
on screen.

No build step, no `npm install`, and no internet needed: React and Babel are saved in
`vendor/`.

```
react-from-the-inside/
├── index.html        ← all 66 slides (open this)
├── css/deck.css      all styles (light + dark, scales for a projector)
├── js/
│   ├── common.js     JS + JSX highlighter, value formatter, the "fly" animation
│   ├── runner.js     live React examples: Babel → render → Preview + Console
│   ├── visuals.js    component tree, render pipeline, state queue, same-box/new-box,
│   │                 live effect timeline, JSX → object → DOM chain, flip cards
│   └── deck.js       navigation, step reveals, overview, theme, keyboard shortcuts
└── vendor/           React 18.3.1 + ReactDOM (development builds) + Babel standalone 7.26
```

## Running it

Double-click `index.html`, or serve it:

```bash
cd react-from-the-inside
python3 -m http.server 8000     # then open http://localhost:8000
```

**Why React 18.3 and not 19?** React 19 has no single-file browser build, so it needs a
bundler. Everything taught here works the same in React 19, and slide 48 covers what's new
in 19. The **development** builds are used on purpose: they print the warnings students
need to learn to read (missing keys, controlled inputs, hook order).

## Controls

| Key | Does |
|---|---|
| `→` `Space` `PageDown` | next step, then next slide (a dot on → means steps remain) |
| `←` `PageUp` | back |
| `O` | overview of all slides (click to jump) |
| `R` | re-run the code on this slide (fresh state) |
| `T` / `F` | light/dark theme / fullscreen |
| `Ctrl/⌘ + Enter` | run while editing code |

Typing inside an example never moves slides. Letter shortcuts also pause for 2 seconds
after you type, so a demo that steals focus mid-word (Bug 8) can't trigger them.

## How the live examples work

- Each example defines an `App` component. It renders in **Preview**. `console.log`,
  React's warnings and errors show in **Console**.
- Hooks (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`,
  `createContext`, `useReducer`, `memo`…) are **already imported**. Tell students that in a
  real project the first line would be `import { useState } from 'react'`.
- The app **starts automatically** when you arrive on the slide and stops when you leave
  (timers too). Bug 2 and Bug 6 wait for **▶ Run**, so students can predict first.
- **{ } Compiled** shows the plain JavaScript Babel made from the JSX.
- **✎ Edit** for live "what if…?" changes. **↺ Reset code** undoes them. **■ Stop** unmounts.
- Render crashes show a 💥 box instead of a blank preview, so students see what broke.
- Helpers built for the course:
  - `<RenderBox name="…">` is a box that **flashes and counts each render** (Part 5).
  - `fakeApi` is a pretend server with delays: `getUser(id)` (id 4 → 404),
    `searchPeople(q)` (shorter words answer slower, so the race in Bug 12 happens every
    time), and `getPosts()` (counts requests).
- A form submitted without `preventDefault()` would reload the whole deck. The runner
  catches that and acts out the reload instead: it restarts the app, so all its state is lost.

Class names the examples can use in the preview: `card`, `row`, `stack`, `avatar`,
`badge`, `done`, `big`, `muted`, `error`, `ok`, `primary` (button), `dark`, `light`.

## Slide map

| # | Slide | The animation / what to do |
|---|---|---|
| 1–3 | Title, map, imperative vs declarative | `UI = f(state)` formula on the title |
| **Part 1: JSX & components** | | |
| 5 | First component | |
| 6 | JSX is just JavaScript | **JSX → `createElement` calls → plain object → real DOM**, all made live by Babel and React. Reveal with → |
| 7 | JSX rules | 🐞 tabs: two parents (SyntaxError), `class`/`for` (warnings), lowercase component |
| 8 | Props | 🐞 tab: changing a prop → TypeError (props are frozen) |
| 9 | Props flow down | **Tree:** prop labels fly from parent to children |
| 10–12 | Conditionals, lists & keys, quiz | 🐞 No key → React's warning in the console |
| **Part 2: state & events** | | |
| 14 | Events | 🐞 `onClick={greet('Sara')}` runs during render |
| 15 | Why not a normal variable? | Console counts, screen stays 0 |
| 16 | `useState` piece by piece | Annotated code, reveal with → |
| 17 | Trigger → Render → Commit | **Pipeline** with the restaurant analogy. Press *First render*, then *Click +1* a few times. Only the number flashes in the "real DOM" |
| 18 | Rendering = calling your function | Console logs every render. `RenderBox` appears for the first time |
| 19 | State is a snapshot | **Queue:** `count` flies in as 0 on all three lines → "replace with 1" ×3 → 1. Switch to `c => c + 1` → 3 |
| 20 | Snapshot: try it | Live +3 bug and fix |
| 21 | Same box or new box? | **Memory boxes:** `push` changes box #1 and `Object.is` is true, so no render. Spread makes box #2, so it renders |
| 22 | Immutable updates | Recipe table + a todo app |
| 23 | Data down, events up | **Tree:** `onToggle(2)` flies up to App, then the re-render cascades down |
| 24–26 | Lifting state, forms, quiz | |
| **Part 3: effects & refs** | | |
| 28–29 | Pure render vs side effects, `useEffect` piece by piece | |
| 30 | **Effect timeline (live)** | A real component logs 🎨 render / 🧹 cleanup / ⚡ effect. Try all three dependency settings with *Change other state*, *userId → 2*, *Unmount* |
| 31 | Cleanup: a clock | Hide/Show → 🧹 stop timer |
| 32 | StrictMode runs effects twice | connect → disconnect → connect, on purpose |
| 33 | Fetching | Loading / error (User 4) / data, plus the `ignore` flag |
| 34 | `useRef` | Focus, ref vs state, stopwatch |
| 35 | You might not need an effect | 🐞 tab logs two renders per keystroke |
| **Part 4: sharing state & logic** | | |
| 37 | Prop drilling vs context | **Tree:** the theme passes through 3 middlemen, then context skips them |
| 38–41 | Context, `useReducer`, custom hooks, rules of hooks | Resize the window for `useWindowWidth` |
| **Part 5: rendering & performance** | | |
| 43 | When does a component re-render? | **Tree:** the cascade, then `memo` skipping Header |
| 44 | See re-renders live | Flashing `RenderBox`es |
| 45 | `memo` / `useMemo` / `useCallback` | 🐞 inline object/function → memo'd Header renders anyway |
| 46 | `useMemo` for slow work | 🐞 type fast: it lags |
| 47 | State lives in the tree (`key`) | Note sticks to the wrong person, then `key` fixes it |
| 48 | What's next | React 19, frameworks, TanStack Query, testing |
| **Part 6: bugs** | | |
| 49 | Bug index | Each entry jumps to its bug |
| 50–63 | Bugs 1–14 | See the routine below |
| 64–66 | Debugging checklist, final quiz, cheat sheet | |

### The bug routine

1. Read the code. Ask: **"what will happen when I click…?"** The symptom line under the
   title tells you what to try.
2. Do it in the Preview. Read the console out loud.
3. Ask **"why?"**, then press `→` to reveal the explanation line by line.
4. Click the `✅` tab: same app, fixed. Compare.

| Bug | Symptom | Root cause |
|---|---|---|
| 01 | List doesn't update | `push` / `obj.x++` mutates state: same reference, so no render |
| 02 | "Too many re-renders" | `onClick={setCount(…)}` calls during render |
| 03 | 3 likes → 1 | Stale snapshot inside `setTimeout` → use the updater |
| 04 | Timer stuck at 1 | Stale closure: interval + `[]` deps |
| 05 | Ticks after unmount, then doubled | Effect without cleanup |
| 06 | Requests forever | Object in deps is new every render |
| 07 | Note jumps to another row | Index as key + insert at top |
| 08 | Input loses focus every key | Component defined inside a component |
| 09 | "Inbox 0" | `0 && …` renders 0 |
| 10 | Greeting doesn't follow the prop | Prop copied into `useState` |
| 11 | "Rendered more hooks…" | Hook inside `if` |
| 12 | Search shows old results | Race condition: no stale-response guard |
| 13 | Form resets everything | Missing `e.preventDefault()` |
| 14 | "uncontrolled → controlled" | `useState()` starts as `undefined` |

## Suggested run-of-show

It's a lot for one sitting. Recommended: **three ~90-minute sessions**.

| Session | Slides | Focus |
|---|---|---|
| 1 | 1–26 | JSX, components, props, state, the render cycle, snapshot, immutability, forms |
| 2 | 27–41 + Bugs 1–7 | Effects, refs, context, reducer, custom hooks, then bugs that use them |
| 3 | 42–48 + Bugs 8–14 + wrap-up | Re-renders and performance, the remaining bugs, checklist, final quiz |

Short on time? Slides 15–21 (state and snapshots) and the effect timeline (30) are the core
mental model. Bugs 1, 3, 4, 5 and 7 cover most real-world React bugs.

## Editing the deck

- **Slide:** copy a `<section class="slide">`. `data-title` shows in the overview, and
  `data-part` (1–6) sets the accent colour. `class="step"` reveals an element with →.
- **Live example:** `<div class="runner">` with one or more
  `<script type="text/x-snippet" data-label="🐞 Bug" data-kind="bug">…</script>`
  (`data-kind="fix"` for green tabs). The code must define `App`. `❌`/`✅` in a comment
  tints that line.
  - Put a `<ul class="points r-notes">` inside the runner to show notes next to the code
    (above the preview). Add `data-notes="after"` to put them below the preview (bug slides).
  - `data-strict` wraps the app in `<StrictMode>`. `data-autorun="false"` waits for ▶ Run.
- **Code that's only shown, never run:** `<script type="text/x-code">…</script>`. JSX can't
  be written directly in HTML, because the browser would treat the tags as real elements.
- **Tree scenarios:** `SCENES` in `js/visuals.js`, used as
  `<div class="tree-demo" data-tree="todo" data-scenes="props|event">`.
