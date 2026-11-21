"use strict";

// Each plate is a single photograph. Its oblique band is a polarised print of the
// same pixels, so the change in colour keeps the contour in registration.
const acidPlates = new WeakMap();
function polarisedPlate(img) {
  if (acidPlates.has(img)) return acidPlates.get(img);
  const plate=document.createElement("canvas");
  const scale=Math.min(1,1000/Math.max(img.width,img.height));
  plate.width=Math.round(img.width*scale);
  plate.height=Math.round(img.height*scale);
  const surface=plate.getContext("2d",{willReadFrequently:true});
  surface.drawImage(img,0,0,plate.width,plate.height);
  const frame=surface.getImageData(0,0,plate.width,plate.height);
  const pixels=frame.data;
  // Dark ground turns phosphor green and bright printed surfaces turn violet.
  const stops=[[0,222,255,49],[.14,169,251,91],[.34,124,171,215],[.55,102,85,203],
               [.72,60,31,128],[.88,34,16,79],[1,16,14,34]];
  for(let i=0;i<pixels.length;i+=4){
    const luma=(.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2])/255;
    let n=1;while(n<stops.length-1&&luma>stops[n][0])n++;
    const a=stops[n-1],b=stops[n],f=(luma-a[0])/(b[0]-a[0]);
    for(let channel=1;channel<=3;channel++)pixels[i+channel-1]=a[channel]+f*(b[channel]-a[channel]);
  }
  surface.putImageData(frame,0,0);
  acidPlates.set(img,plate);
  return plate;
}

function acidSpecular(ctx,top,bottom) {
  const chrome=ctx.createLinearGradient(0,top,0,bottom);
  const bands=[[0,"#3e3b76"],[.14,"#b8c8ff"],[.28,"#f6fbff"],[.42,"#abafd2"],
    [.48,"#5e669b"],[.505,"#1b1736"],[.54,"#6f60aa"],[.71,"#b9b6ff"],
    [.83,"#f8fbff"],[.94,"#92999f"],[1,"#d5ff62"]];
  for(const [offset,colour] of bands)chrome.addColorStop(offset,colour);
  return chrome;
}

function acidOrbit(ctx,x,y,rx,ry,angle,front) {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const metal=acidSpecular(ctx,-ry,ry);
  // The return arc narrows to a point as the strip twists away from the viewer.
  ctx.beginPath();
  const start=front?.13:Math.PI*.95, end=front?Math.PI*.92:Math.PI*2.05;
  const count=90;
  for(let i=0;i<=count;i++){
    const t=start+(end-start)*i/count;
    const w=1+10*Math.pow(Math.sin(i*Math.PI/count),1.65);
    const px=(rx+w)*Math.cos(t),py=(ry+w*.4)*Math.sin(t);
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  }
  for(let i=count;i>=0;i--){
    const t=start+(end-start)*i/count;
    ctx.lineTo((rx-1)*Math.cos(t),(ry-1)*Math.sin(t));
  }
  ctx.closePath();ctx.fillStyle=metal;ctx.fill();
  ctx.restore();
}

function acidSpark(ctx,x,y,size){
  ctx.save();ctx.translate(x,y);ctx.rotate(.23);
  const s=size;
  ctx.beginPath();ctx.moveTo(0,-s);
  ctx.quadraticCurveTo(.08*s,-.09*s,.78*s,0);
  ctx.quadraticCurveTo(.08*s,.09*s,0,s);
  ctx.quadraticCurveTo(-.08*s,.09*s,-.78*s,0);
  ctx.quadraticCurveTo(-.08*s,-.09*s,0,-s);
  ctx.closePath();ctx.fillStyle="#eaffaa";ctx.fill();ctx.restore();
}

