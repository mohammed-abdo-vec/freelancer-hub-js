/* Shared helpers for the whole deck: run mode, syntax highlighting, value formatting
   and small animation tools. Everything hangs off one global, window.Deck, so the
   other scripts (runner.js, visuals.js, deck.js) can share it without a build step. */
(function () {
  const Deck = (window.Deck = {});

  // localStorage can throw (private windows, blocked storage), so every access is guarded.
  Deck.store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
  };

  Deck.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Run mode -------------------------------------------------------------
     'module' = modern code (ES modules, classes, "use strict"): a plain call gets this = undefined
     'script' = an old classic <script> in sloppy mode:          a plain call gets this = window
     The switch in the top bar flips this for every runnable example and animation. */
  let mode = Deck.store.get('this-deck-mode') === 'script' ? 'script' : 'module';
  document.documentElement.dataset.mode = mode;

  Deck.getMode = () => mode;
  Deck.setMode = (next) => {
    mode = next;
    Deck.store.set('this-deck-mode', next);
    document.documentElement.dataset.mode = next;
    document.dispatchEvent(new CustomEvent('deck:mode', { detail: next }));
  };
  // Some values differ between modes; those are written as (mode) => value.
  Deck.pick = (value) => (typeof value === 'function' ? value(mode) : value);

  /* ---- Text helpers ---------------------------------------------------------- */
  Deck.esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Strip blank first/last lines and the common indentation, so code in the HTML can be indented.
  Deck.dedent = (text) => {
    const lines = text.replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lines.map((l) => l.slice(indent)).join('\n');
  };

  /* ---- Syntax highlighting ---------------------------------------------------
     A tiny highlighter: just enough for the lesson. `this` and `=>` get their own
     loud colours because they are what the session is about. */
  const TOKEN = /(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(this)\b|(=>)|\b(const|let|var|function|return|new|class|constructor|extends|super|static|if|else|for|of|in|typeof|instanceof|true|false|null|undefined|async|await|try|catch|throw)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\s*\()/;

  const span = (cls, text) => `<span class="tk-${cls}">${Deck.esc(text)}</span>`;

  // Template literals: colour the string, but highlight the code inside ${ } normally.
  function template(text) {
    let out = '';
    let last = 0;
    const re = /\$\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(text))) {
      out += span('str', text.slice(last, m.index));
      out += `<span class="tk-interp">\${</span>${Deck.hl(m[1])}<span class="tk-interp">}</span>`;
      last = m.index + m[0].length;
    }
    return out + span('str', text.slice(last));
  }

  Deck.hl = function hl(code) {
    const re = new RegExp(TOKEN.source, 'g'); // fresh regex: hl() calls itself for templates
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(code))) {
      out += Deck.esc(code.slice(last, m.index));
      const t = m[0];
      if (m[1]) out += span('com', t);
      else if (m[2]) out += t[0] === '`' ? template(t) : span('str', t);
      else if (m[3]) out += span('this', t);
      else if (m[4]) out += span('arrow', t);
      else if (m[5]) out += span('kw', t);
      else if (m[6]) out += span('num', t);
      else out += span('fn', t);
      last = m.index + t.length;
    }
    return out + Deck.esc(code.slice(last));
  };

  // One <span class="ln"> per line, so lines can be highlighted.
  // A line with ❌ in it is tinted red, a line with ✅ is tinted green.
  Deck.hlLines = (code) =>
    code
      .split('\n')
      .map((line) => {
        const cls = line.includes('❌') ? ' bad' : line.includes('✅') ? ' good' : '';
        return `<span class="ln${cls}">${Deck.hl(line) || ' '}</span>`;
      })
      .join('');

  /* ---- Formatting values like DevTools does (roughly) ------------------------ */
  Deck.fmt = function fmt(v, depth = 0) {
    const t = typeof v;
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (t === 'string') return depth ? `'${v}'` : v;
    if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
    if (t === 'symbol') return v.toString();
    if (t === 'function') return `ƒ ${v.name || 'anonymous'}()`;
    if (v === window) return 'Window {…}';
    if (v === document) return '#document';
    if (v instanceof Element) {
      const id = v.id ? '#' + v.id : '';
      const cls = v.classList.length ? '.' + [...v.classList].join('.') : '';
      return `<${v.tagName.toLowerCase()}${id}${cls}>`;
    }
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (depth > 2) return Array.isArray(v) ? '[…]' : '{…}';
    if (Array.isArray(v)) return '[' + v.map((x) => fmt(x, depth + 1)).join(', ') + ']';
    const name = v.constructor && v.constructor !== Object ? v.constructor.name + ' ' : '';
    const keys = Object.keys(v);
    const body = keys.slice(0, 6).map((k) => `${k}: ${fmt(v[k], depth + 1)}`).join(', ');
    return `${name}{${body}${keys.length > 6 ? ', …' : ''}}`;
  };

  /* ---- Animation helpers ------------------------------------------------------ */
  Deck.wait = (ms) => new Promise((r) => setTimeout(r, Deck.reduced ? Math.min(ms, 120) : ms));

  // Fly a little label from one element to another (used for "this = cat" moments).
  Deck.fly = function (from, to, html, extraClass = '') {
    if (!from || !to) return Promise.resolve();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const g = document.createElement('div');
    g.className = 'flyer ' + extraClass;
    g.innerHTML = html;
    document.body.append(g);
    const gw = g.offsetWidth;
    const gh = g.offsetHeight;
    const x0 = a.left + a.width / 2 - gw / 2;
    const y0 = a.top + a.height / 2 - gh / 2;
    const dx = b.left + b.width / 2 - gw / 2 - x0;
    const dy = b.top + b.height / 2 - gh / 2 - y0;
    const lift = -Math.max(50, Math.abs(dx) * 0.25);
    g.style.left = x0 + 'px';
    g.style.top = y0 + 'px';
    const anim = g.animate(
      [
        { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
        { transform: 'translate(0, 0) scale(1.2)', opacity: 1, offset: 0.18 },
        { transform: `translate(${dx / 2}px, ${dy / 2 + lift}px) scale(1.15)`, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1 },
      ],
      { duration: Deck.reduced ? 1 : 1100, easing: 'ease-in-out', fill: 'forwards' }
    );
    return anim.finished.then(() => g.remove(), () => g.remove());
  };

  // Restart a CSS animation class on an element (e.g. a "pop" when a value lands).
  Deck.pulse = (el, cls = 'pop') => {
    el.classList.remove(cls);
    void el.offsetWidth; // force reflow so the animation plays again
    el.classList.add(cls);
  };

  Deck.el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
})();
