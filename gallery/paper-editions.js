"use strict";

// The photographic face follows the Bangor Cathedral card. Its narrow red caption
// sits in the paper below the picture. The open writing field uses the letter
// proportions, short rule and boxed postage mark seen on the Old Hastings reverse.
const souvenirPlates = new WeakMap();
const postalRoman = '"Times New Roman", Times, serif';

function souvenirPlate(photo, key, hasInset) {
  const variants = souvenirPlates.get(photo) || [];
  const variant = hasInset ? 1 : 0;
  if (variants[variant]) return variants[variant];
  const plate = document.createElement("canvas");
  const w = plate.width = 875, h = plate.height = 711;
  const g = plate.getContext("2d", {willReadFrequently:true});

  if (key === "knit") {
    // Crop at the sides, keeping the hanging textile and both windows in view.
    coverPhoto(g, photo, 0, 0, w, h);
  } else {
    // The portrait scans have different margins. Retain the neck, feet and hem,
    // removing only the scanner's side bands or the calibration strip underneath.
    const sx = key === "jug" ? photo.width * .327 : 0;
    const sw = key === "jug" ? photo.width * .364 : photo.width;
    const sy = key === "gown" ? photo.height * .036 : 0;
    const sh = key === "gown" ? photo.height * .90 : photo.height;
    const ratio = (h - 18) / sh;
    const dw = sw * ratio;
    const left = Math.round((hasInset ? w * .44 : w / 2) - dw / 2);
    g.drawImage(photo, sx, sy, sw, sh, left, 0, dw, h);
    // The source is an upright studio view. Feather the studio edges into neutral
    // mount paper without stretching the room or adding a second photograph.
    const side = g.createLinearGradient(left,0,left+dw,0);
    side.addColorStop(0,"transparent");side.addColorStop(.11,"black");
    side.addColorStop(.90,"black");side.addColorStop(1,"transparent");
    g.globalCompositeOperation="destination-in";
    g.fillStyle=side;g.fillRect(0,0,w,h);
    g.globalCompositeOperation="destination-over";
    g.fillStyle=key==="jug" ? "#d5d0c5" : "#191d1a";g.fillRect(0,0,w,h);
    g.globalCompositeOperation="source-over";
  }

  // The reference has blue-black ink in its shadows and warm, visible stock in
  // the highlights. A fixed ink grain breaks up both midtones and flat margins.
  const pixels = g.getImageData(0,0,w,h);
  const data = pixels.data, ink = [40, 52, 52], stock = [245, 233, 206];
  let sequence = 19217;
  for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
      const i = 4 * (y*w + x);
      const light = (data[i]*.299 + data[i+1]*.587 + data[i+2]*.114)/255;
      sequence = (Math.imul(1664525, sequence) + 1013904223) >>> 0;
      const grain = (sequence/4294967296 - .5) * (13 + 15 * (1-Math.abs(2*light-1)));
      const tone = Math.min(1, light * 1.04);
      for (let channel=0; channel<3; channel++) {
        const duotone = ink[channel] + (stock[channel]-ink[channel])*tone;
        data[i+channel] = duotone*.94 + data[i+channel]*.06 + grain;
      }
    }
  }
  g.putImageData(pixels, 0,0);
  g.globalCompositeOperation = "destination-in";
  const edge = g.createLinearGradient(0,h-40,0,h);
  edge.addColorStop(0,"black");edge.addColorStop(.48,"rgba(0,0,0,.89)");edge.addColorStop(1,"transparent");
  g.fillStyle=edge;g.fillRect(0,0,w,h);
  variants[variant]=plate;souvenirPlates.set(photo,variants);
  return plate;
}

