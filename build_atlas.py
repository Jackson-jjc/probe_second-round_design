# -*- coding: utf-8 -*-
"""Build the self-contained public design atlas. Python standard library only."""
from pathlib import Path
from html import escape as e
import json

HERE = Path(__file__).resolve().parent
load = lambda name: json.loads((HERE / name).read_text(encoding='utf-8'))
data = load('design_data.json')
details = {d['id']: d for d in load('research_details.json')}
venues = load('venue_designs.json')
objects = venues['objects']
for d in data:
    d.update(details[d['id']])
    d.update(venues['probes'][d['id']])
assert len(data) == 5 and all(len(d['adaptations']) == 2 for d in data)

RQS = [
 ('RQ · 主问题', '博物馆与遗产场所中的人机互动，如何塑造访客的真实性体验？', 'How do human–AI interactions shape visitors’ experiences of authenticity in museums and heritage sites?'),
 ('SQ1 · 体验依据', '访客在AI中介的遗产相遇中，依托什么形成真实性体验？', 'What do visitors draw on to experience authenticity in AI-mediated heritage encounters?'),
 ('SQ2 · 互动过程', '访客如何在与AI互动时，维持或修订对真实性的理解？', 'How do visitors maintain or revise their understandings of authenticity through interaction with AI?')
]

def link(url, text):
    return f'<a href="{e(url, quote=True)}" target="_blank" rel="noopener noreferrer">{e(text)} ↗</a>'

def photo(src, alt, credit):
    return f'<figure class="reference-photo"><div class="photo-well"><img src="{e(src,quote=True)}" alt="{e(alt,quote=True)}" loading="lazy" referrerpolicy="no-referrer"><p class="image-fallback" hidden>外部图片暂未载入，请使用下方来源链接查看原图。</p></div><figcaption>{e(credit)} 外链预览，需联网。</figcaption></figure>'

def object_card(key, adaptation=None):
    o = objects[key]
    extra_sources = ''.join('<p class="small">'+link(s['url'],s['label'])+'</p>' for s in o.get('additional_sources',[]))
    more = '' if not adaptation else f'''<div class="adaptation"><h4>这里具体选什么？</h4><p>{e(adaptation['detail'])}</p><h4>换到这家馆，怎么做？</h4><p>{e(adaptation['task'])}</p><p class="quote">{e(adaptation['question'])}</p><p class="small"><b>设计边界：</b>{e(adaptation['boundary'])}</p></div>'''
    return f'''<article class="object-card"><div class="object-copy"><span class="eyebrow">{e(o['venue'])}</span><h3>{e(o['name'])}</h3><p class="en">{e(o['english'])}</p><span class="status">{e(o['status'])}</span></div>{photo(o['image'],o['name']+' · 来源参考图',o['credit'])}<div class="object-copy"><p>{e(o['fact'])}</p><p class="small">{e(o['limit'])}</p>{link(o['url'],'核查官方对象／展览资料')}{extra_sources}{more}</div></article>'''

def rq_cards():
    return '<div class="rq-grid">'+''.join(f'<article><span class="eyebrow">{a}</span><h3>{b}</h3><p class="en">{c}</p></article>' for a,b,c in RQS)+'</div>'

def table(headers, rows):
    return '<div class="table-scroll"><table><thead><tr>'+''.join(f'<th>{h}</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td>{c}</td>' for c in row)+'</tr>' for row in rows)+'</tbody></table></div>'

def storyboard(d):
    result = '<div class="storyboard">'
    for i,(screen,s,note) in enumerate(zip(d['screens'],d['steps'],d['screen_notes'])):
        result += f'''<article class="screen"><div class="screen-bar"><span>{chr(65+i)} / {e(screen['title'].split(' ',1)[-1])}</span><span>{i+1} / 3</span></div><div class="screen-body"><span class="mini-label">界面文案与布局示意</span><h3>{e(note)}</h3><div class="sample">{e(s['example'])}</div><p>{e(screen['content'])}</p><div class="mock-button">{e(screen['controls'])}</div></div><div class="screen-foot">{e(s['data'])}</div></article>'''
    return result+'</div><p class="small">这里展示设计流程，按钮为静态示意。例句是设计者构造的示例，不是AI实测输出或参与者数据。</p>'

