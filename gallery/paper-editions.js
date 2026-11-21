"use strict";

// British picture postcards often let the photograph meet the paper below it.
// The source remains recognisable after this two-ink photographic treatment.
const souvenirPrints = new WeakMap();

function souvenirPrint(photo, key) {
  if (souvenirPrints.has(photo)) return souvenirPrints.get(photo);
  const print = document.createElement("canvas");
  // The museum's flagon scan includes wide white margins on either side of the photograph.
  const left = key === "jug" ? Math.round(photo.width * .325) : 0;
  const width = key === "jug" ? Math.round(photo.width * .378) : photo.width;
  print.width = width;
  print.height = photo.height;
  const g = print.getContext("2d", {willReadFrequently:true});
  g.drawImage(photo, left, 0, width, photo.height, 0, 0, width, photo.height);
  const pixels = g.getImageData(0, 0, width, print.height);
  const data = pixels.data;
  const ink = [45, 57, 52], stock = [235, 227, 205];
  for (let i=0; i<data.length; i+=4) {
    const light = (data[i]*.299 + data[i+1]*.587 + data[i+2]*.114) / 255;
    for (let channel=0; channel<3; channel++) {
      const tone = ink[channel] + (stock[channel]-ink[channel])*light;
      data[i+channel] = tone*.90 + data[i+channel]*.10;
    }
  }
  g.putImageData(pixels, 0, 0);
  // Blend an upright studio photograph into its own edge tone while keeping its full height.
  const edge = g.getImageData(2, Math.floor(print.height*.24), 1, 1).data;
  const matte = "rgb("+edge[0]+","+edge[1]+","+edge[2]+")";
  if (key !== "knit") {
    g.globalCompositeOperation = "destination-in";
    const fade = g.createLinearGradient(0,0,width,0);
    fade.addColorStop(0,"transparent");
    fade.addColorStop(.10,"#000");
    fade.addColorStop(.90,"#000");
    fade.addColorStop(1,"transparent");
    g.fillStyle = fade;
    g.fillRect(0,0,width,print.height);
  }
  const result = {print,matte};
  souvenirPrints.set(photo, result);
  return result;
}

