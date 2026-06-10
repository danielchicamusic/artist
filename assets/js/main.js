// DJs warmup list
const djs=["Seth Troxler","Ilario Alicante","Marco Carola","Sebastien Leger","Matador","Dennis Ferrer","Matthias Tanzmann","Stefano Noferini","Alexis Cabrera","Hito","wAFF","Paco Osuna","Kevin Saunderson","Marco Faraone","Dennis Cruz","Stacey Pullen","Alexi Delano","Rafa Barrios","Hector Couto","Pablo Luque","Yaya Tamango","Marko Nastic","Jean Pierre & Jesse Calosso","Miro Pajic","Andy Martin"];
const dc=document.getElementById("djs");
djs.forEach(n=>{const d=document.createElement("div");d.className="dj";d.textContent=n;dc.appendChild(d);});

// Gallery
const imgs=[
  "images/gallery/photo1.jpg",
  "images/gallery/photo2.jpg",
  "images/gallery/photo4.jpg",
];

const trk=document.getElementById("gtrak");
imgs.forEach((src)=>{
  const sl=document.createElement("div");sl.className="gslide";
  const im=document.createElement("img");im.src=src;
  im.onclick=()=>openLb(src);sl.appendChild(im);
  trk.appendChild(sl);
});
let gI=0;
function gUpdate(){const w=(trk.children[0]?.offsetWidth||280)+3;trk.style.transform=`translateX(-${gI*w}px)`;}
function gNext(){const vis=window.innerWidth<=720?2:3;const mx=Math.max(0,imgs.length-vis);gI=gI>=mx?0:gI+1;gUpdate();}
function gPrev(){const vis=window.innerWidth<=720?2:3;const mx=Math.max(0,imgs.length-vis);gI=gI<=0?mx:gI-1;gUpdate();}
setInterval(gNext,4000);
function openLb(src){document.getElementById("lb-img").src=src;document.getElementById("lb").classList.add("on");}
