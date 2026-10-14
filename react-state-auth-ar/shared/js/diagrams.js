/* مخططات التسلسل (sequence diagrams) — مين يكلّم مين وبأي ترتيب.

   <div class="seq" data-lanes="3">
     <div class="seq-head"><div>🧑 المستخدم</div><div>⚛️ React</div><div>🖥️ السيرفر</div></div>
     <div class="msg step" data-from="2" data-to="3"><b>POST /auth/login</b><small>email + password</small></div>
     <div class="msg reply step" data-from="3" data-to="2"><b>200</b><small>accessToken</small></div>
     <div class="note step" data-at="2">نحفظ التوكن في الذاكرة</div>
   </div>

   - المسارات (lanes) مرقّمة من 1، والمسار 1 هو الأول من جهة اليمين (الصفحة RTL).
   - .msg سهم من مسار إلى مسار. .reply = سهم متقطع (رد). .bad / .ok للون.
   - .note ملاحظة على مسار واحد (data-at) أو على عدة مسارات (data-at="1-3").
   هذا الملف يحسب أعمدة الـ grid فقط، والباقي في CSS. */
(function () {
  document.querySelectorAll('.seq').forEach((seq) => {
    const lanes = Number(seq.dataset.lanes || seq.querySelector('.seq-head').children.length);
    seq.style.setProperty('--lanes', lanes);

    // خطوط المسارات العمودية
    for (let i = 1; i <= lanes; i++) {
      const line = document.createElement('div');
      line.className = 'lane-line';
      line.style.setProperty('--i', i);
      seq.prepend(line);
    }

    seq.querySelectorAll(':scope > .msg').forEach((m) => {
      const from = Number(m.dataset.from);
      const to = Number(m.dataset.to);
      const a = Math.min(from, to);
      const b = Math.max(from, to);
      m.style.gridColumn = `${a} / ${b + 1}`;
      m.style.setProperty('--span', b - a + 1);
      m.classList.add(to > from ? 'to-end' : 'to-start');
      // نغلّف النص حتى يجلس فوق السهم
      if (!m.querySelector(':scope > .msg-label')) {
        const label = document.createElement('div');
        label.className = 'msg-label';
        while (m.firstChild) label.append(m.firstChild);
        m.append(label);
      }
    });

    seq.querySelectorAll(':scope > .note').forEach((n) => {
      const [a, b = a] = String(n.dataset.at).split('-').map(Number);
      n.style.gridColumn = `${a} / ${b + 1}`;
    });
  });
})();
