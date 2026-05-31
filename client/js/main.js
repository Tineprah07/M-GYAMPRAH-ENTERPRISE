/* Navbar, mobile menu, scroll reveal, toast - shared across pages */
(function () {
  const hamburger = document.querySelector('[data-hamburger]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // Highlight active nav link based on path
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-links] a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Reveal-on-scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // Toast utility
  MGE.toast = function toast(message, type = 'info') {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    el.style.background = type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#0f172a';
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3200);
  };

  // Year in footer
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  // Hero slideshow
  document.querySelectorAll('[data-slideshow]').forEach(initSlideshow);

  function initSlideshow(root) {
    const slides = root.querySelectorAll('.slide');
    if (slides.length < 2) return;

    const dotsHost = root.querySelector('[data-slideshow-dots]');
    const prevBtn  = root.querySelector('[data-slideshow-prev]');
    const nextBtn  = root.querySelector('[data-slideshow-next]');
    const INTERVAL = 5500;

    let current = Math.max(0, [...slides].findIndex((s) => s.classList.contains('is-active')));
    if (current === -1) current = 0;
    let timer;

    // Build dot buttons
    if (dotsHost) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('role', 'tab');
        if (i === current) dot.classList.add('active');
        dot.addEventListener('click', () => { go(i); restart(); });
        dotsHost.appendChild(dot);
      });
    }

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      if (dotsHost) {
        dotsHost.querySelectorAll('button').forEach((d, i) => d.classList.toggle('active', i === current));
      }
    }
    const next = () => go(current + 1);
    const prev = () => go(current - 1);

    prevBtn?.addEventListener('click', () => { prev(); restart(); });
    nextBtn?.addEventListener('click', () => { next(); restart(); });

    // Keyboard support when hero is focused
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { prev(); restart(); }
      if (e.key === 'ArrowRight') { next(); restart(); }
    });

    // Pause on hover / focus, resume on leave
    const pause = () => clearInterval(timer);
    const restart = () => { pause(); timer = setInterval(next, INTERVAL); };
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin',   pause);
    root.addEventListener('focusout',  restart);

    // Respect reduced motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduce.matches) restart();
    reduce.addEventListener?.('change', (e) => (e.matches ? pause() : restart()));
  }
})();