def detail_page(d):
    case_photo = photo(d['case_image'],d['case']+' · 官方案例图片','图片来源：'+d['case']+' 官方页面；版权归原权利人。')
    steps=''.join(f'''<article><span class="step-number">{i:02}</span><h3>{e(s['title'])}</h3><p>{e(s['human'])}</p><p class="small"><b>AI：</b>{e(s['ai'])}</p></article>''' for i,s in enumerate(d['steps'],1))
    return f'''<section class="page probe" id="p{d['id']}" aria-labelledby="title-{d['id']}">
    <div class="page-top"><a href="#overview">← 五方案总览</a><a href="assets/concept-{d['id']}.png" target="_blank">打开原尺寸设计图 ↗</a></div>
    <div class="eyebrow">PROBE {d['id']} / {e(d['verb'])} / {e(d['lens'])}</div><h1 id="title-{d['id']}">{e(d['name'])}</h1><p class="lead">{e(d['short'])}</p><p class="intro">{e(d['form'])}</p>
    <div class="tags"><span>{e(d['people'])}</span><span>{e(d['time'])}</span><span>{e(d['camera_label'])}</span><span>一次AI回应</span></div>
    <figure class="concept"><img src="assets/concept-{d['id']}.png" alt="方案{d['id']}：{e(d['name'])}的设备、访客动作与屏幕关系概念图" width="1536" height="1024"><figcaption><b>AI生成的场景设计图。</b>物件、场地与屏幕均为示意，不是馆藏照片或已实施系统；具体对象以本页来源图片为准。右侧插图只表示替换对象的交互可能性。中文界面流程见下方。</figcaption></figure>
    <div class="focus"><span class="eyebrow">这一项具体研究什么</span><h2>{e(d['focus'])}</h2><p>{e(d['rqmap'])}</p><p><b>值得观察的张力：</b>{e(d['tension'])}</p></div>
    <div class="section-heading"><span>01 / INTERACTION</span><h2>三个界面，把一次互动讲清楚</h2></div>{storyboard(d)}
    <div class="invite">“{e(d['invite'])}”</div><div class="steps">{steps}</div>
    <div class="section-heading"><span>02 / COLLECTIONS</span><h2>两个目标场所，各自对应什么对象？</h2></div><p class="small">以下为同一互动机制的两种场地适配。左侧流程细节以THG为基础；GHT的替换任务、资料与条件在右卡单列。曾展出不等于现在可用，也不等于GHT拥有作品。</p><div class="object-grid">{''.join(object_card(a['object'],a) for a in d['adaptations'])}</div>
    <div class="section-heading"><span>03 / CAMERA & AI</span><h2>摄像头和AI，各自负责什么？</h2></div><div class="two-col"><article class="panel"><h3>{e(d['camera_label'])}</h3><p>{e(d['camera'])}</p><p class="small">{e(d['camera_data'])}</p></article><article class="panel"><h3>一次AI调用的输入与输出</h3><p>{e(d['ai_contract'])}</p><h4>最终产物</h4><p>{e(d['output_fields'])}</p></article></div>
    <div class="section-heading"><span>04 / PRECEDENT</span><h2>真实案例 → 本方案的改动</h2></div><div class="case-study">{case_photo}<article><span class="eyebrow">已有博物馆实践</span><h3>{e(d['case'])}</h3><p>{e(d['caseFact'])}</p>{link(d['caseUrl'],'查看官方案例')}<h4>借用什么，改变什么？</h4><p>{e(d['case_note'])}</p><p class="small">案例说明交互形式有先例，不证明本方案已被两家目标馆采用，也不证明AI改善了真实性体验。</p></article></div>
    <div class="section-heading"><span>05 / EVIDENCE</span><h2>留下什么材料，怎样回答研究问题？</h2></div>{table(['保存的过程材料','可以观察什么','不能直接推断什么'],[[e(x) for x in row] for row in d['evidence']])}
    <article class="panel"><h3>分析单位与方法</h3><p>{e(d['analysis'])}</p><p><b>结束追问：</b>{e(d['followup'])}</p><p class="small"><b>局限：</b>{e(d['limits'])}</p></article>
    <details class="implementation"><summary>实施清单、主持方式与小试检查</summary><div class="two-col"><article><h3>材料与设备</h3><ul>{''.join('<li>'+e(x)+'</li>' for x in d['materials'])}</ul><h3>最小实现</h3><p>{e(d['build'])}</p></article><article><h3>时间安排（设计估计）</h3><ol>{''.join('<li>'+e(x)+'</li>' for x in d['timing'])}</ol><p class="small">不含招募、知情同意与设备调试。GHT采用右侧适配任务，须重新试时。</p><h3>研究者怎么主持</h3><p>{e(d['host'])}</p></article></div><h3>第一轮小试先看什么</h3><p>{e(d['pilot'])}</p><p><b>适合：</b>{e(d['choose'])}</p><p><b>不优先：</b>{e(d['notchoose'])}</p></details>
    <div class="page-top bottom"><a href="#overview">← 返回总览</a><a href="#p{int(d['id'])%5+1:02}">下一个方案 →</a></div></section>'''

