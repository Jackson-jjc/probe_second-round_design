"use strict";
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
const designURL=(key,type,n)=>"images/"+key+"-"+type+n+".jpg";
function photographs(key){
 const o=objects[key];
 return '<div class="photos">'+o.photo.map((url,i)=>'<figure><a href="'+url+'" target="_blank" rel="noopener noreferrer"><img src="'+o.cardPhoto[i]+'" alt="'+esc(o.alt[i])+'"></a><figcaption><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(o.labels[i])+' ↗</a></figcaption></figure>').join("")+'</div>';
}
function cardHTML(c){
 const o=objects[c.key],h=c.image?'<img class="designpic" src="'+designURL(c.key,c.type,c.image)+'" alt="'+esc(o[c.type][c.image-1])+'"><p class="creditline">Prepared AI design · '+o.id+'–'+c.type.toUpperCase()+c.image+' · '+esc(o[c.type][c.image-1])+'</p>':'';
 return '<article class="wallcard"><p class="kicker">Postcard '+c.type.toUpperCase()+' · '+o.id+'</p><h3>'+esc(o.name)+'</h3>'+photographs(c.key)+'<p class="creditline">'+esc(o.credit)+'</p>'+h+'<p class="words" dir="auto">'+esc(c.words)+'</p>'+(c.label?'<p class="proposal"><small>Proposed museum label</small><br>'+esc(c.label)+'</p>':'')+'<a class="source-url" href="'+o.url+'" target="_blank" rel="noopener">Source record ↗</a></article>';
}
async function downloadCard(c,returnCanvas=false){
 const o=objects[c.key];async function bitmap(url){const im=new Image();im.src=url;await im.decode();return im;}
 const [design,...views]=await Promise.all([c.image?bitmap(designURL(c.key,c.type,c.image)):null,...o.cardPhoto.map(bitmap)]);
 const canvas=document.createElement("canvas");canvas.width=1500;const g=canvas.getContext("2d");
 function lines(input,width){let result=[""];for(const word of Array.from(new Intl.Segmenter(undefined,{granularity:"word"}).segment(input),s=>s.segment)){
  if(word.includes("\n")){for(const ch of word)if(ch==="\n")result.push("");continue;}
  if(g.measureText(result.at(-1)+word).width>width&&result.at(-1))result.push("");
  for(const ch of word){if(g.measureText(result.at(-1)+ch).width>width&&result.at(-1))result.push("");result[result.length-1]+=ch;}
 }return result;}
 g.font='34px Georgia, "Microsoft YaHei", sans-serif';const body=lines(c.words,1380);
 const label=c.label?lines("Museum label · "+c.label,1380):[];
 canvas.height=Math.max(930,800+(body.length+label.length)*48+(label.length?36:0));
 const ink="#253e34";g.fillStyle="#faf6ea";g.fillRect(0,0,1500,canvas.height);g.fillStyle=ink;g.fillRect(0,0,1500,82);g.font="36px Georgia";g.fillStyle="#fffbed";g.fillText("AI & Heritage",50,54);g.textAlign="right";g.font="23px monospace";g.fillText("ROUND 1   /   POSTCARD "+c.type.toUpperCase(),1450,52);g.textAlign="left";
 function box(img,x,y,w,h){g.fillStyle="#e9e5d7";g.fillRect(x,y,w,h);const z=Math.min(w/img.width,h/img.height);g.drawImage(img,x+(w-img.width*z)/2,y+(h-img.height*z)/2,img.width*z,img.height*z);}
 const left=design?590:1400;if(views.length){views.forEach((v,i)=>box(v,50+i*(left/views.length),106,left/views.length-5,345));}else{g.fillStyle="#e6e9db";g.fillRect(50,106,left,345);g.fillStyle=ink;g.font="25px monospace";g.fillText("SOURCE RECORD   /   "+o.id,78,172);g.font="36px Georgia";g.fillText(o.name,78,260);g.font="25px Georgia";lines(o.place,left-62).forEach((s,i)=>g.fillText(s,78,308+i*32));}
 if(design)box(design,665,106,785,345);
 g.fillStyle=ink;g.font="21px monospace";g.fillText(c.key==="gown"?"V&A   /   BACK VIEW AND SILK DETAIL":"SOURCE PHOTOGRAPH   /   "+o.id,50,489);if(design)g.fillText("PREPARED AI IMAGE   /   "+o.id+"–"+c.type.toUpperCase()+c.image,665,489);
 g.font="54px Georgia";g.fillText(o.name,50,577);g.font='34px Georgia, "Microsoft YaHei", sans-serif';body.forEach((t,i)=>g.fillText(t,50,640+i*48));
 g.fillStyle="#824b37";
 label.forEach((t,i)=>g.fillText(t,50,676+(body.length+i)*48));
 g.fillStyle=ink;g.font="23px Georgia";g.fillText(o.credit,50,canvas.height-104);g.font="21px monospace";g.fillText(o.url,50,canvas.height-63);
 if(returnCanvas)return canvas;
 const blob=await new Promise(resolve=>canvas.toBlob(resolve));const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=o.id+"-"+c.type.toUpperCase()+"-postcard.png";a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
