# AI & Heritage · Two Probe Concepts and Round 1

[Read the research design website](https://jackson-jjc.github.io/probe_second-round_design/)

Version **2026-10-23-full-concepts**. Five starting ideas led to two working probe concepts. Round 1 is their first low-fidelity exploration. Feedback will refine the directions, support further iterations and inform eventual selection.

## The two working concepts

**[A · Make with AI on My Cuff or Bag](docs/PROBE_A.md)** investigates: How do people maintain or revise their understandings of authenticity through interaction with AI and cultural heritage? The intended interaction begins with assembling ordinary materials. An approved photograph of the arrangement and a named textile reference enter AI together. The person rearranges, photographs again and compares the response. A cuff or bag is one presentation form.

**[B · One Object, Two Interpretations](docs/PROBE_B.md)** investigates: How do people express and negotiate their understanding of a shared heritage object through AI-mediated cross-cultural exchange? AI language and image assistance support expression, real replies and clarification. The conversation stays visible alongside related postcards. Digital interfaces and paper boards with a small AI screen are two implementation options. Integrated printing is a possible later addition.

These are developing concepts. The website distinguishes their intended AI interactions and possible future research records from the implementation and collection limits of each prototype round. Diagram labels use ordinary step names.

## Round 1 · Low-fidelity prototypes

[Read the Round 1 plan](docs/FIRST_STAGE_TEST.md). Basis: **ERGO 117392, V1.0, 22 October 2026**. Recruitment begins after ethics approval. 10–15 adult ECS staff or students try A then B, about three minutes each, and answer four optional questions. Total time is about 10–15 minutes.

A uses the provided textile image, material arrangement and prepared AI examples. Participants choose a postcard and may add a one-sentence caption about what they kept or changed and why.

B retains all earlier original-language messages and replies. Participants add a comment or reply, choose one message and a prepared AI image, and form a related postcard. The conversation and postcard areas share one local whiteboard. Full history remains visible.

AI examples are prepared and checked before sessions. The researcher manually switches examples and assembles cards. Anonymous messages and A/B cards remain for later participants. Own-card paper copies exclude other people’s replies.

Retain consent and questionnaire answers, A optional captions and source/image choices, B original messages and reply/clarification relationships, plus source/image/postcard references. Keep questionnaire answers private and exclude labelled AI starters. This round excludes photographs, screenshots, recordings, observation notes, interaction logs, personal details and A’s physical arrangements. Participant text stays outside AI services. Participation and storage follow the submitted protocol.

## Follow the reasoning

- [Development](docs/ITERATION.md): meeting, interview, five-to-two selection and prototype rounds.
- [One five-probe table](docs/COMPARISON.md): activities, questions, theory, book cases and selection.
- [Speculation](docs/SPECULATION.md): thirteen original passages, six credited screenshots and the design inferences they support.
- [Research evidence](docs/EVIDENCE_FOR_A.md) and [31 numeric references](docs/SOURCES.md).

`data/probe-designs.json` defines the working concepts. `data/study-plan.json` defines Round 1. `content/first-stage-test.html` gives the separate round description. `build_site.py` builds the site and notes. `assets/design/` contains editable diagrams for both levels. The old five-probe atlas remains historical under `archive/initial-five/`.

Use permitted digital object images and checked information from the target venues. The textile shortlist includes Ian Giles’s Everyone Involved, shown at GHT in 2024. Verify the exact image and permission. The work’s source and collection context stay visible. Raw ethics forms, private records, full books and participant data are outside the public repository.

Build with `python build_site.py`. Preview with `python -m http.server 8767 --bind 127.0.0.1`. The built page also opens directly from disk. Literature search cut-off and existing source credits are preserved. This update clarifies design levels and the latest protocol.

## Visual mockups · 23 October 2026

Five built-in image_gen illustrations show the working A and B concepts and their distinct Round 1 setups. Textile motifs, messages and interface details in these images are invented for explanation. Existing research and book figures remain unchanged. The A picture now shows material assembly, approved photography, both AI inputs and a second response. B also has a hybrid paper-board illustration with a separately labelled later printer option.

Current assets: `assets/design/a-concept-mockup.png`, `assets/design/b-concept-mockup.png`, `assets/design/round1-a-mockup.png` `assets/design/round1-b-mockup.png` and `assets/design/b-hybrid-mockup.png`. The existing storyboard URL also shows the corrected A mockup. Plain-language flow diagrams remain available in expandable sections. [Prompts and correction instructions](data/design-image-prompts.json).
