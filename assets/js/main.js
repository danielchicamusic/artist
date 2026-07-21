// Custom cursor
const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  setTimeout(() => { cursorRing.style.left = e.clientX + 'px'; cursorRing.style.top = e.clientY + 'px'; }, 80);
});
document.querySelectorAll('a,button,.rel-card,.gallery-item,.dj-tag').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.width = '16px'; cursor.style.height = '16px'; cursorRing.style.width = '50px'; cursorRing.style.height = '50px'; });
  el.addEventListener('mouseleave', () => { cursor.style.width = '8px'; cursor.style.height = '8px'; cursorRing.style.width = '36px'; cursorRing.style.height = '36px'; });
});

// Nav scroll
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 80); });

// DJs
const djs = [
  {n:"Seth Troxler",f:true},{n:"Ilario Alicante",f:true},{n:"Marco Carola",f:true},
  {n:"Sebastien Leger",f:true},{n:"Matador",f:true},{n:"Dennis Ferrer",f:true},
  {n:"Matthias Tanzmann",f:true},{n:"Stefano Noferini",f:false},{n:"Alexis Cabrera",f:false},
  {n:"Hito",f:false},{n:"wAFF",f:true},{n:"Paco Osuna",f:true},
  {n:"Kevin Saunderson",f:true},{n:"Marco Faraone",f:true},{n:"Dennis Cruz",f:false},
  {n:"Stacey Pullen",f:true},{n:"Alexi Delano",f:false},{n:"Rafa Barrios",f:false},
  {n:"Hector Couto",f:false},{n:"Pablo Luque",f:false},{n:"Marko Nastic",f:true},
  {n:"Jean Pierre & Jesse Calosso",f:true},{n:"Miro Pajic",f:false},{n:"Andy Martin",f:false}
];
const djc = document.getElementById('djs');
if(djc) djs.forEach(({n,f}) => {
  const d = document.createElement('div');
  d.className = 'dj-tag' + (f?' ft':'');
  d.textContent = n;
  djc.appendChild(d);
});

// Gallery
const galleryImgs = [
  'images/gallery/photo1.jpg',
  'images/gallery/photo2.jpg',
  'images/gallery/photo3.jpg',
  'images/gallery/photo4.jpg',
  'images/gallery/photo5.jpg',
];
const galleryEl = document.getElementById('gallery-grid');
if(galleryEl) {
  galleryImgs.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Daniel Chica ' + (i+1);
    img.onerror = () => div.style.display = 'none';
    img.onclick = () => openLb(src);
    div.appendChild(img);
    galleryEl.appendChild(div);
  });
}

// Lightbox
function openLb(src) {
  document.getElementById('lb-img').src = src;
  document.getElementById('lb').classList.add('on');
}

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));