overview = f'''<section class="page" id="overview"><div class="hero"><div><span class="eyebrow">SECOND ROUND PROBE / DESIGN ATLAS / 2026.10.02</span><h1>五种互动，<br>看见理解如何变化。</h1><p class="lead">从藏品细节，到人的身体、记忆与声音。<br>一次AI回应之后，把判断交还给访客。</p><div class="actions"><a class="button" href="#p01">从方案01开始 →</a><a class="text-link" href="#research">先看研究问题 ↗</a></div><p class="small">5个方案 · 2个目标场所 · 每项约6–10分钟<br>设计稿，尚未接入AI、摄像头或开展访客研究。</p></div><a href="#p02" class="hero-image"><img src="assets/concept-02.png" alt="方案02：通过摄像头比较手工作品和藏品细节的AI生成概念图" width="1536" height="1024"><span>02 / 把领子折出来 · AI生成概念图</span></a></div>
    <div class="overview-note"><b>先问一个共同问题</b><p>人机互动如何塑造访客的真实性体验？五个Probe分别观察细节证据、材料经验、改作边界、共同解释与人际联系。喜欢、信任、答对知识题，均不能直接代替真实性体验。</p></div>
    <div class="section-heading"><span>FIVE PROBES</span><h2>先选你想观察的那种关系</h2><p>每页都有：场景设计图 → 三屏流程 → 两馆对象 → 案例转化 → 数据与分析。</p></div><div class="design-grid">{''.join(f'<a class="design-card" href="#p{d["id"]}"><img src="assets/concept-{d["id"]}.png" alt="方案{d["id"]}场景概念图" loading="lazy" width="1536" height="1024"><div><span class="eyebrow">{d["id"]} / {e(d["lens"])}</span><h2>{e(d["name"])}</h2><p>{e(d["short"])}</p><span class="small">{e(d["time"])} · {e(d["camera_label"])}</span><span class="card-arrow" aria-hidden="true">↗</span></div></a>' for d in data)}</div>
    <div class="section-heading"><span>AT A GLANCE</span><h2>五项如何区分？</h2></div>{table(['方案','人的输入 → AI回应','最关键的观察','两个场所的对象'],[[f'<a href="#p{d["id"]}">{d["id"]} {e(d["name"])}</a>',e(x),e(y),e(objects[d['adaptations'][0]['object']]['name'])+'<br>／'+e(objects[d['adaptations'][1]['object']]['name'])] for d,x,y in zip(data,['选点＋疑问 → 有出处的线索','作品照＋手感 → 视觉比较','改动／保留要求 → 局部新作','两句独立理解 → 一张展签','给同伴的原话 → 观看邀请'],['哪些依据被接受、保留或推翻','人如何纠正AI漏掉的身体感受','个人表达与历史对象如何区分','谁的声音被保留、弱化或协商','原意、改写与接收是否相通'])])}
    <div class="two-col"><article class="panel"><h3>先做哪一个？</h3><p><b>先做01</b>，最容易得到围绕具体对象的解释。需要摄像头与动手体验，选<b>01＋02</b>；关注AI图像改作，选<b>01＋03</b>；关注共同声音，选<b>04＋05</b>。</p><p class="small">这些是制作建议，不是效果排名。先选1–2项小试，不要求每位访客做完五项。</p></article><article class="panel"><h3>两馆资料现在到哪一步？</h3><p>THG已核实皮革酒壶与绘鸟玻璃片。GHT已核实Pether借展绘画组及《Everyone Involved》历史展览；永久馆藏归属和当前可用性不能由展览记录代替。</p><a href="#collections">查看真实对象图片与可用条件 →</a></article></div></section>'''

