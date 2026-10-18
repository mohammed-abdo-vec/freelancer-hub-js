# How Babel compiles JavaScript

Babel is a **compiler that turns JavaScript into other JavaScript**: modern syntax goes in
and older syntax comes out, so every browser can run it.
It works in three steps:

```
 your code ──► ① PARSE ──► AST ──► ② TRANSFORM ──► new AST ──► ③ GENERATE ──► compiled code
  (text)                  (tree)    (plugins edit                               (text)
                                     the tree)
```

The session has two parts:

| Part | What it shows | Needs |
|---|---|---|
| `index.html` | A live playground: type modern JS and see the tokens, the AST, the plugins Babel picked, and the output. Switch the target browser to see how the output changes. | Nothing. Open it, or run `python3 -m http.server`. Babel runs in the page from `vendor/`. |
| `node-demo/` | The real tools: Babel's three steps done **by hand** (parser, traverse, generator), a custom plugin, and a real `babel src --out-dir dist` build. | Node 20.19+, then `npm install` |

---

## node-demo, file by file

```
node-demo/
├── src/app.js              modern JS with 11 features marked ①–⑪
├── src/Button.jsx          JSX, which no browser understands
├── babel.config.json       presets + targets (default: IE 11, "modern": latest Chrome)
├── 1-three-steps.js        parse → traverse → generate, by hand, on a single line of code
├── 2-custom-plugin.js      runs our plugin through @babel/core
├── plugins/remove-console.js   a 20-line Babel plugin
├── dist/                   ← output for IE 11      (committed, so students can read it without installing)
└── dist-modern/            ← output for latest Chrome
```

```bash
cd node-demo
npm install
npm run steps          # the three steps, printed one by one
npm run plugin         # our plugin removes console.* and inlines __VERSION__
npm run build          # src → dist          (IE 11)
npm run build:modern   # src → dist-modern   (latest Chrome)
```

What students should notice:

* **`npm run steps`**: `const double = (n) => n * 2;` becomes a JSON tree, our two visitors
  rewrite it, and the generator prints `var double = function (n) { return n * 2; };`.
  Then the real `preset-env` produces nearly the same thing. **A preset is just a bundle of
  visitors like ours.**
* **`dist/app.js` vs `dist-modern/app.js`**: it's the same source, but the IE 11 file is
  **1.3 KB → 8.5 KB** and full of helpers (`_classCallCheck`, `_regenerator`, …), while the
  modern file is almost unchanged. **The target decides how much Babel rewrites.**
* Run all three: `node src/app.js`, `node dist/app.js`, `node dist-modern/app.js`. They all
  print the same line, so the compiled code does exactly what the original did.

---

## Run-of-show (~60 min)

| Time | Do | Say |
|---|---|---|
| 0–5 | Open `index.html`, example **Arrow function + const**, target **IE 11** | "IE 11 can't run the left side. Babel writes the right side for it." |
| 5–15 | Tabs **① Tokens** → **① AST**. Click nodes and watch the source highlight on the left. | "Babel never understands your program. It turns text into a tree." |
| 15–25 | Terminal: `npm run steps`. Walk through `1-three-steps.js`. | "This is a plugin: an object whose keys are node types." |
| 25–35 | Playground: **Class**, **Optional chaining**, **async/await**, and click through the 4 targets. Tab **② Plugins used**. | "Older target means more plugins and more code. Chrome latest means almost nothing changes." |
| 35–40 | Tick **hide helper functions**, then untick it. Click **▶ Run both**. | "Those helpers are why bundles get bigger. And the output still behaves the same." |
| 40–45 | Example **JSX component** | "JSX isn't JavaScript. Babel turns `<div>` into `React.createElement`." |
| 45–55 | Example **console.\***, tick **our plugin**. Then open `plugins/remove-console.js`, `npm run plugin`. | "You can write your own: ESLint, Prettier, codemods and bundlers all work on ASTs." |
| 55–60 | `npm run build` vs `build:modern`, compare file sizes | "Vite/Next ship modern builds by default. You choose targets on purpose." |

### Questions to ask the class
1. Why does `"Already-old code"` come out (almost) unchanged even for IE 11?
2. Babel compiles `?.` for IE 11. Does it also add `Array.prototype.includes`? *(No. That's a
   **polyfill**, not syntax. preset-env needs `useBuiltIns` + core-js for that.)*
3. What would a plugin that renames every variable called `foo` to `bar` look like?

---

## Notes
* The playground uses **@babel/standalone 7.26** (vendored). `node-demo` installs **Babel 8**.
  Their output differs very slightly; the ideas are identical.
* Babel 8 needs Node 20.19+ (or 22.12+).
* Explore any AST yourself: <https://astexplorer.net> (choose `@babel/parser`).
