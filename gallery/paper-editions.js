"use strict";

// The softly printed view and caption band recall British photographic picture postcards.
// They are an original setting for the visitor's own message and the credited object.
const souvenirPrints = new WeakMap();

function souvenirPrint(photo) {
  if (souvenirPrints.has(photo)) return souvenirPrints.get(photo);
  const print = document.createElement("canvas");
  const factor = Math.min(1, 1000 / Math.max(photo.width, photo.height));
  print.width = Math.max(1, Math.round(photo.width * factor));
  print.height = Math.max(1, Math.round(photo.height * factor));
  const g = print.getContext("2d");
  g.filter = "sepia(.58) saturate(.75) contrast(.9) brightness(1.04)";
  g.drawImage(photo, 0, 0, print.width, print.height);
  g.filter = "none";
  g.globalCompositeOperation = "destination-in";
  for (const [dx, dy] of [[print.width, 0], [0, print.height]]) {
    const fade = g.createLinearGradient(0, 0, dx, dy);
    fade.addColorStop(0, "transparent");
    fade.addColorStop(.065, "#000");
    fade.addColorStop(.94, "#000");
    fade.addColorStop(1, "transparent");
    g.fillStyle = fade;
    g.fillRect(0, 0, print.width, print.height);
  }
  souvenirPrints.set(photo, print);
  return print;
}

function souvenirScroll(ctx, x, y, direction) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, 1);
  ctx.strokeStyle = "#927850";
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.bezierCurveTo(27, 4, 48, -17, 71, -7);
  ctx.bezierCurveTo(91, 3, 95, 7, 131, 0);
  ctx.moveTo(21, 1);
  ctx.bezierCurveTo(43, 6, 51, -10, 65, -4);
  ctx.stroke();
  ctx.restore();
}

function britishEdition(ctx, c, o, views, design, theme, footer) {
  const {paper, ink, rule, accent} = theme;
  const left = 83;
  grain(ctx, "#856a3825", footer);
  ctx.strokeStyle = "#b5a783";
  ctx.lineWidth = 2;
  ctx.strokeRect(25, 25, 1450, footer - 44);
  cardLine(ctx, 35, 35, 1465, 35, "#d4c7a6", 1);
  const print = souvenirPrint(views[0]);
  const windowX = design ? 751 : 622;
  const windowW = 1430 - windowX;
  const fit = Math.min(windowW / print.width, 540 / print.height);
  const pw = fit * print.width, ph = fit * print.height;
  ctx.drawImage(print, windowX + (windowW - pw) / 2, 70 + (540 - ph) / 2, pw, ph);
  const headingWidth = design ? 657 : 527;
  const titleTop = design ? 144 : 219;
  cardType(ctx, "A   M U S E U M   P I C T U R E   P O S T C A R D", left, titleTop - 68,
    "bold 19px " + serif, accent, headingWidth);
  const below = wrappedHeading(ctx, o.name, left, titleTop, headingWidth, "italic 65px " + serif, 64, ink);
  cardType(ctx, o.place, left + 2, below - 10, "23px " + serif, accent, headingWidth);
  if (design) {
    const x = left + 18, y = Math.max(326, below + 17), w = 572, h = 211;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, h / 2);
    ctx.clip();
    // Exact colours are retained on the chosen design, with a mount around the print.
    framePhoto(ctx, design, x, y, w, h, "#e7dbc1");
    ctx.restore();
    ctx.strokeStyle = "#9e8863";
    ctx.lineWidth = 2;
    for (const padding of [0, 6]) {
      ctx.beginPath();
      ctx.roundRect(x-padding,y-padding,w+2*padding,h+2*padding,h/2+padding);
      ctx.stroke();
    }
    cardType(ctx, imageRef(o,c), left + 22, y+h+38, "bold 18px " + mono, ink);
  } else {
    souvenirScroll(ctx,left+6,below+37,1);
  }
  cardType(ctx, "Tinted source photograph", windowX + 14, 633, "italic 23px " + serif, ink);
  cardLine(ctx, left, 655, 1415, 655, rule, 1.6);
  cardLine(ctx, left, 661, 1415, 661, rule, 1);
  cardLine(ctx, 1167, 701, 1167, footer-35, rule, 1.4);
  cardType(ctx, "Post Card", 1194, 749, "italic 45px " + serif, accent, 224);
  drawStamp(ctx,1248,774, "#667e6d",paper,.72);
  ctx.save();
  ctx.strokeStyle="#907d65";ctx.lineWidth=1.3;
  for(let j=0;j<3;j++){
    const y=828+j*8;
    ctx.beginPath();ctx.moveTo(1316,y);
    ctx.bezierCurveTo(1346,y-15,1358,y+10,1397,y);ctx.stroke();
  }
  ctx.restore();
}

