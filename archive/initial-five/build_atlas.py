# -*- coding: utf-8 -*-
"""Build the self-contained English atlas with the Python standard library."""
from pathlib import Path
from html import escape as e
import json

HERE = Path(__file__).resolve().parent
def load(name):
    return json.loads((HERE/name).read_text(encoding='utf-8'))
data = load('design_data.json')
details = {d['id']: d for d in load('research_details.json')}
venues = load('venue_designs.json')
objects = venues['objects']
for d in data:
    d.update(details[d['id']])
    d.update(venues['probes'][d['id']])
assert len(data) == 5 and all(len(d['adaptations']) == 2 for d in data)

QUESTIONS = [
 ('Main question', 'How does interacting with AI shape visitors’ experiences of authenticity in museums and heritage sites?', 'We explore how visitors describe their connection with objects, history, places and people when they use AI.'),
 ('What the feeling is based on', 'What do visitors rely on for a sense of authenticity during a museum or heritage visit that involves AI?', 'We look at the details, facts, memories, feelings and relationships they point to.'),
 ('What stays or changes', 'How do visitors keep or change their understanding of authenticity as they interact with AI?', 'We follow what visitors accept, question, change or leave open, and ask why.')
]
PURPOSE = 'These five probes help us explore how visitors experience authenticity when AI is part of a museum visit. We want to understand what that experience is based on and how it stays the same or changes during an activity.'
PROBE_MEANING = 'A probe is a short activity that gives visitors something to try, respond to and talk about. Here, visitors look, make, change, write or share, then explain their own view after one AI response.'
AUTHENTICITY_MEANING = 'Here, authenticity means a visitor’s sense of a real or meaningful connection with an object, its history, the place or other people. We ask visitors what feels authentic to them and why.'
SELECTION = 'Textiles come first where the records support them. Everyone Involved is the preferred GHT textile candidate. No Chinese textile at either target venue was verified in the public records checked. A British–Chinese pair remains unconfirmed; objects from other museums have not been substituted.'

def link(url,label):
    return f'<a href="{e(url,quote=True)}" target="_blank" rel="noopener noreferrer">{e(label)} ↗</a>'

def table(headers,rows):
    return '<div class="table-scroll"><table><thead><tr>'+''.join(f'<th>{e(h)}</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td>{c}</td>' for c in row)+'</tr>' for row in rows)+'</tbody></table></div>'

def photo(src,alt,credit):
    return f'<figure class="reference-photo"><div class="photo-well"><img src="{e(src,quote=True)}" alt="{e(alt,quote=True)}" loading="lazy" referrerpolicy="no-referrer"><p class="image-fallback" hidden>Image unavailable. Open the source link below to view the original.</p></div><figcaption>{e(credit)} Online image; internet required.</figcaption></figure>'

def object_card(key,adaptation=None):
    o=objects[key]
    extra=''.join('<p class="small">'+link(s['url'],s['label'])+'</p>' for s in o.get('additional_sources',[]))
    task='' if not adaptation else f'''<div class="adaptation"><h4>Detail to use</h4><p>{e(adaptation['detail'])}</p><h4>Task at this venue</h4><p>{e(adaptation['task'])}</p><p class="quote">{e(adaptation['question'])}</p><p class="small"><b>Limit:</b> {e(adaptation['boundary'])}</p></div>'''
    return f'''<article class="object-card"><div class="object-copy"><span class="eyebrow">{e(o['venue'])}</span><h3>{e(o['name'])}</h3><p class="en">{e(o['english'])}</p><span class="status">{e(o['status'])}</span></div>{photo(o['image'],o['name']+' — source image',o['credit'])}<div class="object-copy"><p>{e(o['fact'])}</p><p class="small">{e(o['limit'])}</p>{link(o['url'],'Open venue record')}{extra}{task}</div></article>'''

def rq_cards():
    return '<div class="rq-grid">'+''.join(f'<article><span class="eyebrow">{e(label)}</span><h3>{e(q)}</h3><p>{e(plain)}</p></article>' for label,q,plain in QUESTIONS)+'</div>'

