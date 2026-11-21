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

function pieceHTML(piece,index,s,preview=false){
 const top=index===s.piece;
 const className=['piece',piece.kind,piece.fold?'folded':'',top&&!preview?'selected':''].filter(Boolean).join(' ');
 const style='left:'+piece.x+'%;top:'+piece.y+'%;--angle:'+piece.angle+'deg;z-index:'+(top?10:index+1);
 const props='class="'+className+'" style="'+style+'"';
 const motif=piece.kind==='flower'?'✿':'';
 if(preview)return '<span '+props+' data-preview-piece="'+index+'">'+motif+'</span>';
 return '<button type="button" '+props+' data-piece="'+index+'" aria-label="'+names[piece.kind]+' '+(index+1)+'" aria-pressed="'+top+'">'+motif+'</button>';
}

function matReplica(s){
 return s.pieces.map((piece,i)=>pieceHTML(piece,i,s,true)).join('');
}

function markedDetail(k,point){
 if(!point)return "";
 const o=objects[k];
 return '<figure class="marked-reference"><div class="reference-thumb"><img src="'+o.cardPhoto[point.i]+'" alt="'+esc(o.alt[point.i])+'">'
  +'<i class="pin" aria-hidden="true" style="left:'+point.x+'%;top:'+point.y+'%"></i></div>'
  +'<figcaption>The detail you marked<br>'+esc(o.labels[point.i])+'</figcaption></figure>';
}
function designComparison(k,s){
 const o=objects[k];
 const questions={
  gown:'Where did you place the flower on the cloth? Look at which flowers the cuff or bag leaves in view.',
  jug:'Follow the line you made with your pieces. Where does that line continue or break in the design?',
  knit:'Look at the space between your loops. How does the spacing or direction of the knit change in the design?'
 };
 const example=s.generated?design(k,'a',s.generated):'<p class="blank">Choose a prepared design to put beside your arrangement.</p>';
 const choices=s.generated?row(btn('use-generated','Use this design on my postcard')+btn('generate','Compare the other design')):row(btn('generate','Show a prepared design'));
 return '<section class="benchpanel comparison-panel" id="generate-preview" tabindex="-1">'
  +'<p class="kicker">2 · Compare with your arrangement</p><h2>What carried over into the design?</h2>'
  +'<p>'+questions[k]+'</p><div id="marked-reference">'+markedDetail(k,s.detail)+'</div><div class="comparison-pair">'
  +'<section><h3>Your arrangement</h3><div class="mat mat-replica" role="img" aria-label="Your arrangement of '+kit[k].map(kind=>names[kind]).join(', ')+'">'+matReplica(s)+'</div>'
  +btn('adjust-arrangement','Adjust my arrangement')+'</section>'
  +'<section><h3>Prepared design</h3>'+example+'</section></div>'
  +'<p class="key">The website draws a saved example at random for '+esc(o.name)+'. At the study table, the researcher chooses an example based on your arrangement.</p>'
  +choices+btn('source-only','Continue with the source photo only')+'</section>';
}


function postcardWords(k,s){
 if(!s.from)return s.text;
 return ownMessages(k).find(m=>m.id===s.from)?.text || "";
}

function draftCard(t,k,s){
 const label=s.label==="keep"?"Each version continues the original work.":s.label==="change"?s.custom:"";
 return cardHTML({type:t,key:k,image:s.image,words:t==="a"?s.words:postcardWords(k,s),label});
}