function britishEdition(ctx, c, o, views, design, theme, footer) {
  const {paper, ink, rule, accent} = theme;
  const {print,matte} = souvenirPrint(views[editionSourceIndices(c,o)[0]], c.key);
  const h = 550;
  grain(ctx, "#856a382a", footer);
  if (c.key === "knit") {
    coverPhoto(ctx,print,0,0,1500,h);
  } else {
    // Loose mounts are given room at the right, clear of the original object.
    fillArea(ctx,matte,0,0,1500,h);
    const ratio = (h-20) / print.height;
    const w = print.width*ratio;
    ctx.drawImage(print,(design ? 594 : 750)-w/2,6,w,print.height*ratio);
    const shade=ctx.createLinearGradient(0,0,1500,0);
    shade.addColorStop(0,"#5e61492c");
    shade.addColorStop(.32,"transparent");
    shade.addColorStop(.73,"transparent");
    shade.addColorStop(1,"#5e614931");
    ctx.fillStyle=shade;
    ctx.fillRect(0,0,1500,h);
  }
  const fade = ctx.createLinearGradient(0,h-47,0,h);
  fade.addColorStop(0,"transparent");
  fade.addColorStop(1,paper);
  ctx.fillStyle=fade;
  ctx.fillRect(0,h-47,1500,47);

  if (design) {
    const x=1009, y=251, w=385, height=208;
    ctx.save();
    ctx.translate(x+w/2,y+height/2);
    ctx.rotate(-.036);
    ctx.fillStyle=paper;
    ctx.shadowColor="#30292154";ctx.shadowBlur=7;ctx.shadowOffsetY=5;
    ctx.beginPath();ctx.ellipse(0,0,w/2+9,height/2+9,0,0,2*Math.PI);ctx.fill();
    ctx.shadowColor="transparent";
    ctx.save();
    ctx.beginPath();ctx.ellipse(0,0,w/2,height/2,0,0,2*Math.PI);ctx.clip();
    framePhoto(ctx,design,-w/2,-height/2,w,height,"#e8dec7");
    ctx.restore();
    ctx.strokeStyle="#877656";ctx.lineWidth=1.8;
    ctx.beginPath();ctx.ellipse(0,0,w/2+3,height/2+3,0,0,2*Math.PI);ctx.stroke();
    ctx.restore();
    const ref=imageRef(o,c).replace("  /  "," · ");
    ctx.save();ctx.textAlign="center";
    ctx.font="bold 19px "+mono;
    const labelWidth=ctx.measureText(ref).width+24;
    fillArea(ctx,paper,x+w/2-labelWidth/2,y+height+23,labelWidth,33);
    cardType(ctx,ref,x+w/2,y+height+46,"bold 19px "+mono,ink);
    ctx.restore();
  }

  // Printers set the scene name in muted red directly under the photographic plate.
  cardType(ctx,o.name,81,611,"49px "+serif,accent,982);
  cardType(ctx,o.place,84,650,"italic 28px "+serif,ink,1043);
  ctx.save();ctx.textAlign="right";
  cardType(ctx,"Tinted source photograph · "+o.id,1419,643,"21px "+serif,accent,360);
  ctx.restore();
  cardLine(ctx,82,681,1418,681,rule,1.4);
  cardLine(ctx,1167,703,1167,footer-36,rule,1.3);
  cardType(ctx,"Post Card",1195,750,"italic 43px "+serif,accent,224);
  drawStamp(ctx,1240,776,"#697d69",paper,.72);
  ctx.save();
  ctx.strokeStyle="#907d65";ctx.lineWidth=1.4;
  for(let j=0;j<3;j++){
    const y=829+j*8;
    ctx.beginPath();ctx.moveTo(1309,y);
    ctx.bezierCurveTo(1344,y-14,1357,y+10,1400,y);ctx.stroke();
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

// The printed type strip and small stamp-like clipping borrow the hierarchy of
// the rooster mailpiece in Art Makes People's "12 Mail Art Ideas" Pinterest pin.
function materialCollageEdition(ctx, c, o, views, design, theme, footer) {
  const {ink, paper, accent} = theme;
  const indices = editionSourceIndices(c, o);
  const mark = c.type === "a" && c.detail?.i === indices[0] &&
    Number.isFinite(c.detail.x) && Number.isFinite(c.detail.y) ? c.detail : null;
  const source = views[indices[0]];
  const cutout = design && c.type === "a" ? peelPaperObject(design) : null;
  const red = "#bd3526", deepBlue = "#303e60";
  grain(ctx, "#776f592a", footer);

  // Keep the object name across the top, like the first line on a real piece of mail.
  cardType(ctx, o.name, 60, 108, "bold 73px " + serif, ink, 1115);
  cardType(ctx, o.place, 64, 153, "italic 29px " + serif, ink, 1110);
  ctx.save();
  ctx.translate(1208, 48);
  ctx.rotate(.035);
  fillArea(ctx, red, 0, 0, 106, 58);
  fillArea(ctx, deepBlue, 106, 0, 114, 58);
  cardType(ctx, "POST", 11, 41, "bold 34px " + mono, "#fff5dd", 85);
  cardType(ctx, "CARD", 119, 41, "bold 34px " + mono, "#fff5dd", 87);
  ctx.restore();

  // The largest clipping uses exactly the photograph and point chosen in Probe A.
  // Its ragged leading edge exposes a second sheet of unprinted paper beneath it.
  const height = design ? 465 : 625;
  const torn = [[0,2],[470,0],[597,8],[638,2],[661,11],[652,81],[673,109],
    [651,149],[662,211],[647,259],[669,293],[659,height-73],[669,height-37],
    [640,height-12],[568,height+4],[513,height-4],[482,height+7],
    [402,height-2],[331,height+13],[245,height-3],[191,height+12],
    [129,height+2],[81,height+11],[-2,height-5]];
  ctx.save();
  ctx.translate(68, 229);
  ctx.rotate(-.04);
  ctx.save();ctx.translate(6,10);paperPath(ctx,torn,"#c8baa1");ctx.restore();
  ctx.save();ctx.translate(2,5);paperPath(ctx,torn,"#fff8e8");ctx.restore();
  ctx.save();
  paperPath(ctx, torn);
  ctx.clip();
  ctx.filter = "grayscale(1) contrast(1.2)";
  coverPhoto(ctx, source, -2, 0, 679, height + 14, mark);
  ctx.filter = "none";
  ctx.fillStyle = "#28251c32";
  for (let y=2; y<height+14; y+=9) {
    for (let x=2+(y%2)*4; x<679; x+=9) ctx.fillRect(x,y,1.6,1.6);
  }
  ctx.restore();
  ctx.restore();

  // The vertical source strip sits on the seam so it labels a specific photograph.
  ctx.save();
  ctx.translate(74, 553);
  ctx.rotate(-Math.PI/2 - .04);
  fillArea(ctx, red, -10, -23, 312, 37);
  cardType(ctx, (mark ? "MARKED DETAIL" : "SOURCE DETAIL") + "  /  " + o.id,
    0, 3, "bold 22px " + mono, "#fff8e7", 282);
  ctx.restore();

  if (indices.length > 1) {
    const extra = views[indices[1]];
    // An actual second collection photograph becomes the small reference print.
    ctx.save();
    ctx.translate(608, 214);
    ctx.rotate(.055);
    fillArea(ctx, "#c6b9a4", 4, 6, 164, 201);
    fillArea(ctx, "#e7dfc4", 0, 0, 164, 201);
    ctx.strokeStyle = deepBlue;ctx.lineWidth=1.8;
    ctx.strokeRect(5,5,154,191);
    coverPhoto(ctx, extra, 12, 12, 140, 148);
    smallType(ctx, "V&A  /  " + o.id, 13, 187, deepBlue, 138);
    ctx.restore();
  }
  if (design) {
    // The colour reproduction crosses the photograph's lower edge like a pasted slip.
    const w = cutout ? 482 : 548;
    const h = cutout ? 280 : 230;
    ctx.save();
    ctx.translate(cutout ? 434 : 400, 729);
    ctx.rotate(-.056);
    paperPath(ctx, [[-w/2-49,-h/2+28],[-96,-h/2-25],[96,-h/2-10],[w/2+40,-h/2-26],
      [w/2+35,h/2-8],[111,h/2+19],[-82,h/2+4],[-w/2-37,h/2+20]], red);
    if (cutout) {
      const scale = Math.min(w/cutout.width,h/cutout.height);
      const dw=cutout.width*scale, dh=cutout.height*scale;
      ctx.shadowColor="#30231672";ctx.shadowOffsetY=5;ctx.shadowOffsetX=3;ctx.shadowBlur=5;
      ctx.drawImage(cutout,-dw/2,-dh/2,dw,dh);
    } else {
      fillArea(ctx, "#fff6df", -w/2-8,-h/2-8,w+16,h+16);
      framePhoto(ctx,design,-w/2,-h/2,w,h,"#ece2cd");
    }
    ctx.restore();
    ctx.save();ctx.translate(407,895);ctx.rotate(-.022);
    fillArea(ctx,"#fdf7e8",-8,-24,332,34);
    smallType(ctx,imageRef(o,c),0,0,deepBlue,312);
    ctx.restore();
  }
  // Discrete dividers leave the visitor's continuous writing area clear.
  cardLine(ctx, 850, 289, 1430, 289, "#c4b7a0", 1.6);
  cardType(ctx,"AI & HERITAGE",851,footer-31,"bold 18px "+mono,accent);
}
