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
 if(route!=="a" || state("a",k).step==="compose-card")return photographs(k);
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
  +'<figcaption>The detail you marked<br>'+esc(o.labels[point.i])+'<br>The Paper collage layout uses this detail.</figcaption></figure>';
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


function cardData(type,key,s){
 const label=s.label==="keep"?"Each version continues the original work.":s.label==="change"?s.custom:"";
 const card={type,key,image:s.image,style:s.style||"classic",words:type==="a"?s.words:postcardWords(key,s),label};
 if(type==="a"&&s.detail)card.detail={...s.detail};
 return card;
}

function composeCard(type,k,s){
 const c=cardData(type,k,s);
 const isMaking=type==="a";
 const context=isMaking
  ? '<label class="form">Caption (optional)<textarea bind="words" dir="auto" placeholder="Which detail did you keep? What changed?">'+esc(s.words)+'</textarea></label>'
  : '<blockquote class="reply-context"><small>Your message on this card</small><p class="words" dir="auto">'+esc(c.words)+'</p></blockquote>';
 const chosen=s.image?"Object photo + "+objects[k][type][s.image-1]:"Object photo only";
 return '<section class="benchpanel compose" id="compose-card" tabindex="-1">'
  +'<p class="kicker">3 · Make your postcard</p><h2>Your postcard</h2>'
  +'<div class="card-ingredients"><span>'+esc(objects[k].name)+' · '+esc(chosen)+'</span>'+btn("back-compare",isMaking?"Revisit the designs":"Revisit the pictures")+'</div>'
  +context+stylePickerHTML(c)+'<div id="draft-card">'+cardHTML(c)+'</div>'
  +(isMaking?museumLabel(s):museumDisplay(k,s))
  +btn("review","Check my postcard")+'</section>';
}

function museumLabel(s){
 const options=[["","Leave undecided"],["keep","Keep those words"],["change","Write my own label"],["omit","Leave the label off"]];
 return '<div class="proposal"><strong>Imagine this label beside your card</strong>'
  +'<p>“Each version continues the original work.” Would you keep these words, change them or leave them off? Which detail led you to that choice?</p>'
  +'<label class="form">My label choice<select bind="label">'+options.map(([v,text])=>opt(v,text,s.label)).join("")+'</select></label>'
  +(s.label==="change"?'<label class="form">My museum label<input type="text" bind="custom" dir="auto" value="'+esc(s.custom)+'"></label>':"")+'</div>';
}