def ai_description(text):
    if text.startswith('Input: ') and ' Output: ' in text:
        receives, returns = text[7:].split(' Output: ', 1)
        return f'<h4>AI receives</h4><p>{e(receives)}</p><h4>AI returns</h4><p>{e(returns)}</p>'
    return '<p>'+e(text)+'</p>'

def storyboard(d):
    out='<div class="storyboard">'
    for i,s in enumerate(d['steps'],1):
        out+=f'''<article class="screen"><div class="screen-bar"><span>SCREEN {i}</span><span>{i} / 3</span></div><div class="screen-body"><span class="mini-label">PROPOSED SCREEN</span><h3>{e(s['title'])}</h3><p>{e(s['human'])}</p><div class="sample">{e(s['example'])}</div><p><b>AI:</b> {e(s['ai'])}</p><div class="mock-button">{e(s['controls'])}</div></div><div class="screen-foot"><b>Record:</b> {e(s['data'])}</div></article>'''
    return out+'</div><p class="small">Static screen sketches. Examples are written for this design, not measured AI outputs or participant data. See the venue tasks below for the object-specific changes.</p>'

def detail_page(d):
    case_photo=photo(d['case_image'],d['case']+' — official case image','Image: '+d['case']+' official page. Rights remain with the rights holders.')
    return f'''<section class="page probe" id="p{d['id']}" aria-labelledby="title-{d['id']}">
    <div class="page-top"><a href="#overview">← All five probes</a><a href="assets/concept-{d['id']}.png" target="_blank">Open full design image ↗</a></div>
    <div class="eyebrow">PROBE {d['id']} / {e(d['lens'])}</div><h1 id="title-{d['id']}">{e(d['name'])}</h1><p class="lead">{e(d['form'])}</p>
    <div class="tags"><span>{e(d['people'])}</span><span>{e(d['time'])}</span><span>{e(d['camera_label'])}</span><span>One AI response</span></div>
    <figure class="concept"><img src="assets/concept-{d['id']}.png" alt="AI design sketch for {e(d['name'])}: visitor action, equipment and screen layout" width="1536" height="1024"><figcaption><b>AI-generated design sketch.</b> Objects, rooms and screens are illustrative. Insets show earlier possible object swaps; the source photos and venue tasks below define the current choices. This is not a collection photo or a working system.</figcaption></figure>
    <div class="focus"><span class="eyebrow">WHAT THIS PROBE ASKS</span><h2>{e(d['focus'])}</h2><p>{e(d['tension'])}</p><p>{e(d['question_connection'])}</p><details class="question-details"><summary>Read the full research questions</summary>{''.join('<p class="full-question">'+e(q)+'</p>' for q in d['questions'])}</details></div>
    <div class="section-heading"><span>01 / THE ACTIVITY</span><h2>Three steps, one AI response</h2></div>{storyboard(d)}
    <div class="section-heading"><span>02 / OBJECTS AT THE TWO VENUES</span><h2>What visitors work with</h2><p>Two versions of the same activity. The GHT option is a past exhibition candidate, not a confirmed GHT-owned or currently displayed object.</p></div><div class="object-grid">{''.join(object_card(a['object'],a) for a in d['adaptations'])}</div>
    <div class="section-heading"><span>03 / CAMERA AND AI</span><h2>What each tool does</h2><p>A fact card is a short list of information checked by the venue.</p></div><div class="two-col"><article class="panel"><h3>{e(d['camera_label'])}</h3><p>{e(d['camera'])}</p><details><summary>Input and recording details</summary><p class="small">{e(d['camera_data'])}</p></details></article><article class="panel"><h3>One AI response</h3>{ai_description(d['ai_contract'])}<h4>What the visitor leaves</h4><p>{e(d['output_fields'])}</p></article></div>
    <div class="section-heading"><span>04 / REAL MUSEUM EXAMPLE</span><h2>What we borrow and change</h2></div><div class="case-study">{case_photo}<article><span class="eyebrow">EXISTING PRACTICE</span><h3>{e(d['case'])}</h3><p>{e(d['caseFact'])}</p>{link(d['caseUrl'],'Open official case')}<h4>Our proposed change</h4><p>{e(d['case_note'])}</p><p class="small">This case supports the interaction idea. It does not show that either target venue uses this probe or that AI improves authenticity.</p></article></div>
    <div class="section-heading"><span>05 / RESEARCH EVIDENCE</span><h2>What to record and how to read it</h2></div>{table(['Record','What it can show','What it cannot show alone'],[[e(x) for x in row] for row in d['evidence']])}
    <article class="panel"><h3>Analysis</h3><p>{e(d['analysis'])}</p><p><b>Follow-up question:</b> {e(d['followup'])}</p><p class="small"><b>Limit:</b> {e(d['limits'])}</p></article>
    <details class="implementation"><summary>Set-up, timing and first trial</summary><div class="two-col"><article><h3>Materials</h3><ul>{''.join('<li>'+e(x)+'</li>' for x in d['materials'])}</ul><h3>Smallest working version</h3><p>{e(d['build'])}</p></article><article><h3>Suggested timing</h3><p>{e(d['time'])} overall. Allow about 1 minute to introduce the task, 2–4 minutes before AI, 1–2 minutes to review its reply and 2–3 minutes to respond. Adjust these parts in a trial to fit the overall task.</p><p class="small">Estimates, not measured times. Consent and set-up are extra. Recheck timing for the GHT version.</p><h3>Researcher’s role</h3><p>{e(d['host'])}</p></article></div><h3>Check in the first trial</h3><p>{e(d['pilot'])}</p></details>
    <div class="page-top bottom"><a href="#overview">← All five probes</a><a href="#p{int(d['id'])%5+1:02}">Next probe →</a></div></section>'''

