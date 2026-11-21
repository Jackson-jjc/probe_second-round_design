"use strict";
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[ch]);
const designURL = (key, type, n) => "images/" + key + "-" + type + n + ".jpg";

function photographs(key) {
  const o = objects[key];
  return '<div class="photos">' + o.photo.map((url, i) =>
    '<figure><a href="' + url + '" target="_blank" rel="noopener noreferrer"><img src="' + o.cardPhoto[i] +
    '" alt="' + esc(o.alt[i]) + '"></a><figcaption><a href="' + url +
    '" target="_blank" rel="noopener noreferrer">' + esc(o.labels[i]) + ' ↗</a></figcaption></figure>'
  ).join("") + '</div>';
}

function cardHTML(c) {
  const o = objects[c.key];
  const sources=editionSourceIndices(c,o);
  const design = c.image ? '<p>Prepared AI design · ' + esc(o[c.type][c.image-1]) +
    ' (' + o.id + '–' + c.type.toUpperCase() + c.image + ')</p>' : "";
  const label = c.label ? '<p class="card-label"><strong>Proposed museum label</strong><br>' + esc(c.label) + '</p>' : "";
  return '<article class="wallcard postal-card" aria-label="Postcard from ' + esc(o.name) + '">' +
    '<heritage-postcard data-card="' + esc(JSON.stringify(c)) + '" aria-hidden="true"></heritage-postcard>' +
    '<details class="postal-transcript"><summary>Read postcard text and credits</summary><h3>' + esc(o.name) +
    '</h3><p>' + esc(o.place) + ' · ' + postcardStyleNames[styleKey(c)] + ' · ' + editionFinish(styleKey(c),c) + '</p><p class="words" dir="auto">' + esc(c.words) + '</p>' + label + design +
    '<p>' + cardSourceLinks(o,sources) + '</p><p>' + esc(editionCredit(o,sources)) + '</p>' +
    '<a class="source-url" href="' + esc(o.url) + '" target="_blank" rel="noopener">Source record ↗</a></details></article>';
}

const postcardImages = new Map();
function cardBitmap(url) {
  if (!postcardImages.has(url)) {
    const img = new Image();
    img.src = url;
    postcardImages.set(url, img.decode().then(() => img).catch(error => {
      postcardImages.delete(url);
      throw error;
    }));
  }
  return postcardImages.get(url);
}

const serif = 'Georgia, "Times New Roman", serif';

const mono = 'Consolas, "Courier New", monospace';
const segmenter = new Intl.Segmenter(undefined, {granularity: "grapheme"});

function wrapCardText(ctx, value, maxWidth) {
  const lines = [];
  for (const paragraph of String(value || "").split(/\r\n|\r|\n/)) {
    let line = "";
    for (const token of paragraph.match(/\s+|\S+/gu) || []) {
      if (line.trimEnd() && ctx.measureText(line + token).width > maxWidth) {
        lines.push(line.trimEnd());
        line = "";
      }
      if (!line && !token.trim()) continue;
      if (ctx.measureText(token).width <= maxWidth) { line += token; continue; }
      for (const {segment} of segmenter.segment(token)) {
        if (line && ctx.measureText(line + segment).width > maxWidth) {
          lines.push(line);
          line = "";
        }
        line += segment;
      }
    }
    lines.push(line.trimEnd());
  }
  // Keep East Asian closing punctuation with the preceding grapheme.
  for(let i=1;i<lines.length;i++){
    if(!/^[、。，；：！？）〉》」』】]/u.test(lines[i]) || !lines[i-1])continue;
    const previous=Array.from(segmenter.segment(lines[i-1]),entry=>entry.segment);
    if(previous.length<2 || ctx.measureText(previous[previous.length-1]+lines[i]).width>maxWidth)continue;
    lines[i]=previous.pop()+lines[i];
    lines[i-1]=previous.join("");
  }
  return lines;
}

function cardLine(ctx, x1, y1, x2, y2, color = "#bab5a0", width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}


