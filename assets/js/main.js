/* ── Reveal al hacer scroll ───────────────────────────── */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (el) { observer.observe(el); });
})();

/* ── Contadores animados (stats) ──────────────────────── */
(function () {
  var counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    var target = parseFloat(el.dataset.countTo);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var prefix = el.dataset.prefix || '';

    if (reduceMotion) {
      el.textContent = prefix + target.toFixed(decimals);
      return;
    }

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { counterObserver.observe(el); });
})();

/* ── Resplandor + tilt 3D que sigue al cursor en tarjetas ── */
(function () {
  var cards = document.querySelectorAll('.card-hover');
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAX_TILT = 14;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');

      var nx = (x / 100) * 2 - 1;
      var ny = (y / 100) * 2 - 1;
      card.style.setProperty('--rx', (-ny * MAX_TILT) + 'deg');
      card.style.setProperty('--ry', (nx * MAX_TILT) + 'deg');
    });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* ── Nav activo según sección visible ──────────────────── */
(function () {
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-underline[href^="#"]');
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

  var linkById = {};
  navLinks.forEach(function (link) {
    linkById[link.getAttribute('href').slice(1)] = link;
  });

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = linkById[entry.target.id];
      if (!link || !entry.isIntersecting) return;
      navLinks.forEach(function (l) { l.classList.remove('nav-active'); });
      link.classList.add('nav-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (section) { sectionObserver.observe(section); });
})();

/* ── Botón compartir ─────────────────────────────────── */
(function () {
  var btn = document.getElementById('share-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({
        title: 'Rooster Pizza & Grill',
        text: 'Pizza, Carne y Pasta con sabor auténtico en La Fortuna, Costa Rica.',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(function () {
        btn.title = '¡Link copiado!';
        setTimeout(function () { btn.title = ''; }, 2000);
      });
    }
  });
})();

/* ── Menú mobile hamburguesa ─────────────────────────── */
(function () {
  var btn   = document.getElementById('mobile-menu-btn');
  var menu  = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function toggleMenu(force) {
    var open = typeof force === 'boolean' ? force : !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  btn.addEventListener('click', function () { toggleMenu(); });

  menu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', function () { toggleMenu(false); });
  });

  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      toggleMenu(false);
    }
  });
})();

/* ── Hero Carousel ───────────────────────────────────── */
(function () {
  var slides = document.querySelectorAll('.hero-slide');
  var dots   = document.querySelectorAll('.carousel-dot');
  var current = 0;
  var timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo((current + 1) % slides.length); }

  function start() { timer = setInterval(next, 3500); }
  function stop()  { clearInterval(timer); }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { stop(); goTo(i); start(); });
  });

  if (slides.length) start();
})();

/* ── Scroll centrado a secciones por ancla ───────────── */
(function () {
  var NAV_HEIGHT = 96; // alto del nav fijo (h-24)

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();

      var targetTop = window.scrollY + target.getBoundingClientRect().top;
      var viewportH = window.innerHeight;
      var sectionH = target.offsetHeight;
      var available = viewportH - NAV_HEIGHT;
      var fits = sectionH <= available;

      // Si cabe bajo el nav, se centra en el espacio disponible.
      // Si no cabe, se avanza un poco más (la mitad del padding superior de la
      // sección, que es espacio vacío) para que se vea más contenido debajo.
      var padTop = parseFloat(getComputedStyle(target).paddingTop) || 0;
      var offset = fits ? (available - sectionH) / 2 : -(padTop / 2);
      var destY = Math.max(targetTop - NAV_HEIGHT - offset, 0);

      window.scrollTo({ top: destY, behavior: 'smooth' });
      history.pushState(null, '', '#' + id);
    });
  });
})();

/* ── Traducción ES / EN ──────────────────────────────── */
let currentLang = 'es';

function setLang(lang) {
  currentLang = lang;

  document.querySelectorAll('[data-en]').forEach(function(el) {
    if (!el.dataset.es) el.dataset.es = el.innerHTML;
    el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.es;
  });

  document.querySelectorAll('[data-placeholder-en]').forEach(function(el) {
    if (!el.dataset.placeholderEs) el.dataset.placeholderEs = el.placeholder;
    el.placeholder = lang === 'en' ? el.dataset.placeholderEn : el.dataset.placeholderEs;
  });

  var btnEs = document.getElementById('lang-es');
  var btnEn = document.getElementById('lang-en');
  btnEs.className = lang === 'es'
    ? 'text-sm font-bold text-ash-white transition-colors cursor-pointer'
    : 'text-sm text-on-surface-variant hover:text-ash-white transition-colors cursor-pointer';
  btnEn.className = lang === 'en'
    ? 'text-sm font-bold text-ash-white transition-colors cursor-pointer'
    : 'text-sm text-on-surface-variant hover:text-ash-white transition-colors cursor-pointer';
}