// A flood from the outer edge removes the neutral tabletop behind the cuff or bag.
// If the subject and background cannot be separated, retain the whole colour print.
const extractedPieces = new WeakMap();

function peelPaperObject(image) {
  if (extractedPieces.has(image)) return extractedPieces.get(image);
  const sheet = document.createElement("canvas");
  const ratio = Math.min(1, 920 / Math.max(image.width,image.height));
  const w=sheet.width=Math.max(2,Math.round(image.width*ratio));
  const h=sheet.height=Math.max(2,Math.round(image.height*ratio));
  const g=sheet.getContext("2d",{willReadFrequently:true});
  g.drawImage(image,0,0,w,h);
  const pixels=g.getImageData(0,0,w,h), data=pixels.data;
  const queue=new Int32Array(w*h), visited=new Uint8Array(w*h);
  let first=0,last=0;
  function add(i) {
    if(visited[i])return;
    visited[i]=1;
    const y=Math.floor(i/w), x=i-y*w, pos=i*4;
    const lhs=4*y*w, rhs=lhs+4*(w-1), alpha=x/(w-1);
    let delta=0;
    for(let channel=0;channel<3;channel++){
      const predicted=data[lhs+channel]*(1-alpha)+data[rhs+channel]*alpha;
      delta=Math.max(delta,Math.abs(data[pos+channel]-predicted));
    }
    if(delta>15)return;
    queue[last++]=i;
    data[pos+3]=0;
  }
  for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
  while(first<last){
    const i=queue[first++], x=i%w;
    if(x>0)add(i-1);
    if(x+1<w)add(i+1);
    if(i>=w)add(i-w);
    if(i+w<w*h)add(i+w);
  }
  let result=null;
  if(last>w*h*.22 && last<w*h*.89){
    let x0=w, y0=h, x1=0, y1=0;
    for(let i=0;i<w*h;i++)if(data[i*4+3]){
      x0=Math.min(x0,i%w);x1=Math.max(x1,i%w);
      y0=Math.min(y0,Math.floor(i/w));y1=Math.max(y1,Math.floor(i/w));
    }
    // A pale fabric panel may approach the tabletop colour. Keep the body of the
    // cuff or bag intact while leaving the opening of a handle transparent.
    const start=Math.round(y0+(y1-y0)*.34);
    for(let y=start;y<=y1;y++){
      let left=w,right=-1;
      for(let x=x0;x<=x1;x++)if(data[4*(y*w+x)+3]){
        left=Math.min(left,x);right=x;
      }
      for(let x=left;x<=right;x++)data[4*(y*w+x)+3]=255;
    }
    g.putImageData(pixels,0,0);
    result=document.createElement("canvas");
    result.width=x1-x0+1;result.height=y1-y0+1;
    result.getContext("2d").drawImage(sheet,x0,y0,result.width,result.height,0,0,result.width,result.height);
  }
  extractedPieces.set(image,result);
  return result;
}