const postcardStyleNames = Object.freeze({
  classic: "British picture postcard", collage: "Paper collage", line: "Line study", technical: "Acid chrome"
});

function styleKey(card) {
  return Object.hasOwn(postcardStyleNames,card.style) ? card.style : "classic";
}


function editionFinish(style,card){
 const descriptions={
  classic:card.image?"Tinted view with an oval inset":"One tinted view",
  collage:card.detail?"A torn print of your marked detail":"Torn black-and-white print",
  line:"Ink contours with a wash of colour",
  technical:"Chrome type and inverted colour"
 };
 return descriptions[style];
}

function editionSourceIndices(c,o){
 const last=o.cardPhoto.length-1;
 const marked=c.type==="a" && Number.isInteger(c.detail?.i) && c.detail.i>=0 && c.detail.i<=last
  && Number.isFinite(c.detail.x) && Number.isFinite(c.detail.y);
 const style=styleKey(c);
 if(style==="classic")return [0];
 const primary=marked?c.detail.i:(style==="collage"?last:0);
 if(style==="collage" && c.image && last===1)return [primary,1-primary];
 return [primary];
}

function editionCredit(o,indices){
 if(o.viewCredits && indices.length===1)return o.viewCredits[indices[0]];
 return o.credit;
}

function cardSourceLinks(o,indices){
 return indices.map(i=>'<a href="'+esc(o.photo[i])+'" target="_blank" rel="noopener noreferrer">'+esc(o.alt[i])+' ↗</a>').join(" ");
}

const cardSans = '"Segoe UI", Arial, "Microsoft YaHei", sans-serif';
const cardLayouts = {
  classic:   {paper:"#f5efdf", ink:"#323a35", accent:"#793e37", rule:"#b7ae91", x:83, y:777, width:1030, font:"italic 41px "+serif, leading:55},
  collage:   {paper:"#f6f0e4", ink:"#282827", accent:"#a32626", rule:"#aba390", x:850, y:397, width:575, font:"38px "+cardSans, leading:54},
  line:      {paper:"#faf9f3", ink:"#243f42", accent:"#43675d", rule:"#b4c2b8", x:850, y:433, width:570, font:"italic 42px "+serif, leading:59},
  technical: {paper:"#111019", ink:"#f4f0ff", accent:"#d4ff32", rule:"#585264", x:835, y:576, width:605, font:"39px "+cardSans, leading:55}
};

function cardType(ctx, value, x, y, font, color, width) {
  ctx.font=font;
  ctx.fillStyle=color;
  if(width===undefined) ctx.fillText(value,x,y);
  else ctx.fillText(value,x,y,width);
}

function smallType(ctx, text, x, y, color, width) {
  cardType(ctx,text,x,y,"bold 19px "+mono,color,width);
}

