"use strict";
const work=document.querySelector("#work"),dialog=document.querySelector("#review"),wall=[],messages=[],own=new Set();
let route="",selected={a:"gown",b:"gown"},drafts={},pending=null,timer;
const keys=["gown","jug","knit"];
const kit={gown:["fabric","flower","strip"],jug:["strip","leaf","leaf"],knit:["fabric","loop","loop"]};
const names={fabric:"Cloth",flower:"Paper flower",strip:"Paper strip",leaf:"Paper leaf",loop:"Cord loop"};
const unique=()=>crypto.randomUUID();
function say(text){const box=document.querySelector("#notice");box.textContent=text;clearTimeout(timer);timer=setTimeout(()=>box.textContent="",5000);}
function state(t,k){const id=t+k;if(!drafts[id])drafts[id]=t==="a"?{pieces:kit[k].map((kind,i)=>({kind,x:[25,50,73][i],y:[48,57,40][i],angle:0,fold:false})),piece:0,generated:0,image:0,words:"",label:"",custom:""}:{text:"",parent:"",generated:0,image:0,make:true,from:"",display:"thread"};return drafts[id];}
const btn=(action,label,active)=>'<button type="button" data-do="'+action+'"'+(active===undefined?"":' aria-pressed="'+active+'"')+'>'+esc(label)+'</button>';
const row=html=>'<div class="row">'+html+'</div>';
const opt=(v,text,chosen)=>'<option value="'+esc(v)+'" '+(v===chosen?"selected":"")+'>'+esc(text)+'</option>';
const ownMessages=k=>messages.filter(m=>m.key===k&&own.has(m.id));
const thread=k=>messages.filter(m=>m.key===k);
function nOf(k,id){return thread(k).findIndex(m=>m.id===id)+1;}
function sourcePhotos(k){
 if(route!=="a")return photographs(k);
 const o=objects[k],current=state("a",k).detail;
 return '<p class="key">Touch a detail to mark it for making. The link under each view opens the full photograph.</p><div class="photos">'+o.photo.map((url,i)=>{
  const marked=current?.i===i;
  return '<figure><button type="button" class="detail-photo" data-photo="'+i+'" aria-label="Mark a detail in '+esc(o.labels[i])+'" title="Click to mark. Use arrow keys to adjust."><img referrerpolicy="no-referrer" src="'+o.cardPhoto[i]+'" alt="'+esc(o.alt[i])+'">'+(marked?'<i class="pin" aria-hidden="true" style="left:'+current.x+'%;top:'+current.y+'%"></i>':'')+'</button><figcaption><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(o.labels[i])+' ↗</a></figcaption></figure>';
 }).join("")+'</div>';
}
function source(k){const o=objects[k];return '<aside class="srcbox"><p class="kicker">Source '+o.id+' · '+esc(o.place)+'</p><h2>'+esc(o.name)+'</h2>'+sourcePhotos(k)+'<p class="creditline">'+esc(o.credit)+'</p><p>'+esc(o.fact)+'</p><a class="source-url" target="_blank" rel="noopener" href="'+o.url+'">Open collection or exhibition record ↗</a></aside>';}
function design(k,t,n){const o=objects[k];return '<figure><img src="'+designURL(k,t,n)+'" alt="'+esc(o[t][n-1])+'"><figcaption>Prepared AI image · '+o.id+'–'+t.toUpperCase()+n+'<br>'+esc(o[t][n-1])+'</figcaption></figure>';}
function pieceHTML(p,i,s){const sel=i===s.piece;return '<button type="button" class="piece '+p.kind+(sel?" selected":"")+(p.fold?" folded":"")+'" aria-label="'+names[p.kind]+' '+(i+1)+'" aria-pressed="'+sel+'" data-piece="'+i+'" style="left:'+p.x+'%;top:'+p.y+'%;--angle:'+p.angle+'deg;z-index:'+(sel?10:i+1)+'">'+(p.kind==="flower"?"✿":"")+'</button>';}
function generatedPanel(t,k,s){
 const hasPreview=Boolean(s.generated);
 const isMaking=t==="a";
 const prompt=isMaking
  ? "This website draws a saved design at random from the examples for your chosen object. At the study table, the researcher chooses a prepared design based on how you arranged the materials."
  : "This demo draws one of the prepared AI images for your chosen object.";
 const action=isMaking
  ? (hasPreview?"Show another prepared design":"Show a prepared design")
  : (hasPreview?"Generate another preview ↻":"Generate a preview ✦");
 const result=hasPreview
  ? '<div class="generated-result">'+design(k,t,s.generated)
    +'<p class="key">Demo response · randomly selected prepared image</p>'
    +btn("use-generated","Use this image in my postcard")+'</div>'
  : '<p class="blank">Your image will appear here. You can try another before making your card.</p>';
 return '<section class="benchpanel" id="generate-preview">'
  +'<p class="kicker">2 · '+(isMaking?'Explore prepared designs':'Generate a preview')+'</p><h2>See a possible image</h2>'
  +'<p>'+prompt+'</p>'
  +row(btn("generate",action))
  +result+'<details><summary>Browse the prepared images</summary><div class="designs">'
  +[1,2].map(n=>design(k,t,n)).join("")+'</div></details></section>';
}
function selectedImage(t,k,s){
 return s.image
  ? '<div class="chosen-preview">'+design(k,t,s.image)+'<span>Selected for your postcard ✓</span></div>'
  : '<p class="key">You can make a card with the source and your words, or choose an image above.</p>';
}
function a(k,s){
 const o=objects[k];
 const imageOptions=[[0,"Source only · leave the AI image off"],...o.a.map((name,i)=>[i+1,name])];
 const labelOptions=[["","Leave undecided"],["keep","Keep those words"],["change","Write a different label"],["omit","Leave the label off"]];
 const custom=s.label==="change"?'<label class="form">My museum label<input type="text" bind="custom" dir="auto" value="'+esc(s.custom)+'"></label>':"";
 return '<section class="benchpanel" id="make-input"><p class="kicker">1 · Look and arrange</p>'
  +'<h2>Arrange a detail from the photograph</h2><p>'+esc(o.make)+'</p>'
  +'<div class="mat" aria-label="Material arrangement">'+s.pieces.map((p,i)=>pieceHTML(p,i,s)).join("")+'</div>'
  +'<p class="key">Drag a piece or focus it and use the arrow keys. Rotate or fold the selected piece. At the table, use the real materials.</p>'
  +row(btn("rotate","Rotate ↻")+btn("fold","Fold / open")+btn("resetmat","Reset mat")+'<a class="linkbar" target="_blank" href="making-mat.pdf">Print the A4 mat ↗</a>')
  +'</section>'+generatedPanel("a",k,s)
  +'<section class="benchpanel" id="compose-card"><p class="kicker">3 · Make your postcard</p>'
  +'<h2>Put the image and your words together</h2><div id="selected-image">'+selectedImage("a",k,s)+'</div>'
  +'<label class="form">Image on my postcard<select bind="image">'+imageOptions.map(([n,l])=>opt(n,l,s.image)).join("")+'</select></label>'
  +'<label class="form">My caption (optional)<textarea bind="words" dir="auto" placeholder="What did you keep, change or miss?">'+esc(s.words)+'</textarea></label>'
  +'<div class="proposal"><strong>Proposed museum label</strong>'
  +'<p>“Each version continues the original work.” Would you keep these words, change them or leave them off? Which detail led you there?</p>'
  +'<label class="form">My display choice<select bind="label">'+labelOptions.map(([n,l])=>opt(n,l,s.label)).join("")+'</select></label>'+custom+'</div>'
  +btn("review","Create my postcard →")
  +'<p class="key">See the assembled card, then download it or add it to the postcard wall.</p>'
  +'<a href="#probe-b">Continue to Probe B →</a></section>';
}