research=f'''<section class="page" id="research"><span class="eyebrow">RESEARCH LOGIC</span><h1>问题保持集中，<br>证据落在互动过程。</h1><p class="lead">五种设计是进入同一研究问题的不同入口，不是五个独立课题。</p>{rq_cards()}
<div class="section-heading"><span>OPERATIONAL FOCUS</span><h2>这里怎样理解“真实性体验”？</h2></div><p>关注访客如何描述自己与物件、过去、场地、制作过程或他人产生的真实联系，以及他们用什么理由支持这种联系。先收集参与者的语言，再使用“物件依据、个人表达、身体经验、人际关系”等作为分析提示；不预先规定哪一种才算真实。</p><div class="process"><article><b>互动前</b><p>我注意到什么？<br>为什么对我重要？</p><span>SQ1 · 初始依据</span></article><article><b>AI介入</b><p>它说了／改了什么？<br>所依据的材料是什么？</p><span>保留实际输入与输出</span></article><article><b>人的回应</b><p>保留、修订、拒绝或悬置？<br>理由是什么？</p><span>SQ2 · 维持与变化</span></article></div>
<h2>同一个过程，五种可观察的张力</h2>{table(['Probe','具体观察焦点','如何连接正式研究问题'],[[f'<a href="#p{d["id"]}">{d["id"]} {e(d["name"])}</a>',e(d['focus']),e(d['rqmap'])] for d in data])}
<div class="two-col"><article class="panel"><h3>建议的小试方式</h3><p>第一步先与场馆确认对象和资料卡。再选1–2个Probe，约6–8段试用会话检查任务是否清楚、是否留下具体解释；这是设计估计，不是正式样本量或统计功效结论。双人Probe以一对访客的一段互动为单位。</p><p>研究者先问“为什么停在这里”“这让你怎样理解它”，最后再追问联系与真实感。不把“你现在是不是更觉得真实了”当成标准提问。</p></article><article class="panel"><h3>建议的分析路径</h3><p>按事件对齐：原始关注 → 实际AI输出 → 人的取舍 → 具体理由。先做会话内过程分析，再比较不同访客；保留没有改变、拒绝AI、任务失败等反例。</p><p>记录媒介（原物／数字图）、场馆、使用语言、摄像头模式、同伴关系、研究者协助及模型错误。两馆对象不同，不能据差异声称“场馆”或“文化”造成了效果。</p></article></div>
<article class="panel"><h3>什么可以作为证据，什么还不够？</h3><p><b>有解释力的材料：</b>访客明确指向一个细节、一个事实或一次手感，并说明它为什么改变／没有改变自己与对象的关系。</p><p><b>还不够的材料：</b>点击次数、停留时长、喜欢程度、知识正确率或泛泛的“AI很好用”。这些可以提供背景，不能独自回答真实性问题。</p><p><b>若后续要检验AI的因果影响：</b>需另行设计无AI或等内容对照、分配与顺序方案，并重新确定样本量。本轮是探索性设计Probe，不承担这一结论。</p></article>
<details class="implementation"><summary>研究实施时的最小记录与参与选择</summary><p>每段会话记录对象与资料版本、匿名会话代号、人的实际输入、模型版本与输出、人的修订及理由。是否保存作品照片、是否录音分别说明；仅在确认后提交必要的图文给模型，并记录实际服务提供方与数据去向。未确定模型服务前不开展采集。</p><p>允许跳过理由、拒绝AI版本、保留两种意见或退出；由研究者代录时逐字回读。结束后清除共享设备上的上一位访客内容。网页本身只有设计展示，不申请摄像头或保存参与者输入。</p></details></section>'''

