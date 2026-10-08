/* The animated explainers:
   1. Component tree      props down, events up, re-render cascade, memo, prop drilling, context
   2. Render pipeline     trigger → render → commit
   3. State queue         setCount(count + 1) ×3 vs setCount(c => c + 1) ×3
   4. Same box or new box why mutating state doesn't re-render
   5. Effect timeline     a REAL component: watch render / cleanup / effect happen
   6. JSX chain          JSX → createElement → element object → DOM, computed live
   7. Flip cards          quizzes */
(function () {
  const { el, hl, hlLines, wait, fly, pulse, esc } = Deck;
  const h = React.createElement;

  // Every visual can be re-played; a new play cancels the old one.
  function player() {
    let id = 0;
    return {
      start() { id += 1; const mine = id; return () => mine === id; },
      cancel() { id += 1; },
    };
  }

  /* ======================================================================
     1. COMPONENT TREE
     ====================================================================== */
  const TREES = {
    todo: [
      { id: 'app', name: 'App', parent: null, note: 'state: todos' },
      { id: 'header', name: 'Header', parent: 'app', note: 'props: count' },
      { id: 'list', name: 'TodoList', parent: 'app', note: 'props: todos, onToggle' },
      { id: 'i1', name: 'TodoItem', parent: 'list', note: '“Buy milk”' },
      { id: 'i2', name: 'TodoItem', parent: 'list', note: '“Learn React”' },
      { id: 'i3', name: 'TodoItem', parent: 'list', note: '“Walk”' },
    ],
    theme: [
      { id: 'app', name: 'App', parent: null, note: 'state: theme' },
      { id: 'layout', name: 'Layout', parent: 'app' },
      { id: 'sidebar', name: 'Sidebar', parent: 'layout' },
      { id: 'content', name: 'Content', parent: 'layout' },
      { id: 'menu', name: 'Menu', parent: 'sidebar' },
      { id: 'btn', name: 'ThemeButton', parent: 'menu', note: 'needs theme' },
    ],
  };

  const SCENES = {
    props: {
      label: 'Props flow down',
      async play(t) {
        t.say('A parent passes data to its children as <b>props</b>, like arguments to a function.');
        await Promise.all([t.fly('app', 'header', 'count={3}'), t.fly('app', 'list', 'todos={todos}')]);
        if (!t.alive()) return;
        t.mark(['header', 'list'], 'got');
        await Promise.all(['i1', 'i2', 'i3'].map((n, k) => t.fly('list', n, `todo={todos[${k}]}`)));
        if (!t.alive()) return;
        t.mark(['i1', 'i2', 'i3'], 'got');
        t.say('Props only go <b>down</b>, and they are <b>read-only</b>. A child never changes its props.');
      },
    },
    event: {
      label: 'Events flow up',
      async play(t) {
        t.say('① The user clicks “Learn React” inside a <code>TodoItem</code>.');
        t.flash('i2', 'clicked');
        await wait(900);
        t.say('② The item can\'t change the todos (they aren\'t its state). It calls the function it got as a prop: <code>onToggle(2)</code>.');
        await t.fly('i2', 'list', 'onToggle(2)', 'up');
        await t.fly('list', 'app', 'onToggle(2)', 'up');
        if (!t.alive()) return;
        t.say('③ <code>App</code> owns the state, so <code>App</code> updates it: <code>setTodos(…)</code>.');
        t.flash('app', 'state');
        await wait(900);
        t.say('④ React renders again, and the new props flow back down.');
        await t.cascade();
      },
    },
    rerender: {
      label: 'A state change re-renders…',
      async play(t) {
        t.say('<code>setTodos(…)</code> in <code>App</code> → React calls <code>App()</code> again…');
        t.flash('app', 'state');
        await wait(700);
        await t.cascade();
        if (!t.alive()) return;
        t.say('…and by default <b>every component inside it renders too</b>, even <code>Header</code>, whose props didn\'t change. That\'s normal and usually fast.');
      },
    },
    memo: {
      label: '…unless memo() skips',
      async play(t) {
        t.say('Now <code>Header</code> is wrapped in <code>memo()</code>. Its props (count = 3) are the same as last time…');
        t.flash('app', 'state');
        await wait(700);
        await t.cascade(['header']);
        if (!t.alive()) return;
        t.say('…so React <b>skips</b> it and reuses the last result. Everything else renders as usual.');
      },
    },
    drill: {
      label: 'Prop drilling',
      async play(t) {
        t.say('Only <code>ThemeButton</code> needs <code>theme</code>, but it has to travel through every level…');
        await t.fly('app', 'layout', 'theme');
        t.mark(['layout'], 'pass');
        await t.fly('layout', 'sidebar', 'theme');
        t.mark(['sidebar'], 'pass');
        await t.fly('sidebar', 'menu', 'theme');
        t.mark(['menu'], 'pass');
        await t.fly('menu', 'btn', 'theme');
        if (!t.alive()) return;
        t.mark(['btn'], 'got');
        t.say('<code>Layout</code>, <code>Sidebar</code> and <code>Menu</code> don\'t use it. They just pass it on. Painful with 10 props and 6 levels.');
      },
    },
    context: {
      label: 'Context',
      async play(t) {
        t.say('With context, <code>App</code> <b>provides</b> the value once: <code>&lt;ThemeContext.Provider value={theme}&gt;</code>.');
        t.flash('app', 'state');
        await wait(900);
        t.say('Any component below can read it directly with <code>useContext(ThemeContext)</code>. The middle levels never see it.');
        await t.fly('app', 'btn', 'useContext(ThemeContext)', 'ctx', 1500);
        if (!t.alive()) return;
        t.mark(['btn'], 'got');
      },
    },
  };

  function setupTree(root) {
    const nodes = TREES[root.dataset.tree];
    const scenes = root.dataset.scenes.split('|');
    root.innerHTML = '';
    const buttons = el('div', 'tree-buttons');
    const stage = el('div', 'tree-stage');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('tree-lines');
    stage.append(svg);
    const caps = el('ol', 'caps tree-caps');
    root.append(buttons, stage, caps);

    // Lay nodes out in rows by depth.
    const depth = (n) => (n.parent ? depth(nodes.find((x) => x.id === n.parent)) + 1 : 0);
    const rows = [];
    const byId = {};
    nodes.forEach((n) => {
      const d = depth(n);
      if (!rows[d]) { rows[d] = el('div', 'tree-row'); stage.append(rows[d]); }
      const node = el('div', 'tnode', `<b>${esc(n.name)}</b>${n.note ? `<small>${esc(n.note)}</small>` : ''}<span class="tcount" title="renders">1</span>`);
      node.dataset.id = n.id;
      rows[d].append(node);
      byId[n.id] = node;
    });

    function drawLines() {
      const c = stage.getBoundingClientRect();
      svg.setAttribute('width', c.width);
      svg.setAttribute('height', c.height);
      svg.innerHTML = nodes.filter((n) => n.parent).map((n) => {
        const a = byId[n.parent].getBoundingClientRect();
        const b = byId[n.id].getBoundingClientRect();
        const x1 = a.left + a.width / 2 - c.left;
        const y1 = a.bottom - c.top;
        const x2 = b.left + b.width / 2 - c.left;
        const y2 = b.top - c.top;
        const my = (y1 + y2) / 2;
        return `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" />`;
      }).join('');
    }

    const play = player();
    const counts = Object.fromEntries(nodes.map((n) => [n.id, 1]));
    function reset() {
      Object.values(byId).forEach((n) => n.classList.remove('got', 'pass', 'skipped', 'state', 'clicked', 'rendering'));
      caps.innerHTML = '';
    }

    function tools(alive) {
      return {
        alive,
        say: (html) => alive() && caps.append(el('li', 'cap', html)),
        fly: (from, to, label, cls = '', ms) => (alive() ? fly(byId[from], byId[to], esc(label), 'flyer-prop ' + (cls ? 'flyer-' + cls : ''), ms) : Promise.resolve()),
        mark: (ids, cls) => ids.forEach((i) => byId[i].classList.add(cls)),
        flash: (id, cls) => { byId[id].classList.add(cls); pulse(byId[id], 'flash-render'); },
        async cascade(skip = []) {
          const levels = [];
          nodes.forEach((n) => { const d = depth(n); (levels[d] = levels[d] || []).push(n.id); });
          for (const ids of levels) {
            if (!alive()) return;
            ids.forEach((id) => {
              const node = byId[id];
              if (skip.includes(id)) { node.classList.add('skipped'); return; }
              counts[id] += 1;
              node.querySelector('.tcount').textContent = counts[id];
              node.classList.add('rendering');
              pulse(node, 'flash-render');
            });
            await wait(450);
          }
        },
      };
    }

    scenes.forEach((key) => {
      const b = el('button', 'scene-btn', `▶ ${SCENES[key].label}`);
      b.addEventListener('click', async () => {
        buttons.querySelectorAll('.scene-btn').forEach((x) => x.classList.toggle('active', x === b));
        const alive = play.start();
        reset();
        drawLines();
        await SCENES[key].play(tools(alive));
      });
      buttons.append(b);
    });

    caps.innerHTML = '<li class="cap muted">Pick a scenario above.</li>';
    requestAnimationFrame(drawLines);
    window.addEventListener('resize', drawLines);
    document.addEventListener('deck:slide', () => requestAnimationFrame(drawLines));
  }

  /* ======================================================================
     2. RENDER PIPELINE: trigger → render → commit
     ====================================================================== */
  function setupPipeline(root) {
    root.innerHTML = `
      <div class="pipe-stages">
        <div class="pipe-stage" data-s="trigger"><div class="pipe-emoji">🧾</div><b>1 · Trigger</b><small>The customer orders</small><div class="pipe-detail"></div></div>
        <div class="pipe-arrow">→</div>
        <div class="pipe-stage" data-s="render"><div class="pipe-emoji">👩‍🍳</div><b>2 · Render</b><small>The kitchen cooks</small><div class="pipe-detail"></div></div>
        <div class="pipe-arrow">→</div>
        <div class="pipe-stage" data-s="commit"><div class="pipe-emoji">🍽️</div><b>3 · Commit</b><small>The waiter serves</small><div class="pipe-detail"></div></div>
      </div>
      <div class="pipe-bottom">
        <div class="pipe-buttons">
          <button class="btn btn-run pb-first">▶ First render</button>
          <button class="btn btn-ghost pb-click" disabled>▶ Click “+1”</button>
        </div>
        <div class="pipe-screen"><div class="r-pane-label">The screen (real DOM)</div><div class="mock"></div></div>
      </div>
      <ol class="caps pipe-caps"><li class="cap muted">Press <b>First render</b>.</li></ol>`;
    const $ = (s) => root.querySelector(s);
    const stage = (s) => root.querySelector(`[data-s="${s}"]`);
    const caps = $('.pipe-caps');
    const mock = $('.mock');
    const play = player();
    let count = 0;

    const say = (html) => caps.append(el('li', 'cap', html));
    const light = (s) => root.querySelectorAll('.pipe-stage').forEach((x) => x.classList.toggle('on', x.dataset.s === s));

    async function go(first) {
      const alive = play.start();
      caps.innerHTML = '';
      root.querySelectorAll('.pipe-detail').forEach((d) => (d.innerHTML = ''));
      const next = first ? 0 : count + 1;

      light('trigger');
      stage('trigger').querySelector('.pipe-detail').innerHTML = `<code>${hl(first ? 'root.render(<App />)' : `setCount(${next})`)}</code>`;
      say(first
        ? '① <b>Trigger</b>: the app starts. React is told to show <code>&lt;App /&gt;</code>.'
        : '① <b>Trigger</b>: a click calls <code>setCount(' + next + ')</code>. State changed, so React <b>schedules</b> a render. The screen does not change yet.');
      await wait(1400);
      if (!alive()) return;
      await fly(stage('trigger'), stage('render'), first ? 'App' : `count = ${next}`);
      if (!alive()) return;

      light('render');
      stage('render').querySelector('.pipe-detail').innerHTML = `<code>${hl(`App() → <h3>Count: ${next}</h3>`)}</code>`;
      say('② <b>Render</b>: React <b>calls your component function</b>. It returns JSX describing the screen for count = ' + next + '. Still nothing on screen. This is just a description.');
      await wait(1900);
      if (!alive()) return;
      await fly(stage('render'), stage('commit'), first ? '<h3>…</h3>' : `“${next}”`);
      if (!alive()) return;

      light('commit');
      if (first) {
        stage('commit').querySelector('.pipe-detail').innerHTML = '<code>create all DOM nodes</code>';
        mock.innerHTML = `<h3>Count: <span class="mock-num">0</span></h3><button>+1</button>`;
        pulse(mock, 'flash-render');
        say('③ <b>Commit</b>: first time, so React <b>creates</b> every DOM node.');
        $('.pb-click').disabled = false;
      } else {
        stage('commit').querySelector('.pipe-detail').innerHTML = `<code>text: “${count}” → “${next}”</code>`;
        await fly(stage('commit'), mock.querySelector('.mock-num'), String(next));
        mock.querySelector('.mock-num').textContent = next;
        pulse(mock.querySelector('.mock-num'), 'flash-text');
        say('③ <b>Commit</b>: React compares with the last render and changes <b>only what differs</b>: one piece of text. The <code>&lt;h3&gt;</code> and the button are left alone.');
      }
      count = next;
    }
    $('.pb-first').addEventListener('click', () => { count = 0; go(true); });
    $('.pb-click').addEventListener('click', () => go(false));
  }

  /* ======================================================================
     3. STATE QUEUE
     ====================================================================== */
  function setupQueue(root) {
    root.innerHTML = `
      <div class="q-left">
        <div class="seg" role="group" aria-label="Which version">
          <button class="seg-btn" data-u="0" aria-pressed="true">setCount(count + 1)</button>
          <button class="seg-btn" data-u="1" aria-pressed="false">setCount(c =&gt; c + 1)</button>
        </div>
        <pre class="code q-code"></pre>
        <div class="q-snap">During this render: <span class="q-snapval">count = 0</span></div>
        <button class="btn btn-run q-play">▶ Click the button</button>
      </div>
      <div class="q-right">
        <div class="r-pane-label">React's queue for the next render</div>
        <ol class="q-queue"></ol>
        <div class="q-result">Next render: <b class="q-final">?</b></div>
        <ol class="caps q-caps"></ol>
      </div>`;
    const $ = (s) => root.querySelector(s);
    const code = $('.q-code');
    const queue = $('.q-queue');
    const caps = $('.q-caps');
    const play = player();
    let updater = false;

    const lineText = (u) => (u ? 'setCount(c => c + 1);' : 'setCount(count + 1);');
    function reset() {
      play.cancel();
      code.innerHTML = hlLines(`function handleClick() {\n  ${lineText(updater)}\n  ${lineText(updater)}\n  ${lineText(updater)}\n}`);
      queue.innerHTML = '';
      caps.innerHTML = '<li class="cap muted">Press <b>Click the button</b>. count starts at 0.</li>';
      $('.q-final').textContent = '?';
      $('.q-result').className = 'q-result';
    }
    const say = (html) => caps.append(el('li', 'cap', html));
    const lines = () => [...code.querySelectorAll('.ln')];

    async function go() {
      reset();
      const alive = play.start();
      caps.innerHTML = '';
      say(updater
        ? '① Each call puts a <b>function</b> in the queue: “whatever count is by then, add 1”.'
        : '① <code>count</code> is a <b>snapshot</b>: in this render it is <b>0</b> on every line.');
      for (let i = 1; i <= 3; i++) {
        lines().forEach((l, k) => l.classList.toggle('hl', k === i));
        if (!updater) {
          await fly($('.q-snapval'), lines()[i], '0');
          if (!alive()) return;
          lines()[i].innerHTML = hl('  setCount(0 + 1);  // → 1');
        }
        const item = el('li', 'q-item', updater ? `<code>${hl('c => c + 1')}</code>` : '<code>replace with 1</code>');
        queue.append(item);
        pulse(item);
        await wait(700);
        if (!alive()) return;
      }
      lines().forEach((l) => l.classList.remove('hl'));
      say('② The handler is done. Now React renders again and works through the queue in order:');
      await wait(900);
      let value = 0;
      const items = [...queue.children];
      for (const item of items) {
        if (!alive()) return;
        const before = value;
        value = updater ? value + 1 : 1;
        item.classList.add('done');
        item.insertAdjacentHTML('beforeend', `<span class="q-step">${before} → <b>${value}</b></span>`);
        await wait(800);
      }
      $('.q-final').textContent = `count = ${value}`;
      $('.q-result').className = 'q-result ' + (updater ? 'good' : 'bad');
      pulse($('.q-result'));
      say(updater
        ? '③ Each function got the <b>latest</b> value → <b>3</b>. ✅ Use <code>c =&gt; c + 1</code> when the new state depends on the old one.'
        : '③ “Replace with 1” three times is still <b>1</b>. 🐞 The variable <code>count</code> never changes inside one render.');
    }

    root.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => {
      updater = b.dataset.u === '1';
      root.querySelectorAll('.seg-btn').forEach((x) => x.setAttribute('aria-pressed', x === b));
      reset();
    }));
    $('.q-play').addEventListener('click', go);
    reset();
  }

  /* ======================================================================
     4. SAME BOX OR NEW BOX (immutability)
     ====================================================================== */
  function setupBoxes(root) {
    root.innerHTML = `
      <div class="bx-buttons">
        <button class="btn btn-bug bx-mutate">🐞 todos.push('Walk'); setTodos(todos);</button>
        <button class="btn btn-fix bx-copy">✅ setTodos([...todos, 'Walk']);</button>
      </div>
      <div class="bx-stage">
        <div class="bx-vars">
          <div class="bx-var">old state <span class="bx-ptr" data-v="old">→ 📦 #1</span></div>
          <div class="bx-var">new state <span class="bx-ptr" data-v="new">→ ?</span></div>
        </div>
        <div class="bx-boxes"></div>
        <div class="bx-screen"><div class="r-pane-label">Screen</div><ul class="bx-list"></ul></div>
      </div>
      <div class="bx-check"><code>Object.is(oldState, newState)</code> → <b class="bx-verdict">?</b></div>
      <ol class="caps bx-caps"></ol>`;
    const $ = (s) => root.querySelector(s);
    const boxes = $('.bx-boxes');
    const caps = $('.bx-caps');
    const play = player();
    const say = (html) => caps.append(el('li', 'cap', html));

    function box(n, items) {
      const b = el('div', 'bx-box', `<div class="bx-addr">📦 #${n}</div><div class="bx-items">${items.map((i) => `<span class="bx-item">'${i}'</span>`).join('')}</div>`);
      b.dataset.n = n;
      return b;
    }
    function reset() {
      play.cancel();
      boxes.innerHTML = '';
      boxes.append(box(1, ['Milk', 'Code']));
      $('[data-v="new"]').textContent = '→ ?';
      $('.bx-verdict').textContent = '?';
      $('.bx-check').className = 'bx-check';
      $('.bx-list').innerHTML = '<li>Milk</li><li>Code</li>';
      caps.innerHTML = '<li class="cap muted">React compares the old and new state with <code>Object.is</code>: is it the <b>same box</b> in memory?</li>';
    }

    async function go(copy) {
      reset();
      const alive = play.start();
      caps.innerHTML = '';
      const first = boxes.querySelector('.bx-box');
      const walk = el('span', 'bx-item bx-new', "'Walk'");
      if (!copy) {
        say("① <code>push</code> <b>changes the existing box</b> #1. It doesn't make a new one.");
        await fly($('.bx-mutate'), first, "'Walk'");
        if (!alive()) return;
        first.querySelector('.bx-items').append(walk);
        pulse(walk);
        await wait(700);
        say('② <code>setTodos(todos)</code> hands React… the same box #1.');
        $('[data-v="new"]').textContent = '→ 📦 #1';
        pulse($('[data-v="new"]'));
        await wait(1000);
        if (!alive()) return;
        $('.bx-verdict').textContent = 'true (same box)';
        $('.bx-check').className = 'bx-check bad';
        say('③ Same box → React thinks <b>nothing changed</b> and <b>skips the render</b>. The data changed, but the screen still shows 2 items. 😶');
      } else {
        say('① <code>[...todos]</code> makes a <b>new box</b> #2 and copies the items into it.');
        const second = box(2, []);
        boxes.append(second);
        pulse(second);
        for (const item of first.querySelectorAll('.bx-item')) {
          await fly(item, second.querySelector('.bx-items'), item.textContent, '', 600);
          if (!alive()) return;
          second.querySelector('.bx-items').append(el('span', 'bx-item', item.textContent));
        }
        await fly($('.bx-copy'), second, "'Walk'", '', 600);
        if (!alive()) return;
        second.querySelector('.bx-items').append(walk);
        pulse(walk);
        say('② The old box #1 is untouched. <code>setTodos</code> gets box #2.');
        $('[data-v="new"]').textContent = '→ 📦 #2';
        pulse($('[data-v="new"]'));
        await wait(1000);
        if (!alive()) return;
        $('.bx-verdict').textContent = 'false (new box)';
        $('.bx-check').className = 'bx-check good';
        $('.bx-list').innerHTML = '<li>Milk</li><li>Code</li><li class="bx-added">Walk</li>';
        pulse($('.bx-screen'), 'flash-render');
        say('③ New box → React <b>re-renders</b>. ✅ Rule: never change state. Make a new copy with the change.');
      }
    }
    $('.bx-mutate').addEventListener('click', () => go(false));
    $('.bx-copy').addEventListener('click', () => go(true));
    reset();
  }

  /* ======================================================================
     5. EFFECT TIMELINE: a real React component, logging its own lifecycle
     ====================================================================== */
  const DEP_CODE = { none: '', empty: ', []', user: ', [userId]' };
  function setupEffects(root) {
    root.innerHTML = `
      <div class="ef-left">
        <div class="seg" role="group" aria-label="Dependency array">
          <button class="seg-btn" data-m="none" aria-pressed="false">no array</button>
          <button class="seg-btn" data-m="empty" aria-pressed="false">[]</button>
          <button class="seg-btn" data-m="user" aria-pressed="true">[userId]</button>
        </div>
        <pre class="code ef-code"></pre>
        <div class="ef-buttons">
          <button class="btn btn-ghost ef-mount">⏏ Unmount</button>
          <button class="btn btn-ghost ef-user">userId → 2</button>
          <button class="btn btn-ghost ef-other">Change other state</button>
          <button class="btn btn-ghost ef-clear">Clear</button>
        </div>
      </div>
      <div class="ef-right">
        <div class="r-pane-label">What React did, in order</div>
        <ol class="ef-log"></ol>
      </div>`;
    const $ = (s) => root.querySelector(s);
    const logEl = $('.ef-log');
    let mode = 'user';
    let userId = 1;
    let other = 0;
    let mounted = true;
    let gen = 0;

    const LABEL = { render: '🎨 render', effect: '⚡ effect', cleanup: '🧹 cleanup' };
    function log(kind, text) {
      const li = el('li', 'ef-item ef-' + kind, `<b>${LABEL[kind]}</b> <span>${esc(text)}</span>`);
      logEl.append(li);
      logEl.scrollTop = logEl.scrollHeight;
    }

    // The demo component. It returns nothing visible; it just reports what happens.
    function Profile({ userId, other, mode }) {
      log('render', `Profile(userId=${userId}, other=${other})`);
      const deps = mode === 'none' ? undefined : mode === 'empty' ? [] : [userId];
      React.useEffect(() => {
        log('effect', `connect to chat for user ${userId}`);
        return () => log('cleanup', `disconnect user ${userId}`);
      }, deps);
      return null;
    }

    const host = el('div');
    host.hidden = true;
    root.append(host);
    const reactRoot = ReactDOM.createRoot(host);
    const show = () => reactRoot.render(mounted ? h(Profile, { userId, other, mode, key: mode + gen }) : null);

    function renderCode() {
      $('.ef-code').innerHTML = hlLines(`function Profile({ userId }) {\n  useEffect(() => {\n    connect(userId);\n    return () => disconnect(userId);\n  }${DEP_CODE[mode]});\n  return …;\n}`);
    }
    function restart() {
      logEl.innerHTML = '';
      userId = 1; other = 0; mounted = true; gen += 1;
      $('.ef-mount').textContent = '⏏ Unmount';
      $('.ef-user').textContent = 'userId → 2';
      renderCode();
      show();
    }

    root.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => {
      mode = b.dataset.m;
      root.querySelectorAll('.seg-btn').forEach((x) => x.setAttribute('aria-pressed', x === b));
      ReactDOM.flushSync(() => reactRoot.render(null)); // unmount the old version now (it logs its cleanup)
      restart();
    }));
    $('.ef-user').addEventListener('click', () => {
      if (!mounted) return;
      userId = userId === 1 ? 2 : 1;
      $('.ef-user').textContent = `userId → ${userId === 1 ? 2 : 1}`;
      show();
    });
    $('.ef-other').addEventListener('click', () => { if (mounted) { other += 1; show(); } });
    $('.ef-mount').addEventListener('click', () => {
      mounted = !mounted;
      $('.ef-mount').textContent = mounted ? '⏏ Unmount' : '▶ Mount';
      if (!mounted) logEl.append(el('li', 'ef-item ef-note', '<b>⏏</b> <span>component removed from the screen</span>'));
      show();
    });
    $('.ef-clear').addEventListener('click', () => { logEl.innerHTML = ''; });
    restart();
  }

  /* ======================================================================
     6. JSX CHAIN: the real Babel output and the real element object
     ====================================================================== */
  function elementToText(node, indent = '') {
    if (node == null || typeof node !== 'object') return JSON.stringify(node);
    const type = typeof node.type === 'string' ? `'${node.type}'` : node.type.name;
    const lines = [`{`, `${indent}  type: ${type},`, `${indent}  props: {`];
    for (const [k, v] of Object.entries(node.props)) {
      if (k === 'children') continue;
      lines.push(`${indent}    ${k}: ${typeof v === 'function' ? 'ƒ ' + v.name : JSON.stringify(v)},`);
    }
    const kids = [].concat(node.props.children ?? []);
    if (kids.length) {
      lines.push(`${indent}    children: [`);
      kids.forEach((c) => lines.push(`${indent}      ${elementToText(c, indent + '      ')},`));
      lines.push(`${indent}    ]`);
    }
    lines.push(`${indent}  }`, `${indent}}`);
    return lines.join('\n');
  }

  function setupJsxChain(root) {
    const jsx = `<div className="card">\n  <h2>Hello, {name}</h2>\n  <button onClick={wave}>Wave 👋</button>\n</div>`;
    const compiled = Babel.transform(jsx, { presets: ['react'], filename: 'x.jsx', generatorOpts: { jsescOption: { minimal: true } } })
      .code.replace(/\/\*#__PURE__\*\//g, '').replace(/;\s*$/, '');
    const name = 'Sara';
    const wave = function wave() {};
    // eslint-disable-next-line no-new-func
    const element = new Function('React', 'name', 'wave', 'return ' + compiled)(React, name, wave);
    const host = el('div', 'jc-dom');
    ReactDOM.createRoot(host).render(element);

    root.innerHTML = `
      <div class="jc-pane step"><div class="r-pane-label">1 · You write JSX</div><pre class="code">${hlLines(jsx)}</pre></div>
      <div class="jc-arrow step">Babel compiles it ↓</div>
      <div class="jc-pane step"><div class="r-pane-label">2 · It is really function calls</div><pre class="code">${hlLines(compiled)}</pre></div>
      <div class="jc-arrow step">Running them creates ↓</div>
      <div class="jc-pane step"><div class="r-pane-label">3 · A plain object: a description of the UI</div><pre class="code jc-obj"></pre></div>
      <div class="jc-arrow step">React DOM turns it into ↓</div>
      <div class="jc-pane step"><div class="r-pane-label">4 · Real DOM on the screen</div><div class="jc-dom-wrap"></div><pre class="code jc-html"></pre></div>`;
    root.querySelector('.jc-obj').innerHTML = hlLines(elementToText(element));
    root.querySelector('.jc-dom-wrap').append(host);
    setTimeout(() => { root.querySelector('.jc-html').innerHTML = hlLines(host.innerHTML.replace(/></g, '>\n<')); }, 50);
  }

  /* ======================================================================
     7. FLIP CARDS
     ====================================================================== */
  document.querySelectorAll('.flip').forEach((card) => card.addEventListener('click', () => card.classList.toggle('flipped')));

  document.querySelectorAll('.tree-demo').forEach(setupTree);
  document.querySelectorAll('.pipeline').forEach(setupPipeline);
  document.querySelectorAll('.queue-demo').forEach(setupQueue);
  document.querySelectorAll('.box-demo').forEach(setupBoxes);
  document.querySelectorAll('.effect-demo').forEach(setupEffects);
  document.querySelectorAll('.jsx-chain').forEach(setupJsxChain);
})();