function relation(m){if(!m.parent)return "New interpretation";if(m.parent==="starter")return "Reply to AI starter";return "Reply to message "+nOf(m.key,m.parent);}
function bubble(m,allowReply=false){return '<article class="message" id="msg-'+m.id+'"><small>Message '+nOf(m.key,m.id)+' · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p>'+(allowReply?btn("reply:"+m.id,"Reply to this message"):"")+'</article>';}
function threadHTML(k,replies){return thread(k).length?thread(k).map(m=>bubble(m,replies)).join(""):'<p class="blank">No visitor messages yet. Start with something you noticed, or respond to the labelled starter.</p>';}
function b(k,s){const o=objects[k],list=thread(k),mine=ownMessages(k);return '<section class="benchpanel"><p class="kicker">Conversation board</p><h2>'+esc(o.name)+' · original messages</h2><p>'+esc(o.talk)+'</p><div class="thread">'+threadHTML(k,true)+'</div><details><summary>Open a prepared AI starter</summary><p>'+esc(o.starter)+'</p><p lang="zh">'+esc(o.zh)+'</p><small>Prepared Chinese translation · fictional starter</small></details></section><section class="benchpanel" id="make-input"><p class="kicker">1 · Write your message</p><h2>Leave a message or a reply</h2><label class="form">Responding to<select bind="parent">'+opt("","The object · new message",s.parent)+opt("starter","Prepared AI starter",s.parent)+list.map(m=>opt(m.id,"Message "+nOf(k,m.id)+" · "+m.text.slice(0,36),s.parent)).join("")+'</select></label><label class="form">My words, in any language<textarea bind="text" dir="auto" placeholder="Write an observation, a question or a clarification.">'+esc(s.text)+'</textarea></label></section>'+generatedPanel("b",k,s)+'<section class="benchpanel" id="compose-card"><p class="kicker">3 · Make your postcard</p><h2>Put your message on a card</h2><label><input type="checkbox" bind="make" '+(s.make?"checked":"")+'> Make a postcard</label>'+(s.make?'<div id="selected-image">'+selectedImage("b",k,s)+'</div><label class="form">Words on my postcard<select bind="from">'+opt("","My new message above",s.from)+mine.map(m=>opt(m.id,"My message "+nOf(k,m.id)+" · "+m.text.slice(0,36),s.from)).join("")+'</select></label><label class="form">Accompanying image<select bind="image">'+opt(0,"Words with the source only",s.image)+[1,2].map(n=>opt(n,o.b[n-1],s.image)).join("")+'</select></label><div class="proposal"><strong>Future museum display</strong><p>Would the next visitor understand the exchange if they saw just your card? If this is the first message, what would you like someone to respond to?</p>'+row(btn("display:alone","Preview card alone",s.display==="alone")+btn("display:thread","Preview beside its thread",s.display==="thread"))+'</div>':'')+btn("review",s.make?"Create my postcard →":"Review my message")+'</section>'+related(k);}
function cardActions(c){return row(btn("download:"+c.id,"Download postcard PNG ↓")+(c.type==="b"?btn("locate:"+c.message,"Read linked message"):""));}
function related(k){const items=wall.filter(c=>c.key===k);return items.length?'<section class="benchpanel"><h2>Cards beside this thread</h2><div class="wallgrid">'+items.map(c=>'<div>'+cardHTML(c)+cardActions(c)+'</div>').join("")+'</div></section>':'';}
function replyInvitation(){
 const first=wall.find(card=>card.type==="b");
 if(!first || !own.has(first.message))return "";
 return '<section class="benchpanel"><h2>Try the next visitor’s reply</h2>'
  +'<p>Stay in this tab and take the next visitor’s turn. Read the first card’s message, then reply in your own words.</p>'
  +btn("handoff:"+first.message,"Start next visitor and reply →")+'</section>';
}
function postcards(){return replyInvitation()+'<section class="benchpanel"><h2>Checked cards from this rehearsal</h2>'+(wall.length?'<div class="wallgrid">'+wall.map(c=>'<div>'+cardHTML(c)+cardActions(c)+'</div>').join("")+'</div>':'<p class="blank">Your wall starts empty. Make a card in <a href="#probe-a">A</a> or <a href="#probe-b">B</a>, review it, then add it here.</p>')+'</section><details class="benchpanel samplelinks"><summary>Two prepared postcard examples</summary><p>Fictional rehearsal captions. Your cards use your own words.</p><div class="wallgrid"><a href="postcards/gown-a.png"><img src="postcards/gown-a.png" alt="Gown making postcard with the two original V&A views">Open A sample ↗</a><a href="postcards/knit-b.png"><img src="postcards/knit-b.png" alt="Gardez L’Eau response postcard with the source photograph">Open B sample ↗</a></div></details>';}
function render(){route=location.hash==="#probe-b"?"b":location.hash==="#postcards"?"wall":"a";document.querySelector("#title").textContent={a:"Make with the object",b:"Read the object together",wall:"Postcard wall"}[route];document.querySelector("#lead").textContent={a:"Choose a source, look closely, then make a cuff or bag postcard from your own arrangement and words.",b:"Choose an object and leave a message. Hand the board to a second visitor to reply or ask for clarification.",wall:"Cards and original messages are shared with the next visitor in this rehearsal."}[route];
 document.querySelectorAll("nav a").forEach(a=>{const current=a.hash===({a:"#probe-a",b:"#probe-b",wall:"#postcards"}[route]);if(current)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 const path=document.querySelector("#make-path");
 path.hidden=route==="wall";
 path.innerHTML=route==="wall"?"":'<a href="#make-input" data-step="make-input">1 · '+(route==="a"?"Look & arrange":"Write a message")+'</a><span>→</span><a href="#generate-preview" data-step="generate-preview">2 · '+(route==="a"?"Explore prepared designs":"Generate a preview")+'</a><span>→</span><a href="#compose-card" data-step="compose-card">3 · Make & download</a>';
 if(route==="wall"){work.innerHTML=postcards();return;}const k=selected[route],s=state(route,k);work.innerHTML='<div class="picker"><span class="micro">Choose your source</span>'+keys.map(key=>btn("source:"+key,objects[key].name,k===key)).join("")+'</div><div class="desk">'+source(k)+'<div>'+(route==="a"?a(k,s):b(k,s))+'</div></div>';}
function review(){const t=route,k=selected[t],s=state(t,k);let m=null,c=null;
 if(t==="a"){c={id:unique(),type:t,key:k,image:s.image,words:s.words,label:s.label==="keep"?"Each version continues the original work.":s.label==="change"?s.custom:""};}
 else{if(s.text.trim())m={id:unique(),key:k,parent:s.parent,text:s.text};const chosen=s.from?ownMessages(k).find(x=>x.id===s.from):m;
 if(s.make&&!chosen){say("Write a message or choose an earlier message of your own.");return;}if(!s.make&&!m){say("Write a message to review, or skip this activity.");return;}if(s.make)c={id:unique(),type:t,key:k,image:s.image,words:chosen.text,message:chosen.id};}
 pending={t,k,c,m};let html=(m&&(!c||c.message!==m.id)?'<div class="message"><small>New draft · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p></div>':'')+(c?cardHTML(c):'');
 if(t==="a"&&s.label==="omit"){html+='<p class="proposal">'+({keep:"Museum label: Each version continues the original work.",change:"Your proposed label: "+esc(s.custom),omit:"Display without the proposed museum label."}[s.label])+'</p>';}
 if(t==="b"&&c&&s.display==="thread"){html+='<h3>Alongside this card</h3>'+thread(k).map(m=>bubble(m)).join("")+(m?'<div class="message"><small>Draft · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p></div>':'');}
 document.querySelector("#review-title").textContent=c?"Your postcard is ready":"Check your message";
 document.querySelector("#download-draft").hidden=!c;
 document.querySelector("#proof").innerHTML=html+'<p>Check the words and source before adding them to this tab. You can go back to edit.</p>';dialog.showModal();}
dialog.querySelector("#back").onclick=()=>dialog.close();
dialog.querySelector("#accept").onclick=()=>{if(!pending)return;const {m,c,t,k}=pending;if(m){messages.push(m);own.add(m.id);}if(c)wall.push(c);if(t==="b")Object.assign(state(t,k),{text:"",parent:"",from:""});else Object.assign(state(t,k),{words:"",label:"",custom:""});pending=null;dialog.close();if(c)history.pushState(null,"","#postcards");render();window.scrollTo(0,0);say(c?"Your postcard is on the wall. You can download it here.":"Your message is ready for the next visitor.");};
dialog.querySelector("#discard").onclick=()=>{if(!pending)return;const {t,k}=pending;if(t==="b")Object.assign(state(t,k),{text:"",parent:"",from:""});else Object.assign(state(t,k),{words:"",label:"",custom:"",image:0});pending=null;dialog.close();render();say("Draft discarded.");};
dialog.addEventListener("close",()=>pending=null);
work.addEventListener("input",e=>{const f=e.target.getAttribute("bind");if(!f)return;const s=state(route,selected[route]);s[f]=f==="image"?Number(e.target.value):f==="make"?e.target.checked:e.target.value;});
work.addEventListener("change",e=>{
 const field=e.target.getAttribute("bind");
 if(["make","label"].includes(field))render();
 if(field==="image"){
  const preview=document.querySelector("#selected-image");
  if(preview)preview.innerHTML=selectedImage(route,selected[route],state(route,selected[route]));
 }
});
work.addEventListener("click",async e=>{const button=e.target.closest("[data-do]");if(!button)return;const [act,val]=button.dataset.do.split(":");
 if(act==="handoff"){
  startVisitor(messages.find(message=>message.id===val));
  return;
 }
 if(act==="download"){try{await downloadCard(wall.find(c=>c.id===val));}catch{say("Could not download the card. Try again.");}return;}
 if(act==="locate"){const m=messages.find(m=>m.id===val);if(!m)return;selected.b=m.key;if(location.hash!=="#probe-b")history.pushState(null,"","#probe-b");render();document.querySelector("#msg-"+val)?.scrollIntoView({block:"center"});return;}
 if(act==="source"){selected[route]=val;render();return;}const k=selected[route],s=state(route,k);
 if(act==="generate"){
  const pool=[1,2].filter(n=>n!==s.generated);
  s.generated=pool[Math.floor(Math.random()*pool.length)];
  render();
  document.querySelector(".generated-result").scrollIntoView({block:"center"});
  say("Prepared preview ready. Choose whether to use it in your postcard.");
  return;
 }
 if(act==="use-generated"){
  if(!s.generated)return;
  s.image=s.generated;
  if(route==="b")s.make=true;
  render();
  document.querySelector("#compose-card").scrollIntoView({block:"start"});
  document.querySelector('#compose-card select')?.focus({preventScroll:true});
  return;
 }
 if(act==="review"){review();return;}if(act==="reply"){s.parent=val;render();work.querySelector('[bind="text"]').focus();return;}
 if(act==="display")s.display=val;else if(act==="resetmat"){s.pieces=kit[k].map((kind,i)=>({kind,x:[25,50,73][i],y:[48,57,40][i],angle:0,fold:false}));s.piece=0;}
 else if(act==="rotate")s.pieces[s.piece].angle=(s.pieces[s.piece].angle+30)%360;else if(act==="fold")s.pieces[s.piece].fold=!s.pieces[s.piece].fold;render();work.querySelector('[data-do="'+button.dataset.do+'"]')?.focus({preventScroll:true});});
function markDetail(button,x,y){
 const i=Number(button.dataset.photo);
 const point={i,x:Math.max(0,Math.min(100,x)),y:Math.max(0,Math.min(100,y))};
 state("a",selected.a).detail=point;
 work.querySelectorAll(".detail-photo .pin").forEach(pin=>pin.remove());
 const pin=document.createElement("i");pin.className="pin";pin.setAttribute("aria-hidden","true");pin.style.left=point.x+"%";pin.style.top=point.y+"%";button.append(pin);
}
work.addEventListener("click",e=>{const el=e.target.closest("[data-photo]");if(!el)return;const rect=el.getBoundingClientRect();markDetail(el,e.detail?(e.clientX-rect.left)*100/rect.width:50,e.detail?(e.clientY-rect.top)*100/rect.height:50);});
work.addEventListener("keydown",e=>{const el=e.target.closest("[data-photo]");if(!el)return;const delta={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(delta){e.preventDefault();const last=state("a",selected.a).detail;const point=last?.i===Number(el.dataset.photo)?last:{x:50,y:50};markDetail(el,point.x+delta[0],point.y+delta[1]);}});
function startVisitor(replyTo){
 const hasDraft=Object.values(drafts).some(s=>s.text?.trim()||s.words?.trim()||s.custom?.trim());
 if(hasDraft&&!confirm("Start the next visitor and discard unfinished words? Checked messages and postcards stay on this tab."))return;
 drafts={};
 own.clear();
 if(replyTo){
  selected.b=replyTo.key;
  state("b",replyTo.key).parent=replyTo.id;
 }
 if(route==="wall")history.pushState(null,"","#probe-b");
 render();
 if(replyTo)work.querySelector('[bind="text"]')?.focus();
 else if(route==="b")window.scrollTo(0,0);
 say("Next visitor ready. Checked contributions remain on this tab.");
}
document.querySelector("#next").onclick=()=>startVisitor();

let drag=null;
function pick(el){const s=state("a",selected.a);s.piece=Number(el.dataset.piece);work.querySelectorAll(".piece").forEach((p,i)=>{const on=i===s.piece;p.classList.toggle("selected",on);p.style.zIndex=on?10:i+1;p.setAttribute("aria-pressed",on);});return s.pieces[s.piece];}
function position(el,p,x,y){p.x=Math.min(84,Math.max(16,x));p.y=Math.min(76,Math.max(24,y));el.style.left=p.x+"%";el.style.top=p.y+"%";}
work.addEventListener("pointerdown",e=>{const el=e.target.closest(".piece");if(!el)return;const p=pick(el),rect=el.parentElement.getBoundingClientRect();drag={el,p,rect,id:e.pointerId,x:e.clientX,y:e.clientY,ox:p.x,oy:p.y};el.setPointerCapture(e.pointerId);});
work.addEventListener("pointermove",e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;position(d.el,d.p,d.ox+(e.clientX-d.x)*100/d.rect.width,d.oy+(e.clientY-d.y)*100/d.rect.height);});
for(const ev of ["pointerup","pointercancel","lostpointercapture"])work.addEventListener(ev,()=>drag=null);
work.addEventListener("focusin",e=>{if(e.target.matches(".piece"))pick(e.target);});
work.addEventListener("keydown",e=>{const el=e.target.closest(".piece");if(!el)return;const p=pick(el),d={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(d){e.preventDefault();position(el,p,p.x+d[0],p.y+d[1]);}});
window.addEventListener("hashchange",()=>{render();window.scrollTo(0,0);});render();

document.querySelector("#make-path").addEventListener("click",e=>{
 const link=e.target.closest("[data-step]");
 if(!link)return;
 e.preventDefault();
 document.getElementById(link.dataset.step)?.scrollIntoView({block:"start"});
});
document.querySelector("#download-draft").addEventListener("click",async e=>{
 const card=pending?.c;
 if(!card)return;
 const button=e.currentTarget;button.disabled=true;
 try{await downloadCard(card);}catch{say("Could not download the card. Try again.");}finally{button.disabled=false;}
});
