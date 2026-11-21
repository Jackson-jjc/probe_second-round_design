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

// Marginal ticks sit outside the image, like the rails on a specimen sheet.
function acidRail(ctx,x,y,bottom,direction) {
  const edge="#726b80";
  cardLine(ctx,x,y,x,bottom,edge,1.4);
  for(let at=y,index=0;at<=bottom;at+=17,index++){
    const length=index%4===0?17:7;
    cardLine(ctx,x,at,x+direction*length,at,edge,1.4);
  }
}

function acidHero(ctx,img,card,sourceOnly) {
  const imageWidth=img.naturalWidth||img.width;
  const imageHeight=img.naturalHeight||img.height;
  let trim=1;
  if(sourceOnly&&card.key==="jug")trim=.41;
  else if(!sourceOnly&&card.type==="a")trim=.78;
  const croppedWidth=imageWidth*trim;
  const scale=Math.min(651/croppedWidth,554/imageHeight);
  const w=croppedWidth*scale, h=imageHeight*scale;
  const x=421-w/2, y=514-h/2;

  // Both impressions use exactly the same source rectangle. The coloured strip
  // crosses the selected point on a marked source view, or the left third by default.
  function draw(image){
    const sw=image.naturalWidth||image.width,sh=image.naturalHeight||image.height;
    ctx.drawImage(image,sw*(1-trim)/2,0,sw*trim,sh,x,y,w,h);
  }
  draw(img);
  const point=sourceOnly&&card.type==="a"?card.detail:null;
  let centre=.32;
  if(point&&Number.isFinite(point.x)&&Number.isFinite(point.y)){
    const inCrop=(point.x/100-(1-trim)/2)/trim;
    centre=Math.max(.10,Math.min(.90,inCrop+.17*(point.y/100-.5)));
  }
  const cx=x+w*centre;
  const halfWidth=.094*w, slant=.085*w;
  ctx.save();
  ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.beginPath();
  ctx.moveTo(cx-halfWidth+slant,y);
  ctx.lineTo(cx+halfWidth+slant,y);
  ctx.lineTo(cx+halfWidth-slant,y+h);
  ctx.lineTo(cx-halfWidth-slant,y+h);
  ctx.closePath();ctx.clip();draw(polarisedPlate(img));
  ctx.restore();
}

function acidEdition(ctx,c,o,views,design,theme,footer) {
  const source=views[editionSourceIndices(c,o)[0]];
  const {ink,accent}=theme;
  const edge="#81798c";
  ctx.save();

  // Give the metallic letters one broad register. The dark correspondence field
  // and the untouched parts of each photograph carry the finer information.
  ctx.save();
  ctx.translate(49,141);
  ctx.font="900 151px Arial Black, Arial, sans-serif";
  const word="POSTCARD";
  ctx.scale(1247/ctx.measureText(word).width,1);
  ctx.transform(1,0,-.105,1,0,0);
  ctx.fillStyle=acidSpecular(ctx,-110,2);
  ctx.fillText(word,0,0);
  ctx.lineWidth=.65;ctx.strokeStyle="#dad9ef";ctx.strokeText(word,0,0);
  ctx.restore();
  ctx.save();ctx.translate(1352,39);ctx.rotate(.045);
  drawStamp(ctx,0,0,accent,theme.paper,.75);ctx.restore();

  cardLine(ctx,51,167,1448,167,edge,1.5);
  cardType(ctx,"AI & HERITAGE",52,197,"bold 20px "+mono,ink);
  const action=c.type==="a"?"MAKING":"EXCHANGE";
  cardType(ctx,"PROBE "+c.type.toUpperCase()+"  /  "+action+"     ·     OBJECT "+o.id,834,197,"bold 20px "+mono,accent);
  cardLine(ctx,51,211,1448,211,edge,1.5);

  const field=ctx.createLinearGradient(51,234,789,805);
  field.addColorStop(0,"#090911");field.addColorStop(.72,"#171424");field.addColorStop(1,"#191524");
  fillArea(ctx,field,51,223,740,589);
  acidRail(ctx,60,239,795,1);
  acidRail(ctx,782,239,795,-1);
  acidHero(ctx,design||source,c,!design);

  // The rail continues below the print as a real source caption.
  cardLine(ctx,51,824,791,824,edge,1.5);
  cardType(ctx,design?imageRef(o,c):"SOURCE PHOTOGRAPH",54,869,"bold 27px "+mono,accent,705);
  cardType(ctx,"Polarised colour print",54,903,"22px "+cardSans,ink);
  cardLine(ctx,809,222,809,footer-23,"#514a5b",1.3);

  const titleWidth=design?408:603;
  const bottom=wrappedHeading(ctx,o.name,834,298,titleWidth,"bold 49px "+cardSans,53,ink);
  cardType(ctx,o.place,835,bottom+1,"23px "+cardSans,"#d1cbd6",titleWidth);
  if(design){
    const x=1269,y=247,w=171,h=152;
    fillArea(ctx,"#84808d",x-1,y-1,w+2,h+2);
    if(c.key==="jug"){
      fillArea(ctx,"#242230",x,y,w,h);
      const sw=.41*source.width,sh=source.height,dw=h*sw/sh;
      ctx.drawImage(source,(source.width-sw)/2,0,sw,sh,x+(w-dw)/2,y,dw,h);
    }else{
      framePhoto(ctx,source,x,y,w,h,"#242230");
    }
    smallType(ctx,"SOURCE PHOTO",x,y+h+27,ink,w);
  }
  cardLine(ctx,835,472,1442,472,edge,1.5);
  ctx.restore();
}
