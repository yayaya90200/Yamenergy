/**
 * YAM ENERGY – script.js
 * Gestion : Header scroll, menu burger, IntersectionObserver,
 *            animation batterie, slider avis clients
 */

/* ============================================================
   UTILITAIRES
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ============================================================
   HEADER – Scroll shadow
   ============================================================ */
const header = $('#header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

/* ============================================================
   HEADER – Active nav link au scroll
   ============================================================ */
const sections  = $$('section[id]');
const navLinks  = $$('.nav-link');

const activateNavLink = () => {
  let current = '';
  sections.forEach(sec => {
    const top    = sec.offsetTop - 100;
    const height = sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < top + height) {
      current = sec.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
};

window.addEventListener('scroll', activateNavLink, { passive: true });

/* ============================================================
   MENU BURGER
   ============================================================ */
const burger       = $('#burger');
const mobileMenu   = $('#mobileMenu');
const mobileOverlay = $('#mobileOverlay');
const mobileClose  = $('#mobileClose');
const mobileLinks  = $$('.mobile-nav-link');

const openMenu = () => {
  burger.classList.add('open');
  mobileMenu.classList.add('open');
  mobileOverlay.classList.add('active');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
};

const closeMenu = () => {
  burger.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileOverlay.classList.remove('active');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

burger.addEventListener('click', openMenu);
mobileClose.addEventListener('click', closeMenu);
mobileOverlay.addEventListener('click', closeMenu);

// Fermeture sur clic d'un lien mobile
mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});
$('.mobile-cta').addEventListener('click', closeMenu);

// Fermeture touche Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

/* ============================================================
   INTERSECTION OBSERVER – Scroll reveal
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Une fois visible, on ne re-observe plus
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

$$('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   ANIMATION BATTERIE – Compteur dynamique
   ============================================================ */
const batteryFill    = $('#batteryFill');
const batteryPercent = $('#batteryPercent');

// Pourcentage démarre à 0 et monte vers 100, puis repart
let currentPct  = 0;
let direction   = 1;           // 1 = monte, -1 = descend
const maxPct    = 100;
const minPct    = 8;
const stepMs    = 35;          // Intervalle entre chaque %
const stepSize  = 1;           // % par step

const animateBattery = () => {
  currentPct += direction * stepSize;

  if (currentPct >= maxPct) {
    currentPct = maxPct;
    // Pause courte en haut avant de repartir vers le bas
    setTimeout(() => { direction = -1; }, 1800);
  }
  if (currentPct <= minPct) {
    currentPct = minPct;
    // Pause courte en bas avant de remonter
    setTimeout(() => { direction = 1; }, 1200);
  }

  if (batteryFill && batteryPercent) {
    batteryFill.style.width = `${currentPct}%`;
    batteryPercent.textContent = `${currentPct}%`;

    // Couleur dynamique selon le niveau
    if (currentPct < 20) {
      batteryFill.style.background = 'linear-gradient(90deg, #D32F2F, #EF5350)';
    } else if (currentPct < 50) {
      batteryFill.style.background = 'linear-gradient(90deg, #F9A825, #FFD54F)';
    } else {
      batteryFill.style.background = 'linear-gradient(90deg, #2E7D32, #66BB6A)';
    }
  }
};

// Démarre à 68% (valeur héro initiale)
currentPct = 68;
const batteryInterval = setInterval(animateBattery, stepMs);

/* ============================================================
   SLIDER AVIS CLIENTS
   ============================================================ */
const slider       = $('#reviewsSlider');
const prevBtn      = $('#sliderPrev');
const nextBtn      = $('#sliderNext');
const dotsWrapper  = $('#sliderDots');

const reviewCards  = $$('.review-card');
const totalCards   = reviewCards.length;
let cardsPerView   = 3;    // Responsive adapté plus bas
let currentSlide   = 0;

// Crée les points
const buildDots = () => {
  dotsWrapper.innerHTML = '';
  const totalDots = Math.ceil(totalCards / cardsPerView);
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrapper.appendChild(dot);
  }
};

// Active le bon dot
const updateDots = () => {
  $$('.slider-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
};

// Navigation
const goToSlide = (index) => {
  const totalSlides = Math.ceil(totalCards / cardsPerView);
  currentSlide = Math.max(0, Math.min(index, totalSlides - 1));

  // Offset px basé sur la largeur d'une carte + gap
  const cardEl   = reviewCards[0];
  const gap      = 24;
  const cardW    = cardEl.offsetWidth + gap;
  const offset   = currentSlide * cardsPerView * cardW;

  slider.style.transform = `translateX(-${offset}px)`;
  updateDots();
};

const goNext = () => {
  const totalSlides = Math.ceil(totalCards / cardsPerView);
  goToSlide((currentSlide + 1) % totalSlides);
};
const goPrev = () => {
  const totalSlides = Math.ceil(totalCards / cardsPerView);
  goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
};

// Setup initial du slider
const setupSlider = () => {
  cardsPerView = window.innerWidth < 640 ? 1 : window.innerWidth < 960 ? 2 : 3;

  // Transforme le grid en flex pour le sliding
  slider.style.display        = 'flex';
  slider.style.gap            = '24px';
  slider.style.transition     = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
  slider.style.willChange     = 'transform';

  // Largeur de chaque carte en fonction du viewport
  const containerW = slider.parentElement.offsetWidth;
  const gap        = 24;
  const cardWidth  = (containerW - gap * (cardsPerView - 1)) / cardsPerView;

  reviewCards.forEach(card => {
    card.style.minWidth  = `${cardWidth}px`;
    card.style.maxWidth  = `${cardWidth}px`;
    card.style.flexShrink = '0';
  });

  currentSlide = 0;
  slider.style.transform = 'translateX(0)';
  buildDots();
};

prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);

// Auto-slide (pause au hover)
let autoSlideTimer = setInterval(goNext, 5000);
slider.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
slider.addEventListener('mouseleave', () => {
  autoSlideTimer = setInterval(goNext, 5000);
});

// Swipe tactile
let touchStartX = 0;
slider.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
slider.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
});

