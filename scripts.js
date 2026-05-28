/* ═══════════════════════════════════════════════════════════
   THE CHILAM GROUP — Shared JS
   ═══════════════════════════════════════════════════════════ */

/* ─── Nav: scroll detection ─────────────────────────────── */
(function () {
  const pill = document.querySelector('.nav-pill');
  if (!pill) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      pill.style.boxShadow = '0 8px 40px rgba(13,61,93,0.14), 0 1px 4px rgba(13,61,93,0.08)';
    } else {
      pill.style.boxShadow = '';
    }
    lastY = y;
  }, { passive: true });
})();

/* ─── Reveal on scroll ───────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ─── Counter animation ──────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const isDecimal = String(target).includes('.');

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = target * ease;
      el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        io.unobserve(e.target);
        animateCounter(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => {
    el.textContent = '0';
    io.observe(el);
  });
})();

/* ─── Dropdown keyboard accessibility ────────────────────── */
(function () {
  document.querySelectorAll('.has-dropdown').forEach(item => {
    const link = item.querySelector('a');
    const dropdown = item.querySelector('.nav-dropdown');
    if (!link || !dropdown) return;
    link.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropdown.style.display = dropdown.style.display === 'block' ? '' : 'block';
      }
      if (e.key === 'Escape') dropdown.style.display = '';
    });
  });
})();

/* ─── Active nav link highlight ─────────────────────────── */
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ─── Hero sticky: blur + darken as next section slides over ── */
(function () {
  var hero = document.getElementById('hero');
  var heroBg = document.querySelector('.hero-bg');
  if (!hero || !heroBg) return;

  var next = hero.nextElementSibling;
  if (!next) return;

  function update() {
    var heroRect = hero.getBoundingClientRect();
    var nextTop  = next.getBoundingClientRect().top;

    /* How many px of the hero is covered from below by the next section */
    var covered  = Math.max(0, heroRect.bottom - nextTop);
    var coverage = Math.min(1, covered / heroRect.height);

    var blur      = coverage * 14;
    var brightness = 1 - coverage * 0.35;
    heroBg.style.filter = 'blur(' + blur + 'px) brightness(' + brightness + ')';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ─── About image parallax ───────────────────────────────── */
(function () {
  const img = document.querySelector('.about-parallax-img');
  if (!img) return;
  const wrap = img.closest('.about-img-wrap');

  function tick() {
    const rect = wrap.getBoundingClientRect();
    const viewH = window.innerHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    if (progress >= 0 && progress <= 1) {
      const shift = (progress - 0.5) * 44;
      img.style.transform = 'translateY(' + shift + 'px)';
    }
  }

  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ─── Gallery4 Carousel (NUCLEO Projects) ────────────────── */
(function () {
  const track = document.getElementById('nucleoCarousel');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.gallery4-item'));
  const prevBtn = document.querySelector('.gallery4-prev');
  const nextBtn = document.querySelector('.gallery4-next');
  const dots = Array.from(document.querySelectorAll('#nucleoDots .gallery4-dot'));
  let current = 0;

  function getTrackPadLeft() {
    return parseFloat(getComputedStyle(track).paddingLeft) || 0;
  }

  function scrollToItem(index) {
    current = Math.max(0, Math.min(index, items.length - 1));
    const padL = getTrackPadLeft();
    const targetLeft = items[current].offsetLeft - padL;
    track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    sync();
  }

  function sync() {
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === items.length - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { scrollToItem(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { scrollToItem(current + 1); });
  dots.forEach(function (dot, i) { dot.addEventListener('click', function () { scrollToItem(i); }); });

  /* Update index from scroll position */
  var scrollTimer;
  track.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var padL = getTrackPadLeft();
      var scrollCenter = track.scrollLeft + padL;
      var closest = 0, closestDist = Infinity;
      items.forEach(function (item, i) {
        var dist = Math.abs(item.offsetLeft - scrollCenter);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      if (closest !== current) { current = closest; sync(); }
    }, 80);
  }, { passive: true });

  /* Desktop drag */
  var isDragging = false, dragStartX = 0, dragScrollLeft = 0;
  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragStartX = e.clientX;
    dragScrollLeft = track.scrollLeft;
    track.classList.add('is-dragging');
    e.preventDefault();
  });
  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    track.scrollLeft = dragScrollLeft - (e.clientX - dragStartX) * 1.3;
  });
  window.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');
    var padL = getTrackPadLeft();
    var scrollPos = track.scrollLeft + padL;
    var closest = 0, closestDist = Infinity;
    items.forEach(function (item, i) {
      var dist = Math.abs(item.offsetLeft - scrollPos);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    scrollToItem(closest);
  });

  sync();
})();