function acidHero(ctx,img,card,sourceOnly) {
  // The cuff/bag mock-ups have a neutral studio margin. Trim that margin while
  // retaining their full height. Visitor-message illustrations retain full width.
  const inputW=img.naturalWidth||img.width,inputH=img.naturalHeight||img.height;
  // The supplied jug scan includes broad white margins outside the photograph.
  let trim=1;
  if(sourceOnly&&card.key==="jug")trim=.41;
  else if(!sourceOnly&&card.type==="a")trim=.78;
  const sw=inputW*trim, sh=inputH;
  const fit=Math.min(714/sw,610/sh);
  const w=sw*fit,h=sh*fit;
  const x=401-w/2,y=526-h/2;
  ctx.save();
  const path=new Path2D();
  path.moveTo(x+28,y);path.lineTo(x+w-52,y);path.lineTo(x+w,y+52);
  path.lineTo(x+w,y+h-23);path.lineTo(x+w-23,y+h);path.lineTo(x+47,y+h);
  path.lineTo(x,y+h-47);path.lineTo(x,y+28);path.closePath();
  ctx.clip(path);
  const draw=image=>{
    const imageWidth=image.naturalWidth||image.width,imageHeight=image.naturalHeight||image.height;
    ctx.drawImage(image,imageWidth*(1-trim)/2,0,imageWidth*trim,imageHeight,x,y,w,h);
  };
  draw(img);
  // A diagonal sliver crosses the plate. Most of the selected image stays in its original colours.
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w*.40,y);ctx.lineTo(x+w*.17,y+h);ctx.lineTo(x,y+h);ctx.closePath();
  ctx.clip();draw(polarisedPlate(img));
  ctx.restore();
  ctx.save();ctx.strokeStyle="#aca5cd";ctx.lineWidth=1.4;ctx.stroke(path);ctx.restore();
}

function acidEdition(ctx,c,o,views,design,theme,footer) {
  const source=views[c.type==="a"&&views[c.detail?.i]?c.detail.i:0];
  const hero=design||source;
  const {ink,accent}=theme;
  ctx.save();
  const glow=ctx.createRadialGradient(316,465,22,315,465,570);
  glow.addColorStop(0,"#6243ce");glow.addColorStop(.59,"#36216b");glow.addColorStop(1,theme.paper);
  fillArea(ctx,glow,0,0,878,936);

  // Masthead uses its own metallic letterforms to leave the visitor's words plain.
  cardType(ctx,"AI & HERITAGE",55,44,"bold 22px "+mono,ink);
  cardType(ctx,"OBJECT "+o.id+"   /   PROBE "+c.type.toUpperCase(),1026,44,"bold 20px "+mono,ink,345);
  cardLine(ctx,52,65,1448,65,"#6b6180",1.5);
  ctx.save();ctx.translate(58,199);ctx.transform(1,-.027,-.16,1,0,0);ctx.scale(1.52,1);
  ctx.font="900 137px Arial Black, Arial, sans-serif";
  ctx.strokeStyle="#080713";ctx.lineWidth=6;ctx.strokeText("POSTCARD",4,5);
  ctx.fillStyle=acidSpecular(ctx,-104,7);ctx.fillText("POSTCARD",0,0);
  ctx.strokeStyle="#c4c6f1";ctx.lineWidth=.9;ctx.strokeText("POSTCARD",0,0);ctx.restore();
  // A die-cut postage mark. Its perforations and rosette are original to this worktable.
  ctx.save();ctx.translate(1374,80);ctx.rotate(.08);
  drawStamp(ctx,0,0,accent,theme.paper,.61);ctx.restore();

  acidOrbit(ctx,397,520,439,114,-.46,false);
  acidHero(ctx,hero,c,!design);
  acidOrbit(ctx,397,520,439,114,-.46,true);
  acidSpark(ctx,88,715,34);acidSpark(ctx,704,311,17);

  const key=c.type==="a"?"MAKING":"EXCHANGE";
  cardType(ctx,key,54,885,"bold 21px "+mono,accent);
  const desc=design?imageRef(o,c):"SOURCE PHOTOGRAPH";
  cardType(ctx,desc+"   /   POLARISED BAND",54,915,"20px "+mono,ink,700);

  const titleWidth=design?404:606;
  const bottom=wrappedHeading(ctx,o.name,834,278,titleWidth,"italic bold 52px "+serif,54,ink);
  cardType(ctx,o.place,835,bottom+8,"23px "+cardSans,"#c5bdd5",titleWidth);
  if(design){
    const x=1263,y=211,w=179,h=173;
    fillArea(ctx,accent,x-4,y-4,w+8,h+8);
    if(c.key==="jug"){
      fillArea(ctx,"#242230",x,y,w,h);
      const sh=source.height,sw=.41*source.width;
      const dw=h*sw/sh;
      ctx.drawImage(source,(source.width-sw)/2,0,sw,sh,x+(w-dw)/2,y,dw,h);
    }else{
      framePhoto(ctx,source,x,y,w,h,"#242230");
    }
    smallType(ctx,"SOURCE PHOTO",x,y+h+29,ink,w);
  }
  cardLine(ctx,835,488,1442,488,"#787184",2);
  ctx.restore();
}