overview=f'''<section class="page" id="overview"><div class="hero"><div><span class="eyebrow">SECOND ROUND / FIVE RESEARCH ACTIVITIES</span><h1>How AI shapes<br>a museum visit.</h1><p class="lead">Five short activities help us explore what feels authentic to visitors and how their views stay the same or change when they use AI.</p><div class="actions"><a class="button" href="#p01">Explore the five probes →</a><a class="text-link" href="#overview-questions">Read the research questions ↓</a></div><p class="small">Tudor House &amp; Garden · God’s House Tower<br>About 6–10 minutes per activity · Design proposals</p></div><a href="#p02" class="hero-image"><img src="assets/concept-02.png" alt="AI design sketch of making a shape and using a tabletop camera" width="1536" height="1024"><span>02 / MAKE A SHAPE · AI DESIGN SKETCH</span></a></div>
<div class="purpose-block" aria-labelledby="purpose-title"><div><span class="eyebrow">PURPOSE</span><h2 id="purpose-title">Why use these probes?</h2><p>{e(PURPOSE)}</p></div><div><h3>What is a probe?</h3><p>{e(PROBE_MEANING)}</p></div></div>
<div class="section-heading" id="overview-questions"><span>RESEARCH QUESTIONS</span><h2>What we want to understand</h2><p class="reading-copy">{e(AUTHENTICITY_MEANING)}</p></div>{rq_cards()}
<div class="section-heading"><span>HOW THE ACTIVITIES HELP</span><h2>Follow the visitor’s own view</h2></div><div class="process"><article><b>Before AI</b><p>What does the visitor notice, think or feel?</p></article><article><b>One AI response</b><p>What does AI explain, compare, change or write?</p></article><article><b>After AI</b><p>What does the visitor keep, change or question, and why?</p></article></div>
<div class="section-heading"><span>FIVE PROBES</span><h2>Each activity in one sentence</h2></div><div class="design-grid">{''.join(f'<a class="design-card" href="#p{d["id"]}"><img src="assets/concept-{d["id"]}.png" alt="Design sketch for {e(d["name"])}" loading="lazy" width="1536" height="1024"><div><span class="eyebrow">{d["id"]} / {e(d["lens"])}</span><h2>{e(d["name"])}</h2><p>{e(d["form"])}</p><span class="small">{e(d["time"])} · {e(d["camera_label"])}</span><span class="card-arrow" aria-hidden="true">↗</span></div></a>' for d in data)}</div>
<div class="two-col"><article class="panel"><h3>Where to start</h3><p>Start with <a href="#p01">Ask About a Detail</a> for a simple first build. Add <a href="#p02">Make a Shape</a> to study camera use and touch. Use <a href="#p04">Write a Label Together</a> or <a href="#p05">Share a Detail</a> to study two voices and a personal connection.</p><p class="small">Try one or two probes first. These are practical choices, not a ranking of effects. Visitors do not need to complete all five.</p></article><article class="panel"><h3>Textiles and the two venues</h3><p>{e(SELECTION)}</p><a href="#collections">See objects and the search result →</a></article></div></section>'''