function paperPath(ctx, points, color) {
  ctx.beginPath();
  points.forEach(([x,y],i)=>i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();
  if(color){ctx.fillStyle=color;ctx.fill();}
}

function grain(ctx,color,height) {
  // A tiny, repeatable print texture. All lettering and photographs sit above it.
  ctx.fillStyle=color;
  for(let i=0;i<2100;i++){
    const x=(i*977+Math.floor(i/19)*137)%1500, y=(i*569+Math.floor(i/41)*173)%height;
    ctx.fillRect(x,y,1+(i%3),1);
  }
}

function fillArea(ctx, color, x, y, w, h) {
  ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
}

function framePhoto(ctx, img, x,y,w,h, matte="#e6e1d5"){
  fillArea(ctx,matte,x,y,w,h);
  const ratio=Math.min(w/img.width,h/img.height);
  const dw=img.width*ratio, dh=img.height*ratio;
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}

function coverPhoto(ctx,img,x,y,w,h,point){
  const ratio=Math.max(w/img.width,h/img.height)*(point?2.25:1);
  const sw=w/ratio,sh=h/ratio;
  const cx=point?img.width*point.x/100:img.width/2;
  const cy=point?img.height*point.y/100:img.height/2;
  const left=Math.min(Math.max(0,cx-sw/2),img.width-sw);
  const top=Math.min(Math.max(0,cy-sh/2),img.height-sh);
  ctx.drawImage(img,left,top,sw,sh,x,y,w,h);
}

function imageRef(object,card) {
  return "PREPARED AI  /  "+object.id+"-"+card.type.toUpperCase()+card.image;
}

function drawStamp(ctx, x,y,accent,paper,scale=1) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  fillArea(ctx,accent,0,0,116,134);
  ctx.fillStyle=paper;
  for(let v=7;v<116;v+=13){
    for(const h of [0,134]) {ctx.beginPath();ctx.arc(v,h,3.3,0,Math.PI*2);ctx.fill();}
  }
  for(let h=7;h<134;h+=13){
    for(const v of [0,116]) {ctx.beginPath();ctx.arc(v,h,3.3,0,Math.PI*2);ctx.fill();}
  }
  ctx.strokeStyle=paper;ctx.lineWidth=1.5;ctx.strokeRect(9,9,98,116);
  // A woven rosette, printed as a single-colour postage motif.
  ctx.save();ctx.translate(58,58);
  for(let i=0;i<12;i++){
    ctx.rotate(Math.PI/6);ctx.beginPath();ctx.ellipse(0,-15,8,23,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
  cardType(ctx,"A & H",25,111,"bold 20px "+serif,paper);
  ctx.restore();
}

function wrappedHeading(ctx,text,x,y,width,font,leading,color) {
  ctx.font=font;
  const lines=wrapCardText(ctx,text,width);
  lines.forEach((line,i)=>cardType(ctx,line,x,y+i*leading,font,color));
  return y+lines.length*leading;
}

const edgeStudies = new WeakMap();
function contourStudy(img, keepShade) {
  if(edgeStudies.has(img))return edgeStudies.get(img);
  const surface=document.createElement("canvas");
  const scale=760/Math.max(img.width,img.height);
  surface.width=Math.max(1,Math.round(img.width*scale));surface.height=Math.max(1,Math.round(img.height*scale));
  const ctx=surface.getContext("2d",{willReadFrequently:true});
  ctx.drawImage(img,0,0,surface.width,surface.height);
  const w=surface.width,h=surface.height,rgba=ctx.getImageData(0,0,w,h);
  const pixels=rgba.data, gray=new Float32Array(w*h);
  for(let i=0;i<gray.length;i++)gray[i]=.299*pixels[4*i]+.587*pixels[4*i+1]+.114*pixels[4*i+2];
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i=y*w+x;
      let density=0;
      if(x>0 && y>0 && x<w-1 && y<h-1){
        const dx=gray[i-w+1]+2*gray[i+1]+gray[i+w+1]-gray[i-w-1]-2*gray[i-1]-gray[i+w-1];
        const dy=gray[i+w-1]+2*gray[i+w]+gray[i+w+1]-gray[i-w-1]-2*gray[i-w]-gray[i-w+1];
        density=Math.min(.98,Math.max(0,(Math.abs(dx)+Math.abs(dy)-32)/225));
      }
      pixels[4*i]=36;pixels[4*i+1]=64;pixels[4*i+2]=66;
      // A light ink tone keeps the jug's dark leather folds visible between edges.
      if (keepShade) density = Math.max(density, .32 * Math.max(0, 1 - gray[i] / 105));
      pixels[4*i+3]=Math.round(244*density);
    }
  }
  ctx.putImageData(rgba,0,0);edgeStudies.set(img,surface);return surface;
}


const studyPrints = new WeakMap();