// Narrow uprights, elliptical bowls and a lightly flared foot echo the printed
// reverse lettering. This compact drawing is just the title of the postal form.
function postalMasthead(ctx, x, y, ink) {
  const glyphs = {
    P:[22,"M2 31V2H11C22 2 22 18 11 18H2 M0 2H5 M0 31H5"],
    O:[26,"M13 2C27 2 27 31 13 31C-1 31 -1 2 13 2Z"],
    S:[21,"M18 5C13 -1 2 1 2 9C2 17 19 16 19 24C19 33 6 34 2 28"],
    T:[23,"M1 4V2H22V4 M11.5 2V31 M9 31H14"],
    C:[24,"M21 6C16 0 7 0 3 10C-2 24 9 38 21 27"],
    A:[24,"M1 31L12 2L23 31 M5.5 21H18.5 M0 31H4 M20 31H24"],
    R:[24,"M2 31V2H11C22 2 22 17 11 17H2 M11 17L22 31 M0 2H5 M0 31H5"],
    D:[25,"M2 2H10C27 2 27 31 10 31H2V2 M0 2H4 M0 31H4"]
  };
  ctx.save();ctx.translate(x,y);ctx.scale(1.28,1.28);
  ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=1.15;
  for (const letter of "POST CARD") {
    const glyph=glyphs[letter];
    if (glyph) {
      ctx.stroke(new Path2D(glyph[1]));
      ctx.translate(glyph[0]+3.6,0);
    } else {ctx.translate(12,0);}
  }
  ctx.beginPath();ctx.arc(1,30,1.2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function britishEdition(ctx, c, o, views, design, theme, footer) {
  const {ink, accent, paper} = theme;
  const sourceIndex = editionSourceIndices(c,o)[0];
  grain(ctx, "#996c351c", footer);
  ctx.drawImage(souvenirPlate(views[sourceIndex],c.key,Boolean(design)),0,0);
  if (design) {
    // A small coloured inset sits across the edge of the print. The original
    // prepared study, including its silhouette and proportions, fits inside it.
    const cx=707, cy=599, w=246, h=145;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.035);
    ctx.fillStyle=paper;ctx.beginPath();ctx.ellipse(0,0,w/2+8,h/2+8,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);ctx.clip();
    fillArea(ctx,"#e4d9c5",-w/2,-h/2,w,h);
    framePhoto(ctx,design,-w*.44,-h*.42,w*.88,h*.84,"#e4d9c5");
    ctx.restore();ctx.strokeStyle="#987957";ctx.lineWidth=1.7;
    ctx.beginPath();ctx.ellipse(0,0,w/2+3,h/2+3,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
    ctx.save();ctx.textAlign="center";
    const legend=imageRef(o,c).replace("  /  "," · ");
    ctx.font="19px "+postalRoman;
    const tw=ctx.measureText(legend).width+18;
    fillArea(ctx,paper,cx-tw/2,cy+h/2+11,tw,26);
    cardType(ctx,legend,cx,cy+h/2+31,"19px "+postalRoman,accent);
    ctx.restore();
  }
  // Caption sits at five percent of the plate width, in the narrow upright
  // Roman used for place names on early picture cards. Fine print shares the ink.
  cardType(ctx,o.name,47,760,"39px "+postalRoman,accent,799);
  cardType(ctx,o.place,48,804,"small-caps 26px "+postalRoman,accent,794);
  cardType(ctx,o.labels[sourceIndex],48,872,"22px "+postalRoman,accent,798);

  cardLine(ctx,895,42,895,footer-29,"#b6a48b",1.3);
  postalMasthead(ctx,932,65,"#5e5545");
  cardLine(ctx,1012,146,1196,146,"#7f6e58",2);
  // A boxed project mark occupies the place of the printer's postage mark.
  ctx.save();ctx.translate(1340,38);
  ctx.strokeStyle="#9b8770";ctx.lineWidth=1.5;ctx.strokeRect(0,0,99,118);
  ctx.strokeStyle="#7d705b";ctx.lineWidth=1.4;
  ctx.save();ctx.translate(49,42);
  for (let i=0;i<8;i++) {
    ctx.rotate(Math.PI/4);ctx.beginPath();ctx.ellipse(0,-9,5,15,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
  ctx.textAlign="center";
  cardType(ctx,"A & H",49,91,"19px "+postalRoman,ink);
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

// Render the study as an ink screen. Dot radius follows the photograph's tone;
// the diagonal lattice stays registered to the actual crop, including an A mark.
const mailScreens = new WeakMap();

function mailScreen(image, objectKey, index, mark) {
  const isolated = !mark && (objectKey === "jug" || (objectKey === "gown" && index === 0));
  const key = mark ? mark.x + "/" + mark.y : "whole";
  const cached = mailScreens.get(image);
  if (cached && cached.key === key) return cached;
  const sheet = document.createElement("canvas");
  let sx = 0, sy = 0, sw = image.width, sh = image.height;
  if (isolated && objectKey === "jug") {
    sx = sw * .326; sw *= .37;
    sy = sh * .021; sh *= .966;
  } else if (isolated) {
    sx = sw * .16; sw *= .69;
    sy = sh * .057; sh *= .837;
  }

  const wide = objectKey === "knit" && !mark;
  sheet.width = isolated ? Math.round(720 * sw / sh) : 620;
  sheet.height = isolated ? 720 : wide ? 434 : 700;
  const g = sheet.getContext("2d", {willReadFrequently:true});
  if (isolated) g.drawImage(image, sx, sy, sw, sh, 0, 0, sheet.width, sheet.height);
  else coverPhoto(g, image, 0, 0, sheet.width, sheet.height, mark);

  const pixels = g.getImageData(0, 0, sheet.width, sheet.height);
  const data = pixels.data, w = sheet.width, h = sheet.height;
  const ink = [46,48,53], stock = [239,230,207];
  for (let y=0;y<h;y++) {
    let left=0, right=w-1;
    if (isolated) {
      // These two studio photographs have opposite backgrounds. Read the real
      // outside contour row by row and retain the whole textile/leather inside it.
      left=w; right=-1;
      for (let x=0;x<w;x++) {
        const k=4*(y*w+x), r=data[k], gr=data[k+1], b=data[k+2];
        const tone=.299*r+.587*gr+.114*b;
        const subject=objectKey === "jug" ? tone<101 || (r-b>35 && tone<187) : tone>79;
        if (subject) {left=Math.min(left,x);right=x;}
      }
    }
    for (let x=0;x<w;x++) {
      const i=4*(y*w+x);
      if (x<left || x>right) {data[i+3]=0;continue;}
      const tone=(.299*data[i]+.587*data[i+1]+.114*data[i+2])/255;
      const u=(x*.94+y*.342)/5.4, v=(y*.94-x*.342)/5.4;
      const d=Math.hypot(u-Math.floor(u)-.5,v-Math.floor(v)-.5);
      const light=Math.pow(tone,.73);
      const radius=.585*Math.sqrt(1-light);
      const density=Math.max(0,Math.min(1,(radius-d)*4.4+.5));
      const amount=.52*density+.48*(1-light);
      for(let ch=0;ch<3;ch++)data[i+ch]=Math.round(stock[ch]+(ink[ch]-stock[ch])*amount);
    }
  }
  g.putImageData(pixels,0,0);
  const result={key,sheet,isolated};
  mailScreens.set(image,result);
  return result;
}

function mailClippingEdge(w,h) {
  // Build a shallow paper tear along the right and bottom, at print scale.
  const pts=[[0,0],[w*.55,-1],[w,1]];
  for(let i=1;i<=42;i++){
    const fibre=Math.sin(i*1.8)*2.5+Math.sin(i*4.3)*4.6;
    pts.push([w+fibre,h*i/42]);
  }
  for(let i=1;i<=52;i++){
    const fibre=Math.sin(i*2.9)*2.2+Math.cos(i*.68)*5.2;
    pts.push([w*(1-i/52),h+fibre]);
  }
  return pts;
}

function materialCollageEdition(ctx,c,o,views,design,theme,footer) {
  const indices=editionSourceIndices(c,o);
  const mark=c.type==="a" && c.detail?.i===indices[0] &&
    Number.isFinite(c.detail.x) && Number.isFinite(c.detail.y) ? c.detail : null;
  const screen=mailScreen(views[indices[0]],c.key,indices[0],mark);
  const piece=design && c.type==="a" ? peelPaperObject(design) : null;
  const blue="#293d62", red="#b63628", type="#302f2f", cream="#fff7e5";
  grain(ctx,"#78673922",footer);
  const x=858;

  // In the reference a coloured clipping and an upright strip of type meet at
  // a seam. The source study does that job here, with the visitor's unprinted page beside it.
  const maxW=screen.isolated ? 610 : 644, maxH=design ? 670 : 790;
  const scale=Math.min(maxW/screen.sheet.width,maxH/screen.sheet.height);
  const dw=screen.sheet.width*scale,dh=screen.sheet.height*scale;
  const hx=screen.isolated ? 360 : 392;
  const hy=screen.isolated ? (design ? 398 : 456) : (design ? 392 : 466);
  ctx.save();
  ctx.translate(hx,hy);ctx.rotate(-.054);
  if(!screen.isolated){
    const edge=mailClippingEdge(dw,dh);
    ctx.translate(-dw/2,-dh/2);
    ctx.save();ctx.translate(4,7);paperPath(ctx,edge,"#b3a18a");ctx.restore();
    ctx.save();ctx.translate(1,3);paperPath(ctx,edge,cream);ctx.restore();
    paperPath(ctx,edge);ctx.clip();
    ctx.drawImage(screen.sheet,0,0,dw,dh);
  }else{
    ctx.shadowColor="#60533f48";ctx.shadowOffsetX=3;ctx.shadowOffsetY=5;ctx.shadowBlur=2;
    ctx.drawImage(screen.sheet,-dw/2,-dh/2,dw,dh);
  }
  ctx.restore();

  // A slender black press line and a column of red perforations label the photographed source.
  ctx.save();ctx.translate(780,603);ctx.rotate(-Math.PI/2+.011);
  fillArea(ctx,"#efe3c9",-8,-30,430,45);
  ctx.strokeStyle="#58513d";ctx.lineWidth=1;ctx.strokeRect(-8,-30,430,45);
  cardType(ctx,(mark?"MARKED DETAIL":"SOURCE PHOTOGRAPH")+"  /  "+o.id,4,0,
    "bold 24px "+mono,type,404);
  ctx.restore();
  ctx.fillStyle=red;
  for(let i=0;i<17;i++)ctx.fillRect(810,192+i*18,4.5,7.5);

  // The reference uses fine inline display lettering above tightly condensed blue type.
  ctx.save();ctx.translate(x,133);
  const heading="Post Card";
  ctx.font="bold 108px "+serif;
  const headingScale=Math.min(1,552/ctx.measureText(heading).width);
  ctx.scale(headingScale,1);
  ctx.lineJoin="round";
  const letterpress=document.createElement("canvas");
  letterpress.width=Math.ceil(ctx.measureText(heading).width)+8;
  letterpress.height=126;
  const lg=letterpress.getContext("2d");
  lg.font=ctx.font;lg.fillStyle=cream;lg.fillText(heading,3,101);
  lg.globalCompositeOperation="source-atop";
  lg.strokeStyle="#a38360";lg.lineWidth=1.15;lg.beginPath();
  for(let j=-126;j<letterpress.width;j+=6.5){lg.moveTo(j,118);lg.lineTo(j+108,2);}
  lg.stroke();
  ctx.fillStyle="#b49b79";ctx.fillText(heading,2.6,3.5);
  ctx.drawImage(letterpress,-3,-101);
  ctx.strokeStyle="#42342d";ctx.lineWidth=2;ctx.strokeText(heading,0,0);
  // Carry one fine flourish from the initial down below the baseline.
  ctx.lineWidth=1.6;ctx.beginPath();
  ctx.moveTo(16,4);ctx.bezierCurveTo(9,20,35,25,45,15);
  ctx.bezierCurveTo(61,-1,98,20,123,10);ctx.stroke();
  ctx.restore();

  ctx.save();ctx.translate(x,0);ctx.scale(.72,1);
  const objectFont='bold 58px "Arial Narrow", Arial, sans-serif';
  ctx.font=objectFont;
  const lines=wrapCardText(ctx,o.name.toUpperCase(),555/.72);
  for(let i=0;i<lines.length;i++)cardType(ctx,lines[i],0,222+i*59,objectFont,blue);
  ctx.restore();
  cardType(ctx,o.place,x,lines.length>1?333:281,"italic 26px "+serif,type,553);

  // A cancellation joins the printed sheet to the image, as on the source mailpiece.
  // Its letters identify the probe that made the card.
  ctx.save();
  ctx.translate(screen.isolated ? 174 : 95,86);ctx.rotate(-.16);
  ctx.strokeStyle="#56515c";ctx.fillStyle="#56515c";ctx.lineWidth=2;ctx.globalAlpha=.82;
  for (const radius of [52,46]) {
    ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
  }
  const arcText="AI & HERITAGE";
  ctx.font="bold 11px "+mono;ctx.textAlign="center";
  for(let j=0;j<arcText.length;j++){
    const theta=-2.73+(j/(arcText.length-1))*2.32;
    ctx.save();ctx.translate(Math.cos(theta)*35, Math.sin(theta)*35);ctx.rotate(theta+Math.PI/2);
    ctx.fillText(arcText[j],0,0);ctx.restore();
  }
  cardType(ctx,"PROBE "+c.type.toUpperCase(),0,10,"bold 15px "+mono,"#433944");
  ctx.beginPath();ctx.moveTo(-23,18);ctx.lineTo(23,18);ctx.stroke();
  ctx.restore();

  if(indices.length>1){
    // The real alternative view is the little stamp at the upper corner.
    ctx.save();ctx.translate(634,55);ctx.rotate(.087);
    fillArea(ctx,"#d5c9a9",-4,3,128,162);
    fillArea(ctx,"#f7eacc",-5,-3,128,162);
    ctx.strokeStyle=blue;ctx.lineWidth=1.8;ctx.strokeRect(0,2,118,150);
    coverPhoto(ctx,views[indices[1]],6,8,106,110);
    cardType(ctx,"V&A",9,143,"bold 21px "+serif,blue,96);
    ctx.restore();
  }

  if(design){
    const w=piece?445:436, h=piece?273:237;
    ctx.save();ctx.translate(513,729);ctx.rotate(-.085);
    if(piece){
      const factor=Math.min(w/piece.width,h/piece.height);
      const pw=piece.width*factor, ph=piece.height*factor;
      // Offset an opaque cream impression under the die-cut for a real paper rim.
      ctx.shadowColor=cream;ctx.shadowBlur=0;ctx.shadowOffsetX=-4;ctx.shadowOffsetY=-3;
      ctx.drawImage(piece,-pw/2,-ph/2,pw,ph);
      ctx.shadowColor="#594c4360";ctx.shadowOffsetX=4;ctx.shadowOffsetY=5;ctx.shadowBlur=4;
      ctx.drawImage(piece,-pw/2,-ph/2,pw,ph);
    }else{
      const edge=mailClippingEdge(w,h);
      ctx.translate(-w/2,-h/2);
      ctx.save();ctx.translate(3,6);paperPath(ctx,edge,"#af9f85");ctx.restore();
      paperPath(ctx,edge,cream);
      ctx.translate(7,7);
      paperPath(ctx,mailClippingEdge(w-14,h-14));ctx.clip();
      framePhoto(ctx,design,0,0,w-14,h-14,"#ede2ce");
    }
    ctx.restore();

    // Adapt the red dispatch slug to identify the selected prepared design.
    ctx.save();ctx.translate(451,871);ctx.rotate(-.044);
    ctx.font="bold 23px "+mono;
    const ref=imageRef(o,c).replace("  /  "," · ");
    const labelWidth=ctx.measureText(ref).width+30;
    fillArea(ctx,red,-7,-29,labelWidth,39);
    ctx.strokeStyle=cream;ctx.lineWidth=1;ctx.strokeRect(-3,-25,labelWidth-8,31);
    cardType(ctx,ref,6,0,"bold 23px "+mono,cream);
    ctx.restore();
  }
}
