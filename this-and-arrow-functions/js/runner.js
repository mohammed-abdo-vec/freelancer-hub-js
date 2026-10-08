/* Runnable code examples.

   Markup in index.html:
     <div class="runner" data-stage="#some-stage">           ← data-stage is optional
       <script type="text/x-snippet" data-label="🐞 Bug" data-kind="bug"> …code… </script>
       <script type="text/x-snippet" data-label="✅ Fix" data-kind="fix"> …code… </script>
     </div>

   The code on screen is the code that runs: it goes through `new Function(...)`.
   - Module mode adds "use strict" and calls it with this = undefined (like an ES module).
   - Script mode runs it sloppy with this = window (like an old classic <script>).
   setTimeout/setInterval are wrapped only to remember the timer ids (so we can stop
   them); the callback itself goes straight to the real browser timer, so `this`
   inside it behaves exactly like in a real page. */
(function () {
  const { el, esc, fmt, hlLines, dedent } = Deck;

  const timers = new Set();
  let active = null; // the runner that ran last; async errors are printed in its console

  function stopTimers() {
    timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
    timers.clear();
  }
  Deck.stopSnippets = stopTimers;

  /* Errors thrown later (inside a timer or a click handler) never reach the try/catch in
     run(). And when the page is opened from disk (file://) the browser hides their message
     ("Script error."). So callbacks from snippets are wrapped: the wrapper passes `this`
     and the arguments straight through (fn.apply(this, args)), so `this` behaves exactly
     as it would without the wrapper. It only catches the error and prints it. */
  function reportAsync(err) {
    if (!active) return;
    active.print('error', 'Uncaught ' + (err instanceof Error ? `${err.name}: ${err.message}` : String(err)));
    checkLeaks(active);
    console.error(err); // still visible in the real DevTools console
  }
  function guard(fn) {
    return function (...args) {
      try { return fn.apply(this, args); } catch (err) { reportAsync(err); }
    };
  }

  const sandbox = {
    setTimeout: (cb, ms, ...args) => { const id = setTimeout(guard(cb), ms, ...args); timers.add(id); return id; },
    setInterval: (cb, ms, ...args) => { const id = setInterval(guard(cb), ms, ...args); timers.add(id); return id; },
    clearTimeout: (id) => { clearTimeout(id); timers.delete(id); },
    clearInterval: (id) => { clearInterval(id); timers.delete(id); },
  };

  // Same idea for addEventListener, but only for listeners added while a snippet runs.
  // One wrapper per function (WeakMap), so removeEventListener(sameFn) still finds it,
  // and removeEventListener(fn.bind(x)) still fails, just like in Bug 7.
  let inSnippet = false;
  const wrappers = new WeakMap();
  const nativeAdd = EventTarget.prototype.addEventListener;
  const nativeRemove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (inSnippet && typeof fn === 'function') {
      if (!wrappers.has(fn)) wrappers.set(fn, guard(fn));
      fn = wrappers.get(fn);
    }
    return nativeAdd.call(this, type, fn, opts);
  };
  EventTarget.prototype.removeEventListener = function (type, fn, opts) {
    return nativeRemove.call(this, type, (fn && wrappers.get(fn)) || fn, opts);
  };

  /* Accidental globals. In sloppy mode `this.total += 1` with this = window quietly
     creates window.total. We list window's own keys before a run and report new ones,
     then delete them before the next run so every run starts clean. */
  let baseline = null;
  const leaked = new Set();
  function startLeakWatch() {
    leaked.forEach((k) => { try { delete window[k]; } catch { /* ignore */ } });
    leaked.clear();
    baseline = new Set(Object.getOwnPropertyNames(window));
  }
  function checkLeaks(runner) {
    if (!baseline || !runner) return;
    for (const k of Object.getOwnPropertyNames(window)) {
      if (baseline.has(k) || leaked.has(k)) continue;
      leaked.add(k);
      runner.print('warn', `⚠ Accidental global variable: window.${k} = ${fmt(window[k], 1)}`);
    }
  }

  // Fallback for anything the wrappers above didn't catch.
  window.addEventListener('error', (e) => {
    if (!active) return;
    const err = e.error;
    active.print('error', 'Uncaught ' + (err ? `${err.name}: ${err.message}` : e.message));
    checkLeaks(active);
  });

  function setup(root) {
    const snippets = [...root.querySelectorAll('script[type="text/x-snippet"]')].map((s) => {
      const code = dedent(s.textContent);
      return { label: s.dataset.label || 'Code', kind: s.dataset.kind || '', code, original: code };
    });
    const stage = root.dataset.stage ? document.querySelector(root.dataset.stage) : null;
    const stageHTML = stage ? stage.innerHTML : '';
    let current = 0;
    let editing = false;

    const tabs = el('div', 'r-tabs');
    tabs.setAttribute('role', 'tablist');
    const codeWrap = el('div', 'r-code');
    const pre = el('pre', 'code');
    const editor = el('textarea', 'r-editor');
    editor.spellcheck = false;
    editor.hidden = true;
    editor.setAttribute('aria-label', 'Edit the code');
    codeWrap.append(pre, editor);

    const bar = el('div', 'r-bar');
    const runBtn = el('button', 'btn btn-run', '▶ Run');
    const stopBtn = el('button', 'btn btn-ghost', '■ Stop');
    const editBtn = el('button', 'btn btn-ghost', '✎ Edit');
    const resetBtn = el('button', 'btn btn-ghost', '↺ Reset code');
    const modeTag = el('span', 'r-mode');
    stopBtn.title = 'Stop timers started by this code';
    resetBtn.hidden = true;
    bar.append(runBtn, editBtn, resetBtn, stopBtn, modeTag);

    const out = el('div', 'r-console');
    out.setAttribute('aria-live', 'polite');

    root.prepend(tabs, codeWrap, bar, out);
    if (snippets.length < 2) tabs.hidden = true;

    snippets.forEach((s, i) => {
      const t = el('button', 'r-tab ' + s.kind, esc(s.label));
      t.setAttribute('role', 'tab');
      t.addEventListener('click', () => select(i));
      tabs.append(t);
    });

    function showModeTag() {
      modeTag.textContent = Deck.getMode() === 'module' ? 'runs as: module (strict)' : 'runs as: classic script (sloppy)';
    }

    function clearConsole() {
      out.innerHTML = '<div class="r-empty">Press ▶ Run (or the R key) to run this code</div>';
    }

    function print(kind, text) {
      out.querySelector('.r-empty')?.remove();
      const last = out.lastElementChild;
      // The same error again (an interval failing every second)? Count it instead of repeating it.
      if (kind !== 'log' && last && last.dataset.text === text && last.dataset.kind === kind) {
        const n = Number(last.dataset.count || 1) + 1;
        last.dataset.count = n;
        let badge = last.querySelector('.r-count');
        if (!badge) { badge = el('span', 'r-count'); last.prepend(badge); }
        badge.textContent = '×' + n;
        Deck.pulse(badge);
        return;
      }
      const line = el('div', 'r-line r-' + kind);
      line.dataset.text = text;
      line.dataset.kind = kind;
      line.append(el('span', 'r-msg', esc(text)));
      out.append(line);
      out.scrollTop = out.scrollHeight;
    }

    function render() {
      const s = snippets[current];
      pre.innerHTML = hlLines(s.code);
      resetBtn.hidden = s.code === s.original;
      [...tabs.children].forEach((t, i) => t.setAttribute('aria-selected', i === current));
      codeWrap.dataset.kind = s.kind;
    }

    function setEditing(on) {
      const s = snippets[current];
      if (!on && editing) s.code = editor.value;
      editing = on;
      editor.hidden = !on;
      pre.hidden = on;
      editBtn.textContent = on ? '✓ Done editing' : '✎ Edit';
      if (on) {
        editor.value = s.code;
        editor.style.height = pre.offsetHeight + 'px';
        editor.focus();
      }
      render();
    }

    function select(i) {
      if (editing) setEditing(false);
      if (active === api) { stopTimers(); active = null; }
      current = i;
      if (stage) stage.innerHTML = stageHTML;
      clearConsole();
      render();
    }

    function run() {
      if (editing) snippets[current].code = editor.value;
      const s = snippets[current];
      const mode = Deck.getMode();
      stopTimers();
      active = api;
      if (stage) stage.innerHTML = stageHTML; // fresh DOM = no listeners left from the last run
      out.innerHTML = '';
      Deck.pulse(out, 'flash');
      print('info', `▶ ${s.label} · ${mode === 'module' ? 'module (strict mode)' : 'classic script (sloppy mode)'}`);
      startLeakWatch();

      const fakeConsole = {
        log: (...a) => { print('log', a.map((v) => fmt(v)).join(' ')); checkLeaks(api); },
        info: (...a) => print('log', a.map((v) => fmt(v)).join(' ')),
        warn: (...a) => print('warn', a.map((v) => fmt(v)).join(' ')),
        error: (...a) => print('error', a.map((v) => fmt(v)).join(' ')),
      };

      let fn;
      try {
        const body = (mode === 'module' ? '"use strict";\n' : '') + s.code;
        fn = new Function('console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', body);
      } catch (err) {
        print('error', `Uncaught ${err.name}: ${err.message}`); // e.g. a SyntaxError: nothing ran at all
        return;
      }
      inSnippet = true;
      try {
        fn.call(mode === 'module' ? undefined : window, fakeConsole,
          sandbox.setTimeout, sandbox.setInterval, sandbox.clearTimeout, sandbox.clearInterval);
      } catch (err) {
        print('error', 'Uncaught ' + (err instanceof Error ? `${err.name}: ${err.message}` : String(err)));
      } finally {
        inSnippet = false;
      }
      checkLeaks(api);
      setTimeout(() => active === api && checkLeaks(api), 1300);
    }

    runBtn.addEventListener('click', run);
    stopBtn.addEventListener('click', () => { stopTimers(); print('info', '■ Stopped all timers'); });
    editBtn.addEventListener('click', () => setEditing(!editing));
    resetBtn.addEventListener('click', () => {
      const s = snippets[current];
      s.code = s.original;
      if (editing) editor.value = s.code;
      render();
    });
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); }
      if (e.key === 'Tab') {
        e.preventDefault();
        const { selectionStart: a, selectionEnd: b, value } = editor;
        editor.value = value.slice(0, a) + '  ' + value.slice(b);
        editor.selectionStart = editor.selectionEnd = a + 2;
      }
      if (e.key === 'Escape') setEditing(false);
    });
    document.addEventListener('deck:mode', showModeTag);

    const api = { run, print, root };
    root.runner = api;
    showModeTag();
    clearConsole();
    render();
  }

  // Code blocks that are only shown, never run.
  document.querySelectorAll('pre.code').forEach((pre) => { pre.innerHTML = hlLines(dedent(pre.textContent)); });
  document.querySelectorAll('code.hl').forEach((c) => { c.innerHTML = Deck.hl(dedent(c.textContent)); });
  document.querySelectorAll('.runner').forEach(setup);
})();