function messageComparison(k,s){
 const mine=ownMessages(k);
 const authorChoice=mine.length?'<label class="form">Words to use on my card<select bind="from">'
  +opt("","The message I am writing",s.from)
  +mine.map(m=>opt(m.id,"My message "+nOf(k,m.id)+" · "+m.text.slice(0,36),s.from)).join("")+'</select></label>':"";
 const words=postcardWords(k,s);
 return '<section class="benchpanel comparison-panel" id="generate-preview" tabindex="-1">'
  +'<p class="kicker">2 · Choose an optional picture</p><h2>Does this picture say what you mean?</h2>'
  +'<p>Read your message beside a picture prepared for this object. Choose it if it helps someone understand your words.</p>'
  +authorChoice+'<div class="comparison-pair"><section><h3>Your words</h3>'
  +'<p id="comparison-words" class="words" dir="auto">'+esc(words||"Write a message in step 1 to see it here.")+'</p>'
  +(s.from?'':btn("adjust-message","Edit my message"))+'</section><section><h3>Prepared picture</h3>'
  +(s.generated?design(k,"b",s.generated):'<p>Show a picture to compare it with your message.</p>')+'</section></div>'
  +row((s.generated?btn("use-generated","Put this picture on my card"):"")+btn("generate",s.generated?"Try the other picture":"Show a prepared picture"))
  +btn("source-only","Make my card with the object photo and my words")+'</section>';
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
  +'<div class="material-next"><p>Keep your arrangement on the mat. Next, compare it with a prepared cuff or bag and decide which details you would carry over.</p>'
  +btn("compare-arrangement","Compare my arrangement with a design →")+'</div></section>'+designComparison(k,s)
  +'<section class="benchpanel" id="compose-card"><p class="kicker">3 · Make your postcard</p>'
  +'<h2>Write your postcard</h2>'
  +'<label class="form">Image on my postcard<select bind="image">'+imageOptions.map(([n,l])=>opt(n,l,s.image)).join("")+'</select></label>'
  +'<label class="form">My caption (optional)<textarea bind="words" dir="auto" placeholder="What did you keep, change or miss?">'+esc(s.words)+'</textarea></label>'
  +'<div id="draft-card">'+draftCard("a",k,s)+'</div>'
  +'<div class="proposal"><strong>Proposed museum label</strong>'
  +'<p>“Each version continues the original work.” Would you keep these words, change them or leave them off? Which detail led you there?</p>'
  +'<label class="form">My display choice<select bind="label">'+labelOptions.map(([n,l])=>opt(n,l,s.label)).join("")+'</select></label>'+custom+'</div>'
  +btn("review","Create my postcard →")
  +'<p class="key">See the assembled card, then download it or add it to the postcard wall.</p>'
  +'<a href="#probe-b">Continue to Probe B →</a></section>';
}

function relation(m){if(!m.parent)return "New interpretation";if(m.parent==="starter")return "Reply to AI starter";return "Reply to message "+nOf(m.key,m.parent);}
function bubble(m,allowReply=false){return '<article class="message"'+(allowReply?' id="msg-'+m.id+'"':'')+'><small>Message '+nOf(m.key,m.id)+' · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p>'+(allowReply?btn("reply:"+m.id,"Reply to this message"):"")+'</article>';}
function threadHTML(k,replies){return thread(k).length?thread(k).map(m=>bubble(m,replies)).join(""):'<p class="blank">No visitor messages yet. Start with something you noticed, or respond to the labelled starter.</p>';}

