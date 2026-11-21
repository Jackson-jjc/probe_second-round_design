"use strict";

// Lettering drawn for this postcard. Wide shoulders, small punched counters and
// narrow joins keep the eight letters readable as one short line of printed metal.
const acidLetters = {
  P: "M8 0H73Q90 0 90 16V31Q90 47 73 47H37V70H0V8Q0 0 8 0ZM37 19V29H55Q60 29 60 24Q60 19 55 19Z",
  O: "M17 0H73Q90 0 90 17V53Q90 70 73 70H17Q0 70 0 53V17Q0 0 17 0ZM39 23V47Q39 51 45 51Q51 51 51 47V23Q51 19 45 19Q39 19 39 23Z",
  S: "M17 0H88V15H40Q35 15 35 20Q35 24 40 24H72Q90 24 90 39V52Q90 70 72 70H1V54H50Q55 54 55 49Q55 45 50 45H17Q0 45 0 30V16Q0 0 17 0Z",
  T: "M5 0H85Q90 0 90 5V21H63V70H26V21H0V5Q0 0 5 0Z",
  C: "M17 0H89V21H42Q36 21 36 27V43Q36 49 42 49H89V70H17Q0 70 0 53V17Q0 0 17 0Z",
  A: "M15 0H75Q90 0 90 15V70H53V49H36V70H0V15Q0 0 15 0ZM37 29H52V23Q52 18 45 18Q37 18 37 23Z",
  R: "M7 0H73Q89 0 89 14V31Q89 41 78 44L92 70H52L40 48H36V70H0V7Q0 0 7 0ZM36 18V29H54Q59 29 59 24Q59 18 54 18Z",
  D: "M0 0H67Q91 0 91 24V46Q91 70 67 70H0ZM36 20V50H43Q53 50 53 41V29Q53 20 43 20Z"
};
const acidWordmark = new Path2D();
for (const [i, letter] of Array.from("POSTCARD").entries()) {
  acidWordmark.addPath(new Path2D(acidLetters[letter]), new DOMMatrix().translate(i * 95, 0));
}

const acidPrintCache = new WeakMap();
const silverInks = [
  [0,13,14,21], [.14,39,38,51], [.32,116,111,132], [.47,211,215,227], [.54,242,244,245],
  [.65,87,83,109], [.74,61,60,76], [.90,177,179,193], [1,249,249,247]
];
const acidInks = [
  [0,218,255,44], [.24,162,230,105], [.44,139,137,252],
  [.67,107,66,224], [.87,49,27,103], [1,27,17,61]
];

function acidToneTable(stops) {
  const table = new Uint8Array(256 * 3);
  let band = 1;
  for (let level = 0; level < 256; level++) {
    const tone = level / 255;
    while (band < stops.length - 1 && tone > stops[band][0]) band++;
    const low = stops[band-1], high = stops[band];
    const f = (tone - low[0]) / (high[0] - low[0]);
    for (let j = 0; j < 3; j++) table[3*level+j] = Math.round(low[j+1] + f*(high[j+1] - low[j+1]));
  }
  return table;
}
const silverTone = acidToneTable(silverInks), colourTone = acidToneTable(acidInks);

// The silhouette follows the actual flagon in the museum photograph's central strip.
// Keep the irregular lace, hands and full skirt on the original coordinate grid.
const flagonEdge = new Path2D(
  "M106 42 L107 29 Q112 16 127 20 Q143 20 147 36 L154 18 L163 24 L167 38 " +
  "Q183 42 189 63 L194 80 L204 78 L216 96 L210 114 Q222 118 224 143 " +
  "Q238 141 242 153 Q242 172 221 184 Q210 184 216 201 L212 229 " +
  "Q215 247 224 259 L224 272 L218 275 Q229 300 223 318 Q242 326 236 346 " +
  "L228 358 L221 400 L210 405 Q209 424 216 444 Q223 471 222 505 " +
  "Q220 531 229 550 Q235 570 222 578 Q221 599 209 601 Q123 615 66 594 " +
  "Q42 587 42 569 Q42 553 47 539 L46 495 Q46 470 49 455 Q54 424 49 397 " +
  "Q46 371 51 348 L50 329 L37 316 L28 312 L22 324 L19 316 L14 314 " +
  "Q19 301 31 294 L35 279 L35 248 L39 242 L33 215 L32 198 L39 196 " +
  "L31 182 L37 167 L41 143 Q43 130 55 119 L49 111 L59 98 L48 96 " +
  "L54 84 L72 79 L78 66 L71 58 L74 44 L87 42 L96 49 Z"
);

