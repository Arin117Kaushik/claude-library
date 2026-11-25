---
name: research-doc
description: Use when conducting any deep research task for the vault, brand analysis, event history, competitive research, market investigation, or any topic requiring a permanent, multi-source knowledge document.
---

# Research Document Pattern

## Overview
Standard methodology for running deep web research with Oracle and producing permanent vault knowledge files. Consistent format across all research types, brand history, events, competitors, market context.

## When to Use

- Any question requiring 3+ sources to answer confidently
- Competitive analysis, brand deep-dives, event history, market research
- Building a reference doc you'll return to in future sessions
- When a topic spans multiple angles (use topical tracks to separate them)

**Not for:** Quick single-fact lookups, ask directly instead.

---

## Before You Start, Load Prior Learnings

1. **Read `LEARNINGS.md`** in this skill folder. Apply every open lesson to this run's Oracle brief, community queries, and audit, a source that returned nothing last time, a query pattern that worked, a claim type that needed a hedge.
2. **Consolidation gate.** If `LEARNINGS.md` has more than ~8 unconsolidated entries, do one pass before starting this run: promote any pattern that has recurred into this `SKILL.md` (a new `Common Mistakes` row, or a rule in the step it belongs to), then delete the consolidated lines from `LEARNINGS.md`. This is the running agent's check, not something the user has to ask for.
3. **After the run**, append one entry to `LEARNINGS.md` in the format that file specifies, what the audit flagged, what the fact-check caught, anything the user corrected afterward, dead sources, queries worth reusing.

---

## Tooling, Fetch and Extract

The agent running this skill has Bash and the full local toolchain (audited in `[[Claude Skills & Agents]]` → CLI Tools). Use it directly, do not re-verify. Order of preference for pulling a source:

| Need | Use | Not |
|---|---|---|
| Article / blog / magazine text | `trafilatura` (best extractor); fall back to `newspaper`, `justext`, `selectolax` | bare `WebFetch`, truncates, drops structure and embedded content, returns paywalled stubs |
| Search, discovery, `site:` queries | `ddgs` (DuckDuckGo lib) | plain `requests` / repeated `WebSearch`, bot-blocked |
| Page 403s, is JS-rendered, or has an embedded chart / table | `playwright` headless, renders JS, gets past most blocks | concluding the data isn't public |
| YouTube, podcast, or any video with dense relevant content | `/transcribe` skill (faster-whisper, local), or `yt-dlp --write-auto-subs --skip-download` for a fast caption grab | summarising from the video description or comments alone |
| PDF source | `pymupdf` (`import fitz`) |, |
| A page nothing above can read | Chrome MCP (`/claude-in-chrome`), last resort, slowest | reaching for it first |

**Oracle cannot run any of this**, it only has `WebSearch` / `WebFetch`. In the Oracle brief, instruct it: for any source it can't fully read (403, paywall, JS-rendered, video, embedded chart), log the URL in the evidence-log Notes column marked `NEEDS RETRIEVAL` instead of guessing or dropping the fact. After Oracle returns, the main agent does one retrieval pass over those URLs with the toolchain above, before the write-up.

---

## Step 0, Magazine and Culture Sources First

**Mandatory before spawning Oracle.** Surface-level research pulls from Wikipedia, news, and brand sites, things anyone already knows. The insight layer lives in culture-led publications. Always specify these as primary sources:

