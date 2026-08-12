  window.__dtpcReady = true;
  const scrollBar = document.getElementById('scrollBar');
  const fab = document.getElementById('fabDevis');
  function updateScrollUI() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    scrollBar.style.width = pct + '%';
    if (scrolled > 600 && pct < 92) fab.classList.add('show');
    else fab.classList.remove('show');
  }
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  // Tout ce qui est deja a l'ecran quand le script demarre est revele immediatement,
  // sans attendre le callback asynchrone de l'IntersectionObserver ni la transition.
  const vh = window.innerHeight || document.documentElement.clientHeight;
  document.querySelectorAll('.fade-up, .stagger').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) el.classList.add('visible', 'visible-now');
    else observer.observe(el);
  });

  // Halo qui suit le curseur. On teste le type de pointeur A L'EVENEMENT plutot
  // que de se fier a matchMedia : certains navigateurs integres declarent
  // (hover:hover) a tort sur mobile. Au doigt, pointerType vaut 'touch' et on
  // sort immediatement : aucun style n'est modifie, donc iOS n'a aucune raison
  // de retenir le click du 1er appui.
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    }, { passive: true });
  });

  (function() {
    const wrap = document.getElementById('reviewsMarquee');
    const track = document.getElementById('reviewsTrack');
    if (!wrap || !track) return;
    let x = 0;
    let half = track.scrollWidth / 3;
    let speed = 0.45;
    let hovering = false;
    let dragging = false;
    let startX = 0;
    let startTrackX = 0;
    let dragMoved = false;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let velocity = 0;
    let lastX = 0;
    let lastT = 0;

    function apply() {
      if (half > 0 && isFinite(x)) {
        x = x % half;
        if (x > 0) x -= half;
      } else {
        x = 0;
      }
      track.style.transform = 'translateX(' + x + 'px)';
    }
    function loop() {
      if (dragging) {
        // handled in move()
      } else if (Math.abs(velocity) > 0.02) {
        x += velocity;
        velocity *= 0.95;
      } else if (!hovering && !rm) {
        x -= speed;
      }
      apply();
      requestAnimationFrame(loop);
    }
    window.addEventListener('resize', () => { half = track.scrollWidth / 3; });
    window.addEventListener('load', () => { half = track.scrollWidth / 3; });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => { half = track.scrollWidth / 3; }); }
    requestAnimationFrame(loop);

    wrap.addEventListener('mouseenter', () => { hovering = true; });
    wrap.addEventListener('mouseleave', () => { hovering = false; });

    function down(clientX) {
      dragging = true; dragMoved = false;
      startX = clientX; startTrackX = x;
      lastX = clientX; lastT = performance.now();
      velocity = 0;
      wrap.classList.add('dragging');
    }
    function move(clientX) {
      if (!dragging) return;
      const dx = clientX - startX;
      if (Math.abs(dx) > 3) dragMoved = true;
      x = startTrackX + dx;
      const now = performance.now();
      const dt = Math.max(now - lastT, 8);
      velocity = Math.max(-40, Math.min(40, (clientX - lastX) / dt * 16));
      lastX = clientX; lastT = now;
    }
    function up() {
      dragging = false;
      wrap.classList.remove('dragging');
    }
    wrap.addEventListener('pointerdown', (e) => {
      down(e.clientX);
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    wrap.addEventListener('pointermove', (e) => { if (dragging) move(e.clientX); });
    wrap.addEventListener('pointerup', up);
    wrap.addEventListener('pointercancel', up);
    wrap.addEventListener('click', (e) => { if (dragMoved) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  const term = document.getElementById('heroTerm');
  const termScript = [
    { text: '$ ssh client@192.168.1.42', cls: 't-prompt', typed: true, delay: 500 },
    { text: '→ connexion sécurisée établie', cls: 't-muted', delay: 200 },
    { text: '$ ./diagnostic --full', cls: 't-prompt', typed: true, delay: 600 },
    { text: '  [1/5] scan systeme........ OK', cls: 't-ok', delay: 350 },
    { text: '  [2/5] antivirus........... OK', cls: 't-ok', delay: 350 },
    { text: '  [3/5] reseau.............. OK', cls: 't-ok', delay: 350 },
    { text: '  [4/5] disque dur.......... 89% plein', cls: 't-warn', delay: 400 },
    { text: '  [5/5] démarrage........... 42s → lent', cls: 't-warn', delay: 400 },
    { text: '$ fix --auto', cls: 't-prompt', typed: true, delay: 700 },
    { text: '  › nettoyage........... 12 Go libérés', cls: 't-ok', delay: 400 },
    { text: '  › optimisation........ démarrage 9s', cls: 't-ok', delay: 400 },
    { text: '  › sécurité............ 3 mises à jour', cls: 't-ok', delay: 400 },
    { text: '>> PC optimise -- merci DomiTechPC', cls: 't-user', delay: 500 },
    { text: '$ ', cls: 't-prompt', cursor: true, delay: 600 },
  ];
  function typeLine(line, parent, done) {
    const el = document.createElement('div');
    el.className = 'term-line ' + (line.cls || '');
    parent.appendChild(el);
    if (line.typed) {
      const txt = line.text;
      let i = 0;
      (function step() {
        if (i <= txt.length) { el.textContent = txt.slice(0, i); i++; parent.scrollTop = parent.scrollHeight; setTimeout(step, 18 + Math.random() * 20); }
        else done();
      })();
    } else { el.textContent = line.text; done(); }
    if (line.cursor) { const c = document.createElement('span'); c.className = 'cur'; el.appendChild(c); }
    parent.scrollTop = parent.scrollHeight;
  }
  function runTerm() {
    term.innerHTML = '';
    let i = 0;
    function next() {
      if (i >= termScript.length) { setTimeout(runTerm, 4500); return; }
      const line = termScript[i++];
      setTimeout(() => typeLine(line, term, next), line.delay || 200);
    }
    next();
  }
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (term) {
    if (rm) {
      termScript.forEach(l => { const d = document.createElement('div'); d.className = 'term-line ' + (l.cls || ''); d.textContent = l.text; term.appendChild(d); });
    } else {
      const tObs = new IntersectionObserver((ents) => { ents.forEach(e => { if (e.isIntersecting) { runTerm(); tObs.disconnect(); } }); }, { threshold: 0.1 });
      tObs.observe(term);
    }
  }

  function getStoredTheme(){ try{ return localStorage.getItem('dtpc-theme'); }catch(e){ return null; } }
  function setStoredTheme(t){ try{ localStorage.setItem('dtpc-theme', t); }catch(e){} }
  function applyTheme(t){
    if (t === 'light') document.documentElement.setAttribute('data-theme','light');
    else document.documentElement.removeAttribute('data-theme');
    var btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-label', t === 'light' ? 'Activer le thème sombre' : 'Activer le thème clair');
  }
  function toggleTheme(){
    var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'light' ? 'dark' : 'light';
    setStoredTheme(next);
    applyTheme(next);
  }
  applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  // L'etat "presse" est desormais gere en CSS (.contact-item:active).
  // L'ancienne version appliquait transform:scale(.95) des le touchstart :
  // l'element retrecissait sous le doigt et le point de contact pouvait sortir
  // de sa nouvelle zone cliquable au touchend, ce qui annulait le click.
  var themeMQ = window.matchMedia('(prefers-color-scheme: light)');
  var themeMQListener = function(e){ if (!getStoredTheme()) applyTheme(e.matches ? 'light' : 'dark'); };
  if (themeMQ.addEventListener) themeMQ.addEventListener('change', themeMQListener);
  else if (themeMQ.addListener) themeMQ.addListener(themeMQListener);

  function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    var btn = document.getElementById('hamburger');
    if (menu.classList.contains('open')) closeMobileMenu();
    else {
      document.body.style.overflow = 'hidden';
      menu.style.display = 'flex';
      var backdrop = document.getElementById('mobileMenuBackdrop');
      if (backdrop) backdrop.style.display = 'block';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        menu.classList.add('open'); btn.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
      }));
    }
  }
  function closeMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    var btn = document.getElementById('hamburger');
    var backdrop = document.getElementById('mobileMenuBackdrop');
    menu.classList.remove('open'); btn.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { menu.style.display = 'none'; if (backdrop) backdrop.style.display = 'none'; }, 400);
  }
  function copyEmail() {
    var email = 'dtpc.assistance@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(showCopyToast);
    else {
      var ta = document.createElement('textarea'); ta.value = email; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); showCopyToast(); } catch(e) {}
      document.body.removeChild(ta);
    }
  }
  function showCopyToast() {
    var toast = document.getElementById('copyToast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2400);
  }
  async function envoyerFormulaire() {
    var btn = document.getElementById('submit-btn');
    var msg = document.getElementById('form-message');
    var prenom = document.getElementById('prenom').value.trim();
    var email = document.getElementById('email').value.trim();
    msg.style.display = 'none'; msg.className = '';
    if (!prenom || !email) {
      msg.style.display = 'block'; msg.classList.add('error');
      msg.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:-1px;margin-right:2px"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Merci de renseigner au minimum votre prénom et votre e-mail.';
      return;
    }
    btn.classList.add('sending'); btn.disabled = true;
    var data = { prenom, telephone: document.getElementById('telephone').value, email, prestation: document.getElementById('prestation').value, commune: document.getElementById('commune').value, message: document.getElementById('message').value };
    try {
      var res = await fetch('https://formspree.io/f/mnjojknk', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) });
      btn.classList.remove('sending');
      if (res.ok) {
        msg.style.display = 'block'; msg.classList.add('success');
        msg.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:-1px;margin-right:2px"><polyline points="20 6 9 17 4 12"/></svg> Votre demande a bien été envoyée ! Je reviens vers vous sous 2h.';
        btn.querySelector('.btn-text').innerHTML = '<span>Message envoyé</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:-1px;margin-right:2px"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.disabled = true;
        setTimeout(() => {
          ['prenom','telephone','email','prestation','commune','message'].forEach(id => document.getElementById(id).value = '');
          msg.style.display = 'none'; msg.className = '';
          btn.querySelector('.btn-text').innerHTML = '<span>Envoyer ma demande</span><span class="arrow">→</span>';
          btn.disabled = false;
        }, 4000);
      } else throw new Error('erreur');
    } catch(err) {
      btn.classList.remove('sending');
      msg.style.display = 'block'; msg.classList.add('error');
      msg.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:-1px;margin-right:2px"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Une erreur est survenue. Veuillez réessayer ou nous contacter directement.';
      btn.disabled = false;
    }
  }
  function openModal(id) { var m = document.getElementById(id); if (m) { m.classList.add('open'); document.body.style.overflow='hidden'; } }
  function closeModal(id) { var m = document.getElementById(id); if (m) { m.classList.remove('open'); document.body.style.overflow=''; } }
  function closeModalOutside(e, id) { if (e.target === document.getElementById(id)) closeModal(id); }
  function scrollModalTo(anchorId) {
    var el = document.getElementById(anchorId);
    if (el) { var box = el.closest('.modal-box'); if (box && box.parentElement) box.parentElement.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' }); }
    return false;
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); document.body.style.overflow=''; }
  });

