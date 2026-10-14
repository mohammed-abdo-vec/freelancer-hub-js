/* محرك الشرائح: التنقل، إظهار الخطوات واحدة واحدة، نظرة عامة، الثيم.

   الصفحة بالعربي (من اليمين لليسار)، لذلك:
     ← / Space / PageDown   الخطوة أو الشريحة التالية
     → / PageUp             رجوع
     Home / End  الأولى / الأخيرة     O  كل الشرائح     T  الثيم
     F  ملء الشاشة                    R  إعادة تشغيل الكود في هذه الشريحة

   عناصر .step في الشريحة تظهر واحدًا تلو الآخر قبل الانتقال للشريحة التالية.
   رقم الشريحة في الرابط (#7)، فالتحديث يحافظ على مكانك.
   كل تغيير شريحة يطلق حدث deck:slide، ويستخدمه runner.js لإيقاف وتشغيل الأمثلة.

   كل ملف عرض يعرّف أسماء أجزائه قبل تحميل هذا الملف:
     <script>window.DECK = { id: 'state', parts: { 1: '...', 2: '...' } };</script> */
(function () {
  const config = window.DECK || {};
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const bar = document.getElementById('progress-bar');
  const partLabel = document.getElementById('part-label');
  const overview = document.getElementById('overview');
  const PARTS = config.parts || {};
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

  /* ---- الثيم (فاتح / داكن) ---- */
  const root = document.documentElement;
  const savedTheme = Deck.store.get('ar-deck-theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  function toggleTheme() {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    Deck.store.set('ar-deck-theme', root.dataset.theme);
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.requestFullscreen?.().catch(() => {});
  }

  /* ---- نظرة عامة على كل الشرائح ---- */
  const grid = overview.querySelector('.ov-grid');
  slides.forEach((s, i) => {
    const b = Deck.el('button', 'ov-item', `<span class="ov-num">${i + 1}</span>${Deck.esc(s.dataset.title || 'شريحة')}`);
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

  /* ---- لوحة المفاتيح ---- */
  let lastTyped = 0;
  document.addEventListener('keydown', (e) => {
    // الكتابة داخل مثال (حقل إدخال، محرر الكود) لا تحرّك الشرائح أبدًا.
    if (e.target.closest('textarea, input, select, [contenteditable]')) { lastTyped = Date.now(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[a-z]$/i.test(e.key) && Date.now() - lastTyped < 2000) { lastTyped = Date.now(); return; }
    if (overview.open && e.key !== 'o' && e.key !== 'O') return;
    const onButton = e.target.closest('button');
    switch (e.key) {
      // من اليمين لليسار: السهم الأيسر = للأمام
      case 'ArrowLeft': case 'PageDown': next(); break;
      case ' ': if (onButton) return; next(); break;
      case 'ArrowRight': case 'PageUp': prev(); break;
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

  // روابط مثل <a data-goto="#part-2"> تقفز إلى الشريحة التي تحمل هذا الـ id.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-goto]');
    if (!link) return;
    e.preventDefault();
    const target = document.querySelector(link.dataset.goto);
    if (target) go(slides.indexOf(target), true);
  });

  // السحب على الشاشات اللمسية (من اليمين لليسار: السحب لليمين = التالي).
  let touchX = null;
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 70 && !e.target.closest('pre, textarea, .r-console, .r-preview, .seq, .flow')) (dx > 0 ? next : prev)();
  });

  window.addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n && n - 1 !== index) go(n - 1, true);
  });

  const start = parseInt(location.hash.slice(1), 10);
  // ?all في الرابط يُظهر كل الخطوات مباشرة (مفيد للمراجعة قبل الكلاس).
  go(start ? start - 1 : 0, new URLSearchParams(location.search).has('all'));
  document.body.classList.add('ready');
})();