// Reveal a little colour at the point the visitor noticed. The ink and photograph
// share one set of coordinates, so the colour stays inside the same folds and marks.
function lineStudyPrint(image, point, leather) {
  const centre = point || {x: 45, y: 66};
  const cached = studyPrints.get(image);
  if (cached && cached.x === centre.x && cached.y === centre.y) return cached.print;
  const ink = contourStudy(image, leather);
  const print = document.createElement("canvas");
  print.width = ink.width;
  print.height = ink.height;
  const ctx = print.getContext("2d", {willReadFrequently: true});
  const {width, height} = print;
  const cx = width * centre.x / 100, cy = height * centre.y / 100;
  const reach = Math.min(width, height) * .53;
  const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
  wash.addColorStop(0, "rgba(0,0,0,.88)");
  wash.addColorStop(.39, "rgba(0,0,0,.61)");
  wash.addColorStop(1, "transparent");
  ctx.drawImage(image, 0, 0, width, height);
  // Neutral studio backdrops carry little pigment. Leave the paper showing through
  // there while retaining the fabric, leather or thread colours around the mark.
  const photo = ctx.getImageData(0, 0, width, height);
  const pixels = photo.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const chroma = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) -
      Math.min(pixels[i], pixels[i + 1], pixels[i + 2]);
    pixels[i + 3] = Math.round(38 + 217 * Math.min(1, chroma / 43));
  }
  ctx.putImageData(photo, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(ink, 0, 0);
  // Let the perimeter dissolve into the sheet, including on installation photographs.
  ctx.globalCompositeOperation = "destination-in";
  const across = ctx.createLinearGradient(0, 0, width, 0);
  const down = ctx.createLinearGradient(0, 0, 0, height);
  for (const fade of [across, down]) {
    fade.addColorStop(0, "transparent");
    fade.addColorStop(.045, "black");
    fade.addColorStop(fade === down && !leather ? .91 : .955, "black");
    fade.addColorStop(fade === down && !leather ? .973 : 1, "transparent");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, width, height);
  }
  studyPrints.set(image, {x: centre.x, y: centre.y, print});
  return print;
}