// Init + resize
setupSlider();
window.addEventListener('resize', () => {
  setupSlider();
});

/* ============================================================
   SMOOTH SCROLL – Liens internes
   ============================================================ */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = $(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   CURSOR MICRO-INTERACTION sur les cartes
   ============================================================ */
const interactiveCards = $$('.card, .elec-card, .why-card, .review-card, .certif-card, .contact-card');

interactiveCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect    = card.getBoundingClientRect();
    const x       = e.clientX - rect.left;
    const y       = e.clientY - rect.top;
    const cx      = rect.width / 2;
    const cy      = rect.height / 2;
    const rotateY = ((x - cx) / cx) * 3;     // max 3deg
    const rotateX = -((y - cy) / cy) * 2;    // max 2deg

    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    // Force la transition CSS originale à reprendre
  });
});

/* ============================================================
   CONSOLE – Signature
   ============================================================ */
console.log('%cYAM ENERGY', 'color:#2E7D32;font-size:22px;font-weight:900;');
console.log('%cSite développé avec soin.', 'color:#6B7280;font-size:13px;');

/* ============================================================
   FORMULAIRE CONTACT – Web3Forms
   ============================================================ */
document.getElementById('formBtn').addEventListener('click', () => {
  const nom     = document.getElementById('f_nom').value.trim();
  const prenom  = document.getElementById('f_prenom').value.trim();
  const email   = document.getElementById('f_email').value.trim();
  const tel     = document.getElementById('f_tel').value.trim();
  const projet  = document.getElementById('f_projet').value;
  const message = document.getElementById('f_message').value.trim();
  const btn     = document.getElementById('formBtn');
  const msgBox  = document.getElementById('formMessage');

  if (!nom || !prenom || !email || !projet || !message) {
    msgBox.style.display    = 'block';
    msgBox.style.background = '#FEF2F2';
    msgBox.style.color      = '#DC2626';
    msgBox.style.border     = '1px solid #FECACA';
    msgBox.textContent      = '⚠️ Merci de remplir tous les champs obligatoires (*).';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Envoi en cours…';

  fetch('https://api.web3forms.com/submit', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      access_key: 'cdc5e96f-a2a1-4e61-92cf-0ef34753582e',
      subject   : 'Demande de devis – YAM ENERGY',
      Nom    : nom,
      Prénom : prenom,
      Email     : email,
      Télephone     : tel || 'Non renseigné',
      Projet   : projet,
      Message   : message
    })
  })
  .then(res => res.json())
  .then(res => {
    if (res.success) {
      msgBox.style.display    = 'block';
      msgBox.style.background = '#F0FDF4';
      msgBox.style.color      = '#166534';
      msgBox.style.border     = '1px solid #BBF7D0';
      msgBox.textContent      = '✅ Message envoyé ! Nous vous répondrons rapidement.';
      document.getElementById('f_nom').value     = '';
      document.getElementById('f_prenom').value  = '';
      document.getElementById('f_email').value   = '';
      document.getElementById('f_tel').value     = '';
      document.getElementById('f_projet').value  = '';
      document.getElementById('f_message').value = '';
    } else {
      throw new Error();
    }
    btn.textContent = 'Envoyer ma demande';
    btn.disabled    = false;
  })
  .catch(() => {
    msgBox.style.display    = 'block';
    msgBox.style.background = '#FEF2F2';
    msgBox.style.color      = '#DC2626';
    msgBox.style.border     = '1px solid #FECACA';
    msgBox.textContent      = '❌ Erreur lors de l\'envoi. Contactez-nous par téléphone.';
    btn.textContent = 'Envoyer ma demande';
    btn.disabled    = false;
  });
});