function openBagHandle(image) {
  const w=image.width, h=image.height, data=image.data;
  const seed=Math.round(h*.17)*w + Math.floor(w/2);
  const background=data.slice(seed*4,seed*4+3);
  // The prepared bags share a studio backdrop; the open handle encloses a small
  // piece of it that a cut from the outer edge cannot reach.
  const todo=[seed], visited=new Uint8Array(w*h);
  const maxY=Math.floor(h*.35), minX=Math.floor(w*.24), maxX=Math.floor(w*.76);
  while(todo.length) {
    const index=todo.pop();
    if(visited[index]) continue;
    visited[index]=1;
    const x=index%w, y=Math.floor(index/w), i=4*index;
    if(x<minX || x>maxX || y<1 || y>maxY || data[i+3]===0) continue;
    const delta=Math.max(Math.abs(data[i]-background[0]), Math.abs(data[i+1]-background[1]), Math.abs(data[i+2]-background[2]));
    if(delta>16) continue;
    data[i+3]=0;
    todo.push(index-1,index+1,index-w,index+w);
  }
}

function acidPrint(image, kind) {
  if (acidPrintCache.has(image)) return acidPrintCache.get(image);
  // The photographic flagon occupies only the central strip of the published scan;
  // the lower edge of the gown's studio view contains a photographic colour ruler.
  const sx = kind === "jug" ? Math.round(image.width * .319) : 0;
  const sw = kind === "jug" ? Math.round(image.width * .377) : image.width;
  const sh = kind === "gown" ? Math.round(image.height * .936) : image.height;
  const prints = {};
  for (const [name, table] of [["silver", silverTone], ["colour", colourTone]]) {
    const plate = document.createElement("canvas");
    plate.width = sw; plate.height = sh;
    const g = plate.getContext("2d", {willReadFrequently:true});
    if (kind==="jug") {
      g.save();
      g.scale(sw/290,sh/614);
      g.clip(flagonEdge);
      g.drawImage(image,sx,0,sw,sh,0,0,290,614);
      g.restore();
    } else {
      g.drawImage(image,sx,0,sw,sh,0,0,sw,sh);
    }
    const frame = g.getImageData(0, 0, sw, sh), px = frame.data;
    if (kind==="bag") openBagHandle(frame);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const i = (y*sw+x)*4;
        const gray = Math.round(.299*px[i]+.587*px[i+1]+.114*px[i+2]);
        // Hold the actual pattern through the metallic toe and shoulder of the print.
        for (let j = 0; j < 3; j++) px[i+j] = table[3*gray+j]*.84 + px[i+j]*.16;
        if (kind === "gown") {
          px[i+3] *= Math.max(0,Math.min(1,(gray-33)/36));
        } else if (kind === "view") {
          // Full installation views and textile details keep their photographic context.
          // Feather only the outside edge so it meets the dark printing stock.
          const edge = Math.min(x/(sw*.082),(sw-1-x)/(sw*.082),y/(sh*.085),(sh-1-y)/(sh*.085),1);
          px[i+3] *= edge*edge*(3-2*edge);
        }
      }
    }
    g.putImageData(frame, 0, 0);
    prints[name] = plate;
  }
  const result = {...prints, left:sx/image.width, width:sw/image.width, height:sh/image.height};
  acidPrintCache.set(image,result);
  return result;
}

function acidRail(ctx, x, y1, y2, dir) {
  cardLine(ctx,x,y1,x,y2,"#888392",1.3);
  for (let y=y1,i=0; y<=y2; y+=12,i++) {
    cardLine(ctx,x,y,x+dir*(i%5===0?14:5),y,"#a5a2ae",1.4);
  }
}

function acidHero(ctx, plate, point) {
  const {silver,colour} = plate;
  const scale = Math.min(660/silver.width, 558/silver.height);
  const w = silver.width*scale, h = silver.height*scale, x = 415-w/2, y = 508-h/2;
  ctx.drawImage(silver,x,y,w,h);
  const fx = point ? Math.max(0, Math.min(1, (point.x/100-plate.left)/plate.width)) : .58;
  const fy = point ? Math.max(0, Math.min(1, point.y/100/plate.height)) : .50;
  const cx = x + fx*w, cy = y + fy*h;
  const stripe = Math.max(17,w*.081), tilt = w*.19/h;
  const top = cx+(cy-y)*tilt, bottom = top-h*tilt;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(top-stripe,y); ctx.lineTo(top+stripe,y);
  ctx.lineTo(bottom+stripe,y+h); ctx.lineTo(bottom-stripe,y+h); ctx.closePath(); ctx.clip();
  ctx.drawImage(colour,x,y,w,h);
  ctx.restore();
}

