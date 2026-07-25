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
  initScrollHint();
});

/* ========================================
   STARS BACKGROUND
   ======================================== */
function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stars = [];
  let width = 0;
  let height = 0;
  const STAR_COUNT = 200;

  function resize() {
    /* Sin escalar por densidad de pantalla las estrellas se veian
       borrosas en celulares (DPR 2.5-3). Se topea en 2 para no dibujar
       9x mas pixeles. */
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        alphaSpeed: Math.random() * 0.008 + 0.002,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      if (!reduceMotion) {
        s.alpha += s.alphaSpeed * s.alphaDir;
        if (s.alpha >= 1) { s.alpha = 1; s.alphaDir = -1; }
        if (s.alpha <= 0.1) { s.alpha = 0.1; s.alphaDir = 1; }
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 230, 255, ${s.alpha})`;
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();

  /* En mobile, mostrar u ocultar la barra de direcciones dispara resize
     todo el tiempo. Antes se regeneraban las 200 estrellas en cada uno,
     asi que el cielo "saltaba" al scrollear. Solo se regeneran si cambia
     el ancho. */
  let lastWidth = window.innerWidth;
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;
      resize();
      if (widthChanged) createStars();
      if (reduceMotion) draw();
    }, 150);
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

  /* Con movimiento reducido el CSS los oculta: no tiene sentido seguir
     creando y descartando elementos cada 3 segundos. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  /* Toda interaccion manual reinicia el temporizador: antes el autoplay
     podia disparar justo despues de un toque y la foto cambiaba dos veces
     seguidas. */
  let autoplay = null;

  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoplay() {
    if (autoplay) clearInterval(autoplay);
    autoplay = null;
  }

  function goToManual(index) {
    goTo(index);
    startAutoplay();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToManual(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToManual(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToManual(parseInt(dot.dataset.index, 10));
    });
  });

  /* Touch/swipe support */
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    /* El comentario original decia "pausa en hover/touch" pero el touch
       nunca pausaba: el autoplay competia con el gesto del dedo. */
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    startAutoplay();
  }, { passive: true });

  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  /* Solo se responde a las flechas si el carrusel esta a la vista: antes
     el listener era global y las flechas movian fotos invisibles desde
     cualquier parte de la pagina. */
  let inView = false;
  const carousel = track.closest('.carousel') || track;

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inView = entry.isIntersecting;
      if (inView) startAutoplay();
      else stopAutoplay();
    });
  }, { threshold: 0.35 }).observe(carousel);

  document.addEventListener('keydown', (e) => {
    if (!inView) return;
    if (e.key === 'ArrowLeft') goToManual(current - 1);
    if (e.key === 'ArrowRight') goToManual(current + 1);
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

    /* El corazon reventado sale del orden de tabulacion y del arbol de
       accesibilidad: quedaba enfocable con la escala en 0 */
    bubble.disabled = true;
    bubble.setAttribute('aria-hidden', 'true');

    /* Show message */
    showMessage(bubble.dataset.msg);

    /* Check if all hearts popped */
    if (found === total) {
      setTimeout(() => showFinalReveal(), 1500);
    }
  });

  /* En mobile el mensaje es un aviso fijo arriba de la nav (ver CSS): se
     muestra con clase y se esconde solo, para no dejar frases viejas. */
  let msgTimer;
  function showMessage(msg) {
    if (!messageEl || !msg) return;
    messageEl.innerHTML = '<div class="message-card">' + '\u201C' + msg + '\u201D' + '</div>';
    messageEl.classList.add('is-visible');
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => messageEl.classList.remove('is-visible'), 5500);
  }

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


/* ========================================
   SCROLL HINT
   Se esconde al bajar: en mobile la nav flotante queda justo encima
   y los dos elementos se pisaban.
   ======================================== */
function initScrollHint() {
  const hint = document.querySelector('.scroll-hint');
  if (!hint) return;

  // Se usa una clase, no style.opacity: las animaciones CSS ganan sobre
  // los estilos inline y el fade-in de entrada anularia el fade-out.
  const update = () => hint.classList.toggle('is-hidden', window.scrollY > 60);

  update();
  window.addEventListener('scroll', update, { passive: true });
}