| Source | What it covers |
|---|---|
| [Wild City](https://www.thewildcity.com/) | India-specific underground music, club culture, artist profiles |
| [Resident Advisor](https://ra.co/) | Global club culture, DJ/producer deep dives, scene history |
| [Dazed Digital](https://www.dazeddigital.com/) | Fashion, music, cultural movements, subcultural perspectives |
| [i-D Magazine](https://i-d.vice.com/) | Youth culture, queer identity, fashion, underground scenes |
| [The Wire](https://www.thewire.co.uk/) | Experimental music, electronic genres, genre history |
| [Mixmag](https://mixmag.net/) | Dance music, DJs, club culture |
| [Homegrown](https://homegrown.co.in/) | Indian independent music, underground scene |
| [Bandcamp Daily](https://daily.bandcamp.com/) | Independent labels, niche genres, international scenes |
| [RA Features](https://ra.co/features) | Long-form scene analysis, genre retrospectives |

**Rule:** Any research doc about music, culture, fashion, or nightlife must draw at least 3-5 findings from culture-led publications, not just Wikipedia or mainstream news. This is where sub-genre nuance, underground scenes, practitioner perspectives, and genuine cultural context live.

---

## Step 1, Spawn Oracle

Always use the Oracle agent for multi-source research. The brief must include:

1. **Specific questions**, numbered, one per thing you need
2. **What you already know**, so Oracle doesn't re-find it
3. **Source priority**, culture magazines first (Wild City, RA, Dazed, i-D, The Wire, Homegrown), then brand sites, press, Wikipedia
4. **The exact vault file path** to write to
5. **A structured evidence log**, see below

### The evidence log (front-loads verification)

Oracle must return, alongside the prose, a table of every material claim and its sourcing:

| Claim | Domain 1 (+URL) | Domain 2 (+URL) | Notes |
|---|---|---|---|

Rules Oracle applies *as it researches*, not afterward:

- Any claim with real-world stakes, funding amounts, investor/executive names, product claims, direct quotes, consequential dates, needs **two independent registered domains** or Oracle marks it `SINGLE-SOURCED` itself.
- Two citations from the same registered domain are never corroboration. Oracle notes this in the row.
- Every named public figure (celebrity, executive, politician) attached to a claim gets its own dedicated search. Oracle records the query and the result URL in the Notes column.
- Any source Oracle can't fully read, 403, paywall, JS-rendered, video, embedded chart, gets `NEEDS RETRIEVAL` in the Notes column with the URL, not a guessed fact and not a silent drop.

This is what makes the Step 1.6 check cheap, the audit reads this table instead of re-running the research.

### Dispatch Step 1 and Step 1.5 together

Oracle (published layer) and the Chrome community pass (Step 1.5) have no dependency on each other. Dispatch both in the same message so they run in parallel.

When both return, the main agent does a **retrieval pass**: for every row marked `NEEDS RETRIEVAL`, pull the source with the Tooling table above (`trafilatura`, then `playwright` headless, then Chrome MCP) and fill in or correct the fact. Only then start the write-up (Step 3).

---

## Step 1.5, Community Layer (Chrome Pass)

Dispatch this alongside Oracle (see above), using the Chrome browser extension for community and practitioner sources. Oracle finds the published layer. This step finds what insiders actually say versus what gets written about them.

**When to run:** Any research involving music, culture, nightlife, artists, trends, or living communities. Skip for pure historical/factual research with no active scene.

Reference: `[[Research Source Map]]` for specific handles, subreddits, and newsletters by topic.

### Twitter/X

Navigate to x.com/search. Use targeted queries that surface insider conversation, not promotional content:
- `"[topic]" from:[key figure handle]`, what specific insiders say
- `"[topic]" [city/scene] -filter:replies lang:en`, scene discussion
- `"[artist name]" [topic] min_faves:5`, low-noise takes with some traction
- `[topic] since:2024-01-01 -wikipedia -spotify`, recent, non-promotional

Look at reply chains, not just top posts. The reply thread is where real opinions live.

### Reddit

- Search with `ddgs`: `site:reddit.com "[topic]" [scene/city]` (WebSearch gets rate-limited on repeated queries).
- Fetch threads via `old.reddit.com/...` with `trafilatura`, or `playwright` headless if it blocks. Append `.json` to any thread URL for clean structured comments.
- Default subreddits for music/culture: r/electronicmusic, r/DJs, r/india, r/bangalore, r/delhi, r/IndianHipHop, r/worldmusic, r/vinyl
- Look for threads with 10+ comments, subreddit wiki pages (community knowledge), AMAs

### Substack

Search `substack.com/search?q=[topic]&type=publication` with `ddgs`, then extract each relevant post with `trafilatura` (Substack serves clean article HTML, no browser needed unless it's a paywalled post, then `playwright`).
Always check:
- Water & Music (waterandmusic.com), music industry, artist economics
- Penny Fractions (pennfractions.substack.com), indie music economics
- Music x Tech x Future (massprivate.substack.com), scene futures, Bas Grasmayer

### YouTube

Search with `ddgs`: `site:youtube.com "[topic]" interview OR documentary OR "in conversation"`. Also check Boiler Room set descriptions and NTS/RA podcast episode notes.

**Transcribe, don't skim.** The quotes that make a research doc land are spoken, not in the description. For any video with dense relevant content:
- `/transcribe [url]`, faster-whisper, local, handles YouTube / IG / X / TikTok / podcasts
- or `yt-dlp --write-auto-subs --write-subs --sub-lang en --skip-download "[url]"` for a fast caption grab when the video already has captions

Pull transcripts for 2-4 of the most relevant videos, not every result. Quote practitioners directly from the transcript, attributed with the video title and timestamp.

### What to look for across all four

- Opinions that contradict the published narrative
- Names that appear repeatedly in the community but aren't in publications
- Specific events, releases, or moments practitioners reference that haven't been written up
- Regional/community knowledge that lives only in conversation

**Write findings inline with the rest of the doc**, no separate "Community Sources" section. Practitioner takes appear as attributed quotes next to the relevant facts, e.g.:
> Nida Merchant described ParaDisco's early Delhi shows as "basically a prayer circle for people who wanted disco to exist in India" (@nidadadj, Twitter, 2024)

---

## Step 1.6, Two-Tier Fact-Check (REQUIRED)

Oracle can hallucinate names, invent a "finding" that isn't in any real source, and cite one outlet multiple times across a doc as if each citation were independent corroboration. This has happened in real runs: a funding table cited one blog three separate times for three different facts and dressed them up as if separately sourced, a named celebrity was listed as an investor with no independently checkable source, and a product-development claim was attributed to an article that didn't say it. None of it was caught before the doc hit the vault.

The old version of this step re-checked *every* claim with a full agent spawn, effectively re-running the research. This version splits the work: a free audit on everything, a paid agent only on the claim types that actually burned us.

### Tier 1, Self-audit (main agent, no new searches)

Read the evidence log from Step 1. Flag:

- any material claim with fewer than two distinct domains that is **not** already marked `SINGLE-SOURCED`
- any registered domain that appears 3+ times across the whole doc, that is one source dressed as many, mark every such claim `SINGLE-SOURCED` regardless of how many times it's inline-linked
- any material claim in the prose with **no row** in the evidence log

Tier 1 is never skipped.

### Tier 2, Narrow adversarial agent (only if triggered)

**Dispatch the Twitter / fact-check agent only for claims in these categories:**

- named public figures (celebrity, executive, politician) attached to a claim
- funding / money / valuation figures
- direct quotes attributed to a named individual

Pass it only those claims plus their evidence-log rows, not the whole doc. Required verdict per claim: **CONFIRMED** (2+ independent named sources), **SINGLE-SOURCED**, **LIKELY HALLUCINATED** (no source, or the cited source doesn't say it), **UNABLE TO VERIFY**. Public figures attached to unusual claims (a Bollywood actor investing in a defense startup) are hallucination magnets, verify with a direct dedicated search, never infer from an aggregator.

**If the doc contains none of those three categories, Tier 2 is skipped entirely** and Tier 1 is the whole check. Note the skip in the `LEARNINGS.md` entry.

**Run Tier 2 concurrently with Step 3.** Start drafting the doc from the research output while the fact-check agent works the flagged claims. Reconcile its verdicts before the file is finalised.

### Gate (applies to both tiers)

- Nothing `LIKELY HALLUCINATED` stays in the final doc. Remove it.
- Nothing `UNABLE TO VERIFY` goes in without an in-prose hedge (per Step 3's rule on uncertain claims).
- Nothing `SINGLE-SOURCED` is described or implied as corroborated. If one outlet is the only source for several facts, say so once.

### Embedded charts and image-based tables (Tier 2 money path)

`WebFetch` and similar text extractors silently drop anything rendered as an embedded chart (Datawrapper, Flourish), a canvas element, or a straight image, no error, the data just isn't in the returned text. Real miss: a funding-round table was a live Datawrapper chart, both text-based passes never saw it, and the doc shipped with rounds marked "undisclosed" that had public numbers. Whenever Tier 2 touches a funding tracker, Crunchbase/Tracxn-style page, or infographic-heavy article, don't trust a single text fetch:

1. `playwright` headless first, it renders the JS, and the chart's underlying data is often in the DOM or a JSON/CSV request you can read from `page.on("response")`.
2. If the value is baked into a canvas or a flat image, then Chrome MCP (`navigate`, then `computer` with `action: screenshot` or `zoom` on the section) and read the table visually.

Do either before calling a number undisclosed.

---

## Step 2, Links Rule (NON-NEGOTIABLE)

**All links go inline. Never at the bottom.**

Every paragraph or sentence that references a source gets the hyperlink right there in the prose, on the source name, the article title, or the described fact. A "Sources" section at the bottom is not acceptable as the primary reference mechanism.

**For artists, musicians, bands, DJs, or performers:** include inline links to their YouTube channel or a specific song/video, plus their Spotify artist page, right next to their name or the track being discussed. Example:
> **[Donna Summer](https://en.wikipedia.org/wiki/Donna_Summer)**, "I Feel Love" ([YouTube](https://www.youtube.com/results?search_query=donna+summer+i+feel+love+1977)) ([Spotify](https://open.spotify.com/search/Donna%20Summer)) was entirely synthesised...

**For songs:** link to YouTube (official video or search URL) inline next to the song title.

**For organisations, events, films, publications:** link to their Wikipedia page, official site, or primary press coverage, inline.

**YouTube search URL format:** `https://www.youtube.com/results?search_query=artist+name+song+name`
**Spotify search URL format:** `https://open.spotify.com/search/Artist%20Name`

If a bottom-level "Sources" list is kept at all, it is supplementary only, every link it contains must already appear inline in the document.

---

## Step 3, Document Structure

Every research doc uses exactly this format:

```markdown
Created on: {{date}}
Tags: #{{topic}} #{{category}} #research
___

# {{Title}}

[1-2 sentence framing: what this is, why it matters for the project]

---

## {{Section Name}}

[Section intro, 1-2 sentences context]

**{{Entry or Topic}}** ([Source Name](URL))
[Body: facts, context, links inline throughout]

---

## What This Tells Us

- [Bullet 1: implication or pattern]
- [Bullet 2]
- [Bullet 3]

See also: [[Related Note]]
```

**Structure rules:**
- Section headers are descriptive and topic-based. No "Part 1", "Part 2", no numbered prefixes. Use names like "## The Origins" or "## What's Happening Now"
- Inline links are the primary reference mechanism. A supplementary "Sources" list at the bottom is optional
- Only include a fact if you have a source for it. If a claim is genuinely uncertain, note it in plain prose as part of the sentence, e.g. "according to one source" or "not independently verified", never as a tag or label
- `See also:` wikilinks at the very end, after "What This Tells Us"

---

## Organising Principles

| Use | Organiser |
|---|---|
| Events, history, timelines | Chronological, group by era or decade |
| Mixed research with multiple angles | Topical tracks, label by topic (e.g. Track A: Brand History, Track B: Key Figures) |
| Competitor / brand analysis | By category, Products, Events, Revenue, Strategy |

---

## Oracle Prompt Template

Paste and fill this when briefing Oracle:

```
Deep research task. I need [TOPIC].

**Context:** [what you already know, don't repeat this]

**Specific questions:**
1. [question]
2. [question]

**Research approach:**
- Primary sources: culture-led publications first, Wild City, Resident Advisor (ra.co), Dazed Digital, i-D, The Wire, Mixmag, Homegrown, Bandcamp Daily
- Secondary sources: brand site, Wikipedia, press, Instagram, YouTube
- Verify each finding with at least one independent source
- If only one source exists for a fact, say so explicitly rather than presenting it as verified
- Never cite the same outlet for multiple different facts without noting they all trace back to one source, that is not multi-source corroboration
- Any named public figure (celebrity, executive, politician) attached to a claim needs its own direct, dedicated search, don't take it from an aggregator without checking
- Check `[[Research Source Map]]` for specific accounts and communities by topic

**Evidence log (required):** alongside the prose, return a table `Claim | Domain 1 (+URL) | Domain 2 (+URL) | Notes`. Any stakes-bearing claim (funding, names, product claims, quotes, consequential dates) needs two independent registered domains or you mark it `SINGLE-SOURCED` yourself. Two links from the same domain are not corroboration. Any source you can't fully read, 403, paywall, JS-rendered, video, embedded chart, gets `NEEDS RETRIEVAL` in the Notes column with the URL, do not guess the fact or drop it silently.

**Note:** the Chrome community pass (Step 1.5) runs in parallel with this brief. After both return, the running agent does a retrieval pass over every `NEEDS RETRIEVAL` row with local tools (trafilatura / playwright / yt-dlp), then the Step 1.6 two-tier check, a free self-audit of this evidence log, plus a narrow fact-check agent only for public-figure / money / direct-quote claims.

**For each entry, I need:**
- [field list]

**Output format:** [Chronological / Topical Tracks] Markdown.

**Create file at:** <your vault>\[folder]\[Filename].md

Use this header:
Created on: {{date}}
Tags: #tag1 #tag2 #research
___

Only include facts you can source. If something cannot be sourced, omit it. Do not fabricate.
```

### Advanced Template (Community-Depth Research)

Use when the topic has a living community: music scene, active practitioners, brand with a fanbase, cultural movement. The standard template gets the documented layer. This one is designed to surface what practitioners say but don't publish.

```
Deep research task. I need [TOPIC].

**Context:** [what you already know, don't repeat this]

**Specific questions:**
1. [question]
2. [question]

**Research approach, three passes:**

Pass 1, Published layer:
- Culture-led publications first: Wild City, Resident Advisor (ra.co), Dazed Digital, i-D, The Wire, Mixmag, Homegrown, Bandcamp Daily
- Secondary: brand site, Wikipedia, mainstream press
- Each finding needs at least one independent source

Pass 2, Community layer (main agent, local toolchain, see the skill's Tooling table):
- Twitter/X: search `[topic] [key figures] -filter:replies lang:en` and `[topic] since:2024-01-01 -wikipedia -spotify` via Chrome MCP or `ddgs`
  Check specific handles from [[Research Source Map]] for this topic category
- Reddit: `ddgs` for `site:reddit.com` queries; fetch threads via `old.reddit.com` + `trafilatura` or the `.json` endpoint. Subs: r/electronicmusic, r/DJs, r/bangalore, r/delhi, r/IndianHipHop, plus any scene-specific subs found in Pass 1
- Substack: `substack.com/search?q=[topic]` via `ddgs`, extract posts with `trafilatura`, check [[Research Source Map]] for known newsletters
- YouTube: `ddgs` for `site:youtube.com "[topic]" interview OR documentary`, then **transcribe** the 2-4 densest videos with `/transcribe` or `yt-dlp --write-auto-subs`, quote from the transcript, not the description

Pass 3, Adversarial queries (finds what standard search misses):
- `"[key figure]" site:reddit.com`, community takes on specific people
- `"[topic]" -site:wikipedia.org -site:spotify.com -site:apple.com`, removes dominant results
- `"[topic]" substack.com` or `"[topic]" newsletter`, independent writing
- `"[topic]" [year] scene OR community OR underground`, non-promotional framing
- `"[topic]" opinion OR "my take" OR thread`, practitioner opinions

**Evidence log (required):** alongside the prose, return a table `Claim | Domain 1 (+URL) | Domain 2 (+URL) | Notes`. Stakes-bearing claims (funding, names, product claims, quotes, consequential dates) need two independent registered domains or you mark them `SINGLE-SOURCED`. Two links from the same domain are not corroboration. Any source you can't fully read gets `NEEDS RETRIEVAL` + URL in Notes. This table is what the Step 1.6 Tier 1 audit reads.

**For each entry, I need:**
- [field list]

**Flag explicitly:**
- Any finding sourced only from Pass 1 with no community validation
- Any claim where community voice contradicts the published narrative

**Output format:** [Chronological / Topical Tracks] Markdown.

**Create file at:** <your vault>\[folder]\[Filename].md

Use this header:
Created on: {{date}}
Tags: #tag1 #tag2 #research
___

Only include facts you can source. If something cannot be sourced, omit it. Do not fabricate.
```

---

## File Placement

| Research type | Vault folder |
|---|---|
| Work / client / brand | `02 - Work/` |
| Learning / skills / industry knowledge | `03 - Learning/` |
| System / tool / agent reference | `05 - Agentic System/` |

After creating: add a wikilink in the relevant `_index.md`.

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Not specifying the output file path in the Oracle brief | Oracle may not write the file, always give absolute path |
| Numbered section headers ("Part 1", "Part 2") | Use descriptive names, renumbering is painful and adds no value |
| No "What This Tells Us" section | Raw facts without synthesis don't help future sessions |
| Oracle write permission denied | Claude Code may block Oracle's Write tool, write the file yourself from the returned content |
| Not cross-referencing related docs | Always add `See also: [[Note]]` wikilinks at the bottom |
| Citing the same outlet multiple times as if each were independent corroboration | Note once that a fact is single-sourced by that outlet, don't repeat it across the doc as if it were separately verified |
| Named public figure attached to a claim with no direct verification | Run a dedicated search for "[name] + [company/claim]" before including a celebrity, executive, or politician in any fact, this is where hallucinations hide |
| Skipping the Step 1.6 Tier 1 self-audit | Tier 1 is free and never skipped. Only Tier 2 (the fact-check agent) is conditional, and only on public-figure / money / direct-quote claims |
| Running the full fact-check agent on every claim | That is re-research. Tier 2 gets only the flagged claims plus their evidence-log rows |
| A source's data table is an embedded chart or image, so text-based fetching returns nothing for it and the fact gets marked "undisclosed" instead of actually looked up | Load the page in Chrome and screenshot the section before concluding a number isn't public, see the embedded-charts note in Step 1.6 |
| Oracle returns prose with no evidence-log table | Send it back, the table is what makes Tier 1 cheap. No table means the audit has to re-run the research |
| Taking a bare `WebFetch` of a culture-mag article and getting a truncated or paywalled stub | Extract with `trafilatura`; if it 403s, `playwright` headless. See the Tooling table |
| Summarising a YouTube interview or podcast from its description | Pull the transcript, `/transcribe [url]` or `yt-dlp --write-auto-subs`, the quotes that matter aren't in the description |
| Concluding a funding number is "undisclosed" after one text fetch | The page may render it as a chart. `playwright` headless (read the DOM / network JSON), then Chrome MCP screenshot. See the embedded-charts note in Step 1.6 |
| Leaving `NEEDS RETRIEVAL` rows in the evidence log unresolved at write time | Run the retrieval pass first, those are exactly the facts Oracle couldn't stand behind |
| Forgetting to append a `LEARNINGS.md` entry after the run | The self-learning loop only works if every run logs. Do it before considering the task done |

---

## Self-Learning Loop

`LEARNINGS.md` in this folder is the skill's own feedback file. The mechanism, in three pieces:

1. **Read-first**, every run reads it before briefing Oracle (see "Before You Start").
2. **Log after**, every run appends one entry: what Tier 1 flagged, what Tier 2 caught, anything the user corrected after delivery, dead sources, queries worth reusing.
3. **Consolidation gate**, once it passes ~8 unconsolidated entries, the running agent promotes recurring patterns into this `SKILL.md` and trims the log. Count-triggered, not a reminder the user has to give. Same design as `memory/feedback_episodic_memory_system.md`.

**Portable pattern:** sibling `LEARNINGS.md` + read-first line + count-triggered consolidation gate. Once this pilot shows a few runs of improvement, the same three pieces drop into any other skill. Not built fleet-wide yet.

---

## Real-World Examples from This Vault

- `02 - Work/Club Nothing - Research Sources.md`, topical tracks, competitive brand analysis
- `02 - Work/Dazed Events Timeline.md`, chronological era grouping, 30+ entries
- `02 - Work/Dazed History.md`, brand overview with linked events timeline

See also: [[Claude Skills & Agents]]
