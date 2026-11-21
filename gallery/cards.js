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
  const design = c.image ? '<p>Prepared AI design · ' + esc(o[c.type][c.image-1]) +
    ' (' + o.id + '–' + c.type.toUpperCase() + c.image + ')</p>' : "";
  const label = c.label ? '<p class="card-label"><strong>Proposed museum label</strong><br>' + esc(c.label) + '</p>' : "";
  return '<article class="wallcard postal-card" aria-label="Postcard from ' + esc(o.name) + '">' +
    '<heritage-postcard data-card="' + esc(JSON.stringify(c)) + '" aria-hidden="true"></heritage-postcard>' +
    '<details class="postal-transcript"><summary>Read postcard text and credits</summary><h3>' + esc(o.name) +
    '</h3><p>' + esc(o.place) + '</p><p class="words" dir="auto">' + esc(c.words) + '</p>' + label + design +
    '<p>' + o.alt.map(esc).join(" ") + '</p><p>' + esc(o.credit) + '</p>' +
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

const paper = "#fcf6e8", ink = "#263b35", rule = "#bab5a0";
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
  return lines;
}

function cardLine(ctx, x1, y1, x2, y2, color = rule, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function fitPhoto(ctx, img, x, y, width, height) {
  ctx.fillStyle = "#e5e0d3";
  ctx.fillRect(x,y,width,height);
  const scale = Math.min(width/img.width, height/img.height);
  const w = img.width*scale, h = img.height*scale;
  ctx.drawImage(img, x+(width-w)/2, y+(height-h)/2, w, h);
}

function drawPostage(ctx, accent, type) {
  // A textile-weave stamp, perforated on all four edges, with three cancellation lines.
  const x=1280, y=64, w=146, h=166;
  ctx.fillStyle=accent;
  ctx.fillRect(x,y,w,h);
  ctx.fillStyle=paper;
  const notch=(cx,cy)=>{ctx.beginPath();ctx.arc(cx,cy,4,0,2*Math.PI);ctx.fill();};
  for(let i=9;i<w;i+=16){notch(x+i,y);notch(x+i,y+h);}
  for(let j=9;j<h;j+=16){notch(x,y+j);notch(x+w,y+j);}
  ctx.save();
  ctx.strokeStyle=paper;ctx.lineWidth=1.5;
  ctx.strokeRect(x+11,y+11,w-22,h-22);
  ctx.beginPath();ctx.rect(x+23,y+24,w-46,78);ctx.clip();
  for(let i=-55;i<160;i+=13){
    cardLine(ctx,x+i,y+22,x+i+85,y+108,paper,4);
    cardLine(ctx,x+i+85,y+22,x+i,y+108,paper,1.3);
  }
  ctx.restore();
  ctx.font="bold 21px "+mono;ctx.fillStyle=paper;
  ctx.fillText("PROBE "+type.toUpperCase(),x+24,y+137);
  ctx.save();
  ctx.globalAlpha=.56;ctx.lineWidth=2.3;ctx.strokeStyle=ink;
  for(let j=0;j<3;j++){
    const sy=171+j*13;ctx.beginPath();ctx.moveTo(1178,sy);
    ctx.bezierCurveTo(1205,sy-16,1226,sy+14,1252,sy);
    ctx.bezierCurveTo(1274,sy-13,1293,sy+11,1311,sy);ctx.stroke();
  }
  ctx.restore();
}

async function renderPostcard(c) {
  const object=objects[c.key], accent=c.type==="a"?"#924a39":"#36676d";
  const [design,...views]=await Promise.all([
    c.image ? cardBitmap(designURL(c.key,c.type,c.image)) : null,
    ...object.cardPhoto.map(cardBitmap)
  ]);
  const canvas=document.createElement("canvas");
  const ctx=canvas.getContext("2d");
  const scriptFont=(c.type==="b"?"italic 46px ":"italic 38px ")+'Georgia, "Microsoft YaHei", sans-serif';
  ctx.font=scriptFont;
  const words=c.words ? wrapCardText(ctx,c.words,613) : [];
  ctx.font="27px "+serif;
  const label=c.label ? wrapCardText(ctx,c.label,613) : [];
  ctx.font="52px "+serif;
  const title=wrapCardText(ctx,object.name,635);
  const titleTop=106, photoTop=titleTop+title.length*53+48;
  const left=60, leftWidth=662, right=807, block=c.type==="b"?65:56;
  const messageY=373;
  const labelY=messageY+words.length*block+53;
  const messageEnd=label.length ? labelY+label.length*37+29 : messageY+words.length*block;
  const artBottom=878;
  const footer=Math.max(924, messageEnd+60);
  const height=footer+106;
  const scale=Math.min(1, 16384/height);
  canvas.width=Math.round(1500*scale);canvas.height=Math.round(height*scale);
  ctx.scale(scale,scale);
  ctx.fillStyle=paper;ctx.fillRect(0,0,1500,height);
  ctx.strokeStyle="#d8cfb9";ctx.lineWidth=2;ctx.strokeRect(12,12,1476,height-24);
  cardLine(ctx,765,58,765,footer-32);
  cardLine(ctx,left,footer,1440,footer,ink,2);

  ctx.font="bold 18px "+mono;ctx.fillStyle=accent;
  ctx.fillText("AI & HERITAGE   /   OBJECT "+object.id,left,60);
  ctx.font="52px "+serif;ctx.fillStyle=ink;
  title.forEach((line,i)=>ctx.fillText(line,left,titleTop+i*53));
  ctx.font="21px "+serif;
  ctx.fillText(object.place,left,photoTop-49,655);

  const designHeight=design ? 232 : 0;
  const sourceHeight=artBottom-photoTop-(design ? designHeight+73 : 0)-31;
  const gap=6, viewWidth=(leftWidth-gap*(views.length-1))/views.length;
  views.forEach((img,i)=>fitPhoto(ctx,img,left+i*(viewWidth+gap),photoTop,viewWidth,sourceHeight));
  ctx.font="18px "+mono;ctx.fillStyle=ink;
  const sourceLine=views.length===2?"SOURCE PHOTOGRAPHS   /   BACK VIEW & SILK DETAIL":"SOURCE PHOTOGRAPH   /   "+object.id;
  ctx.fillText(sourceLine,left,photoTop+sourceHeight+24);
  if(design){
    const y=artBottom-designHeight-31;
    fitPhoto(ctx,design,left,y,leftWidth,designHeight);
    ctx.font="18px "+mono;ctx.fillStyle=ink;
    ctx.fillText("PREPARED AI   /   "+object.id+"–"+c.type.toUpperCase()+c.image+"   ·   "+object[c.type][c.image-1],left,artBottom-6);
  }
  ctx.font="bold 19px "+mono;ctx.fillStyle=accent;
  ctx.fillText(c.type==="a"?"THE MAKING TABLE":"THE CONVERSATION BOARD",right,66);
  ctx.font=(c.type==="b"?"70px ":"84px ")+serif;ctx.fillStyle=ink;ctx.fillText("Post Card",right-4,174);
  drawPostage(ctx,accent,c.type);
  cardLine(ctx,right,263,1439,263,ink);
  ctx.font="bold 18px "+mono;ctx.fillStyle=accent;
  ctx.fillText(c.type==="a"?"CAPTION":"MESSAGE",right,318);
  const count=label.length ? Math.max(words.length,1) : Math.max(words.length,Math.floor((artBottom-messageY)/block)+1);
  for(let i=0;i<count;i++)cardLine(ctx,right,messageY+13+i*block,1439,messageY+13+i*block,"#d7ccb5",1.6);
  ctx.fillStyle=ink;ctx.font=scriptFont;
  const cardWords=String(c.words||"").trimStart(), rtl=/^[\p{P}\p{N}\s]*[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(cardWords);
  ctx.direction=rtl?"rtl":"ltr";ctx.textAlign=rtl?"right":"left";
  words.forEach((line,i)=>ctx.fillText(line,rtl?1439:right,messageY+i*block));
  ctx.direction="ltr";ctx.textAlign="left";
  if(label.length){
    ctx.font="bold 18px "+mono;ctx.fillStyle=accent;
    ctx.fillText("PROPOSED MUSEUM LABEL",right,labelY);
    ctx.fillStyle=ink;ctx.font="27px "+serif;
    label.forEach((line,i)=>ctx.fillText(line,right,labelY+41+i*37));
  }
  ctx.font="21px "+serif;ctx.fillStyle=ink;ctx.fillText(object.credit,left,footer+35);
  ctx.font="18px "+mono;ctx.fillStyle="#47574d";ctx.fillText(object.url,left,footer+65);
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
