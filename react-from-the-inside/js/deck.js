/* The slide engine: navigation, step-by-step reveals, overview, theme.

   Keys:  → / Space / PageDown  next step or slide     ← / PageUp  back
          Home / End  first / last     O  overview      T  theme
          F  fullscreen                R  re-run the code on this slide

   A slide's `.step` elements appear one at a time before → moves to the next slide.
   The slide number lives in the URL (#7), so a refresh keeps your place.
   Every slide change fires a `deck:slide` event; runner.js uses it to stop the old
   slide's apps and start the new slide's. */
(function () {
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const bar = document.getElementById('progress-bar');
  const partLabel = document.getElementById('part-label');
  const overview = document.getElementById('overview');
  const PARTS = {
    1: 'Part 1 · JSX & components',
    2: 'Part 2 · State & events',
    3: 'Part 3 · Effects & refs',
    4: 'Part 4 · Sharing state & logic',
    5: 'Part 5 · Rendering & performance',
    6: 'Part 6 · The bugs',
  };
  let index = -1;

  const stepsOf = (s) => [...s.querySelectorAll('.step')];

  function updateUI() {
    const s = slides[index];
    counter.textContent = `${index + 1} / ${slides.length}`;
    bar.style.width = ((index + 1) / slides.length) * 100 + '%';
    const part = s.dataset.part || '0';
    partLabel.textContent = PARTS[part] || '';
    document.body.dataset.part = part;
    const hidden = stepsOf(s).filter((x) => !x.classList.contains('shown')).length;
    document.getElementById('next').classList.toggle('has-steps', hidden > 0);
  }

  function go(i, revealAll = false) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const changed = i !== index;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.classList.toggle('is-past', k < i);
      s.inert = k !== i;
    });
    stepsOf(slides[i]).forEach((x) => x.classList.toggle('shown', revealAll));
    slides[i].scrollTop = 0;
    index = i;
    history.replaceState(null, '', '#' + (i + 1));
    updateUI();
    if (changed) document.dispatchEvent(new CustomEvent('deck:slide', { detail: { index: i, slide: slides[i] } }));
  }

  function next() {
    const hidden = stepsOf(slides[index]).filter((x) => !x.classList.contains('shown'));
    if (hidden.length) {
      hidden[0].classList.add('shown');
      hidden[0].scrollIntoView({ block: 'nearest', behavior: Deck.reduced ? 'auto' : 'smooth' });
      updateUI();
    } else go(index + 1);
  }

  function prev() {
    const shown = stepsOf(slides[index]).filter((x) => x.classList.contains('shown'));
    if (shown.length) {
      shown[shown.length - 1].classList.remove('shown');
      updateUI();
    } else go(index - 1, true);
  }

  /* ---- Theme ---- */
  const root = document.documentElement;
  const savedTheme = Deck.store.get('react-deck-theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  function toggleTheme() {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    Deck.store.set('react-deck-theme', root.dataset.theme);
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.requestFullscreen?.().catch(() => {});
  }

  /* ---- Overview ---- */
  const grid = overview.querySelector('.ov-grid');
  slides.forEach((s, i) => {
    const b = Deck.el('button', 'ov-item', `<span class="ov-num">${i + 1}</span>${Deck.esc(s.dataset.title || 'Slide')}`);
    b.dataset.part = s.dataset.part || '0';
    b.addEventListener('click', () => { overview.close(); go(i, true); });
    grid.append(b);
  });
  function toggleOverview() {
    if (overview.open) return overview.close();
    grid.querySelectorAll('.ov-item').forEach((b, i) => b.classList.toggle('current', i === index));
    overview.showModal();
    grid.querySelector('.current')?.focus();
  }
  overview.querySelector('.ov-close').addEventListener('click', () => overview.close());

  /* ---- Input ---- */
  // Some demos steal focus from an input mid-word (Bug 8 does it on purpose). The rest of
  // the word must not trigger letter shortcuts, so they pause for a moment after typing.
  let lastTyped = 0;
  document.addEventListener('keydown', (e) => {
    // Typing inside a demo (inputs in a preview, the code editor) never moves slides.
    if (e.target.closest('textarea, input, select, [contenteditable]')) { lastTyped = Date.now(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[a-z]$/i.test(e.key) && Date.now() - lastTyped < 2000) { lastTyped = Date.now(); return; }
    if (overview.open && e.key !== 'o' && e.key !== 'O') return;
    const onButton = e.target.closest('button');
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': next(); break;
      case ' ': if (onButton) return; next(); break;
      case 'ArrowLeft': case 'PageUp': prev(); break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1); break;
      case 'o': case 'O': toggleOverview(); break;
      case 't': case 'T': toggleTheme(); break;
      case 'f': case 'F': fullscreen(); break;
      case 'r': case 'R': slides[index].querySelector('.runner')?.runner.run(); break;
      default: return;
    }
    e.preventDefault();
  });

  document.getElementById('next').addEventListener('click', next);
  document.getElementById('prev').addEventListener('click', prev);
  document.getElementById('overview-btn').addEventListener('click', toggleOverview);
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
  document.getElementById('fs-btn').addEventListener('click', fullscreen);

  // Links like <a data-goto="#bug-3"> jump to the slide with that id.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-goto]');
    if (!link) return;
    e.preventDefault();
    const target = document.querySelector(link.dataset.goto);
    if (target) go(slides.indexOf(target), true);
  });

  // Swipe on touch screens.
  let touchX = null;
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 70 && !e.target.closest('pre, textarea, .r-console, .r-preview')) (dx < 0 ? next : prev)();
  });

  window.addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n && n - 1 !== index) go(n - 1, true);
  });

  const start = parseInt(location.hash.slice(1), 10);
  go(start ? start - 1 : 0);
  document.body.classList.add('ready');
})();
