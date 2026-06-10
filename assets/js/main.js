// DJs warmup list
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
const dc = document.getElementById("djs");
if(dc) djs.forEach(({n,f}) => {
  const d = document.createElement("div");
  d.className = "dj" + (f ? " featured" : "");
  d.textContent = n;
  dc.appendChild(d);
});

// Gallery slider
const imgs = [
  "images/gallery/photo1.jpg",
  "images/gallery/photo2.jpg",
  "images/gallery/photo3.jpg",
  "images/gallery/photo4.jpg",
  "images/gallery/photo5.jpg",
  "images/gallery/photo6.jpg",
  "images/gallery/photo7.jpg",
  "images/gallery/photo8.jpg",
  "images/gallery/photo9.jpg",
  "images/gallery/photo10.jpg",
];
const trk = document.getElementById("gtrak");
if(trk) {
  imgs.forEach((src, i) => {
    const sl = document.createElement("div");
    sl.className = "gslide";
    const im = document.createElement("img");
    im.src = src;
    im.onerror = () => { sl.innerHTML = '<div class="gslide-ph"><span>Add photo ' + (i+1) + '</span></div>'; };
    im.onclick = () => openLb(src);
    sl.appendChild(im);
    trk.appendChild(sl);
  });
}
let gI = 0;
function gUpdate() {
  const w = (trk && trk.children[0] ? trk.children[0].offsetWidth + 3 : 280);
  if(trk) trk.style.transform = `translateX(-${gI * w}px)`;
}
function gNext() { const mx = Math.max(0, imgs.length - 3); gI = gI >= mx ? 0 : gI + 1; gUpdate(); }
function gPrev() { const mx = Math.max(0, imgs.length - 3); gI = gI <= 0 ? mx : gI - 1; gUpdate(); }
setInterval(gNext, 4000);

// Lightbox
function openLb(src) {
  document.getElementById("lb-img").src = src;
  document.getElementById("lb").classList.add("on");
}