function lineLayout(ctx, c, o, views, design, theme) {
  const sourceIndex = editionSourceIndices(c, o)[0];
  const point = c.type === "a" && c.detail?.i === sourceIndex &&
    Number.isFinite(c.detail.x) && Number.isFinite(c.detail.y) ? c.detail : null;
  const leather = c.key === "jug";
  const print = lineStudyPrint(views[sourceIndex], point, leather);
  // The jug occupies the middle strip of a wide white scan. Crop after tinting
  // so the mark remains in the coordinates of the photograph the visitor saw.
  const sx = leather ? print.width * .319 : 0;
  const sw = leather ? print.width * .375 : print.width;
  const scale = Math.min(825 / sw, 804 / print.height);
  const w = sw * scale, h = print.height * scale;
  ctx.drawImage(print, sx, 0, sw, print.height, 28 + (800 - w) / 2, 855 - h, w, h);
  cardType(ctx, "Line study", 72, 884, "italic 36px " + serif, theme.ink);

  // The selected design takes the place of a small picture stamp at the head of the letter.
  if (design) {
    const x = 1240, y = 41, sw = 181, sh = 103, margin = 9;
    fillArea(ctx, "#d2dccd", x - margin, y - margin, sw + margin * 2, sh + margin * 2);
    ctx.fillStyle = theme.paper;
    for (let px = x; px < x + sw; px += 13) {
      for (const py of [y - margin, y + sh + margin]) {
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (let py = y; py < y + sh; py += 13) {
      for (const px of [x - margin, x + sw + margin]) {
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    framePhoto(ctx, design, x, y, sw, sh, "#f5f1e6");
    smallType(ctx, imageRef(o, c), x - margin, 181, theme.accent, sw + 2 * margin);
  }

  smallType(ctx, "POSTCARD   /   " + o.id + "." + c.type.toUpperCase(), theme.x, 104, theme.accent);
  const nextLine = wrappedHeading(ctx, o.name, theme.x, 239, theme.width, "46px " + serif, 49, theme.ink);
  cardType(ctx, o.place, theme.x, nextLine - 7, "23px " + serif, theme.accent, theme.width);
}
function drawWriting(ctx,card,theme,words,label,footer,key){
  const {x,y,width,font,leading,ink,accent,rule}=theme;
  smallType(ctx,card.type==="a"?"MY CAPTION":"MY MESSAGE",x,y-51,accent);
  const lineCount=label.length?words.length:Math.max(words.length,Math.floor((footer-y-45)/leading)+1);
  if(key==="classic" || !words.length){
    for(let i=0;i<lineCount;i++)cardLine(ctx,x,y+i*leading+12,x+width,y+i*leading+12,rule,1.2);
  }
  function paragraph(line,baseline,fontSpec,color){
    const rtl=/^[\p{P}\p{N}\s]*[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(line);
    ctx.direction=rtl?"rtl":"ltr";ctx.textAlign=rtl?"right":"left";
    cardType(ctx,line,rtl?x+width:x,baseline,fontSpec,color);
  }
  words.forEach((line,i)=>paragraph(line,y+i*leading,font,ink));
  ctx.textAlign="left";ctx.direction="ltr";
  if(label.length){
    const ly=y+words.length*leading+30;
    smallType(ctx,"PROPOSED MUSEUM LABEL",x,ly,accent);
    label.forEach((line,i)=>paragraph(line,ly+41+i*36,"27px "+serif,ink));
  }
  ctx.textAlign="left";ctx.direction="ltr";
}

async function renderPostcard(card, {maxWidth=1500}={}) {
  const o=objects[card.key],key=styleKey(card),theme=cardLayouts[key];
  const [design,...views]=await Promise.all([
    card.image?cardBitmap(designURL(card.key,card.type,card.image)):null,...o.cardPhoto.map(cardBitmap)
  ]);
  const canvas=document.createElement("canvas"), ctx=canvas.getContext("2d");
  ctx.font=theme.font;
  const words=card.words?wrapCardText(ctx,card.words,theme.width):[];
  ctx.font="27px "+serif;
  const label=card.label?wrapCardText(ctx,card.label,theme.width):[];
  const footer=Math.max(936,theme.y+words.length*theme.leading+(label.length?78+label.length*36:0)+52);
  const height=footer+94, scale=Math.min(1,maxWidth/1500,16384/height);
  canvas.width=Math.max(1,Math.round(1500*scale));canvas.height=Math.max(1,Math.round(height*scale));
  ctx.scale(scale,scale);
  fillArea(ctx,theme.paper,0,0,1500,height);
  const paint={classic:britishEdition,collage:materialCollageEdition,line:lineLayout,technical:acidEdition}[key];
  paint(ctx,card,o,views,design,theme,footer);
  drawWriting(ctx,card,theme,words,label,footer,key);
  cardLine(ctx,51,footer,1448,footer,theme.rule,1);
  cardType(ctx,editionCredit(o,editionSourceIndices(card,o)),53,footer+33,"22px "+serif,theme.ink,1395);
  cardType(ctx,o.url,53,footer+65,"18px "+mono,theme.ink,1395);
  return canvas;
}


customElements.define("heritage-postcard", class extends HTMLElement {
  async connectedCallback() {
    if (this.dataset.rendering) return;
    this.dataset.rendering="true";
    try {
      const canvas=await renderPostcard(JSON.parse(this.dataset.card));
      this.replaceChildren(canvas);
    } catch {
      this.textContent="Card image unavailable. Open the text and credits below.";
      const transcript=this.parentElement?.querySelector(".postal-transcript");
      if(transcript)transcript.open=true;
    }
  }
});

async function downloadCard(card, returnCanvas=false) {
  const canvas=await renderPostcard(card);
  if(returnCanvas)return canvas;
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(result=>
    result ? resolve(result) : reject(new Error("PNG export failed")), "image/png"));
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download=objects[card.key].id+"-"+card.type.toUpperCase()+"-postcard.png";
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