function museumDisplay(k,s){
 const beside=s.display==="thread";
 const earlier=thread(k);
 return '<div class="proposal"><strong>Imagine this card on display in a museum</strong>'
  +'<p>Would someone reading your card on its own understand the exchange? If yours is the first message, what would you like them to reply to?</p>'
  +row(btn("display:alone","Card alone",!beside)+btn("display:thread","Card with conversation",beside))+'</div>'
  +(beside?'<aside class="beside-card"><h3>Conversation beside the card</h3>'+earlier.map(m=>bubble(m)).join("")
    +(s.text.trim()?'<div class="message current-draft"><small>Your draft</small><p class="words" dir="auto">'+esc(s.text)+'</p></div>':'')+'</aside>':'');
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
function makingInput(k,s){
 const o=objects[k];
 return '<section class="benchpanel" id="make-input"><p class="kicker">1 · Look and arrange</p>'
  +'<h2>Arrange a detail from the photograph</h2><p>'+esc(o.make)+'</p>'
  +'<div class="mat" aria-label="Material arrangement">'+s.pieces.map((p,i)=>pieceHTML(p,i,s)).join("")+'</div>'
  +'<p class="key">Drag a piece or focus it and use the arrow keys. Rotate or fold the selected piece. At the table, use the real materials.</p>'
  +row(btn("rotate","Rotate ↻")+btn("fold","Fold / open")+btn("resetmat","Reset mat")+'<a class="linkbar" target="_blank" href="making-mat.pdf">Print the A4 mat ↗</a>')
  +'<div class="material-next"><p>Keep your arrangement on the mat. Look at a prepared cuff or bag beside it. Which details would you keep?</p>'
  +btn("compare-arrangement","Compare my arrangement with a design →")+'</div></section>';
}
function relation(m){if(!m.parent)return "New interpretation";if(m.parent==="starter")return "Reply to AI starter";return "Reply to message "+nOf(m.key,m.parent);}
function bubble(m,allowReply=false){
 const useOwn=allowReply&&own.has(m.id)?btn("card-from:"+m.id,"Make a card from my message"):"";
 return '<article class="message"'+(allowReply?' id="msg-'+m.id+'"':'')+'><small>Message '+nOf(m.key,m.id)+' · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p>'+(allowReply?btn("reply:"+m.id,"Reply to this message"):"")+useOwn+'</article>';}
function threadHTML(k,replies){return thread(k).length?thread(k).map(m=>bubble(m,replies)).join(""):'<p class="blank">No visitor messages yet. Start with something you noticed, or respond to the labelled starter.</p>';}

function conversationInput(k,s){
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
  +related(k);
}
function cardActions(c){return row(btn("download:"+c.id,"Download postcard PNG ↓")+(c.type==="b"?btn("locate:"+c.message,"Read linked message"):""));}
function related(k){const items=wall.filter(c=>c.type==="b"&&c.key===k);return items.length?'<section class="benchpanel"><h2>Cards beside this thread</h2><div class="wallgrid">'+items.map(c=>'<div>'+cardHTML(c)+cardActions(c)+'</div>').join("")+'</div></section>':'';}
function replyInvitation(){
 const first=wall.find(card=>card.type==="b");
 if(!first || !own.has(first.message))return "";
 return '<section class="benchpanel"><h2>Try the next visitor’s reply</h2>'
  +'<p>Stay in this tab and take the next visitor’s turn. Read the first card’s message, then reply in your own words.</p>'
  +btn("handoff:"+first.message,"Start next visitor and reply →")+'</section>';
}
function postcards(){
 const next=wall.at(-1)?.type==="a"?'<p class="wall-next"><a href="#probe-b">Continue to Probe B · Write to another visitor →</a></p>':"";
 return next+replyInvitation()+'<section class="benchpanel"><h2>Checked cards from this rehearsal</h2>'+(wall.length?'<div class="wallgrid">'+wall.map(c=>'<div>'+cardHTML(c)+cardActions(c)+'</div>').join("")+'</div>':'<p class="blank">Your wall starts empty. Make a card in <a href="#probe-a">A</a> or <a href="#probe-b">B</a>, review it, then add it here.</p>')+'</section><details class="benchpanel samplelinks"><summary>See the four postcard layouts</summary><p>The same gown and sample caption appear in all four. Open the sheet to look closer.</p><a class="edition-sheet" href="postcards/four-layouts.jpg"><img loading="lazy" src="postcards/four-layouts.jpg" alt="One sample postcard shown in paper collage, British picture postcard, line study and acid chrome layouts"></a><p>Individual sample cards</p><div class="wallgrid"><a href="postcards/gown-a.png"><img src="postcards/gown-a.png" alt="Paper collage postcard using the V&amp;A gown photographs and a prepared bag design">Open A sample ↗</a><a href="postcards/knit-b.png"><img src="postcards/knit-b.png" alt="Line study postcard combining the installation photograph, linework and a visitor message">Open B sample ↗</a></div></details>';}

const workSteps=["make-input","generate-preview","compose-card"];

function chooseExample(s){
 const alternatives=[1,2].filter(n=>n!==s.generated);
 s.generated=alternatives[Math.floor(Math.random()*alternatives.length)];
}

function openStep(next,focusSelector){
 const s=state(route,selected[route]);
 if(!workSteps.includes(next))return;
 if(route==="b" && next!=="make-input" && !postcardWords(selected.b,s).trim() && !(next==="generate-preview"&&ownMessages(selected.b).length)){
  say("Write a message first so you can see how it reads beside a picture.");
  next="make-input";focusSelector='[bind="text"]';
 }
 if(next==="generate-preview"&&!s.generated)chooseExample(s);
 s.step=next;
 if(next==="compose-card")s.make=true;
 render();
 const section=document.getElementById(next);
 const focus=focusSelector?work.querySelector(focusSelector):section;
 if(focus){
  if(!focusSelector)focus.tabIndex=-1;
  focus.focus({preventScroll:true});
  focus.scrollIntoView({block:"start"});
 }
}

function render(){
 route=location.hash==="#probe-b"?"b":location.hash==="#postcards"?"wall":"a";
 const info={
  a:["Make with the object","Choose an object and arrange a detail from its photograph. You’ll compare your arrangement with a prepared design before making your card."],
  b:["Read the object together","Read what another visitor noticed, or start the conversation. You can leave your message on the board or make it into a postcard."],
  wall:["Postcard wall","These cards stay in this tab for the next visitor. Download a copy to keep it."]
 };
 document.querySelector("#title").textContent=info[route][0];
 document.querySelector("#lead").textContent=info[route][1];
 document.querySelectorAll(".mast nav a").forEach(link=>{
  const current=link.hash===({a:"#probe-a",b:"#probe-b",wall:"#postcards"}[route]);
  if(current)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");
 });
 const path=document.querySelector("#make-path");
 path.hidden=route==="wall";
 if(route==="wall"){path.innerHTML="";work.innerHTML=postcards();return;}
 const k=selected[route],s=state(route,k);
 const step=s.step||workSteps[0];
 const labels=route==="a"?["Arrange a detail","Compare designs","Make a postcard"]:["Write or reply","Choose a picture","Make a postcard"];
 path.innerHTML=workSteps.map((id,i)=>'<a href="#'+id+'" data-step="'+id+'"'+(step===id?' aria-current="step"':'')+'>'+ (i+1)+' · '+labels[i]+'</a>').join('<span aria-hidden="true">→</span>');
 const first=step===workSteps[0],compare=step===workSteps[1];
 const picker=first?'<div class="picker"><span class="micro">Choose your object</span>'+keys.map(key=>btn("source:"+key,objects[key].name,k===key)).join("")+'</div>':"";
 const content=first?(route==="a"?makingInput(k,s):conversationInput(k,s))
   :compare?(route==="a"?designComparison(k,s):messageComparison(k,s)):composeCard(route,k,s);
 const reference=first?source(k):'<details class="source-context"'+(matchMedia("(min-width:771px)").matches?" open":"")+'><summary>Object reference · '+esc(objects[k].name)+'</summary>'+source(k)+'</details>';
 work.innerHTML=picker+'<div class="desk">'+reference+'<div>'+content+'</div></div>';
}
function review(){const t=route,k=selected[t],s=state(t,k);let m=null,c=null;
 if(t==="a"){c={...cardData(t,k,s),id:unique()};}
 else{if(s.text.trim())m={id:unique(),key:k,parent:s.parent,text:s.text};const chosen=s.from?ownMessages(k).find(x=>x.id===s.from):m;
 if(s.make&&!chosen){say("Write a message or choose an earlier message of your own.");return;}if(!s.make&&!m){say("Write a message to review, or skip this activity.");return;}if(s.make)c={...cardData(t,k,s),id:unique(),message:chosen.id};}
 pending={t,k,c,m};let html=(m&&(!c||c.message!==m.id)?'<div class="message"><small>New draft · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p></div>':'')+(c?cardHTML(c):'');
 if(t==="a"&&s.label==="omit"){html+='<p class="proposal">'+({keep:"Museum label: Each version continues the original work.",change:"Your proposed label: "+esc(s.custom),omit:"Display without the proposed museum label."}[s.label])+'</p>';}
 if(t==="b"&&c&&s.display==="thread"){html+='<h3>On the board beside this card</h3>'+thread(k).map(m=>bubble(m)).join("")+(m?'<div class="message"><small>Draft · '+relation(m)+'</small><p dir="auto">'+esc(m.text)+'</p></div>':'');}
 document.querySelector("#review-title").textContent=c?"Check your postcard":"Check your message";
 document.querySelector("#download-draft").hidden=!c;
 document.querySelector("#proof").innerHTML=html+'<p>Check your words before sharing them with the next visitor in this tab.</p>';dialog.showModal();}
dialog.querySelector("#back").onclick=()=>dialog.close();
dialog.querySelector("#accept").onclick=()=>{if(!pending)return;const {m,c,t,k}=pending;if(m){messages.push(m);own.add(m.id);}if(c)wall.push(c);if(t==="b")Object.assign(state(t,k),{step:"make-input",text:"",parent:"",from:""});else Object.assign(state(t,k),{step:"make-input",words:"",label:"",custom:""});pending=null;dialog.close();if(c)history.pushState(null,"","#postcards");render();window.scrollTo(0,0);say(c?"Your postcard is on the wall. You can download it here.":"Your message is ready for the next visitor.");};
dialog.querySelector("#discard").onclick=()=>{if(!pending)return;const {t,k}=pending;if(t==="b")Object.assign(state(t,k),{step:"make-input",text:"",parent:"",from:"",image:0});else Object.assign(state(t,k),{step:"make-input",words:"",label:"",custom:"",image:0});pending=null;dialog.close();render();say("Draft discarded.");};
dialog.addEventListener("close",()=>pending=null);
let previewFrame;
function refreshDraft(){
 const preview=document.querySelector("#draft-card");
 if(!preview)return;
 const k=selected[route];
 const card=cardData(route,k,state(route,k));
 preview.innerHTML=cardHTML(card);
 refreshStylePicker(card);
}
work.addEventListener("input",e=>{
 const field=e.target.getAttribute("bind");
 if(!field)return;
 const s=state(route,selected[route]);
 s[field]=field==="image"?Number(e.target.value):field==="make"?e.target.checked:e.target.value;
 if(["words","custom","style"].includes(field)){
  cancelAnimationFrame(previewFrame);previewFrame=requestAnimationFrame(refreshDraft);
 }
});
work.addEventListener("change",e=>{
 const field=e.target.getAttribute("bind");
 if(["label","parent","from"].includes(field)){
  render();work.querySelector('[bind="'+field+'"]')?.focus({preventScroll:true});
 }
});
work.addEventListener("click",async e=>{const button=e.target.closest("[data-do]");if(!button)return;const [act,val]=button.dataset.do.split(":");
 if(act==="handoff"){
  startVisitor(messages.find(message=>message.id===val));
  return;
 }
 if(act==="download"){try{await downloadCard(wall.find(c=>c.id===val));}catch{say("Could not download the card. Try again.");}return;}
 if(act==="locate"){const m=messages.find(m=>m.id===val);if(!m)return;selected.b=m.key;state("b",m.key).step="make-input";if(location.hash!=="#probe-b")history.pushState(null,"","#probe-b");render();document.querySelector("#msg-"+val)?.scrollIntoView({block:"center"});return;}
 if(act==="source"){selected[route]=val;state(route,val).step="make-input";render();return;}const k=selected[route],s=state(route,k);
 if(act==="card-from"){
  if(!ownMessages(k).some(m=>m.id===val))return;
  s.from=val;s.make=true;openStep("generate-preview");return;
 }
 if(act==="back-compare"){openStep("generate-preview");return;}
 if(act==="adjust-arrangement"){
  openStep("make-input",'[data-piece="'+s.piece+'"]');
  return;
 }
 if(act==="adjust-message"){openStep("make-input",'[bind="text"]');return;}
 if(act==="message-only"){
  if(!s.text.trim()){say("Write your message first.");openStep("make-input",'[bind="text"]');return;}
  s.make=false;render();review();return;
 }
 if(act==="compare-message"){s.from="";s.make=true;}
 if(route==="b" && ["compare-message","use-generated","source-only"].includes(act) && !postcardWords(k,s).trim()){
  say("Write a message first, or choose an earlier message of your own.");
  openStep("make-input",'[bind="text"]');return;
 }
 if(["compare-arrangement","compare-message","generate"].includes(act)){
  if(act==="generate")chooseExample(s);
  openStep("generate-preview");
  return;
 }
 if(act==="use-generated" || act==="source-only"){
  if(act==="use-generated"&&!s.generated)return;
  s.image=act==="source-only"?0:s.generated;
  if(route==="b")s.make=true;
  openStep("compose-card");
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
 const marker=document.querySelector("#marked-reference");if(marker)marker.innerHTML=markedDetail(selected.a,point);
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
function pick(el){const s=state("a",selected.a);s.piece=Number(el.dataset.piece);work.querySelectorAll("[data-piece]").forEach((p,i)=>{const on=i===s.piece;p.classList.toggle("selected",on);p.style.zIndex=on?10:i+1;p.setAttribute("aria-pressed",on);});return s.pieces[s.piece];}
function position(el,p,x,y){p.x=Math.min(84,Math.max(16,x));p.y=Math.min(76,Math.max(24,y));el.style.left=p.x+"%";el.style.top=p.y+"%";

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
 openStep(link.dataset.step);
});
document.querySelector("#download-draft").addEventListener("click",async e=>{
 const card=pending?.c;
 if(!card)return;
 const button=e.currentTarget;button.disabled=true;
 try{await downloadCard(card);}catch{say("Could not download the card. Try again.");}finally{button.disabled=false;}
});