function toggleMobileServices() {
  var sub = document.getElementById('mmSubServices');
  var trig = document.getElementById('mmServicesTrigger');
  if (!sub || !trig) return;
  var isOpen = sub.classList.toggle('open');
  trig.classList.toggle('open', isOpen);
}

function initDevTyper() {
  var editor = document.getElementById('devCodeEditor');
  if (!editor) return;

  var codeLines = [
    [{c:'punc',t:'<'},{c:'tag',t:'section'},{c:'txt',t:' '},{c:'attr',t:'class'},{c:'punc',t:'='},{c:'str',t:'"hero"'},{c:'punc',t:'>'}],
    [{c:'punc',t:'  <'},{c:'tag',t:'h1'},{c:'punc',t:'>'},{c:'txt',t:'Bienvenue chez vous'},{c:'punc',t:'</'},{c:'tag',t:'h1'},{c:'punc',t:'>'}],
    [{c:'punc',t:'  <'},{c:'tag',t:'p'},{c:'txt',t:' '},{c:'attr',t:'class'},{c:'punc',t:'='},{c:'str',t:'"hero-desc"'},{c:'punc',t:'>'},{c:'txt',t:'Votre site sur mesure'},{c:'punc',t:'</'},{c:'tag',t:'p'},{c:'punc',t:'>'}],
    [{c:'punc',t:'  <'},{c:'tag',t:'a'},{c:'txt',t:' '},{c:'attr',t:'class'},{c:'punc',t:'='},{c:'str',t:'"btn-primary"'},{c:'txt',t:' '},{c:'attr',t:'href'},{c:'punc',t:'='},{c:'str',t:'"#contact"'},{c:'punc',t:'>'}],
    [{c:'txt',t:'    Demander un devis'}],
    [{c:'punc',t:'  </'},{c:'tag',t:'a'},{c:'punc',t:'>'}],
    [{c:'punc',t:'</'},{c:'tag',t:'section'},{c:'punc',t:'>'}]
  ];

  function removeCursor() {
    var old = editor.querySelector('.vscode-cursor-blink');
    if (old) old.remove();
  }

  function newLineEl(num) {
    var row = document.createElement('div');
    row.className = 'vscode-line';
    var numEl = document.createElement('span');
    numEl.className = 'vscode-line-num';
    numEl.textContent = num;
    var codeEl = document.createElement('span');
    codeEl.className = 'vscode-line-code';
    row.appendChild(numEl);
    row.appendChild(codeEl);
    editor.appendChild(row);
    return codeEl;
  }

  function run() {
    editor.innerHTML = '';
    var lineIdx = 0, tokenIdx = 0, charIdx = 0;
    var currentCodeEl = newLineEl(1);
    var currentSpan = null;

    function tick() {
      if (lineIdx >= codeLines.length) {
        removeCursor();
        setTimeout(run, 2800);
        return;
      }
      var line = codeLines[lineIdx];
      if (tokenIdx >= line.length) {
        removeCursor();
        lineIdx++;
        tokenIdx = 0;
        charIdx = 0;
        if (lineIdx < codeLines.length) currentCodeEl = newLineEl(lineIdx + 1);
        setTimeout(tick, 220);
        return;
      }
      var token = line[tokenIdx];
      if (charIdx === 0) {
        currentSpan = document.createElement('span');
        currentSpan.className = 'vc-' + token.c;
        currentCodeEl.appendChild(currentSpan);
      }
      currentSpan.textContent += token.t[charIdx];
      removeCursor();
      var cursor = document.createElement('span');
      cursor.className = 'vscode-cursor-blink';
      currentCodeEl.appendChild(cursor);

      charIdx++;
      if (charIdx >= token.t.length) { tokenIdx++; charIdx = 0; }
      setTimeout(tick, 28 + Math.random() * 45);
    }
    tick();
  }

  var started = false;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && !started) { started = true; run(); }
    });
  }, { threshold: 0.3 });
  obs.observe(editor);
}
initDevTyper();