function materialCollageEdition(ctx,c,o,views,design,theme,footer){
  const {ink,paper,accent}=theme;
  const mark=c.type==="a" && views[c.detail?.i] && Number.isFinite(c.detail.x) && Number.isFinite(c.detail.y)
    ? c.detail : null;
  const index=mark?.i ?? views.length-1;
  const source=views[index];
  const designCutout=design && c.type==="a" ? peelPaperObject(design) : null;
  grain(ctx,"#776f592a",footer);

  const bottom=design?578:802;
  // Source crop printed in soot ink, clipped to the outer edge of the paper tear.
  const tear=[[0,0],[655,0],[648,72],[695,100],[672,157],[741,204],[716,248],[756,269],
    [722,334],[731,386],[710,410],[746,471],[689,531],[718,bottom-18],[629,bottom+31],
    [579,bottom],[482,bottom+30],[448,bottom+14],[379,bottom+63],[317,bottom+43],
    [237,bottom+80],[169,bottom+52],[81,bottom+82],[0,bottom+57]];
  ctx.save();
  ctx.translate(0,9);paperPath(ctx,tear,"#ada89a");
  ctx.restore();
  ctx.save();
  paperPath(ctx,tear);ctx.clip();
  ctx.filter="grayscale(1) contrast(1.22)";
  coverPhoto(ctx,source,0,0,760,bottom+90,mark);
  ctx.restore();
  // Coarse dot screen belongs to the reproduction, only inside its cut edge.
  ctx.save();paperPath(ctx,tear);ctx.clip();ctx.fillStyle="#18181338";
  for(let y=2;y<bottom+90;y+=9)for(let x=2+(y%2)*4;x<760;x+=9)ctx.fillRect(x,y,1.5,1.5);
  ctx.restore();

  if(design && views.length>1){
    // This narrow second print is the other documented view of the gown.
    const extra=views[index===0?1:0];
    ctx.save();ctx.translate(525,170);ctx.rotate(.084);
    fillArea(ctx,"#eee7d5",-9,-9,222,300);
    coverPhoto(ctx,extra,0,0,203,281);
    ctx.restore();
  }
  if(design){
    const red="#cc4734";
    paperPath(ctx,[[0,660],[204,590],[405,623],[713,540],[769,866],[552,892],[331,868],[122,921],[0,898]],red);
    // A neutral-background product becomes a loose paper object. Other prepared
    // images keep their original colours and full scene on a torn-edged clipping.
    ctx.save();ctx.translate(374,706);ctx.rotate(-.072);
    if(designCutout){
      const scale=Math.min(576/designCutout.width,332/designCutout.height);
      const w=designCutout.width*scale,h=designCutout.height*scale;
      ctx.shadowColor="#341b1b77";ctx.shadowOffsetX=7;ctx.shadowOffsetY=10;ctx.shadowBlur=9;
      ctx.drawImage(designCutout,-w/2,-h/2,w,h);
    }else{
      const w=682,h=240;
      const cut=[[-w/2-9,-h/2-8],[-221,-h/2-13],[-68,-h/2-3],[166,-h/2-10],
        [w/2+7,-h/2-2],[w/2+11,h/2+6],[181,h/2+9],[-19,h/2+3],[-w/2-10,h/2+13]];
      paperPath(ctx,cut,paper);
      framePhoto(ctx,design,-w/2,-h/2,w,h,"#e9dfca");
    }
    ctx.restore();
    fillArea(ctx,paper,432,870,306,39);
    smallType(ctx,imageRef(o,c),445,897,ink,281);
  }
  ctx.save();ctx.translate(49,54);ctx.rotate(-.026);
  const label=mark?"MARKED DETAIL  /  "+o.id:"SOURCE DETAIL  /  "+o.id;
  fillArea(ctx,paper,-10,-26,253,40);
  smallType(ctx,label,0,0,ink,233);ctx.restore();

  cardType(ctx,"MATERIAL STUDY",832,77,"bold 22px "+mono,accent,356);
  ctx.save();ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(1260,45,155,45);
  smallType(ctx,"POST CARD",1277,75,accent,123);ctx.restore();
  const bottomOfTitle=wrappedHeading(ctx,o.name,829,181,585,"bold 64px "+serif,66,ink);
  cardType(ctx,o.place,835,bottomOfTitle, "23px "+serif, ink,579);
  cardLine(ctx,835,373,1418,373,accent,2.4);
  cardType(ctx,"AI & HERITAGE",835,footer-31,"bold 17px "+mono,accent);
}