function b(k,s){
 const o=objects[k],list=thread(k);
 const addresses=list.find(m=>m.id===s.parent);
 const parentWords=s.parent==="starter"?o.starter:addresses?.text;
 return '<section class="benchpanel"><p class="kicker">Conversation board</p><h2>What do you notice about '+esc(o.name)+'?</h2>'
  +'<p>'+esc(o.talk)+'</p><div class="thread">'+threadHTML(k,true)+'</div>'
  +'<details><summary>Read a prepared AI starter</summary><p>'+esc(o.starter)+'</p><p lang="zh">'+esc(o.zh)+'</p>'
  +'<small>Fictional example with a prepared Chinese translation.</small></details></section>'
  +'<section class="benchpanel" id="make-input"><p class="kicker">1 · Write to another visitor</p><h2>Leave a message or reply</h2>'
  +'<label class="form">What are you responding to?<select bind="parent">'+opt("","The object",s.parent)+opt("starter","The prepared AI starter",s.parent)
  +list.map(m=>opt(m.id,"Message "+nOf(k,m.id)+" · "+m.text.slice(0,36),s.parent)).join("")+'</select></label>'
  +(parentWords?'<blockquote class="reply-context"><small>'+(addresses?'Earlier visitor’s message':'Prepared AI starter')+'</small><p class="words" dir="auto">'+esc(parentWords)+'</p></blockquote>':'')
  +'<label class="form">My words, in any language<textarea bind="text" dir="auto" placeholder="What would you like the next visitor to notice or answer?">'+esc(s.text)+'</textarea></label>'
  +'<div class="material-next"><p>You can leave this message on the board or use it to make a postcard.</p>'
  +row(btn("compare-message","Choose a picture for my message")+btn("message-only","Review just my message"))+'</div></section>'
  +messageComparison(k,s)
  +'<section class="benchpanel" id="compose-card"><p class="kicker">3 · Make your postcard</p><h2>Read your card as the next visitor</h2>'
  +'<label><input type="checkbox" bind="make" '+(s.make?"checked":"")+'> Make a postcard from my message</label>'
  +(s.make?'<div id="draft-card">'+draftCard("b",k,s)+'</div>'
    +'<label class="form">Picture on my card<select bind="image">'+opt(0,"Use the object photo only",s.image)+[1,2].map(n=>opt(n,o.b[n-1],s.image)).join("")+'</select></label>'
    +'<div class="proposal"><strong>Imagine this card on display in a museum</strong><p>If someone saw your card on its own, what would they miss from the conversation? If you wrote the first message, what would you like them to reply to?</p>'
    +row(btn("display:alone","See the card alone",s.display==="alone")+btn("display:thread","See it with the conversation",s.display==="thread"))+'</div>'
    +(s.display==="thread"?'<aside class="beside-card"><h3>Conversation beside the card</h3>'
      +list.map(m=>bubble(m)).join("")
      +(s.text.trim()?'<p class="message current-draft"><small>Your draft</small><br><span class="words" dir="auto">'+esc(s.text)+'</span></p>':'')
      +(!list.length&&!s.text.trim()?'<p class="empty-thread">The first message will appear here.</p>':'')+'</aside>':''):'')
  +btn("review",s.make?"Review my postcard":"Review my message")+'</section>'+related(k);
}
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
function render(){route=location.hash==="#probe-b"?"b":location.hash==="#postcards"?"wall":"a";document.querySelector("#title").textContent={a:"Make with the object",b:"Read the object together",wall:"Postcard wall"}[route];document.querySelector("#lead").textContent={a:"Arrange materials around a detail you notice. Compare your arrangement with a cuff or bag design, then choose what to put on your postcard.",b:"Write about an object or reply to someone who has seen it. Choose whether to put your words on a postcard for the next visitor.",wall:"Cards and original messages are shared with the next visitor in this rehearsal."}[route];
 document.querySelectorAll("nav a").forEach(a=>{const current=a.hash===({a:"#probe-a",b:"#probe-b",wall:"#postcards"}[route]);if(current)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 const path=document.querySelector("#make-path");
 path.hidden=route==="wall";
 path.innerHTML=route==="wall"?"":'<a href="#make-input" data-step="make-input">1 · '+(route==="a"?"Look & arrange":"Write a message")+'</a><span>→</span><a href="#generate-preview" data-step="generate-preview">2 · '+(route==="a"?"Compare your arrangement":"Choose a picture")+'</a><span>→</span><a href="#compose-card" data-step="compose-card">3 · Make & download</a>';
 if(route==="wall"){work.innerHTML=postcards();return;}const k=selected[route],s=state(route,k);work.innerHTML='<div class="picker"><span class="micro">Choose your source</span>'+keys.map(key=>btn("source:"+key,objects[key].name,k===key)).join("")+'</div><div class="desk">'+source(k)+'<div>'+(route==="a"?a(k,s):b(k,s))+'</div></div>';}
function review(){const t=route,k=selected[t],s=state(t,k);let m=null,c=null;
 if(t==="a"){c={id:unique(),type:t,key:k,image:s.image,words:s.words,label:s.label==="keep"?"Each version continues the original work.":s.label==="change"?s.custom:""};}
 else{if(s.text.trim())m={id:unique(),key:k,parent:s.parent,text:s.text};const chosen=s.from?ownMessages(k).find(x=>x.id===s.from):m;
 if(s.make&&!chosen){say("Write a message or choose an earlier message of your own.");return;}if(!s.make&&!m){say("Write a message to review, or skip this activity.");return;}if(s.make)c={id:unique(),type:t,key:k,image:s.image,words:chosen.text,message:chosen.id};}
 pending={t,k,c,m};let html=(m&&(!c||c.message!==m.id)?'<div class="message"><small>New draft · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p></div>':'')+(c?cardHTML(c):'');
 if(t==="a"&&s.label==="omit"){html+='<p class="proposal">'+({keep:"Museum label: Each version continues the original work.",change:"Your proposed label: "+esc(s.custom),omit:"Display without the proposed museum label."}[s.label])+'</p>';}
 if(t==="b"&&c&&s.display==="thread"){html+='<h3>On the board beside this card</h3>'+thread(k).map(m=>bubble(m)).join("")+(m?'<div class="message"><small>Draft · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p></div>':'');}
 document.querySelector("#review-title").textContent=c?"Your postcard is ready":"Check your message";
 document.querySelector("#download-draft").hidden=!c;
 document.querySelector("#proof").innerHTML=html+'<p>Check the words and source before adding them to this tab. You can go back to edit.</p>';dialog.showModal();}
dialog.querySelector("#back").onclick=()=>dialog.close();
dialog.querySelector("#accept").onclick=()=>{if(!pending)return;const {m,c,t,k}=pending;if(m){messages.push(m);own.add(m.id);}if(c)wall.push(c);if(t==="b")Object.assign(state(t,k),{text:"",parent:"",from:""});else Object.assign(state(t,k),{words:"",label:"",custom:""});pending=null;dialog.close();if(c)history.pushState(null,"","#postcards");render();window.scrollTo(0,0);say(c?"Your postcard is on the wall. You can download it here.":"Your message is ready for the next visitor.");};
dialog.querySelector("#discard").onclick=()=>{if(!pending)return;const {t,k}=pending;if(t==="b")Object.assign(state(t,k),{text:"",parent:"",from:""});else Object.assign(state(t,k),{words:"",label:"",custom:"",image:0});pending=null;dialog.close();render();say("Draft discarded.");};
dialog.addEventListener("close",()=>pending=null);
let previewFrame;
function refreshDraft(){
 const preview=document.querySelector("#draft-card");
 if(!preview)return;
 const k=selected[route];
 preview.innerHTML=draftCard(route,k,state(route,k));
}
work.addEventListener("input",e=>{
 const field=e.target.getAttribute("bind");
 if(!field)return;
 const s=state(route,selected[route]);
 s[field]=field==="image"?Number(e.target.value):field==="make"?e.target.checked:e.target.value;
 if(field==="text"){
  const words=document.querySelector("#comparison-words");
  const beside=document.querySelector(".beside-card");
  if(beside){
   let draft=beside.querySelector(".current-draft");
   if(!draft){
    draft=document.createElement("div");draft.className="message current-draft";
    draft.innerHTML='<small>Your draft</small><p class="words" dir="auto"></p>';beside.append(draft);
   }
   draft.hidden=!s.text.trim();
   draft.querySelector(".words").textContent=s.text;
   const hint=beside.querySelector(".empty-thread");if(hint)hint.hidden=Boolean(s.text.trim());
  }
  words.textContent=postcardWords(selected.b,s)||"Write a message in step 1 to see it here.";
 }
 if(["text","words","custom","image"].includes(field)){
  cancelAnimationFrame(previewFrame);previewFrame=requestAnimationFrame(refreshDraft);
 }
});
work.addEventListener("change",e=>{
 const field=e.target.getAttribute("bind");
 if(["make","label","parent","from"].includes(field)){
  render();work.querySelector('[bind="'+field+'"]')?.focus({preventScroll:true});
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
 if(act==="adjust-arrangement"){
  work.querySelector('[data-piece="'+s.piece+'"]').focus();
  return;
 }
 if(act==="adjust-message"){work.querySelector('[bind="text"]').focus();return;}
 if(act==="message-only"){
  if(!s.text.trim()){say("Write your message first.");work.querySelector('[bind="text"]').focus();return;}
  s.make=false;render();review();return;
 }
 if(act==="compare-message"){s.from="";s.make=true;}
 if(route==="b" && ["compare-message","use-generated","source-only"].includes(act) && !postcardWords(k,s).trim()){
  say("Write a message first, or choose an earlier message of your own.");
  work.querySelector('[bind="text"]').focus();return;
 }
 if(["compare-arrangement","compare-message","generate"].includes(act)){
  if(act==="generate" || !s.generated){
   const pool=[1,2].filter(n=>n!==s.generated);
   s.generated=pool[Math.floor(Math.random()*pool.length)];
  }
  render();
  const comparison=document.querySelector("#generate-preview");
  comparison.focus({preventScroll:true});
  comparison.scrollIntoView({block:"start"});
  return;
 }
 if(act==="use-generated" || act==="source-only"){
  if(act==="use-generated"&&!s.generated)return;
  s.image=act==="source-only"?0:s.generated;
  if(route==="b")s.make=true;
  render();
  document.querySelector("#compose-card").scrollIntoView({block:"start"});
  document.querySelector("#compose-card h2").setAttribute("tabindex","-1");
  document.querySelector("#compose-card h2").focus({preventScroll:true});
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
 document.querySelector("#marked-reference").innerHTML=markedDetail(selected.a,point);
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
function pick(el){const s=state("a",selected.a);s.piece=Number(el.dataset.piece);work.querySelectorAll("[data-piece]").forEach((p,i)=>{const on=i===s.piece;p.classList.toggle("selected",on);p.style.zIndex=on?10:i+1;p.setAttribute("aria-pressed",on);});work.querySelector(".mat-replica").innerHTML=matReplica(s);return s.pieces[s.piece];}
function position(el,p,x,y){p.x=Math.min(84,Math.max(16,x));p.y=Math.min(76,Math.max(24,y));el.style.left=p.x+"%";el.style.top=p.y+"%";
 const copy=work.querySelector('[data-preview-piece="'+el.dataset.piece+'"]');
 if(copy){copy.style.left=el.style.left;copy.style.top=el.style.top;}
}
work.addEventListener("pointerdown",e=>{const el=e.target.closest("[data-piece]");if(!el)return;const p=pick(el),rect=el.parentElement.getBoundingClientRect();drag={el,p,rect,id:e.pointerId,x:e.clientX,y:e.clientY,ox:p.x,oy:p.y};el.setPointerCapture(e.pointerId);});
work.addEventListener("pointermove",e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;position(d.el,d.p,d.ox+(e.clientX-d.x)*100/d.rect.width,d.oy+(e.clientY-d.y)*100/d.rect.height);});
for(const ev of ["pointerup","pointercancel","lostpointercapture"])work.addEventListener(ev,()=>drag=null);
work.addEventListener("focusin",e=>{if(e.target.matches("[data-piece]"))pick(e.target);});
work.addEventListener("keydown",e=>{const el=e.target.closest("[data-piece]");if(!el)return;const p=pick(el),d={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(d){e.preventDefault();position(el,p,p.x+d[0],p.y+d[1]);}});
window.addEventListener("hashchange",()=>{
 clearTimeout(timer);
 document.querySelector("#notice").textContent="";
 render();
 window.scrollTo(0,0);
});
render();

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
