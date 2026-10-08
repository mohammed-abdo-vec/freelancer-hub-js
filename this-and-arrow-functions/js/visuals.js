/* The animated explainers:
   1. The call-site machine   "look left of the dot" → where does `this` come from?
   2. The scope demo          function vs arrow inside setTimeout
   3. The syntax morph        function → arrow, one step at a time
   4. The `new` demo          what `new` does to `this`
   5. Flip cards              quizzes */
(function () {
  const { el, hl, hlLines, wait, fly, pick, pulse } = Deck;

  const isModule = (m) => m === 'module';
  const plainThis = (m) => (isModule(m) ? 'undefined' : 'window');

  /* ======================================================================
     1. THE CALL-SITE MACHINE
     Each scenario is one call expression, split into tokens with a role:
       owner = what is left of the dot   call = the ()   fn = the function name
       caller = someone else who calls the function later (setTimeout, the browser)
     Each step highlights some roles, says one sentence, and maybe flies a value
     into the `this` box. Text can be a function of the run mode.
     ====================================================================== */
  const findCall = (name) => ({ hl: ['call'], say: `① Find the call: the <b>()</b> after <code>${name}</code>.` });
  const plainCallOut = (m) =>
    isModule(m)
      ? { error: "TypeError: Cannot read properties of undefined (reading 'sound')" }
      : { text: 'undefined! I am undefined', bad: true };
  const noOwnerSay = (m) =>
    isModule(m)
      ? '③ No owner → <code>this</code> = <code>undefined</code>. <span class="muted">(modules, classes, "use strict")</span>'
      : '③ No owner → <code>this</code> = <code>window</code>. <span class="muted">(old sloppy scripts)</span>';

  const SCENARIOS = {
    'cat.speak()': {
      tokens: [['cat', 'owner'], ['.', 'dot'], ['speak', 'fn'], ['()', 'call']],
      steps: [
        findCall('speak'),
        { hl: ['owner', 'dot'], say: '② Look <b>left of the dot</b>: it is <code>cat</code>.' },
        { hl: ['owner'], say: '③ So inside <code>speak</code>, <code>this</code> = <code>cat</code>.', fly: { from: 'owner', value: 'cat' } },
      ],
      out: { text: 'Meow! I am Tom' },
    },
    'dog.speak()': {
      tokens: [['dog', 'owner'], ['.', 'dot'], ['speak', 'fn'], ['()', 'call']],
      steps: [
        findCall('speak'),
        { hl: ['owner', 'dot'], say: '② Look <b>left of the dot</b>: it is <code>dog</code>.' },
        { hl: ['owner'], say: '③ Same function, different caller → <code>this</code> = <code>dog</code>.', fly: { from: 'owner', value: 'dog' } },
      ],
      out: { text: 'Woof! I am Rex' },
    },
    'speak()': {
      tokens: [['∅', 'owner', 'empty'], ['speak', 'fn'], ['()', 'call']],
      steps: [
        findCall('speak'),
        { hl: ['owner'], say: '② Look left of the dot… <b>there is no dot.</b> Nobody owns this call.' },
        { hl: ['owner'], say: noOwnerSay, fly: { from: 'owner', value: plainThis } },
      ],
      out: plainCallOut,
    },
    'const f = cat.speak; f()': {
      pre: 'const f = cat.speak; // no () → copies the function, does not call it',
      tokens: [['∅', 'owner', 'empty'], ['f', 'fn'], ['()', 'call']],
      steps: [
        { hl: ['fn'], say: '① <code>f</code> is the <b>same function</b> as <code>cat.speak</code>. The cat is not glued to it.' },
        { hl: ['owner', 'call'], say: '② Find the call: <code>f()</code>. Left of the dot… <b>nothing</b>.' },
        { hl: ['owner'], say: noOwnerSay, fly: { from: 'owner', value: plainThis } },
      ],
      out: plainCallOut,
    },
    'setTimeout(cat.speak, 1000)': {
      tokens: [['setTimeout', 'caller'], ['(', ''], ['cat', 'owner'], ['.', 'dot'], ['speak', 'fn'], [', 1000)', '']],
      steps: [
        { hl: ['fn'], say: '① Look for <b>()</b> after <code>speak</code>… <b>none!</b> We hand the function to setTimeout. We do not call it.' },
        { hl: ['owner'], cross: ['owner', 'dot'], say: '② So <code>cat</code> here is only used to <i>find</i> the function. It is not the owner of any call.' },
        { hl: ['caller'], say: '③ One second later setTimeout calls it as plain <code>callback()</code>. Browser timers use <code>this</code> = <code>window</code>.', fly: { from: 'caller', value: 'window' } },
      ],
      out: { text: 'undefined! I am undefined', bad: true },
    },
    'speak.call(dog)': {
      tokens: [['speak', 'fn'], ['.call', 'method'], ['(', 'call'], ['dog', 'owner'], [')', 'call']],
      steps: [
        { hl: ['method', 'call'], say: '① Called with <code>.call()</code>: no guessing. You pass <code>this</code> yourself.' },
        { hl: ['owner'], say: '② The first argument becomes <code>this</code> → <code>dog</code>.', fly: { from: 'owner', value: 'dog' } },
      ],
      out: { text: 'Woof! I am Rex' },
    },
  };

  function setupMachine(root) {
    const keys = root.dataset.scenarios.split('|');
    const buttons = el('div', 'm-buttons');
    const stage = el('div', 'm-stage');
    const preLine = el('div', 'm-preline');
    const expr = el('div', 'm-expr');
    const box = el('div', 'this-box', '<span class="this-label">this</span><span class="this-value">?</span>');
    const caps = el('ol', 'm-caps');
    const out = el('div', 'm-out');
    const value = box.querySelector('.this-value');
    stage.append(preLine, expr, box);
    const right = el('div', 'm-right');
    right.append(stage, caps, out);
    root.querySelector('.m-left').append(buttons);
    root.append(right);

    let runId = 0;
    keys.forEach((k) => {
      const b = el('button', 'm-btn', `<code>${hl(k)}</code>`);
      b.addEventListener('click', () => play(k, b));
      buttons.append(b);
    });

    function reset(s) {
      expr.innerHTML = '';
      s.tokens.forEach(([text, role, extra]) => {
        const t = el('span', `tok ${role ? 'r-' + role : ''} ${extra || ''}`, hl(text));
        t.dataset.role = role;
        expr.append(t);
      });
      preLine.innerHTML = s.pre ? hl(s.pre) : '';
      preLine.hidden = !s.pre;
      value.textContent = '?';
      box.classList.remove('filled', 'is-undefined');
      caps.innerHTML = '';
      out.innerHTML = '';
      out.className = 'm-out';
    }

    async function play(key, btn) {
      const id = ++runId;
      const s = SCENARIOS[key];
      buttons.querySelectorAll('.m-btn').forEach((b) => b.classList.toggle('active', b === btn));
      reset(s);
      const tokens = (role) => [...expr.querySelectorAll(`[data-role="${role}"]`)];
      await wait(300);
      for (const step of s.steps) {
        if (id !== runId) return; // another scenario was started: stop this one
        expr.querySelectorAll('.tok').forEach((t) => t.classList.remove('is-hl'));
        (step.hl || []).forEach((r) => tokens(r).forEach((t) => t.classList.add('is-hl')));
        (step.cross || []).forEach((r) => tokens(r).forEach((t) => t.classList.add('crossed')));
        const li = el('li', 'cap', pick(step.say));
        caps.append(li);
        if (step.fly) {
          await wait(500);
          const v = pick(step.fly.value);
          await fly(tokens(step.fly.from)[0], value, v);
          if (id !== runId) return;
          value.textContent = v;
          box.classList.add('filled');
          box.classList.toggle('is-undefined', v === 'undefined' || v === 'window');
          pulse(box);
        }
        await wait(1300);
      }
      if (id !== runId) return;
      const result = pick(s.out);
      out.className = 'm-out ' + (result.error ? 'is-error' : result.bad ? 'is-bad' : 'is-ok');
      out.innerHTML = result.error
        ? `<span class="m-prompt">✖</span> Uncaught ${Deck.esc(result.error)}`
        : `<span class="m-prompt">console ›</span> ${Deck.esc(result.text)}`;
      pulse(out);
    }

    // Start with the first scenario drawn but not played.
    reset(SCENARIOS[keys[0]]);
    caps.innerHTML = '<li class="cap muted">Pick a call above to watch where <code>this</code> comes from.</li>';
  }

  /* ======================================================================
     2. THE SCOPE DEMO: a normal function vs an arrow inside setTimeout
     ====================================================================== */
  const scopeCode = (arrow) => `const user = {
  username: 'mohammed',
  greetLater() {
    setTimeout(${arrow ? '() =>' : 'function ()'} {
      console.log(\`Hi, \${this.username}\`);
    }, 1000);
  }
};
user.greetLater();`;

  function setupScope(root) {
    root.innerHTML = `
      <div class="sd-left">
        <div class="seg" role="group" aria-label="Callback type">
          <button class="seg-btn" data-arrow="0" aria-pressed="true">function () { }</button>
          <button class="seg-btn" data-arrow="1" aria-pressed="false">() =&gt; { }</button>
        </div>
        <pre class="code sd-code"></pre>
        <button class="btn btn-run sd-play">▶ Play</button>
      </div>
      <div class="sd-right">
        <div class="sd-callline"><span class="tok r-owner sd-owner">user</span><span class="tok">.greetLater()</span></div>
        <div class="sd-outer">
          <div class="sd-head"><span class="sd-name"><code>greetLater() { … }</code></span>
            <span class="slot" data-slot="outer"><i>this</i><b>?</b></span></div>
          <div class="sd-inner">
            <div class="sd-head"><span class="sd-name sd-kind"></span>
              <span class="slot" data-slot="inner"><i>this</i><b>?</b></span></div>
            <div class="sd-body"><code>console.log(\`Hi, \${this.username}\`)</code></div>
          </div>
        </div>
        <div class="sd-timer"><span class="tok sd-timer-tok">⏱ setTimeout</span><span class="sd-track"><span class="sd-fill"></span></span></div>
        <ol class="m-caps sd-caps"></ol>
        <div class="m-out sd-out"></div>
      </div>`;

    const $ = (s) => root.querySelector(s);
    const code = $('.sd-code');
    const inner = $('.sd-inner');
    const outerSlot = $('[data-slot="outer"]');
    const innerSlot = $('[data-slot="inner"]');
    const caps = $('.sd-caps');
    const out = $('.sd-out');
    const fill = $('.sd-fill');
    let arrow = false;
    let runId = 0;

    root.querySelector('.sd-body code').innerHTML = hl('console.log(`Hi, ${this.username}`)');

    function lines(...idx) {
      code.querySelectorAll('.ln').forEach((l, i) => l.classList.toggle('hl', idx.includes(i)));
    }
    function setSlot(slot, text, cls = '') {
      slot.querySelector('b').textContent = text;
      slot.className = 'slot ' + cls;
      if (cls.includes('filled')) pulse(slot);
    }
    function reset() {
      runId++;
      code.innerHTML = hlLines(scopeCode(arrow));
      inner.classList.toggle('is-arrow', arrow);
      $('.sd-kind').innerHTML = `<code>${hl(arrow ? '() => { … }' : 'function () { … }')}</code>`;
      setSlot(outerSlot, '?');
      setSlot(innerSlot, arrow ? 'none of its own' : '?', arrow ? 'none' : '');
      caps.innerHTML = `<li class="cap muted">Press ▶ Play to run <code>user.greetLater()</code>.</li>`;
      out.innerHTML = '';
      out.className = 'm-out sd-out';
      fill.style.transition = 'none';
      fill.style.width = '0%';
    }
    const say = (html) => caps.append(el('li', 'cap', html));

    async function play() {
      reset();
      const id = runId;
      caps.innerHTML = '';
      const alive = () => id === runId;

      lines(8, 2);
      say('① <code>user.greetLater()</code>: left of the dot is <code>user</code> → greetLater\'s <code>this</code> = <code>user</code>.');
      await wait(600);
      await fly($('.sd-owner'), outerSlot.querySelector('b'), 'user');
      if (!alive()) return;
      setSlot(outerSlot, 'user', 'filled');
      await wait(1200);

      lines(3, 5);
      say('② setTimeout starts a 1-second timer. greetLater finishes and returns.');
      void fill.offsetWidth;
      fill.style.transition = `width ${Deck.reduced ? 0.1 : 1.6}s linear`;
      fill.style.width = '100%';
      await wait(1900);
      if (!alive()) return;

      lines(3, 4);
      if (!arrow) {
        say('③ The timer fires and calls the callback as a plain <code>callback()</code>. A <code>function</code> gets its <b>own new this</b>, and timers give it <code>window</code>.');
        await wait(600);
        await fly($('.sd-timer-tok'), innerSlot.querySelector('b'), 'window');
        if (!alive()) return;
        setSlot(innerSlot, 'window', 'filled bad');
        await wait(1100);
        say('④ <code>window.username</code> does not exist → <code>undefined</code>.');
        out.className = 'm-out sd-out is-bad';
        out.innerHTML = '<span class="m-prompt">console ›</span> Hi, undefined';
      } else {
        say('③ The timer fires. An arrow has <b>no this of its own</b>, so it uses the <code>this</code> of the code around it: greetLater\'s.');
        await wait(600);
        await fly(outerSlot.querySelector('b'), innerSlot.querySelector('b'), 'user', 'flyer-arrow');
        if (!alive()) return;
        setSlot(innerSlot, 'user ↑ borrowed', 'filled good');
        await wait(1100);
        say('④ <code>user.username</code> → <code>"mohammed"</code>.');
        out.className = 'm-out sd-out is-ok';
        out.innerHTML = '<span class="m-prompt">console ›</span> Hi, mohammed';
      }
      pulse(out);
    }

    root.querySelectorAll('.seg-btn').forEach((b) =>
      b.addEventListener('click', () => {
        arrow = b.dataset.arrow === '1';
        root.querySelectorAll('.seg-btn').forEach((x) => x.setAttribute('aria-pressed', x === b));
        reset();
      })
    );
    $('.sd-play').addEventListener('click', play);
    reset();
  }

  /* ======================================================================
     3. THE SYNTAX MORPH: [-removed-] and {+added+} mark the change from the step before
     ====================================================================== */
  const MORPH = [
    { code: 'function add(a, b) {\n  return a + b;\n}', say: 'A normal <b>function declaration</b>. Let\'s turn it into an arrow function.' },
    { code: '[-function add-]{+const add = function+}(a, b) {\n  return a + b;\n}{+;+}', say: '① Store the function in a variable (a <b>function expression</b>).' },
    { code: 'const add = [-function-](a, b) {+=> +}{\n  return a + b;\n};', say: '② Delete the word <code>function</code>. Put <code>=&gt;</code> after the parameters.' },
    { code: 'const add = (a, b) => [-{\n  return -]a + b[-;\n}-];', say: '③ The body is one expression? Drop <code>{ }</code> and <code>return</code>. The value is returned for you (<b>implicit return</b>).' },
    { code: 'const [-add-]{+double+} = [-(a, b)-]{+n+} => [-a + b-]{+n * 2+};', say: '④ Exactly one parameter? The <code>( )</code> are optional.' },
  ];
  const parts = (code) => {
    const out = [];
    const re = /\[-([\s\S]*?)-\]|\{\+([\s\S]*?)\+\}/g;
    let last = 0;
    let m;
    while ((m = re.exec(code))) {
      if (m.index > last) out.push({ text: code.slice(last, m.index), kind: '' });
      out.push(m[1] != null ? { text: m[1], kind: 'del' } : { text: m[2], kind: 'ins' });
      last = m.index + m[0].length;
    }
    if (last < code.length) out.push({ text: code.slice(last), kind: '' });
    return out;
  };
  const renderParts = (list, show) =>
    list.filter((p) => show.includes(p.kind)).map((p) => (p.kind ? `<span class="${p.kind}">${hl(p.text)}</span>` : hl(p.text))).join('');

  function setupMorph(root) {
    root.innerHTML = `
      <pre class="code morph-code"></pre>
      <p class="morph-say"></p>
      <div class="morph-bar">
        <button class="btn btn-ghost mb-back">◀ Back</button>
        <span class="morph-dots"></span>
        <button class="btn btn-run mb-next">Next step ▶</button>
      </div>`;
    const code = root.querySelector('.morph-code');
    const say = root.querySelector('.morph-say');
    const dots = root.querySelector('.morph-dots');
    let i = 0;
    let runId = 0;
    MORPH.forEach(() => dots.append(el('span', 'dot')));

    async function show(n, animate) {
      const id = ++runId;
      i = n;
      const p = parts(MORPH[n].code);
      say.innerHTML = MORPH[n].say;
      [...dots.children].forEach((d, k) => d.classList.toggle('on', k <= n));
      root.querySelector('.mb-back').disabled = n === 0;
      root.querySelector('.mb-next').disabled = n === MORPH.length - 1;
      if (animate && p.some((x) => x.kind)) {
        code.innerHTML = renderParts(p, ['', 'del']); // first: strike out what goes away
        code.classList.add('striking');
        await wait(1300);
        if (id !== runId) return;
        code.classList.remove('striking');
      }
      code.innerHTML = renderParts(p, ['', 'ins']); // then: the new code, additions glowing
      code.classList.toggle('settled', !animate);
    }
    root.querySelector('.mb-next').addEventListener('click', () => i < MORPH.length - 1 && show(i + 1, true));
    root.querySelector('.mb-back').addEventListener('click', () => i > 0 && show(i - 1, false));
    show(0, false);
  }

  /* ======================================================================
     4. THE `new` DEMO
     ====================================================================== */
  const NEW_CODE = `function Pet(petName, sound) {
  // new did: this = {}
  this.petName = petName;
  this.sound = sound;
  // new does: return this
}
const rex = new Pet('Rex', 'Woof');
console.log(rex.petName);`;

  const NEW_STEPS = [
    { lines: [], say: 'Press <b>Next step</b> to run <code>new Pet(\'Rex\', \'Woof\')</code> slowly.' },
    { lines: [6, 1], say: '① <code>new</code> creates a brand-new empty object <code>{}</code> and points <code>this</code> at it.' },
    { lines: [2], say: '② <code>this.petName = petName</code> writes onto that new object.', row: ['petName', "'Rex'"] },
    { lines: [3], say: '③ Same for <code>sound</code>.', row: ['sound', "'Woof'"] },
    { lines: [4, 6], say: '④ The function ends and <code>new</code> returns <code>this</code> for you. It lands in <code>rex</code>.', land: true },
    { lines: [7], say: '⑤ <code>rex.petName</code> → <code>"Rex"</code>. Forget <code>new</code> and it is a plain call: <code>this</code> is undefined or window.', out: true },
  ];

  function setupNew(root) {
    root.innerHTML = `
      <div class="nd-left">
        <pre class="code nd-code"></pre>
        <div class="morph-bar">
          <button class="btn btn-ghost nd-back">↺ Restart</button>
          <button class="btn btn-run nd-next">Next step ▶</button>
        </div>
      </div>
      <div class="nd-right">
        <div class="nd-var"><code>rex</code> <span class="nd-eq">=</span> <span class="nd-slot">?</span></div>
        <div class="nd-obj" hidden>
          <span class="nd-this">this</span>
          <div class="nd-brace">Pet {</div>
          <div class="nd-rows"></div>
          <div class="nd-brace">}</div>
        </div>
        <p class="morph-say nd-say"></p>
        <div class="m-out nd-out"></div>
      </div>`;
    const $ = (s) => root.querySelector(s);
    const code = $('.nd-code');
    code.innerHTML = hlLines(NEW_CODE);
    let i = 0;

    async function go(n) {
      i = n;
      const s = NEW_STEPS[n];
      code.querySelectorAll('.ln').forEach((l, k) => l.classList.toggle('hl', s.lines.includes(k)));
      $('.nd-say').innerHTML = s.say;
      $('.nd-next').disabled = n === NEW_STEPS.length - 1;
      const obj = $('.nd-obj');
      if (n === 0) {
        obj.hidden = true;
        $('.nd-rows').innerHTML = '';
        $('.nd-slot').textContent = '?';
        $('.nd-slot').classList.remove('filled');
        $('.nd-out').innerHTML = '';
        $('.nd-out').className = 'm-out nd-out';
        return;
      }
      if (n === 1) { obj.hidden = false; pulse(obj); }
      if (s.row) {
        const r = el('div', 'nd-row', `<code>${hl(`${s.row[0]}: ${s.row[1]}`)}</code>`);
        $('.nd-rows').append(r);
        pulse(r);
      }
      if (s.land) {
        await fly(obj, $('.nd-slot'), "Pet {petName: 'Rex', sound: 'Woof'}");
        $('.nd-slot').innerHTML = `<code>${hl("Pet {petName: 'Rex', sound: 'Woof'}")}</code>`;
        $('.nd-slot').classList.add('filled');
        pulse($('.nd-slot'));
      }
      if (s.out) {
        $('.nd-out').className = 'm-out nd-out is-ok';
        $('.nd-out').innerHTML = '<span class="m-prompt">console ›</span> Rex';
      }
    }
    $('.nd-next').addEventListener('click', () => i < NEW_STEPS.length - 1 && go(i + 1));
    $('.nd-back').addEventListener('click', () => go(0));
    go(0);
  }

  /* ======================================================================
     5. FLIP CARDS
     ====================================================================== */
  function setupFlip(card) {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  }

  document.querySelectorAll('.machine').forEach(setupMachine);
  document.querySelectorAll('.scope-demo').forEach(setupScope);
  document.querySelectorAll('.morph').forEach(setupMorph);
  document.querySelectorAll('.new-demo').forEach(setupNew);
  document.querySelectorAll('.flip').forEach(setupFlip);
})();