research=f'''<section class="page" id="research"><span class="eyebrow">RESEARCH QUESTIONS</span><h1>What feels real,<br>and what changes?</h1><p class="lead">{e(PURPOSE)}</p><p class="reading-copy">{e(AUTHENTICITY_MEANING)}</p>{rq_cards()}
<div class="section-heading"><span>LISTEN TO THE VISITOR</span><h2>Start with their own words</h2></div><p class="reading-copy">Ask what the visitor notices and what supports their sense of connection. Let them explain what authenticity means to them. Keep examples of uncertainty, disagreement and no change, as well as examples of a changed view.</p>
<div class="process"><article><b>Before AI</b><p>What do you notice?<br>Why does it matter to you?</p></article><article><b>AI response</b><p>What did it say or change?<br>What information did it use?</p></article><article><b>Visitor response</b><p>What do you keep, change or leave open?<br>Why?</p></article></div>
<h2>How each probe contributes</h2>{table(['Probe','Its question','Connection to the research questions'],[[f'<a href="#p{d["id"]}">{e(d["name"])}</a>',e(d['focus']),e(d['question_connection'])] for d in data])}
<div class="two-col"><article class="panel"><h3>First trial</h3><p>Confirm the object and fact card with the venue. Try one or two probes over about 6–8 sessions to check clarity, timing and the quality of explanations. This is a planning estimate, not a final sample size.</p><p>Ask “Why did you stop here?” before asking about a real connection. Avoid leading questions such as “Does this now feel more authentic?” For pair activities, analyse the shared session while keeping each person’s words visible.</p></article><article class="panel"><h3>Analysis</h3><p>Follow the sequence: first view → actual AI output → visitor’s choice → reason. Compare events within a session before comparing visitors. Keep cases with no change, rejection, uncertainty and failure.</p><p>Record the object, venue, original or digital viewing, camera mode, language, broad pair relationship, model errors and researcher help. Different objects do not support a claim that venue or culture caused a difference.</p></article></div>
<article class="panel"><h3>Evidence that answers the questions</h3><p>A visitor identifies a feature, a source, a memory or the feel of making, and explains why it matters to their connection. A click, long visit, correct fact or positive rating alone is not enough.</p><p>These are exploratory probes. A claim that AI caused a change would need a separate comparison design, such as an activity with the same information and no AI, and a justified sample size.</p></article>
<details class="implementation"><summary>Recording and participant choices</summary><p>Record the object and source version, anonymous session ID, actual inputs and outputs, model version, human changes and reasons. Explain photo storage and audio recording separately. Confirm the model service and data handling before collecting material; send only input the visitor has checked.</p><p>People can skip a reason, reject a draft, keep different views or stop. Clear the shared device between sessions. This atlas has no active AI, camera access or participant data collection.</p></details></section>'''