collections=f'''<section class="page" id="collections"><span class="eyebrow">TWO VENUES / VERIFIED REFERENCES</span><h1>对象有出处，<br>场地关系说清楚。</h1><p class="lead">Tudor House & Garden × God’s House Tower</p><div class="overview-note"><b>藏品、借展作品与场地，不混为一谈。</b><p>THG两项由官方馆藏亮点页确认。GHT目前能可靠对应的是历史展出的对象；本轮未核实到可直接使用的GHT永久馆藏清单。以下给出具体方案适配，但保留借展／曾展身份，不把它们写成现展或GHT自有藏品。</p><p class="small">核查日期：2026-10-02。工作代号只是本项目索引，不是馆方藏品编号。当前沿用“对象优先”的设计范围：皮革与玻璃不是纺织品；若研究必须限定纺织品，THG方案还需另选馆方确认的对象。</p></div><div class="object-grid">{''.join(object_card(k) for k in objects)}</div>
<h2>两馆落地前需要明确的四件事</h2><div class="process four"><article><b>01 / 对象</b><p>THG确认单件编号；GHT复核具名画作与一件壁挂组件及其出借或收藏主体。</p></article><article><b>02 / 可见性</b><p>目前能看原物还是只用数字图？GHT历史展览日期不等于现在在展。</p></article><article><b>03 / 图像</b><p>落实可用高清图、摄影条件和研究使用范围；03另确认生成改作条件。</p></article><article><b>04 / 事实卡</b><p>确定可说的事实、来源与不确定之处；将个人联想与史实分开。</p></article></div><p>若GHT不能提供这些对象，可与场馆讨论以建筑本体作为替代遗产对象。但这会改变刺激材料，应另列条件并重新试用，不能继续称为“同一藏品比较”。{link('https://godshousetower.org.uk/ght-story-3/','GHT建筑与场地历史')}</p></section>'''

references=f'''<section class="page" id="references"><span class="eyebrow">SOURCES & DELIVERY</span><h1>案例依据与文件说明</h1><p class="lead">案例事实来自官方页面；互动转化与研究解释是本项目的设计判断。</p>{table(['方案','官方案例','本方案借用与改动'],[[f'{d["id"]} {e(d["name"])}',link(d['caseUrl'],d['case']),e(d['case_note'])] for d in data])}<h2>图像身份</h2><p>五张场景图使用内置 image_gen 生成，提示词保存于 <a href="image_prompts.json">image_prompts.json</a>。它们用于表达设备、动作和界面关系，不承担藏品外观、文物材质或历史场景的证据功能。</p><p>THG对象、壁挂与案例图片外链自官方页面；Pether画作使用Art UK图片地址，并以Commons转载档案及开幕报道交叉核对，逐项保留来源与权利说明；仓库不打包这些第三方照片。外链加载失败仍保留对象文字与来源链接。正式研究所需的高清图和使用条件需落实。</p><h2>可复用文件</h2><ul><li><a href="DESIGN_NOTES.md">完整五方案文字稿</a>：研究问题、两馆对象、摄像头与分析路径。</li><li><a href="venue_designs.json">两馆适配与来源数据</a>；<a href="collection_sources.json">对象来源索引</a>。</li><li><a href="build_atlas.py">构建脚本</a>：只需Python标准库，运行后生成本页与文字稿。</li><li><a href="README.md">使用说明</a>；<a href="validation.json">交付检查记录</a>。</li></ul><p class="small">全部例句为设计示例；时间、难度与试用人数为建议，未作为实测结果。无AI接口、摄像头采集、访客数据或跟踪统计。</p></section>'''

