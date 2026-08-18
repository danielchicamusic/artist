document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open);
  });
  mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Hero crossfade + EXIF tag ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  const exifTag = document.getElementById('exifTag');
  const exifData = [
    'AVALON CLUB — BCN · f/1.8 · ISO 3200 · 35mm',
    'TECHNO NIGHT — BCN · f/2.0 · ISO 2000 · 50mm',
    'AFTER HOURS — BCN · f/1.4 · ISO 4000 · 35mm',
    'BEACH CLUB — EJE CAFETERO · f/2.8 · ISO 1250 · 24mm',
  ];
  let heroIndex = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[heroIndex].classList.remove('is-active');
      heroIndex = (heroIndex + 1) % slides.length;
      slides[heroIndex].classList.add('is-active');
      exifTag.textContent = exifData[heroIndex % exifData.length];
    }, 5200);
  }

  /* ---------- Gallery data ---------- */
  const GALLERY = [
    { src:'g01', title:'El payaso',        loc:'Barcelona',        tag:'TECHNO NIGHT',   exif:'f/1.8 · ISO 3200 · 35mm' },
    { src:'g02', title:'Sesión en vivo',    loc:'Barcelona',        tag:'CABINA',         exif:'f/2.0 · ISO 2500 · 50mm' },
    { src:'g03', title:'Avalon',            loc:'Barcelona',        tag:'CLUB NIGHT',     exif:'f/1.4 · ISO 1600 · 24mm' },
    { src:'g04', title:'Pista a tope',      loc:'Barcelona',        tag:'MAIN FLOOR',     exif:'f/2.8 · ISO 2000 · 35mm' },
    { src:'g05', title:'Backstage',         loc:'Barcelona',        tag:'RETRATO',        exif:'f/1.8 · ISO 800 · 85mm' },
    { src:'g06', title:'Party set',         loc:'Barcelona',        tag:'ROOFTOP',        exif:'f/2.0 · ISO 1250 · 35mm' },
    { src:'g07', title:'Beach club',        loc:'Eje Cafetero',     tag:'GOLDEN HOUR',    exif:'f/2.8 · ISO 400 · 24mm' },
    { src:'g08', title:'En cabina',         loc:'Barcelona',        tag:'DJ SET',         exif:'f/1.4 · ISO 3200 · 50mm' },
    { src:'g09', title:'Pista',             loc:'Barcelona',        tag:'DANCEFLOOR',     exif:'f/2.0 · ISO 4000 · 35mm' },
    { src:'g10', title:'After hours',       loc:'Barcelona',        tag:'CLOSE UP',       exif:'f/1.8 · ISO 2000 · 50mm' },
    { src:'g11', title:'Backstage pass',    loc:'Barcelona',        tag:'BACKSTAGE',      exif:'f/1.8 · ISO 1600 · 35mm' },
  ];

  const grid = document.getElementById('galleryGrid');
  GALLERY.forEach((item, i) => {
    const el = document.createElement('figure');
    el.className = 'g-item reveal';
    el.dataset.index = i;
    el.innerHTML = `
      <span class="g-index mono">${String(i+1).padStart(2,'0')} / ${String(GALLERY.length).padStart(2,'0')}</span>
      <img src="images/thumb/${item.src}.webp" alt="${item.title} — ${item.loc}" loading="lazy">
      <figcaption class="g-overlay">
        <div class="g-tag">
          <div class="g-title">${item.title}</div>
          <div class="g-meta"><span>${item.tag} — ${item.loc}</span><span>${item.exif}</span></div>
        </div>
      </figcaption>
    `;
    grid.appendChild(el);
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const flashOverlay = document.getElementById('flashOverlay');
  let currentIndex = 0;

  function fireFlash(){
    flashOverlay.classList.remove('fire');
    void flashOverlay.offsetWidth; // reflow to restart animation
    flashOverlay.classList.add('fire');
  }

  function openLightbox(index){
    currentIndex = index;
    const item = GALLERY[currentIndex];
    lbImage.src = `images/full/${item.src}.webp`;
    lbImage.alt = `${item.title} — ${item.loc}`;
    lbCaption.textContent = `${item.title} — ${item.tag}, ${item.loc} · ${item.exif}`;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    fireFlash();
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function nav(delta){
    currentIndex = (currentIndex + delta + GALLERY.length) % GALLERY.length;
    const item = GALLERY[currentIndex];
    lbImage.src = `images/full/${item.src}.webp`;
    lbImage.alt = `${item.title} — ${item.loc}`;
    lbCaption.textContent = `${item.title} — ${item.tag}, ${item.loc} · ${item.exif}`;
    fireFlash();
  }

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.g-item');
    if (!item) return;
    openLightbox(Number(item.dataset.index));
  });
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => nav(-1));
  document.getElementById('lbNext').addEventListener('click', () => nav(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') nav(-1);
    if (e.key === 'ArrowRight') nav(1);
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Contact form (demo — wire to your own backend/Formspree) ---------- */
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Enviado ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
    }, 2400);
    // TODO: reemplazar por integración real (Formspree, mailto, API propia, etc.)
  });

});