collections=f'''<section class="page" id="collections"><span class="eyebrow">TUDOR HOUSE & GARDEN / GOD’S HOUSE TOWER</span><h1>Choose the object.<br>Check its record.</h1><p class="lead">Textiles are preferred. The venue relationship must be supported by a source.</p><div class="overview-note"><b>Search result: the British–Chinese pair is not yet verified.</b><p>{e(SELECTION)}</p><p><b>Ownership gap:</b> Tudor House has named collection highlights. The GHT records confirm past exhibitions, not GHT ownership. If both objects must belong to the two venues, the GHT object still needs confirmation.</p><p class="small">Checked 2 October 2026. This is not proof that the venues have no Chinese textiles. A British setting or clothing style does not establish where an object was made. {link('collection_search.json','Read the search record')}</p></div>
<div class="section-heading"><span>PREFERRED TEXTILE ROUTE</span><h2>A textile candidate and a Tudor House fallback</h2><p>The fabric hangings appear in probes 01, 02, 04 and 05. Select one component with the venue and artist before a trial. The official photo shows the installation, not an individually catalogued component. The Tudor House jug is made of leather, not cloth.</p></div><div class="object-grid">{object_card('GHT-EI')}{object_card('THG-LJ')}</div>
<div class="section-heading"><span>NON-TEXTILE ALTERNATIVES</span><h2>For image changes and small details</h2></div><div class="object-grid">{object_card('THG-GP')}{object_card('GHT-MP')}</div>
<details class="implementation"><summary>Another textile lead and what the search excluded</summary><p>GHT also documented sarah filmer’s <i>knit the walls</i>, a community knitting project shown there in 2022. It is a local textile alternative, but does not supply a verified Chinese object or establish GHT ownership. {link('https://godshousetower.org.uk/eventer/knit-the-walls-the-finale/','GHT exhibition record')}</p><p>The search excluded other museums called Tudor House, city-wide holdings without a target-venue record, workshop props and objects in unrelated museums.</p></details>
<h2>What to confirm with each venue</h2><div class="process four"><article><b>One object</b><p>Name, record number, material, origin and owner.</p></article><article><b>Access</b><p>Original on display, stored object or approved digital image?</p></article><article><b>Image use</b><p>Photo quality, photography rules and conditions on AI editing.</p></article><article><b>Fact card</b><p>Checked facts, sources and clearly marked uncertainties.</p></article></div></section>'''

references=f'''<section class="page" id="references"><span class="eyebrow">CASES AND SOURCES</span><h1>Real examples.<br>Proposed changes.</h1><p class="lead">The museum cases are documented practices. The five activities and their research uses are proposals.</p>{table(['Probe','Official museum case','What this proposal changes'],[[e(d['name']),link(d['caseUrl'],d['case']),e(d['case_note'])] for d in data])}<h2>About the images</h2><p>The five concept images show actions, devices and screen layouts. They are AI-generated sketches, not evidence of collection appearance, a historical setting or a completed system. Original prompts are in <a href="image_prompts.json">image_prompts.json</a>. Current GHT textile tasks take priority over earlier object insets.</p><p>Object and case photographs load from source websites and keep their credits. The Pether image uses an Art UK image address checked against its Commons record and an opening report. Third-party photographs are not copied into this repository. If an image fails, its source link remains available.</p><h2>Files</h2><ul><li><a href="DESIGN_NOTES.md">Full design notes</a></li><li><a href="collection_sources.json">Object sources</a> and <a href="collection_search.json">textile search record</a></li><li><a href="venue_designs.json">Venue tasks, camera plans and case images</a></li><li><a href="README.md">How to open and rebuild the atlas</a></li><li><a href="validation.json">Validation record</a></li></ul><p class="small">All example text is written for the design. Timing is estimated. The atlas has no live AI calls, camera capture, visitor records or analytics.</p></section>'''

nav='<a href="#overview">Overview</a>'+''.join(f'<a href="#p{d["id"]}">{d["id"]} {e(d["name"])}</a>' for d in data)+'<a href="#research">Research questions</a><a href="#collections">Objects</a><a href="#references">Sources</a>'
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Why we use five short AI museum probes, the research questions they address, and each activity explained in simple English."><title>AI × Authenticity · Five Probe Designs</title><link rel="stylesheet" href="styles.css"><script src="app.js" defer></script></head><body><a class="skip-link" href="#content">Skip to content</a><header><div class="brand"><a href="#overview">AI <i>×</i> Authenticity</a><span>SECOND ROUND / DESIGN ATLAS</span></div><nav aria-label="Atlas pages">{nav}</nav></header><main id="content"><div class="toolbar"><span>RESEARCH DESIGN · FIVE SHORT ACTIVITIES</span><div><button id="all" type="button">Expand all</button><button id="print" type="button">Print / Save PDF</button></div></div>{overview}{''.join(detail_page(d) for d in data)}{research}{collections}{references}<footer><b>Start with an object. Keep the visitor’s own words.</b><p>Updated 9 October 2026. Object sources were checked on 2 October 2026. Historical exhibitions do not confirm current access or ownership.</p>{link('https://github.com/Jackson-jjc/probe_second-round_design','GitHub repository')}</footer></main></body></html>'''
(HERE/'index.html').write_text(page,encoding='utf-8')

