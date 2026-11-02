# CFA Level III Study Hub (Portfolio Management pathway, Aug 2027)

Same architecture as `cfa-l2.html`: static HTML, no build step, state in localStorage, StudyHubUpdater-compatible data schema (`INDEX`, `GROUPS`, `PAGE_IMAGES`, `SEED_EXPLAINERS`).

## Install
1. Copy this `cfa-l3/` folder into `studyhub/` (so you get `studyhub/cfa-l3/index.html`).
2. Add the card in `HOME_CARD.html` to `studyhub/index.html`, next to the L2 card.
3. Commit and push. The existing deploy workflow ships it. No new secrets needed.

## What is in it
| View | What it does |
|---|---|
| Dashboard | Days to exam, syllabus deadline, pace vs plan, weight covered, reviews due, today's tasks, weak topics from your error log |
| Daily plan | Scheduler over all 36 modules. Editable hours, depth and deadline. Phase timeline. Exports to .ics and .csv |
| Syllabus by book | 6 books, per-module hours, CR likelihood, planned window, tick-off |
| Progress tracker | 5 stages per module, readiness weighted by topic, mock log with item-set and CR scores |
| Concept notes | 65 concept cards with formula and exam tip, searchable |
| Formula sheet | 90 formulas, filter and copy |
| Calculator labs | Option payoff, implementation shortfall, Brinson, currency hedging, risk-adjusted metrics and Fundamental Law, efficient frontier and CAL, LDI duration gap |
| IPS studio | 7 investor archetypes, the 7 IPS components, clues and mistakes, your own notes |
| Constructed response | 15 timed drills, command-word reference, model answers, self-scoring |
| Ethics drill | 20 violation/compliant cases plus a standards table |
| Error log | Spaced repetition (1, 3, 7, 16, 35 days). Q-bank, CR and ethics misses log automatically |
| Study sessions | Time log, streak, hours by topic |
| Flashcards | 45 terms in 15 rotating daily decks, confidence rating |
| Question bank | 36 starter questions, practice and timed mock |
| Explainers | 2 seeded visual explainers |

## Known gaps (be honest with yourself)
* The question bank is a 36-question starter set and the notes folder is empty. Add your own notes images (`assets/notes/aa-01.jpg`, `pc-01.jpg`, `perf-01.jpg`, `der-01.jpg`, `path-01.jpg`, `eth-01.jpg`) and fill `PAGE_IMAGES`.
* Asset Allocation and Ethics weights (marked †) are not confirmed for 2027.
* Command-word definitions are study aids. Check the current CFA Institute wording.
* The 70% mock benchmark is a planning heuristic. The pass mark is not published.

## StudyHubUpdater
Use the same flow as L2 with these prefixes: `aa-`, `pc-`, `perf-`, `der-`, `path-`, `eth-`. Explainers here use `{id, topic, title, html}`. Generate the file with `json.dumps` so newlines are escaped.

## What is saved
Everything is saved in the browser (localStorage) as you work: module ticks, mocks, errors, sessions, plan settings, quiz and flashcard stats, IPS notes, plus every filter, tab, calculator input, constructed-response draft and the last view you were on. Data is per browser and device. Use Exports and backup to move it. If the browser blocks storage (private window), the hub shows a warning.

## Cross-device sync
`sync.php` plus `assets/sync.js`. Open Exports and backup, create a sync code, and paste it on your other device. Data is encrypted in the browser (AES-GCM, key derived from the code), so the server only stores ciphertext in `sync_data/` (created on first use, not in git). Edits made on two devices are combined with a three-way merge against the last synced snapshot, so adding on one device and deleting on another both survive. It needs PHP, which Hostinger shared hosting has. It will not work on GitHub Pages or when opening the files straight from disk.
Not synced on purpose: theme, filters, tabs and calculator inputs, which are per device.
