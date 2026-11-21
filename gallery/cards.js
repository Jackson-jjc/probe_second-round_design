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
    '</h3><p>' + esc(o.place) + ' · ' + postcardStyleNames[styleKey(c)] + '</p><p class="words" dir="auto">' + esc(c.words) + '</p>' + label + design +
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

function cardLine(ctx, x1, y1, x2, y2, color = rule, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}


const postcardStyleNames = Object.freeze({
  collage: "Paper collage", classic: "Vintage post", line: "Line study", technical: "Digital archive"
});

function styleKey(card) {
  return Object.hasOwn(postcardStyleNames,card.style) ? card.style : "classic";
}

const cardSans = '"Segoe UI", Arial, "Microsoft YaHei", sans-serif';
const cardLayouts = {
  classic:   {paper:"#f7efdd", ink:"#322f27", accent:"#854938", rule:"#b4a27f", x:851, y:448, width:552, font:"italic 42px "+serif, leading:60},
  collage:   {paper:"#f5ede0", ink:"#322c25", accent:"#9b412c", rule:"#ae8972", x:854, y:448, width:548, font:"37px "+cardSans, leading:56},
  line:      {paper:"#f6f7f1", ink:"#283c44", accent:"#365966", rule:"#a5b3b3", x:820, y:285, width:589, font:"italic 42px "+serif, leading:60},
  technical: {paper:"#162d2c", ink:"#f0f6e9", accent:"#c4f195", rule:"#5c7770", x:410, y:735, width:1000, font:"40px "+cardSans, leading:58}
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

function sourceStrip(ctx,views,x,y,w,h,color,gap=6){
  const single=(w-(views.length-1)*gap)/views.length;
  views.forEach((im,i)=>framePhoto(ctx,im,x+i*(single+gap),y,single,h,color));
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

function vintageLayout(ctx, c, o, views, design, theme, footer) {
  const {paper,ink,accent,rule}=theme;
  grain(ctx,"#86644226",footer);
  ctx.strokeStyle=rule;ctx.lineWidth=2;
  ctx.strokeRect(29,27,1442,footer-48);
  ctx.strokeRect(36,34,1428,footer-62);
  // Photo corners and a double rule frame the source without cropping it.
  const x=69,y=69,w=678,h=design?416:675;
  fillArea(ctx,"#e5dcc4",x-6,y-6,w+12,h+12);
  sourceStrip(ctx,views,x,y,w,h,"#e4d9c1",5);
  for(const [cx,cy,dx,dy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){
    paperPath(ctx,[[cx-3*dx,cy-3*dy],[cx+29*dx,cy-3*dy],[cx-3*dx,cy+29*dy]],"#9b835c");
  }
  smallType(ctx,views.length===2?"SOURCE PHOTOGRAPHS   /   BACK & DETAIL":"SOURCE PHOTOGRAPH",x,y+h+33,ink);
  if(design){
    framePhoto(ctx,design,x,y+h+58,w,202,"#eae0ca");
    smallType(ctx,imageRef(o,c),x,y+h+288,ink);
  }
  const objectBottom=wrappedHeading(ctx,o.name,x,844,683,"italic 45px "+serif,46,ink);
  cardType(ctx,o.place,x,objectBottom-9,"22px "+serif,ink,680);
  cardLine(ctx,792,67,792,footer-59,rule,2);
  cardType(ctx,"Post Card",845,193,"italic 91px "+serif,ink,420);
  cardType(ctx,"A I   &   H E R I T A G E",851,245,"20px "+serif,accent);
  drawStamp(ctx,1293,74,accent,paper);
  ctx.save();ctx.strokeStyle="#ad9678";ctx.lineWidth=2.1;
  for(let i=0;i<3;i++){
    ctx.beginPath();ctx.moveTo(1200,187+i*13);
    ctx.bezierCurveTo(1242,162+i*13,1271,213+i*13,1323,184+i*13);ctx.stroke();
  }
  ctx.restore();
  cardLine(ctx,851,293,1408,293,rule,2);
  cardLine(ctx,851,299,1408,299,rule,1);
}

function collageLayout(ctx,c,o,views,design,theme,footer) {
  const {paper,ink,accent}=theme;
  fillArea(ctx,"#d7a681",0,0,798,footer);
  grain(ctx,"#79533827",footer);
  const mark=c.type==="a" && views[c.detail?.i] && Number.isFinite(c.detail.x) && Number.isFinite(c.detail.y) ? c.detail : null;
  const detail=mark?views[mark.i]:views[views.length-1];
  // A torn detail is a crop. The complete, credited source stays visible on the print below.
  const edge=[[0,0],[773,0],[748,66],[758,119],[729,151],[747,220],[709,262],
    [717,315],[672,365],[687,408],[626,464],[600,535],[551,579],[0,535]];
  ctx.save();paperPath(ctx,edge);ctx.clip();coverPhoto(ctx,detail,0,0,780,593,mark);ctx.restore();
  paperPath(ctx,[[52,54],[263,45],[267,84],[58,91]],paper);
  smallType(ctx,mark?"MARKED DETAIL":"SOURCE DETAIL",66,77,ink,183);
  // Two photo-paper mounts overlap the crop along a diagonal; captions stay with their prints.
  function mount(imgs,x,y,w,h,angle,label){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    ctx.shadowColor="#55372148";ctx.shadowBlur=11;ctx.shadowOffsetX=3;ctx.shadowOffsetY=7;
    fillArea(ctx,"#fcf9ef",0,0,w,h);ctx.shadowColor="transparent";
    sourceStrip(ctx,imgs,13,13,w-26,h-65,"#dfd8c8",3);
    smallType(ctx,label,16,h-18,ink,w-32);
    ctx.restore();
  }
  const sourceY=design?294:315;
  mount(views,38,sourceY,design?510:680,design?290:456,-.055,views.length===2?"SOURCE / BACK & DETAIL":"SOURCE PHOTOGRAPH");
  if(design)mount([design],168,574,566,248,.038,imageRef(o,c));
  // A deckled letter-paper edge separates layered material and the written note.
  const left=[[794,0],[785,74],[801,128],[783,198],[795,250],[781,300],[793,346],[778,420],
    [797,465],[783,536],[790,615],[778,695],[797,731],[784,849],[791,footer]];
  paperPath(ctx,[...left,[1500,footer],[1500,0]],paper);
  cardType(ctx,"POSTCARD",851,87,"bold 27px "+cardSans,accent);
  const titleBottom=wrappedHeading(ctx,o.name,849,174,550,"bold 60px "+serif,60,ink);
  cardType(ctx,o.place,853,titleBottom+3,"22px "+serif,ink,550);
  cardLine(ctx,850,343,1405,343,"#bf8d71",2);
  cardType(ctx,"AI & HERITAGE",44,footer-36,"bold 20px "+mono,ink);
}

const edgeStudies = new WeakMap();
function contourStudy(img) {
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
      pixels[4*i]=240-199*density;pixels[4*i+1]=243-180*density;pixels[4*i+2]=237-163*density;
      pixels[4*i+3]=255;
    }
  }
  ctx.putImageData(rgba,0,0);edgeStudies.set(img,surface);return surface;
}

function lineLayout(ctx,c,o,views,design,theme,footer){
  const {ink,accent,rule}=theme;
  cardType(ctx,"Line study",59,98,"italic 73px "+serif,ink);
  smallType(ctx,"POSTCARD  /  "+o.id+"."+c.type.toUpperCase(),820,76,ink);
  cardLine(ctx,59,124,1435,124,rule);
  const study=contourStudy(views[0]);
  framePhoto(ctx,study,83,157,631,475,"#f0f3ed");
  // Registration crosses on the contour plate establish a drawing-sheet margin.
  for(const [x,y] of [[75,149],[722,149],[75,641],[722,641]]){
    cardLine(ctx,x-8,y,x+8,y,accent,1.5);
    cardLine(ctx,x,y-8,x,y+8,accent,1.5);
  }
  smallType(ctx,"CONTOUR FROM SOURCE PHOTOGRAPH",82,670,accent);
  const y=706,h=142;
  const sourceW=design?310:634;
  sourceStrip(ctx,views,83,y,sourceW,h,"#e0e5dd");
  smallType(ctx,views.length===2?"SOURCE / BACK & DETAIL":"SOURCE PHOTOGRAPH",83,y+h+27,ink,sourceW);
  if(design){
    framePhoto(ctx,design,414,y,300,h,"#e0e5dd");
    smallType(ctx,imageRef(o,c),414,y+h+27,ink,300);
  }
  cardLine(ctx,767,152,767,footer-53,rule,1);
  const bottom=wrappedHeading(ctx,o.name,818,168,595,"italic 37px "+serif,38,ink);
  cardType(ctx,o.place,820,bottom-7,"19px "+serif,accent,589);
}

function technicalLayout(ctx,c,o,views,design,theme,footer){
  const {paper,ink,accent,rule}=theme;
  fillArea(ctx,"#b8dc94",0,0,1500,44);
  smallType(ctx,"AI & HERITAGE   /   OBJECT ARCHIVE",48,30,paper);
  smallType(ctx,"POSTCARD  "+o.id+"."+c.type.toUpperCase(),1190,30,paper);
  cardType(ctx,o.name,47,132,"600 68px "+cardSans,ink,1390);
  cardType(ctx,o.place,52,174,"23px "+mono,"#d0e0cb",1390);
  cardLine(ctx,52,206,1448,206,rule,2);
  const x=52,y=234,h=331,sourceW=850;
  sourceStrip(ctx,views,x,y,sourceW,h,"#283e3a",8);
  smallType(ctx,views.length===2?"01  SOURCE PHOTOGRAPHS   /   BACK & DETAIL":"01  SOURCE PHOTOGRAPH",x,603,ink);
  if(design){
    framePhoto(ctx,design,928,y,520,h,"#283e3a");
    smallType(ctx,"02  "+imageRef(o,c),928,603,accent);
  }else{
    coverPhoto(ctx,views[views.length-1],928,y,520,h);
    smallType(ctx,"02  DETAIL OF SOURCE PHOTOGRAPH",928,603,accent);
  }
  // Registration ticks refer to the image row; there is no invented scale or reading.
  for(let i=0;i<43;i++)cardLine(ctx,52+i*33,211,52+i*33,211+(i%7?5:12),rule,1.5);
  cardLine(ctx,52,631,1448,631,rule,2);
  cardLine(ctx,368,665,368,footer-38,rule,1);
  cardType(ctx,c.type.toUpperCase(),50,811,"bold 160px "+cardSans,accent);
  smallType(ctx,c.type==="a"?"MAKING":"EXCHANGE",59,862,ink);
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
  const paint={classic:vintageLayout,collage:collageLayout,line:lineLayout,technical:technicalLayout}[key];
  paint(ctx,card,o,views,design,theme,footer);
  drawWriting(ctx,card,theme,words,label,footer,key);
  cardLine(ctx,51,footer,1448,footer,theme.rule,1);
  cardType(ctx,o.credit,53,footer+33,"22px "+serif,theme.ink,1395);
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
