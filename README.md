# AI & Authenticity · Two Probe Directions

**[Read the current research design site](https://jackson-jjc.github.io/probe_second-round_design/)**

Version **2026-10-16-cuff-bag**. Updated **16 October 2026**. The website is in English. It explains how five initial museum activities became two focused directions, what visitors would do, what each direction could investigate and why it is worth a small trial.

## Start here

| Direction | What a visitor does | Research focus |
| --- | --- | --- |
| **[A · Make with AI on My Cuff or Bag](docs/PROBE_A.md)** | Capture a cuff or bag corner, see AI respond, fold or reposition and compare the next preview | Material action, AI response and connection to a source work |
| **[B · One Object, Two Interpretations](docs/PROBE_B.md)** | Develop one postcard through a local-item preview, real reply and clarification, then keep it | Cross-language understanding and an optional personal keepsake |

Both use an approved digital heritage reference and real participant input. AI has a defined role, and visitors can complete a non-AI route. Both use one fixed local capture window. A follows the physical action and AI response. B follows one developing postcard through a real conversation and optional receipt. The next stage is a small visitor trial.

## Follow the reasoning

1. **[Iteration](docs/ITERATION.md)** explains the feedback, broad-participation criterion and selection decisions.
2. **[Five-probe evaluation and initial selection table](docs/COMPARISON.md)** keeps all five activities, questions, theories, speculative elements, feedback and decisions in one continuous comparison.
3. **[A](docs/PROBE_A.md)** and **[B](docs/PROBE_B.md)** give the full activity, AI role, set-up, theory, participant input, data, analysis and revision criteria.
4. **[Speculation](docs/SPECULATION.md)** contains thirteen verified original sentences from Dunne and Raby, printed page numbers and the exact design reasoning they support. Five book cases are tied directly to the five table rows. Each row explains the book case, the idea we borrow, how it relates to the probe, the exact activity step it changes and the choice it informs.
5. **[Numeric references](docs/SOURCES.md)** identify scholarly and official practice sources. References use **[1], [2], [3]**, with no letter prefixes.

The website includes an AI-generated A storyboard, three original SVG design diagrams and six credited book-figure screenshots inside the five-probe table and the case quotations. It also shows four original paper figures from the Huayao making work, the AI Pattern Merchant and machine-translation research. Each has an original figure number, author credit, source and licence. Each example separates the original findings from our design interpretation.

The [detailed Huayao evidence and reasoning for A](docs/EVIDENCE_FOR_A.md) explains what the original study did, how its findings support specific design choices, the change in AI role and what A still needs to establish. The illustrated A section adds a direct Art Morph comparison and a concrete guide to authenticity-related data. On the website, this is expanded inside the Huayao case, with a direct link from A’s theory section.

## Objects and implementation

Target venues: **Tudor House & Garden** and **God’s House Tower**, Southampton. Use digital reference images. Ordinary cloth or paper is an activity material.

The preferred textile candidate is Ian Giles’s *Everyone Involved*, exhibited at GHT in 2024. The venue states that the work would enter Southampton City Art Gallery’s collection afterwards. Before fieldwork, confirm one hanging, its context, current availability and image permission.

Tudor House’s Leather Jug is a leather object. A textile study at this venue can use a confirmed local textile reference, or the permitted GHT-associated digital material with its actual source named. B shares one digital object across languages. A British–Chinese textile pairing would require further object confirmation.

## Repository map

- `index.html` is the current website.
- `build_site.py` builds the website and readable notes using the Python standard library.
- `styles.css` and `app.js` provide the responsive layout, original-passage controls, anchor navigation and printing.
- `content/` contains the illustrated implementation guides for A and B.
- `assets/design/` contains the concept storyboard and three original design diagrams.
- `assets/book-cases/` contains six attributed figure screenshots from the supplied method book.
- `data/probe-designs.json` and `data/comparison-copy.json` are the editable source text for the directions and table.
- `data/directions.json` and `data/five-probe-analysis.json` are generated exports.
- Other `data/` files contain numeric references, original quotations, source-figure credits, image prompts and validation results.
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

Main literature search cut-off: **14 October 2026**. Targeted material-interaction and practice checks added **16 October 2026**. Original passages and figures checked: **16 October 2026**. This focused design synthesis supports the next study iteration.

The associated Huayao papers report related work, and the CHI extended abstract is identified. ZOMA and the empathy study are used at abstract level. Each source contributes a specific design choice, which the A and B trials will examine in their own setting.

Paper figures retain their individual **CC BY 4.0** or **CC BY-NC 4.0** licences. See [figure credits](data/figure-credits.json). Cropping removes surrounding prose without changing figure content. The project is an academic research design presentation. Attributed book quotations and six figure screenshots support discussion of the specific book cases. Figure content and original captions are preserved. Their rights remain with the named rights holders. No open licence is claimed for those screenshots. Full papers, book chapters, raw interview records, private drafts and visitor data are not included.

The page illustrates proposed activities. It presents the research design. Camera capture, AI and email are planned for the private study system. Example card wording and timings are design suggestions.

The iteration records the **2 October meeting before the 9 October probe interview**. The researcher confirmed the meeting date on 16 October. Current web content and the local Chinese materials use the same version ID.