md='# AI × Authenticity: Five Probe Designs\n\nUpdated 9 October 2026. Research design proposals.\n\n[Open the atlas](index.html)\n\n## Why use these probes?\n\n'+PURPOSE+'\n\n'+PROBE_MEANING+'\n\n'+AUTHENTICITY_MEANING+'\n\n## Research questions\n\n'
for label,q,plain in QUESTIONS: md+=f'### {label}\n\n{q}\n\n{plain}\n\n'
md+='## Object selection\n\n'+SELECTION+'\n\nPast GHT exhibitions are not confirmed GHT-owned collections. Under a strict ownership requirement, that part of the pair remains pending. Leather and glass are non-textile alternatives.\n\n'
for o in objects.values():
    md+=f'### {o["venue"]}: {o["name"]}\n\n{o["status"]}. {o["fact"]}\n\n{o["limit"]}\n\n[Venue record]({o["url"]}) · [Source image]({o["image"]})\n\n'
    for s in o.get('additional_sources',[]): md+=f'[{s["label"]}]({s["url"]})\n\n'
for d in data:
    md+=f'## {d["id"]}. {d["name"]}\n\n**In one sentence:** {d["form"]}\n\n{d["people"]}; {d["time"]} (estimate).\n\n![AI design sketch, not a collection photo](assets/concept-{d["id"]}.png)\n\n**Probe question:** {d["focus"]}\n\n'
    md+='### Connection to the research questions\n\n'+'\n\n'.join(d['questions'])+'\n\n'+d['question_connection']+'\n\n### Three steps\n\n'
    for i,s in enumerate(d['steps'],1): md+=f'{i}. **{s["title"]}.** {s["human"]}\n   - AI: {s["ai"]}\n   - Example: {s["example"]}\n   - Record: {s["data"]}\n\n'
    md+='### Venue versions\n\n'
    for a in d['adaptations']:
        o=objects[a['object']]
        md+=f'**{o["venue"]}: {o["name"]}** ({o["status"]})\n\nDetail: {a["detail"]} {a["task"]}\n\nAsk: {a["question"]}\n\nLimit: {a["boundary"]}\n\n'
    md+=f'### Camera and AI\n\n{d["camera_label"]}. {d["camera"]}\n\n{d["camera_data"]}\n\n{d["ai_contract"]}\n\n**Output:** {d["output_fields"]}\n\n### Museum example\n\n[{d["case"]}]({d["caseUrl"]})\n\n{d["caseFact"]}\n\n{d["case_note"]}\n\n### Evidence and analysis\n\n'
    for row in d['evidence']: md+='- '+' / '.join(row)+'\n'
    md+=f'\n{d["analysis"]}\n\n**Follow-up:** {d["followup"]}\n\n**Limit:** {d["limits"]}\n\n### Implementation\n\n'
    md+='\n'.join('- '+x for x in d['materials'])+f'\n\n{d["build"]}\n\n{d["host"]}\n\n**First trial:** {d["pilot"]}\n\n'
md+='## Study limits\n\nStart with one or two probes and about 6–8 trial sessions to test the tasks, not as a final sample-size claim. Follow first view, actual AI output, visitor choice and reason within each session. Retain no-change, rejection and failure cases. Pair tasks use the shared session as a unit while preserving both voices. Likes, time spent and correct answers cannot establish authenticity. Different objects and venues do not support causal claims about culture or place.\n\n## Images and data\n\nConcept images are generated sketches. Source photos carry credits in the atlas. Earlier GHT insets are illustrative; current venue task cards define the objects. All example responses are design text, not participant data. This site does not call AI, open a camera or collect input.\n'
(HERE/'DESIGN_NOTES.md').write_text(md,encoding='utf-8')
(HERE/'collection_sources.json').write_text(json.dumps(dict(checked_on='2026-10-02',objects=objects,selection_note=SELECTION),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Built 9 English pages, 5 probes, 10 venue versions and full design notes.')