nav='<a href="#overview">总览</a>'+''.join(f'<a href="#p{d["id"]}">{d["id"]} {e(d["name"])}</a>' for d in data)+'<a href="#research">研究问题</a><a href="#collections">两馆对象</a><a href="#references">案例与来源</a>'
page=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="五个AI博物馆研究Probe的设计图、两馆对象、案例与真实性研究问题。"><title>AI × Authenticity · 五方案设计图册</title><link rel="stylesheet" href="styles.css"><script src="app.js" defer></script></head><body><a class="skip-link" href="#content">跳到内容</a><header><div class="brand"><a href="#overview">AI <i>×</i> Authenticity</a><span>第二轮 / 设计图册</span></div><nav aria-label="图册导航">{nav}</nav></header><main id="content"><div class="toolbar"><span>DESIGN PROPOSAL · 非运行系统</span><div><button id="all" type="button">展开全部</button><button id="print" type="button">打印／保存PDF</button></div></div>{overview}{''.join(detail_page(d) for d in data)}{research}{collections}{references}<footer><b>从对象出发，把人的判断留下来。</b><p>方案与研究设计 · 2026.10.02。生成概念图 ≠ 藏品照片；历史展览记录 ≠ 当前可用性。</p><a href="https://github.com/Jackson-jjc/probe_second-round_design" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a></footer></main></body></html>'''
(HERE/'index.html').write_text(page,encoding='utf-8')

md = '# 五个AI Probe：设计图、两馆对象与研究逻辑\n\n更新：2026-10-02。设计稿；未接入AI或开展参与者研究。\n\n[打开设计图册](index.html)\n\n'
md+='## 研究问题\n\n'+''.join(f'**{a}：{b}**\n\n{c}\n\n' for a,b,c in RQS)
md+='五项为探索性Probe，关注访客如何用对象、过去、身体、个人表达或他人联系形成并修订真实性体验。喜欢、信任、停留时长和知识正确率不能直接代替真实性。建议先选1–2项开展约6–8段会话的小试以校准流程；这不是正式样本量估计。以会话内“原始关注→AI实际输出→人的取舍→解释理由”为分析主线，保留未改变、拒绝与失败事件；双人任务以互动对为单位。两馆对象和媒介不同，不作场馆或文化的因果比较。\n\n'
md+='## 两馆对象与使用条件\n\nTHG两项来自官网馆藏亮点；GHT两项是已核实的历史借展／展览对象，并非已核实的GHT永久馆藏或现展作品。对象范围沿用现有设计的皮革、玻璃与纺织等；若必须严格限定纺织品，THG仍需另选对象。\n\n'
for k,o in objects.items():
    md+=f'### {k} · {o["name"]}\n\n{o["venue"]} / {o["english"]} / {o["status"]}\n\n{o["fact"]}\n\n{o["limit"]}\n\n[官方资料]({o["url"]}) · [来源参考图]({o["image"]})\n\n'
    md+=''.join(f'[{s["label"]}]({s["url"]})\n\n' for s in o.get('additional_sources',[]))
for d in data:
    md+=f'## {d["id"]} {d["name"]}\n\n**一句话：**{d["form"]}\n\n{d["people"]}，约{d["time"]}（未实测）。\n\n![AI生成概念图，不是馆藏照片](assets/concept-{d["id"]}.png)\n\n**观察焦点：**{d["focus"]}\n\n**对应RQ：**{d["rqmap"]}\n\n**张力：**{d["tension"]}\n\n### 三步互动\n\n'
    for i,s in enumerate(d['steps'],1): md+=f'{i}. **{s["title"]}**：{s["human"]}\n   - AI：{s["ai"]}\n   - 保存：{s["data"]}\n\n'
    md+='### 两馆适配\n\n'
    for a in d['adaptations']:
        o=objects[a['object']]
        md+=f'**{o["venue"]} / {o["name"]}（{o["status"]}）**\n\n选取：{a["detail"]}。{a["task"]}\n\n追问：{a["question"]}\n\n边界：{a["boundary"]}\n\n'
    md+=f'### 摄像头与AI\n\n{d["camera_label"]}。{d["camera"]}\n\n{d["camera_data"]}\n\n{d["ai_contract"]}\n\n### 案例与设计变化\n\n[{d["case"]}]({d["caseUrl"]})。{d["caseFact"]}\n\n{d["case_note"]}\n\n### 数据与分析\n\n'
    md+='|保存材料|观察内容|推断边界|\n|---|---|---|\n'+''.join('|'+ '|'.join(row)+'|\n' for row in d['evidence'])
    md+=f'\n{d["analysis"]}\n\n**产物：**{d["output_fields"]}\n\n**主持：**{d["host"]}\n\n**最小制作：**{d["build"]}\n\n**试用检查：**{d["pilot"]}\n\n**局限：**{d["limits"]}\n\n'
md+='## 图像与实施说明\n\n场景设计图由内置image_gen生成；原始提示见image_prompts.json。真实对象与案例照片外链自官方网页或已标明的图像档案，保留来源，不以生成图替代。正式实施先落实单件编号、图像及使用条件、事实卡和模型服务。摄像头只在确认后提交必要图像，讨论录音另行说明；允许跳过、拒绝与退出，结束后重置共享设备。\n'
(HERE/'DESIGN_NOTES.md').write_text(md,encoding='utf-8')
(HERE/'collection_sources.json').write_text(json.dumps({'verified_on':venues['verified_on'],'objects':objects,'image_status':'five_generated_concepts; official_object_and_case_images_linked_remotely; high_resolution_research_use_pending'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Built index.html, DESIGN_NOTES.md and collection_sources.json: 5 probes / 10 venue adaptations.')