function acidPostage(ctx, source, key, theme) {
  const x = 1281, y = 38, w = 150, h = 137;
  fillArea(ctx,"#d5d2d9",x,y,w,h);
  ctx.fillStyle = theme.paper;
  for(let px=x+6;px<x+w;px+=12) {
    for(const py of [y,y+h]) { ctx.beginPath();ctx.arc(px,py,3.7,0,Math.PI*2);ctx.fill(); }
  }
  for(let py=y+6;py<y+h;py+=12) {
    for(const px of [x,x+w]) { ctx.beginPath();ctx.arc(px,py,3.7,0,Math.PI*2);ctx.fill(); }
  }
  const ix=x+10, iy=y+10, iw=w-20, ih=h-36;
  if (key==="jug") {
    const sw=source.width*.377, dw=sw*ih/source.height;
    fillArea(ctx,"#25242b",ix,iy,iw,ih);
    ctx.drawImage(source,source.width*.319,0,sw,source.height,ix+(iw-dw)/2,iy,dw,ih);
  } else {
    framePhoto(ctx,source,ix,iy,iw,ih,"#25242b");
  }
  cardType(ctx,"SOURCE PHOTO",ix+1,y+h-9,"bold 16px "+mono,"#201d2a",iw);
}

function acidEdition(ctx,c,o,views,design,theme,footer) {
  const sourceIndex = editionSourceIndices(c,o)[0], source = views[sourceIndex];
  const cutout = design && c.type==="a" ? peelPaperObject(design) : null;
  const kind = cutout ? (c.image===2 ? "bag" : "cutout") : !design && c.key==="jug" ? "jug"
    : !design && c.key==="gown" && sourceIndex===0 ? "gown" : "view";
  const plate = acidPrint(cutout || design || source,kind);
  const point = !design && c.type==="a" && c.detail?.i===sourceIndex &&
    Number.isFinite(c.detail.x) && Number.isFinite(c.detail.y) ? c.detail : null;
  ctx.save();

  // The broad flat lettering and the reflective photographic plate have different jobs.
  // Header, ruled information and image share the same left and right edges.
  const l=50, r=781;
  ctx.save();ctx.translate(l,48);ctx.scale((r-l)/756,1.24);
  ctx.fillStyle="#efedf0";ctx.fill(acidWordmark,"evenodd");ctx.restore();
  cardLine(ctx,l,149,r,149,"#b5b2bd",1.4);
  cardType(ctx,"AI & HERITAGE",l,184,"bold 21px "+mono,theme.ink);
  ctx.textAlign="right";
  cardType(ctx,"PROBE "+c.type.toUpperCase()+"  /  "+o.id,r,184,"bold 21px "+mono,theme.accent);
  ctx.textAlign="left";
  cardLine(ctx,l,200,r,200,"#b5b2bd",1.4);
  acidRail(ctx,l,211,800,1);acidRail(ctx,r,211,800,-1);
  acidHero(ctx,plate,point);
  cardLine(ctx,l,811,r,811,"#b5b2bd",1.4);
  cardType(ctx,design?imageRef(o,c):"SOURCE PHOTOGRAPH",l,858,"bold 27px "+mono,theme.accent,r-l);
  cardType(ctx,"Silver and polarised colour",l,891,"22px "+cardSans,theme.ink,r-l);

  // The unprinted writing field has just the object, its museum and a postage mark.
  // When an AI design is the main plate, the stamp carries the unaltered source.
  if (design) acidPostage(ctx,source,c.key,theme);
  else drawStamp(ctx,1328,41,theme.accent,theme.paper,.86);
  ctx.strokeStyle="#8f899c";ctx.lineWidth=1.7;
  for(let i=0;i<3;i++) {
    const yy=131+i*9;
    ctx.beginPath();ctx.moveTo(1157,yy);
    ctx.bezierCurveTo(1198,yy-18,1217,yy+14,1257,yy);
    ctx.quadraticCurveTo(1270,yy-5,1283,yy-3);ctx.stroke();
  }
  const titleBottom=wrappedHeading(ctx,o.name,835,268,600,"bold 49px "+cardSans,53,theme.ink);
  cardType(ctx,o.place,836,titleBottom+1,"23px "+cardSans,"#d1cbd6",603);
  ctx.restore();
}
