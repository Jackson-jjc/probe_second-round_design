# AI & Authenticity · First-stage Probe Development

[Read the research design website](https://jackson-jjc.github.io/probe_second-round_design/)

Version **2026-10-21-ethics117392-stage1**. Protocol basis: **Probe Development Survey, ERGO 117392, V1.0, 21 October 2026**. Recruitment begins after ethics approval.

## Start with the current test

10–15 adult ECS staff or students try A then B, about three minutes each, and answer four optional questions. Total session time is about 10–15 minutes. AI content is prepared and checked before sessions. The researcher manually switches examples and assembles cards. [Read the full first-stage plan](docs/FIRST_STAGE_TEST.md).

**[A · Make with AI on My Cuff or Bag](docs/PROBE_A.md):** choose a source detail, arrange materials, compare prepared AI effects on cuff/bag pictures, then select a source-labelled postcard.

**[B · One Object, Two Interpretations](docs/PROBE_B.md):** combine original participant words, a source reference and a selected prepared AI image in one postcard. Read earlier submitted cards and reply or clarify.

Both anonymous postcards join a shared local study wall. Participants may keep printed copies of their own cards without other people’s replies. The wall runs on study equipment, requires no account and is restricted to study participants.

## Data and participation

Retain consent ticks, questionnaire answers, A source/image choices, and B original words, replies and clarifications with source/image and reply references. Export text and references to existing images. Exclude labelled AI starter notes from participant evidence. Questionnaire answers remain private.

The study excludes names, signatures, contacts, demographics, photographs, screenshots, audio, video, observation notes, interaction logs and A’s physical arrangements. Participant text stays outside AI services. Participants may skip or discard drafts before submission. Submitted anonymous data cannot be located for removal. Lock paper and use approved secure UK University storage. Retain data for at least 10 years after collection or publication, whichever is later, then review disposal.

## Follow the design reasoning

- [Iteration](docs/ITERATION.md): 2 October meeting, 9 October interview, 16 October concept and 21 October first-stage protocol.
- [Five-probe table](docs/COMPARISON.md): starting ideas, current A/B, focused questions, theory, book cases and selection reasons.
- [Speculation](docs/SPECULATION.md): thirteen original passages and six credited book-figure screenshots. Book originals and our design inferences are distinguished. Future museum scenarios explain the design direction and remain separate from the current protocol.
- [Huayao evidence](docs/EVIDENCE_FOR_A.md) and [31 numeric references](docs/SOURCES.md): original research and museum precedents.

The site uses plain activity names throughout. The earlier image codes have been replaced. Current diagrams show prepared examples, manual simulation and the local postcard wall. The original camera and live-generation concept is preserved in Git history. Its implementation and evaluation would be a later study.

## Sources and files

Use only images and collection information for 1–2 agreed objects from Tudor House & Garden and God’s House Tower. The textile shortlist includes Ian Giles’s *Everyone Involved*, shown at GHT in 2024. Confirm the exact image, source context and use permission before preparing the examples. The venue states that the work would enter Southampton City Art Gallery’s collection. Tudor House’s Leather Jug is classified as leather.

`data/study-plan.json` defines the current procedure. `data/probe-designs.json`, `data/comparison-copy.json` and `content/` hold editable text. `build_site.py` generates the website and readable notes. `assets/design/` holds editable SVG diagrams. `archive/initial-five/` preserves the early five-probe atlas as history. The website presents the research design. Study activities run on separate local equipment.

Build with `python build_site.py`. Preview with `python -m http.server 8767 --bind 127.0.0.1`. Opening `index.html` directly also works.

Literature search cut-off: 14 October 2026, with targeted checks on 16 October. Existing academic claims and original quotations are retained. Paper figures keep their individual Creative Commons licences and source credits. Book screenshots retain original captions and rights-holder credits. Full books, papers, private ethics forms, interview records and participant data are outside the public repository.
