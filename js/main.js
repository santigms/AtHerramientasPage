/* ==========================================================================
   FERRETERÍA EL TORNILLO — main.js
   Vanilla JS · IntersectionObserver · Sin librerías
   ========================================================================== */

// ─── CONFIGURACIÓN EDITABLE ─────────────────────────────────────────────────
// Modificá estos datos para adaptar la landing a otro negocio.

const CONFIG = {
  whatsapp: '5491100000000', // Número de WhatsApp sin + ni espacios
  whatsappMsg: 'Hola! Vi su página web y quiero hacer una consulta.',
  businessName: 'Ferretería El Tornillo',

  // Horarios: cada día tiene un array de rangos { open, close } en formato 24h.
  // Domingo = 0, Lunes = 1 ... Sábado = 6.
  schedule: {
    0: [],                                         // Domingo: cerrado
    1: [{ open: '08:00', close: '13:00' }, { open: '15:00', close: '19:30' }], // Lunes
    2: [{ open: '08:00', close: '13:00' }, { open: '15:00', close: '19:30' }], // Martes
    3: [{ open: '08:00', close: '13:00' }, { open: '15:00', close: '19:30' }], // Miércoles
    4: [{ open: '08:00', close: '13:00' }, { open: '15:00', close: '19:30' }], // Jueves
    5: [{ open: '08:00', close: '13:00' }, { open: '15:00', close: '19:30' }], // Viernes
    6: [{ open: '08:00', close: '13:00' }],        // Sábado
  },

  // Valores finales para los contadores animados
  counters: {
    years: 15,
    products: 5000,
    clients: 3000,
    brands: 120,
  },
};

// ─── UTILIDADES ──────────────────────────────────────────────────────────────

/**
 * Comprueba si el usuario prefiere movimiento reducido.
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Parsea un string "HH:MM" y devuelve minutos desde medianoche.
 */
function timeToMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

// ─── 1. MENÚ HAMBURGUESA ────────────────────────────────────────────────────

function initMobileMenu() {
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const overlay = document.querySelector('.header__overlay');
  const links = document.querySelectorAll('.header__nav-link');

  if (!burger || !nav) return;

  function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', isOpen);
    burger.classList.toggle('is-active', isOpen);
    overlay?.classList.toggle('is-visible', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', () => toggleMenu());
  overlay?.addEventListener('click', () => toggleMenu(false));

  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });
}

// ─── 2. HEADER CON SOMBRA AL SCROLLEAR ──────────────────────────────────────

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('scrolled', !entry.isIntersecting);
    },
    { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
  );

  // Observamos un elemento "sentinela" al inicio del body
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  sentinel.setAttribute('aria-hidden', 'true');
  document.body.prepend(sentinel);
  observer.observe(sentinel);
}

// ─── 3. ANIMACIONES DE SCROLL (reveal) ──────────────────────────────────────

function initScrollReveal() {
  if (prefersReducedMotion()) {
    // Mostrar todo sin animación
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── 4. CONTADORES ANIMADOS ─────────────────────────────────────────────────

function animateCounter(el, target, duration = 2000) {
  if (prefersReducedMotion()) {
    el.textContent = target.toLocaleString('es-AR');
    return;
  }

  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    const value = Math.floor(eased * (target - start) + start);
    el.textContent = value.toLocaleString('es-AR');

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('es-AR');
    }
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const key = el.dataset.counter;
          const target = CONFIG.counters[key] || 0;
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

// ─── 5. CARTEL ABIERTO / CERRADO ────────────────────────────────────────────

function initOpenClosedStatus() {
  const statusEl = document.querySelector('.schedule__status');
  if (!statusEl) return;

  function updateStatus() {
    const now = new Date();
    const day = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const ranges = CONFIG.schedule[day] || [];

    const isOpen = ranges.some(r => {
      const open = timeToMinutes(r.open);
      const close = timeToMinutes(r.close);
      return currentMinutes >= open && currentMinutes < close;
    });

    statusEl.className = 'schedule__status ' + (isOpen ? 'schedule__status--open' : 'schedule__status--closed');
    statusEl.innerHTML = `
      <span class="schedule__dot"></span>
      ${isOpen ? 'Abierto ahora' : 'Cerrado'}
    `;
  }

  updateStatus();
  // Actualizar cada minuto
  setInterval(updateStatus, 60000);

  // Marcar el día actual en la tabla de horarios
  const rows = document.querySelectorAll('.schedule__table tr[data-day]');
  const today = new Date().getDay();
  rows.forEach(row => {
    if (parseInt(row.dataset.day, 10) === today) {
      row.classList.add('is-today');
    }
  });
}

// ─── 6. LIGHTBOX DE GALERÍA ─────────────────────────────────────────────────

function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox__img');
  const closeBtn = document.querySelector('.lightbox__close');
  const prevBtn = document.querySelector('.lightbox__nav--prev');
  const nextBtn = document.querySelector('.lightbox__nav--next');
  const galleryItems = document.querySelectorAll('.gallery__item');

  if (!lightbox || !galleryItems.length) return;

  let currentIndex = 0;

  // Recopilar las URLs de las imágenes
  const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return img ? img.src : '';
  }).filter(Boolean);

  function openLightbox(index) {
    currentIndex = index;
    if (images[currentIndex]) {
      lightboxImg.src = images[currentIndex];
    }
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    if (images[currentIndex]) {
      lightboxImg.src = images[currentIndex];
    }
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', () => navigate(-1));
  nextBtn?.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

// ─── 7. WHATSAPP LINKS ─────────────────────────────────────────────────────

function initWhatsAppLinks() {
  const waLinks = document.querySelectorAll('[data-whatsapp]');
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappMsg)}`;

  waLinks.forEach(link => {
    link.href = url;
  });
}

// ─── 8. SCROLL SUAVE PARA LINKS INTERNOS ────────────────────────────────────
// (El CSS ya tiene scroll-behavior: smooth, pero esto agrega soporte extra)

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    });
  });
}

// ─── INICIALIZACIÓN ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initScrollReveal();
  initCounters();
  initOpenClosedStatus();
  initLightbox();
  initWhatsAppLinks();
  initSmoothScroll();
});
