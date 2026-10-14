/* Runnable React examples.

   Markup in index.html:
     <div class="runner" data-strict data-autorun="false">       ← both attributes optional
       <script type="text/x-snippet" data-label="🐞 Bug" data-kind="bug"> …JSX… </script>
       <script type="text/x-snippet" data-label="✅ Fix" data-kind="fix"> …JSX… </script>
     </div>

   Each snippet defines a component called App. The runner:
   1. compiles the JSX with Babel (the "{ } Compiled" button shows the result),
   2. runs it with the hooks already in scope (as if `import { useState, … } from 'react'`),
   3. renders <App /> into the Preview box, inside an error boundary,
   4. shows console.log, React's own warnings and errors in the Console box.

   The code on screen is the code that runs. There is no hidden demo code. */
(function () {
  const { el, esc, fmt, hlLines, dedent } = Deck;
  const h = React.createElement;

  /* ---- Timers: remembered so Stop / leaving the slide can kill them ---- */
  const timers = new Set();
  function stopTimers() {
    timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
    timers.clear();
  }

  let active = null; // the runner whose console receives warnings and async errors
  const all = [];

  /* ---- Errors from event handlers and timers ---------------------------------
     Opened from disk (file://), the browser hides the message of errors thrown in
     callbacks ("Script error."). So snippet callbacks are wrapped: the wrapper passes
     `this` and the arguments straight through and only catches the error to print it.
     One wrapper per function (WeakMap) keeps the identity stable, so React.memo and
     useCallback behave exactly as they would without it. */
  const wrappers = new WeakMap();
  function guard(fn) {
    if (typeof fn !== 'function') return fn;
    if (!wrappers.has(fn)) {
      wrappers.set(fn, function (...args) {
        try { return fn.apply(this, args); } catch (err) { active?.error(err); }
      });
    }
    return wrappers.get(fn);
  }
  const sandboxTimers = {
    setTimeout: (cb, ms, ...a) => { const id = setTimeout(guard(cb), ms, ...a); timers.add(id); return id; },
    setInterval: (cb, ms, ...a) => { const id = setInterval(guard(cb), ms, ...a); timers.add(id); return id; },
    clearTimeout: (id) => { clearTimeout(id); timers.delete(id); },
    clearInterval: (id) => { clearInterval(id); timers.delete(id); },
  };

  // The React that snippets see: the real one, except event-handler props (onClick…)
  // go through guard() so their errors are printed.
  const SnippetReact = Object.assign({}, React, {
    createElement(type, props, ...children) {
      if (props && typeof type === 'string') {
        for (const k in props) if (/^on[A-Z]/.test(k) && typeof props[k] === 'function') props[k] = guard(props[k]);
      }
      return React.createElement(type, props, ...children);
    },
  });

  /* ---- React's own warnings ("Each child in a list should have a unique key"…) ----
     React prints them with console.error / console.warn. We copy them into the
     Console box of the active runner, formatted like the browser would. */
  function formatReactMessage(args) {
    let [first, ...rest] = args;
    if (first instanceof Error) return null; // printed by the error boundary already
    let msg = String(first);
    msg = msg.replace(/%[sdo]/g, () => {
      const v = rest.shift();
      return typeof v === 'string' ? v : fmt(v, 1);
    });
    msg = msg.split('\n    at ')[0].split('\n    in ')[0].trim(); // drop the component stack
    if (/^The above error occurred|^Uncaught \[|^Consider adding an error boundary/.test(msg)) return null;
    return msg;
  }
  for (const level of ['error', 'warn']) {
    const original = console[level].bind(console);
    console[level] = (...args) => {
      original(...args);
      if (!active) return;
      const msg = formatReactMessage(args);
      if (!msg) return;
      active.print('warn', '⚠ ' + msg);
      if (/Maximum update depth exceeded/.test(msg)) active.halt('حلقة تحديث لا نهائية');
    };
  }

  // Fallback for any error that slipped past the wrappers.
  window.addEventListener('error', (e) => {
    if (!active) return;
    if (e.error) active.error(e.error);
    else if (e.message && !/^Script error/.test(e.message)) active.print('error', e.message);
  });
  window.addEventListener('unhandledrejection', (e) => active?.error(e.reason));

  /* ---- A fake network for the data-fetching examples ----------------------
     Delays are deterministic so race-condition demos behave the same every time:
     shorter search words answer SLOWER, so typing "react" fast gets "r" last. */
  const PEOPLE = ['Sara', 'Omar', 'Lina', 'Yousef', 'Mona', 'Karim', 'Rana', 'Ali', 'Huda', 'Tarek', 'Reem', 'Adam', 'Nour', 'Rami'];
  const USERS = {
    1: { id: 1, name: 'Sara', city: 'Dubai', role: 'Frontend' },
    2: { id: 2, name: 'Omar', city: 'Cairo', role: 'Design' },
    3: { id: 3, name: 'Lina', city: 'Amman', role: 'Backend' },
  };
  const later = (ms, fn) => new Promise((resolve, reject) => sandboxTimers.setTimeout(() => {
    try { resolve(fn()); } catch (err) { reject(err); }
  }, ms));
  let requestCount = 0;
  const fakeApi = {
    searchPeople(query) {
      const q = query.trim().toLowerCase();
      const ms = Math.max(250, 1800 - q.length * 350);
      return later(ms, () => PEOPLE.filter((p) => p.toLowerCase().includes(q)));
    },
    getUser(id) {
      return later(700, () => {
        if (!USERS[id]) throw new Error(`User ${id} not found (404)`);
        return { ...USERS[id] };
      });
    },
    getPosts(options = {}) {
      requestCount++;
      return later(300, () => [
        { id: 1, title: `Posts about "${options.topic || 'react'}" #1` },
        { id: 2, title: `Posts about "${options.topic || 'react'}" #2` },
      ]);
    },
    get requests() { return requestCount; },
    reset() { requestCount = 0; },
  };


  /* ---- create(): نسخة مصغّرة من Zustand (نفس الـ API، ~20 سطر) -----------------
     Zustand الحقيقي يعمل بنفس الفكرة بالضبط: متغير خارج React + قائمة مشتركين +
     useSyncExternalStore. الكومبوننت يعيد الرندر فقط إذا تغيّر ناتج الـ selector
     الخاص به (مقارنة Object.is). لذلك الأمثلة هنا تتصرف مثل zustand تمامًا،
     بما في ذلك الخطأ الشهير: selector يرجع object جديد كل مرة → حلقة لا نهائية. */
  function create(initializer) {
    let state;
    const listeners = new Set();
    const getState = () => state;
    const setState = (partial, replace) => {
      const next = typeof partial === 'function' ? partial(state) : partial;
      if (Object.is(next, state)) return;
      state = replace || typeof next !== 'object' || next === null ? next : Object.assign({}, state, next);
      listeners.forEach((l) => l());
    };
    const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
    state = initializer(setState, getState);
    function useStore(selector) {
      const select = selector || ((s) => s);
      return React.useSyncExternalStore(subscribe, () => select(state));
    }
    return Object.assign(useStore, { getState, setState, subscribe });
  }

  /* ---- سيرفر مصادقة وهمي (fakeAuthApi) لأمثلة الـ Auth ---------------------------
     - login(email, password)  → { accessToken, expiresAt, user }  (+ refresh token في "كوكي" وهمية)
     - me(accessToken)         → user، أو خطأ status 401 إذا التوكن منتهي/غير موجود
     - refresh()               → { accessToken, expiresAt, user } باستخدام الكوكي، أو 401
     - logout()                → يمسح الكوكي
     الـ access token يعيش 10 ثوانٍ فقط، حتى نرى انتهاءه أمامنا في الكلاس.
     الحسابات: sara@demo.dev (student) و omar@demo.dev (admin)، كلمة المرور 123456 */
  const ACCESS_TTL = 10000;
  const AUTH_USERS = {
    'sara@demo.dev': { id: 1, name: 'سارة', role: 'student', password: '123456' },
    'omar@demo.dev': { id: 2, name: 'عمر', role: 'admin', password: '123456' },
  };
  const authDb = { cookie: null, cookieEmail: null, tokens: new Map(), n: 0 };
  const httpError = (status, message) => Object.assign(new Error(message), { status });
  const publicUser = (email) => { const { password, ...user } = AUTH_USERS[email]; return { email, ...user }; };
  function issueToken(email) {
    const token = 'acc_' + (++authDb.n) + '_' + Math.random().toString(36).slice(2, 6);
    authDb.tokens.set(token, { email, exp: Date.now() + ACCESS_TTL });
    return { accessToken: token, expiresAt: Date.now() + ACCESS_TTL, user: publicUser(email) };
  }
  const fakeAuthApi = {
    TTL_SECONDS: ACCESS_TTL / 1000,
    login(email, password) {
      return later(500, () => {
        const u = AUTH_USERS[email];
        if (!u || u.password !== password) throw httpError(401, '401: الإيميل أو كلمة المرور غير صحيحة');
        authDb.cookie = 'ref_' + Math.random().toString(36).slice(2, 8);
        authDb.cookieEmail = email;
        return issueToken(email);
      });
    },
    me(accessToken) {
      return later(300, () => {
        const t = authDb.tokens.get(accessToken);
        if (!t) throw httpError(401, '401: لا يوجد توكن صالح');
        if (Date.now() > t.exp) throw httpError(401, '401: التوكن انتهت صلاحيته');
        return publicUser(t.email);
      });
    },
    refresh() {
      return later(400, () => {
        if (!authDb.cookie) throw httpError(401, '401: لا توجد كوكي refresh');
        authDb.cookie = 'ref_' + Math.random().toString(36).slice(2, 8); // rotation: الكوكي القديمة لم تعد صالحة
        return issueToken(authDb.cookieEmail);
      });
    },
    logout() {
      return later(200, () => { authDb.cookie = null; authDb.cookieEmail = null; return { ok: true }; });
    },
    get cookie() { return authDb.cookie; },
    reset() { authDb.cookie = null; authDb.cookieEmail = null; authDb.tokens.clear(); },
  };

  /* ---- RenderBox: a box that flashes and counts every time it renders ---- */
  function RenderBox({ name, children, tone }) {
    const renders = React.useRef(0);
    const ref = React.useRef(null);
    renders.current += 1;
    React.useEffect(() => { Deck.pulse(ref.current, 'flash-render'); });
    return h('div', { className: 'rbox' + (tone ? ' rbox-' + tone : ''), ref },
      h('div', { className: 'rbox-head' }, h('b', null, name), h('span', { className: 'rbox-count' }, 'رندر: ' + renders.current)),
      children);
  }

  /* ---- Error boundary: shows render errors instead of a blank preview ---- */
  class Boundary extends React.Component {
    constructor(props) { super(props); this.state = { error: null }; }
    static getDerivedStateFromError(error) { return { error }; }
    componentDidCatch(error) { this.props.onError(error); }
    render() {
      if (this.state.error) {
        return h('div', { className: 'pv-crash' }, h('b', null, '💥 التطبيق انهار'), h('div', null, this.state.error.message));
      }
      return this.props.children;
    }
  }

  // Everything a snippet can use without importing it.
  const SCOPE = {
    React: SnippetReact, ReactDOM,
    useState: React.useState, useEffect: React.useEffect, useLayoutEffect: React.useLayoutEffect,
    useRef: React.useRef, useMemo: React.useMemo, useCallback: React.useCallback,
    useContext: React.useContext, createContext: React.createContext, useReducer: React.useReducer,
    useId: React.useId, memo: React.memo, Fragment: React.Fragment, StrictMode: React.StrictMode,
    useSyncExternalStore: React.useSyncExternalStore,
    RenderBox, fakeApi, create, fakeAuthApi,
  };
  const SCOPE_NAMES = Object.keys(SCOPE);

  function setup(root) {
    const snippets = [...root.querySelectorAll('script[type="text/x-snippet"]')].map((s) => {
      const code = dedent(s.textContent);
      return { label: s.dataset.label || 'Code', kind: s.dataset.kind || '', code, original: code };
    });
    const strict = root.hasAttribute('data-strict');
    let current = 0;
    let editing = false;
    let compiledView = false;
    let reactRoot = null;
    let seen = new Set();

    const tabs = el('div', 'r-tabs');
    tabs.setAttribute('role', 'tablist');
    const codeWrap = el('div', 'r-code');
    const pre = el('pre', 'code');
    const editor = el('textarea', 'r-editor');
    editor.spellcheck = false;
    editor.hidden = true;
    editor.setAttribute('aria-label', 'عدّل الكود');
    codeWrap.append(pre, editor);

    const bar = el('div', 'r-bar');
    const runBtn = el('button', 'btn btn-run', '▶ تشغيل');
    const editBtn = el('button', 'btn btn-ghost', '✎ تعديل');
    const resetBtn = el('button', 'btn btn-ghost', '↺ استرجاع الكود');
    const compBtn = el('button', 'btn btn-ghost', '{ } بعد Babel');
    const stopBtn = el('button', 'btn btn-ghost', '■ إيقاف');
    const tag = el('span', 'r-tag', strict ? 'React 18 · StrictMode' : 'React 18');
    compBtn.title = 'اعرض الـ JavaScript الذي حوّل Babel الـ JSX إليه';
    stopBtn.title = 'أزل التطبيق وأوقف المؤقتات';
    resetBtn.hidden = true;
    bar.append(runBtn, editBtn, resetBtn, compBtn, stopBtn, tag);

    const outWrap = el('div', 'r-out');
    const previewBox = el('div', 'r-pane r-preview-pane', '<div class="r-pane-label">المعاينة</div>');
    const preview = el('div', 'r-preview');
    previewBox.append(preview);
    const consoleBox = el('div', 'r-pane r-console-pane', '<div class="r-pane-label">الكونسول</div>');
    const out = el('div', 'r-console');
    out.setAttribute('aria-live', 'polite');
    consoleBox.append(out);
    outWrap.append(previewBox, consoleBox);

    // Layout: code + console on the left; the slide's notes + the preview on the right.
    // Lesson slides put the notes above the preview; bug slides (data-notes="after") put the
    // explanation below it, so students see the bug before the "why".
    const notes = root.querySelector(':scope > .r-notes');
    if (notes) {
      const left = el('div', 'r-left');
      left.append(codeWrap, consoleBox);
      const side = el('div', 'r-side');
      if (root.dataset.notes === 'after') side.append(previewBox, notes);
      else side.append(notes, previewBox);
      root.classList.add('wide');
      root.closest('.wrap')?.classList.add('fill');
      root.prepend(tabs, bar, left, side);
    } else {
      root.prepend(tabs, codeWrap, bar, outWrap);
    }
    if (snippets.length < 2) tabs.hidden = true;

    snippets.forEach((s, i) => {
      const t = el('button', 'r-tab ' + s.kind, esc(s.label));
      t.setAttribute('role', 'tab');
      t.addEventListener('click', () => { select(i); run(); });
      tabs.append(t);
    });

    function clearConsole() {
      out.innerHTML = '<div class="r-empty">لا يوجد شيء في الكونسول بعد</div>';
    }

    function print(kind, text) {
      out.querySelector('.r-empty')?.remove();
      const last = out.lastElementChild;
      // The same warning or error again (an effect looping)? Count it instead of repeating it.
      if (kind !== 'log' && last && last.dataset.text === text && last.dataset.kind === kind) {
        const n = Number(last.dataset.count || 1) + 1;
        last.dataset.count = n;
        let badge = last.querySelector('.r-count');
        if (!badge) { badge = el('span', 'r-count'); last.prepend(badge); }
        badge.textContent = '×' + n;
        return;
      }
      if (out.children.length > 300) out.firstElementChild.remove();
      const line = el('div', 'r-line r-' + kind);
      line.dataset.text = text;
      line.dataset.kind = kind;
      line.append(el('span', 'r-msg', esc(text)));
      out.append(line);
      out.scrollTop = out.scrollHeight;
    }

    function error(err) {
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      if (seen.has(msg)) return; // React reports some errors twice in development
      seen.add(msg);
      print('error', 'Uncaught ' + msg);
    }

    function compile(code) {
      return Babel.transform(code, {
        presets: [['react', { runtime: 'classic' }]], filename: 'App.jsx', sourceType: 'script',
        generatorOpts: { jsescOption: { minimal: true } }, // keep emoji readable in the Compiled view
      }).code.replace(/\/\*#__PURE__\*\//g, '');
    }

    function render() {
      const s = snippets[current];
      if (compiledView) {
        let js;
        try { js = compile(s.code); } catch (err) { js = '// Babel لم يستطع ترجمة هذا الكود:\n// ' + err.message.split('\n')[0]; }
        pre.innerHTML = hlLines(js);
      } else {
        pre.innerHTML = hlLines(s.code);
      }
      codeWrap.classList.toggle('is-compiled', compiledView);
      compBtn.classList.toggle('on', compiledView);
      resetBtn.hidden = s.code === s.original;
      [...tabs.children].forEach((t, i) => t.setAttribute('aria-selected', i === current));
      codeWrap.dataset.kind = s.kind;
    }

    function setEditing(on) {
      const s = snippets[current];
      if (!on && editing) s.code = editor.value;
      if (on && compiledView) compiledView = false;
      editing = on;
      editor.hidden = !on;
      pre.hidden = on;
      editBtn.textContent = on ? '✓ انتهيت' : '✎ تعديل';
      if (on) {
        render();
        editor.value = s.code;
        editor.style.height = pre.offsetHeight + 'px';
        editor.focus();
      }
      render();
    }

    function unmount() {
      if (reactRoot) {
        const r = reactRoot;
        reactRoot = null;
        try { r.unmount(); } catch { /* ignore */ }
      }
    }

    function stop(quiet) {
      unmount();
      if (active === api) stopTimers();
      if (!quiet) print('info', '■ تم الإيقاف: أُزيل التطبيق وتوقفت المؤقتات');
    }

    function halt(reason) {
      if (!reactRoot) return;
      // Defer: React is in the middle of rendering when it warns.
      setTimeout(() => {
        stop(true);
        print('error', `■ أوقفنا التطبيق تلقائيًا: ${reason}.`);
      });
    }

    function select(i) {
      if (editing) setEditing(false);
      current = i;
      render();
    }

    function run() {
      if (editing) snippets[current].code = editor.value;
      const s = snippets[current];
      all.forEach((r) => r !== api && r.isLive() && r.stop(true));
      stopTimers();
      unmount();
      active = api;
      seen = new Set();
      fakeApi.reset();
      fakeAuthApi.reset();
      out.innerHTML = '';
      preview.innerHTML = '';
      Deck.pulse(previewBox, 'flash');

      let js;
      try {
        js = compile(s.code);
      } catch (err) {
        // Babel's message has the line and a code frame pointing at the problem.
        print('error', 'SyntaxError: ' + err.message.replace(/^\/?App\.jsx: /, '').replace(/\u001b\[\d+m/g, ''));
        preview.innerHTML = '<div class="pv-crash"><b>💥 لم يظهر شيء</b><div>الكود فيه خطأ في الكتابة. اقرأ الكونسول.</div></div>';
        return;
      }

      const fakeConsole = {
        log: (...a) => print('log', a.map((v) => fmt(v)).join(' ')),
        info: (...a) => print('log', a.map((v) => fmt(v)).join(' ')),
        warn: (...a) => print('warn', a.map((v) => fmt(v)).join(' ')),
        error: (...a) => print('error', a.map((v) => fmt(v)).join(' ')),
      };

      let App;
      try {
        const fn = new Function(...SCOPE_NAMES, 'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
          '"use strict";\n' + js + '\n;return typeof App === "function" ? App : null;');
        App = fn(...SCOPE_NAMES.map((n) => SCOPE[n]), fakeConsole,
          sandboxTimers.setTimeout, sandboxTimers.setInterval, sandboxTimers.clearTimeout, sandboxTimers.clearInterval);
      } catch (err) {
        error(err);
        return;
      }
      if (!App) { print('error', 'هذا الكود يحتاج كومبوننت اسمه App لعرضه في المعاينة.'); return; }

      reactRoot = ReactDOM.createRoot(preview);
      let tree = h(Boundary, { onError: error, key: Math.random() }, h(App));
      if (strict) tree = h(React.StrictMode, null, tree);
      reactRoot.render(tree);
      clearConsole(); // the placeholder disappears as soon as something is printed
    }

    runBtn.addEventListener('click', run);
    stopBtn.addEventListener('click', () => stop(false));
    editBtn.addEventListener('click', () => setEditing(!editing));
    compBtn.addEventListener('click', () => {
      if (editing) setEditing(false);
      compiledView = !compiledView;
      render();
    });
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

    // A <form> submit that nobody stopped would reload the whole deck. Catch it here,
    // and act out what a real reload would do: the app starts again from scratch.
    // (This listener is on document, so it runs after React's onSubmit handler.)
    document.addEventListener('submit', (e) => {
      if (!preview.contains(e.target)) return;
      const wouldReload = !e.defaultPrevented;
      e.preventDefault();
      if (!wouldReload) return;
      setTimeout(() => {
        const keep = out.innerHTML;
        run();
        out.innerHTML = keep;
        print('error', '🔄 المتصفح أعاد تحميل الصفحة! (submit بدون e.preventDefault()) وكل الـ state ضاعت.');
      }, 400);
    });

    const api = {
      run, print, error, halt, root,
      stop: (quiet) => stop(quiet),
      isLive: () => !!reactRoot,
      autorun: root.dataset.autorun !== 'false',
      showIdle() {
        preview.innerHTML = '<div class="pv-idle">اضغط <b>▶ تشغيل</b> لبدء التطبيق</div>';
        clearConsole();
      },
    };
    root.runner = api;
    all.push(api);
    clearConsole();
    render();
    api.showIdle();
  }

  // When the slide changes: stop every app, then start the ones on the new slide.
  document.addEventListener('deck:slide', (e) => {
    all.forEach((r) => r.isLive() && r.stop(true));
    stopTimers();
    active = null;
    e.detail.slide.querySelectorAll('.runner').forEach((node) => {
      const r = node.runner;
      if (r.autorun) r.run();
      else r.showIdle();
    });
  });

  Deck.renderStaticCode();
  document.querySelectorAll('.runner').forEach(setup);
})();