function setDevicePreview(btn, mode) {
  var wrap = btn.closest('.vis-toggle-wrap');
  if (!wrap) return;
  wrap.classList.remove('force-pc', 'force-mobile');
  wrap.classList.add(mode === 'mobile' ? 'force-mobile' : 'force-pc');
  wrap.querySelectorAll('.vis-device-btn').forEach(function(b) {
    b.classList.toggle('active', b === btn);
  });
}

/* Prefetch des pages de service APRES le chargement complet, pour ne pas
   concurrencer le CSS/JS critique sur mobile. Respecte le mode economie de donnees. */
(function() {
  var pages = [
    '/index.html',
    '/depannage-informatique-blois.html',
    '/recuperation-donnees-blois.html',
    '/nettoyage-securite-pc-blois.html',
    '/developpement-web-blois.html',
    '/creation-site-internet-blois.html',
    '/applications-metier-blois.html'
  ];
  function go() {
    var c = navigator.connection;
    if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
    var here = location.pathname.replace(/\/$/, '/index.html');
    pages.forEach(function(p) {
      if (p === here) return;
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.href = p; l.as = 'document';
      document.head.appendChild(l);
    });
  }
  if (document.readyState === 'complete') setTimeout(go, 1200);
  else window.addEventListener('load', function() { setTimeout(go, 1200); });
})();

