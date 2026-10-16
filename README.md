# AI & Authenticity · Two Probe Directions

**[Read the current research design site](https://jackson-jjc.github.io/probe_second-round_design/)**

Updated **16 October 2026**. The website is in English. It explains how five initial museum activities became two focused directions, what visitors would do, what each direction could investigate and why it is worth a small trial.

## Start here

| Direction | What a visitor does | Research focus |
| --- | --- | --- |
| **[A · My Making Card](docs/PROBE_A.md)** | Try a simple material action, then keep or correct AI’s account of the experience | Making, lived experience and authenticity |
| **[B · One Object, Two Interpretations](docs/PROBE_B.md)** | Explain a detail, exchange a real reply through optional translation, then clarify meaning | Personal interpretation and cross-language exchange |

Both use an approved digital heritage reference and real participant input. AI has a defined role, and visitors can complete a non-AI route. The card is something to take away and a record to discuss. The new activities have not yet been tested.

## Follow the reasoning

1. **[Iteration](docs/ITERATION.md)** explains the feedback, broad-participation criterion and selection decisions.
2. **[Five-probe evaluation and initial selection table](docs/COMPARISON.md)** keeps all five activities, questions, theories, speculative elements, feedback and decisions in one continuous comparison.
3. **[A](docs/PROBE_A.md)** and **[B](docs/PROBE_B.md)** give the full activity, AI role, set-up, theory, participant input, data, analysis and revision criteria.
4. **[Speculation](docs/SPECULATION.md)** contains thirteen verified original sentences from Dunne and Raby, printed page numbers and the exact design reasoning they support. Five book cases are tied directly to the five table rows. Each row states its present gap, different arrangement, discussion prop, trade-off and consequence for selection.
5. **[Numeric references](docs/SOURCES.md)** identify scholarly and official practice sources. References use **[1], [2], [3]**, with no letter prefixes.

The website additionally shows four original paper figures from the Huayao making work, the AI Pattern Merchant and machine-translation research. Each has an original figure number, author credit, source and licence. Findings, our design inferences and transfer limits are distinguished.

The [detailed Huayao evidence and reasoning for A](docs/EVIDENCE_FOR_A.md) explains what the original study did, how its findings support specific design choices, the change in AI role, an illustrative analysis episode and what A still needs to establish. On the website, this is expanded inside the Huayao case, with a direct link from A’s theory section.

## Objects and implementation

Target venues: **Tudor House & Garden** and **God’s House Tower**, Southampton. Use digital images rather than handling original objects. Ordinary cloth or paper is an activity material.

The preferred textile candidate is Ian Giles’s *Everyone Involved*, exhibited at GHT in 2024. The venue states that the work would enter Southampton City Art Gallery’s collection afterwards. GHT ownership, current display and image permission are not assumed. One hanging and its context still need confirmation.

Tudor House’s Leather Jug is leather, not a textile. A strictly textile-led study needs a confirmed textile reference or permission to use the GHT-associated digital material at that location with its actual source named. A verified British–Chinese textile pair at the two venues has not been established. B can share one digital object across languages.

## Repository map

- `index.html` is the current website.
- `build_site.py` builds the website and readable notes using the Python standard library.
- `styles.css` and `app.js` provide the responsive layout, original-passage controls, anchor navigation and printing.
- `data/` contains the two directions, one five-probe comparison, numeric references, original quotations and figure credits.
- `docs/` contains readable research notes for GitHub.
- `assets/research/` contains four credited paper-figure crops.
- `archive/initial-five/` keeps the self-contained early five-probe atlas. **It is a historical design version, not the current recommendation.**

## Build and preview

```text
python build_site.py
python -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/`. The current site is also readable by opening `index.html` directly. No frontend dependency or AI service is required. The optional venue photograph loads from the official source website and has a fallback.

GitHub Pages serves the root of `main`. Check its publication status after a push before calling a version live.

## Evidence and assets

Literature search cut-off: **14 October 2026**. Original passages and figures checked: **16 October 2026**. This is a focused design-oriented synthesis, not a systematic review or a claim that the ideas are unprecedented.

The associated Huayao papers are not independent replications. The CHI extended abstract is labelled as such. ZOMA and the empathy study are used at abstract level. Other papers and real museum implementations inform the design without proving outcomes for A or B.

Paper figures retain their individual **CC BY 4.0** or **CC BY-NC 4.0** licences. See [figure credits](data/figure-credits.json). Cropping removes surrounding prose without changing figure content. The project is an academic research design presentation. Brief attributed book quotations support critical discussion. Full papers, book chapters, raw interview records, private drafts and visitor data are not included.

The page illustrates proposed activities. It does not open a camera, call an AI model, collect visitor data or contain analytics. Example card wording and timings are design suggestions.
