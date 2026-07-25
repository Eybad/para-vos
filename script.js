/* ============================================
   PARA VOS — Scripts
   Counter, stars, carousel, heart game
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initFloatingHearts();
  initCounter();
  initCarousel();
  initHeartGame();
  initScrollReveal();
  initNavHighlight();
});

/* ========================================
   STARS BACKGROUND
   ======================================== */
function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  const STAR_COUNT = 200;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        alphaSpeed: Math.random() * 0.008 + 0.002,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.alpha += s.alphaSpeed * s.alphaDir;
      if (s.alpha >= 1) { s.alpha = 1; s.alphaDir = -1; }
      if (s.alpha <= 0.1) { s.alpha = 0.1; s.alphaDir = 1; }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 230, 255, ${s.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createStars();
  });
}

/* ========================================
   ICON HELPER — crea un <svg><use href="#id"></svg>
   ======================================== */
const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

function createIcon(id, className) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon ' + (className || ''));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', '#' + id);
  use.setAttributeNS(XLINK_NS, 'xlink:href', '#' + id);

  svg.appendChild(use);
  return svg;
}

/* ========================================
   FLOATING HEARTS
   ======================================== */
function initFloatingHearts() {
  const container = document.getElementById('floating-hearts');
  if (!container) return;

  const icons = ['i-heart-solid', 'i-heart', 'i-hearts', 'i-sparkle'];
  const colors = ['#ff6b9d', '#c44dff', '#a855f7', '#f9a8d4', '#e8448a'];

  function spawnHeart() {
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const el = createIcon(icon, 'float-heart');
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = (Math.random() * 8 + 10) + 's';
    el.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
    container.appendChild(el);

    el.addEventListener('animationend', () => el.remove());
  }

  /* Spawn a heart every 3-6 seconds */
  setInterval(() => spawnHeart(), 3000 + Math.random() * 3000);

  /* Initial batch */
  for (let i = 0; i < 5; i++) {
    setTimeout(() => spawnHeart(), i * 600);
  }
}

/* ========================================
   LIVE COUNTER
   ======================================== */
function initCounter() {
  /* 14 de octubre de 2024 — month is 0-indexed */
  const startDate = new Date(2024, 9, 14, 0, 0, 0);

  const elDays = document.getElementById('counter-days');
  const elHours = document.getElementById('counter-hours');
  const elMinutes = document.getElementById('counter-minutes');
  const elSeconds = document.getElementById('counter-seconds');

  if (!elDays) return;

  function update() {
    const now = new Date();
    const diff = now - startDate;
    if (diff < 0) return;

    const totalSeconds = Math.floor(diff / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    elDays.textContent = days.toLocaleString('es-AR');
    elHours.textContent = String(hours).padStart(2, '0');
    elMinutes.textContent = String(minutes).padStart(2, '0');
    elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ========================================
   CAROUSEL
   ======================================== */
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
  let current = 0;
  const total = slides.length;

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
    });
  });

  /* Touch/swipe support */
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  /* Auto-advance every 5s */
  let autoplay = setInterval(() => goTo(current + 1), 5000);

  /* Pause on hover/touch */
  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  });

  /* Keyboard */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
}

/* ========================================
   INTERACTIVE HEART GAME
   ======================================== */
function initHeartGame() {
  const grid = document.getElementById('hearts-grid');
  const counterEl = document.getElementById('hearts-found');
  const messageEl = document.getElementById('message-reveal');
  const finalEl = document.getElementById('final-reveal');
  if (!grid) return;

  let found = 0;
  const total = grid.querySelectorAll('.heart-bubble').length;

  grid.addEventListener('click', (e) => {
    const bubble = e.target.closest('.heart-bubble');
    if (!bubble || bubble.classList.contains('popped')) return;

    /* Spawn particles from heart position */
    const rect = bubble.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    spawnParticles(cx, cy);

    /* Pop the heart */
    bubble.classList.add('popped');
    found++;
    if (counterEl) counterEl.textContent = found;

    /* Show message */
    const msg = bubble.dataset.msg;
    if (messageEl && msg) {
      messageEl.innerHTML = `<div class="message-card">"${msg}"</div>`;
    }

    /* Check if all hearts popped */
    if (found === total) {
      setTimeout(() => showFinalReveal(), 1500);
    }
  });

  function spawnParticles(cx, cy) {
    const icons = ['i-heart-solid', 'i-sparkle', 'i-hearts'];
    const colors = ['#ff6b9d', '#f9a8d4', '#c44dff', '#f5c542', '#67e8f9', '#e8448a'];

    for (let i = 0; i < 12; i++) {
      const p = createIcon(icons[Math.floor(Math.random() * icons.length)], 'heart-particle');
      p.style.color = colors[Math.floor(Math.random() * colors.length)];

      const angle = (Math.PI * 2 * i) / 12;
      const dist = 60 + Math.random() * 60;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--tx', tx + 'px');
      p.style.setProperty('--ty', ty + 'px');
      p.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';

      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  function showFinalReveal() {
    if (!finalEl) return;
    finalEl.classList.add('active');
    spawnConfetti();

    /* Dismiss on click */
    finalEl.addEventListener('click', () => {
      finalEl.classList.remove('active');
    });
  }

  function spawnConfetti() {
    const colors = [
      '#ff6b9d', '#c44dff', '#f5c542', '#67e8f9',
      '#e91e84', '#a855f7', '#ff9a9e', '#fad0c4'
    ];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.top = -10 + 'px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (4 + Math.random() * 8) + 'px';
      piece.style.height = (4 + Math.random() * 8) + 'px';
      piece.style.animationDuration = (2 + Math.random() * 3) + 's';
      piece.style.animationDelay = Math.random() * 2 + 's';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }
}

/* ========================================
   SCROLL REVEAL (Intersection Observer)
   ======================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach((el) => observer.observe(el));
}

/* ========================================
   NAV HIGHLIGHT
   ======================================== */
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    threshold: 0.3,
  });

  sections.forEach((s) => observer.observe(s));
}