/* Pre-selection de la prestation depuis l'URL.
   Les boutons devis des pages service pointent vers
   /index.html?prestation=<slug>#devis-form : on retrouve ici le libelle
   correspondant et on le selectionne dans le formulaire.
   Le <option> n'a volontairement pas d'attribut value : envoyerFormulaire()
   envoie prestation.value a Formspree, et on veut garder le libelle lisible
   dans les e-mails plutot que le slug. */
(function() {
  var sel = document.getElementById('prestation');
  if (!sel || !window.URLSearchParams) return;
  var labels = {
    'depannage': 'Dépannage informatique',
    'recuperation': 'Récupération de données',
    'nettoyage': 'Nettoyage & Sécurité',
    'developpement-web': 'Développement web',
    'site-web': 'Site web personnalisé',
    'applications-metier': 'Applications & outils métier'
  };
  var wanted = labels[new URLSearchParams(location.search).get('prestation')];
  if (!wanted) return;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].text === wanted) { sel.selectedIndex = i; return; }
  }
})();

/* Un <a> sans href porte role="button" et tabindex="0" : il est focalisable,
   mais un element non-<button> ne declenche pas click sur Entree/Espace.
   On complete le clavier, et on tient aria-expanded a jour pour les lecteurs
   d'ecran. Aucun effet sur la souris ni le tactile. */
(function() {
  var t = document.getElementById('mmServicesTrigger');
  if (!t) return;
  t.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    e.preventDefault();
    t.click();
  });
  t.addEventListener('click', function() {
    var open = t.classList.contains('open') ||
               (t.parentElement && t.parentElement.classList.contains('open'));
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
