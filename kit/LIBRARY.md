# Arin's Claude Library

Every agent, skill, plugin and tool in the setup, with how to install it.

From the [Claude Library](https://github.com/Arin117Kaushik/claude-library). Updated 25 Nov 2026.

## Agents

### Robert
*Agent · dispatcher.* Plans big or fuzzy tasks and hands each part to the right agent.

Robert never does the work himself. He reads a messy request, breaks it into steps, matches every step to the best agent or skill, and marks which steps can run at the same time. The output is one next action first, then a short plan.

**How it works**
- Classifies the task: build, research, decision, debug, writing
- Maps each part to an agent or skill from a routing table
- Puts independent steps in parallel
- Names any gap where no agent fits and suggests one

**When to reach for it**
- A task touches several areas at once
- You do not know which tool fits
- Work could be split across agents

**Try saying**
- `Robert, I want to turn my podcast notes into a weekly newsletter. Plan it.`
- `Robert: migrate this script to a scheduled job and document it`

Tip: Edit the routing table inside the file to list only the agents you actually have.

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/robert.md -o ~/.claude/agents/robert.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/robert.md)

### Stark
*Agent · strategist.* Talks a decision through and ends with one recommendation.

A thinking partner for choices. Stark strips the problem down to the real decision, keeps two or three options, picks one with a reason and names the risk. He never writes files or code, so he stays focused on the call.

**How it works**
- Finds the actual decision under the noise
- Keeps only the options that matter
- Answers in a fixed shape: the move, why, the risk, the next action

**When to reach for it**
- Should I do X or Y
- Going in circles on a choice
- A second opinion before committing

**Try saying**
- `Should I learn n8n or write automations in Python first?`
- `Stark, pressure test this plan before I start`

Tip: Ask him to argue against your favourite option. He will.

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/stark.md -o ~/.claude/agents/stark.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/stark.md)

### Oracle
*Agent · researcher.* Runs deep web research and cross-checks every claim.

Oracle turns a question into five to eight targeted searches, follows the threads, and checks whether sources agree. You get a short summary, the key findings with citations, what is still contested and how fresh the information is.

**How it works**
- Splits the topic into sub-questions
- Searches, then reads the sources behind the sources
- Marks each finding with how well it is supported
- Flags stale or single-source claims

**When to reach for it**
- A question one search cannot settle
- Market or company research
- Checking a claim before you repeat it

**Try saying**
- `Oracle, research how small agencies price AI automation work in 2026`
- `Find out everything about the Model Context Protocol roadmap`

Tip: Pair it with the research-doc skill when the answer should become a permanent note.

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/oracle.md -o ~/.claude/agents/oracle.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/oracle.md)

### Cortana
*Agent · full-stack dev.* Builds features that touch database, API and frontend at once.

Cortana treats a feature as one unit across every layer. Schema, endpoints, types and UI are designed together so they agree, then tested together. Based on a community full-stack subagent.

**How it works**
- Reads the existing schema and API patterns first
- Designs the data contract before the UI
- Builds layer by layer and keeps types in sync
- Adds tests across the whole path

**When to reach for it**
- A new feature end to end
- A frontend for a fresh API
- Refactors that cross layers

**Try saying**
- `Cortana, add sign-up with email confirmation to this app`
- `Build a small dashboard that reads from this SQLite file`

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/cortana.md -o ~/.claude/agents/cortana.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/cortana.md) · [Source](https://github.com/VoltAgent/awesome-claude-code-subagents)

### Aurther
*Agent · career coach.* Resumes, target companies and interview prep, Arthur Morgan style.

Direct, honest and on your side. Aurther reads a job post for the five to seven things the company really wants, maps your experience to them without inventing anything, finds companies worth applying to and runs mock interviews.

**How it works**
- Asks for the job post and your resume before advising
- Cuts bullets that do not pull weight for this role
- Rewrites the rest as clear, measurable impact
- Calls out stalling, kindly

**When to reach for it**
- Tailoring a resume to one job
- Building a target company list
- Prepping for an interview

**Try saying**
- `Aurther, here is the JD and my resume. What lands and what is dead weight?`
- `Run a mock interview for a junior automation engineer role`

Tip: Fill in the profile block at the top of the file once so every answer starts from your real situation.

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/aurther.md -o ~/.claude/agents/aurther.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/aurther.md)

### Jarvis
*Agent · code reviewer.* Reviews code for bugs, security holes and maintainability.

A senior review before anything ships. Jarvis checks correctness, injection risks, secrets in code, error handling, patterns and test coverage, then ranks findings by how much they matter so you fix the right things first.

**How it works**
- Runs quick scans for secrets and risky calls
- Reads changed code with its callers
- Ranks findings: critical, important, minor
- Says what was done well too

**When to reach for it**
- Before merging a branch
- After a big refactor
- Anything touching auth or money

**Try saying**
- `Jarvis, review my last commit`
- `Review the payment module before I deploy`

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/jarvis.md -o ~/.claude/agents/jarvis.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/jarvis.md) · [Source](https://github.com/VoltAgent/awesome-claude-code-subagents)

### Friday
*Agent · prompt engineer.* Writes and tunes prompts, system prompts and agent files.

Friday designs prompts, tests variations and tightens them for accuracy and cost. She also knows what not to put in a prompt: instructions the model already follows waste tokens. She writes the definitions for new agents like the ones on this shelf.

**How it works**
- Starts from the goal and a few test inputs
- Removes instructions the model follows by default
- Tries variations and keeps the one that measures best
- Writes agent files with clear triggers

**When to reach for it**
- A new agent definition
- A prompt that behaves badly
- Cutting tokens from a long prompt

**Try saying**
- `Friday, write an agent that reviews my Obsidian notes for broken links`
- `This system prompt is 3,000 tokens. Make it half without losing behavior`

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/friday.md -o ~/.claude/agents/friday.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/friday.md) · [Source](https://github.com/VoltAgent/awesome-claude-code-subagents)

### Alfread
*Agent · vault keeper.* Keeps an Obsidian vault fast: big files, attachments, indexing.

Alfread scans a notes vault for heavy attachments, slow searches and messy structure, then suggests what to move, compress or archive. Nothing gets deleted without asking.

**How it works**
- Finds the largest files and image folders
- Checks for duplicate and orphaned attachments
- Suggests a tidy structure and archive moves

**When to reach for it**
- The vault feels slow
- Attachments pile up
- A monthly tidy

**Try saying**
- `Alfread, why is my vault slow to open?`
- `Find attachments no note links to`

```
mkdir -p ~/.claude/agents && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/agents/alfread.md -o ~/.claude/agents/alfread.md
```

macOS, Linux or Git Bash. Restart Claude Code, then name the agent in a prompt.

[Download](../kit/agents/alfread.md)

## Design Skills

### antislop
*Skill · core filter.* Stops interfaces from looking machine-made.

A filter, not a style. Every visual choice has to pass a purpose test: what does this serve? On top of that the result must be lively, honest and working. It ends with a pass or fail delivery gate, so nothing ships with fake numbers, dead buttons or broken mobile.

**How it works**
- Hard gate: honesty, function and accessibility rules that never bend
- Purpose gate: gradients, glass, glow are allowed only with a written reason
- Three dials set energy, rhythm and motion before building
- A delivery report backs every pass with evidence

**When to reach for it**
- Any UI build
- Restyling a page
- Reviewing a page someone else generated

**Try saying**
- `Build a landing page for my newsletter, antislop on`
- `Audit this page with antislop in after mode`

Tip: Run npx antislop-ai --mode during once and it stops asking which mode you want.

```
npx antislop-ai
```

The installer asks which agents to install for. Pick the skills you want.

[Source](https://github.com/miqdadbadjuber/anti-slop)

### antislop-ui
*Skill · visual.* Color, layout, components, motion and page speed rules.

The visual deep dive of antislop. It lists the tells of generated design (blue-purple gradients, bento grids, fake terminals, stat cards with invented numbers) and what to do instead.

**How it works**
- Each pattern has a tell, why it reads as slop, and the fix
- Covers landing pages and app screens
- Ends with a UI checklist run next to the core gate

**When to reach for it**
- Building or editing any interface
- Choosing palette and type
- Checking motion and performance

**Try saying**
- `Restyle this dashboard. Load antislop and antislop-ui`

```
npx antislop-ai
```

The installer asks which agents to install for. Pick the skills you want.

[Source](https://github.com/miqdadbadjuber/anti-slop)

### antislop-layoutmobile
*Skill · responsive.* Layouts that hold from phone to desktop.

Grids that reflow, no sideways scrolling, text that stays inside its box and tap targets big enough for thumbs. It catches the layouts that look right on a laptop and fall apart on a phone.

**How it works**
- Checks every breakpoint, not only desktop
- Enforces 44 pixel tap targets
- Flags overflow and clipped cards

**When to reach for it**
- Any layout with breakpoints
- Fixing a broken mobile view

**Try saying**
- `The pricing table breaks on my phone. Fix it with antislop-layoutmobile`

```
npx antislop-ai
```

The installer asks which agents to install for. Pick the skills you want.

[Source](https://github.com/miqdadbadjuber/anti-slop)

### antislop-human
*Skill · accessibility.* Contrast, keyboard, focus and states for real people.

Makes sure everyone can use the thing. Contrast ratios are checked with a built-in checker, every control works by keyboard, focus is always visible, and empty, loading and error states actually exist.

**How it works**
- Runs the contrast checker on real color pairs
- Walks the page with Tab, Enter and Escape
- Checks names on icon buttons and labels on fields

**When to reach for it**
- Before shipping any UI
- Contrast checks
- Keyboard passes

**Try saying**
- `Check this form for keyboard and contrast problems`

```
npx antislop-ai
```

The installer asks which agents to install for. Pick the skills you want.

[Source](https://github.com/miqdadbadjuber/anti-slop)

### antislop-code
*Skill · comments.* Strips generic AI comments and never touches the code.

Removes comments that narrate the obvious ("loop through the items") and keeps the ones that explain a real reason. The logic stays byte for byte the same, so it is safe to run on any file.

**How it works**
- Classifies each comment: noise or reason
- Deletes only the noise
- Leaves code untouched

**When to reach for it**
- Cleaning a generated codebase
- Before publishing a repo

**Try saying**
- `Run antislop-code on the src folder`

```
npx antislop-ai
```

The installer asks which agents to install for. Pick the skills you want.

[Source](https://github.com/miqdadbadjuber/anti-slop)

### impeccable
*Skill · design critic.* Critiques, audits and polishes an existing interface.

A design review toolkit. It looks at hierarchy, spacing, type, color, motion, UX copy and edge cases, and can push a dull design to be bolder or a loud one to be quieter. Best used after something is built.

**How it works**
- Reviews against a long checklist of design principles
- Proposes concrete changes, not vague advice
- Can iterate live in the browser

**When to reach for it**
- Polishing something already built
- A UX review
- Making a bland page feel crafted

**Try saying**
- `Critique the settings page with impeccable`
- `Polish the empty states in this app`

```
npx skills add pbakaus/impeccable
```

Installs with the open skills installer.

[Source](https://github.com/pbakaus/impeccable)

## Build Method

### brainstorming
*Skill · superpowers.* Pins down what to build before anything gets built.

Before any feature or creative work, Claude asks about intent, constraints and what done looks like, one question at a time, then shapes a short design you agree on. It saves the most expensive mistake: building the wrong thing well.

**How it works**
- Reads the project for context first
- Asks one focused question at a time
- Offers two or three approaches with a recommendation
- Writes the agreed design down

**When to reach for it**
- A new feature
- A creative build
- Anything with open questions

**Try saying**
- `I want a tool that turns voice notes into tasks. Brainstorm it with me`

Tip: If the spec is already clear, say so and it moves straight to planning.

```
claude plugin marketplace add obra/superpowers-marketplace && claude plugin install superpowers@superpowers-marketplace
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/obra/superpowers)

### writing-plans
*Skill · superpowers.* Turns a design into small, testable build steps.

Writes an implementation plan with exact files, steps and checks. Each step is small enough to do and verify on its own, so a fresh agent could pick up any step without the whole history.

**How it works**
- Lists every file to create or change
- Breaks work into two to five minute steps
- Adds the check that proves each step works

**When to reach for it**
- After brainstorming
- Before touching code on a multi-step task

**Try saying**
- `Write the plan for the design we just agreed`

```
claude plugin marketplace add obra/superpowers-marketplace && claude plugin install superpowers@superpowers-marketplace
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/obra/superpowers)

### subagent-driven-development
*Skill · superpowers.* Runs a plan by giving each task to a fresh subagent.

Hands each independent task to its own subagent with a clean context, then reviews the result before moving on. Mistakes get caught between steps instead of stacking up.

**How it works**
- One subagent per task, no shared clutter
- A review after every task
- The main session keeps the big picture

**When to reach for it**
- Executing a written plan
- Tasks that do not depend on each other

**Try saying**
- `Execute the plan with subagent-driven-development`

```
claude plugin marketplace add obra/superpowers-marketplace && claude plugin install superpowers@superpowers-marketplace
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/obra/superpowers)

### systematic-debugging
*Skill · superpowers.* Finds the root cause before proposing any fix.

Stops guess-and-patch loops. Reproduce the bug, read the evidence, form one hypothesis, test it, and only then fix the cause, not the symptom.

**How it works**
- Reproduce reliably first
- Gather evidence: logs, inputs, recent changes
- One hypothesis at a time, tested
- After three failed fixes, question the architecture

**When to reach for it**
- Any bug or failing test
- Behaviour nobody can explain

**Try saying**
- `The export button works locally but not in production. Debug it systematically`

```
claude plugin marketplace add obra/superpowers-marketplace && claude plugin install superpowers@superpowers-marketplace
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/obra/superpowers)

### verification-before-completion
*Skill · superpowers.* No "done" without running the check and showing it.

Before Claude says something works, it runs the real command, reads the real output and shows it. Evidence first, claims second. It removes the most annoying failure: a confident "fixed" that is not.

**How it works**
- Names the command that proves the claim
- Runs it fresh
- Quotes the output in the reply

**When to reach for it**
- About to say fixed or done
- Before a commit or pull request

**Try saying**
- `Verify the build passes before you call it done`

```
claude plugin marketplace add obra/superpowers-marketplace && claude plugin install superpowers@superpowers-marketplace
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/obra/superpowers)

### writing-skills
*Skill · superpowers.* Writes new skills and tests that they trigger.

Treats a skill like code. Write it, test it against real prompts, and check that it changes behaviour before installing it. Skills that never fire are worse than none.

**How it works**
- Starts from a failing case: what goes wrong without the skill
- Writes the smallest skill that fixes it
- Tests the trigger words and the behaviour

**When to reach for it**
- Making a new skill
- Fixing a skill that never fires

**Try saying**
- `Turn my code review checklist into a skill`

```
claude plugin marketplace add obra/superpowers-marketplace && claude plugin install superpowers@superpowers-marketplace
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/obra/superpowers)

## Workflow Skills

### task-observer
*Skill · self-improving.* Watches long tasks and logs what should become a skill.

Runs alongside multi-step work and notes corrections, repeated patterns and workflow lessons. Over time it proposes new skills or edits to existing ones, so the setup improves from real use.

**How it works**
- Logs observations during work
- Groups repeated lessons
- Proposes skill changes for review

**When to reach for it**
- Any multi-step session
- Reviewing the observation log weekly

**Try saying**
- `What did task-observer log this week?`

Follow the install steps in the repository. Licensed CC BY 4.0.

[Page](https://github.com/rebelytics/one-skill-to-rule-them-all)

### research-doc
*Skill · research.* Deep research that becomes a permanent note.

A full research pipeline for notes you want to keep. Oracle gathers sources, every stakes-bearing claim needs two independent domains, a fact check catches invented names and double-counted sources, and the result lands in one uniform note structure.

**How it works**
- Reads its lessons file before every run
- Briefs Oracle with an evidence log requirement
- Audits single-source and unreadable sources
- Writes the note and logs what went wrong for next time

**When to reach for it**
- Brand or market research
- Event or company history
- Anything worth keeping

**Try saying**
- `Research the history of this record label and save it to my vault`

Tip: Charts embedded as images are invisible to text fetchers. Screenshot the page before calling a number undisclosed.

```
npx degit Arin117Kaushik/claude-library/kit/skills/research-doc ~/.claude/skills/research-doc
```

Copies the skill folder into your global skills. Start a new session to load it.

[Page](https://github.com/Arin117Kaushik/claude-library/tree/main/kit/skills/research-doc)

### obsidian-markdown
*Skill · notes.* Writes notes in correct Obsidian syntax.

Wikilinks, embeds, callouts, properties and tags written the way Obsidian expects, so notes link up instead of breaking. Written by the maker of Obsidian.

**How it works**
- Uses [[wikilinks]] for notes inside the vault
- Knows callout, embed and property syntax
- Keeps frontmatter valid

**When to reach for it**
- Creating or editing vault notes

**Try saying**
- `Save this summary as an Obsidian note with a callout for the key point`

Follow the install steps in the repository.

[Page](https://github.com/kepano/obsidian-skills)

### transcribe
*Skill · audio.* Any video or audio link to text, locally and free.

Paste a link from YouTube, Instagram, X, TikTok or 1000+ other sites and get a transcript. It downloads with yt-dlp and transcribes with faster-whisper on your own machine. No API key, nothing per use, and it handles many links at once. A Windows port of Hugo Manning's transcribe-skill.

**How it works**
- yt-dlp pulls the audio
- faster-whisper transcribes on CPU or NVIDIA GPU
- A term-repair list fixes common mishearings
- Prints a header with source, title and length

**When to reach for it**
- What does this video say
- Turning talks into notes

**Try saying**
- `transcribe https://www.youtube.com/watch?v=...`
- `Transcribe these five reels and summarise each`

Tip: Add your own niche words to references/term-repairs.txt.

```
npx degit Arin117Kaushik/claude-library/kit/skills/transcribe ~/.claude/skills/transcribe
```

Copies the skill folder into your global skills. Start a new session to load it.

[Page](https://github.com/Arin117Kaushik/claude-library/tree/main/kit/skills/transcribe)

### transcribe-phone
*Skill · audio.* The same transcription on an Android phone, no laptop.

Runs whisper.cpp inside Termux on Android. Share a link or audio file to Termux from any app and get text back while away from the desk.

**How it works**
- A setup script installs whisper.cpp, yt-dlp and ffmpeg in Termux
- A share handler takes links from any app
- Uses a small quantised model so it runs on a phone

**When to reach for it**
- Transcripts on the go
- Voice notes you want as text

**Try saying**
- `Share a reel to Termux, or run: transcribe <url>`

```
npx degit Arin117Kaushik/claude-library/kit/skills/transcribe-phone ~/.claude/skills/transcribe-phone
```

Copies the skill folder into your global skills. Start a new session to load it.

[Page](https://github.com/Arin117Kaushik/claude-library/tree/main/kit/skills/transcribe-phone)

### caption-writer-sms
*Skill · social.* Captions for visual social posts.

Writes captions for Instagram, TikTok, YouTube, Facebook and Pinterest posts, with platform-specific length and hashtag rules. I tuned it to a short, specific music-label voice.

**How it works**
- Asks for the image or video context
- Matches tone to the platform
- Keeps the first line strong for the feed preview

**When to reach for it**
- Any post caption
- YouTube titles and descriptions

**Try saying**
- `Write a caption for this event photo, three lines, no emojis`

A community skill from a social media skills pack.

### n8n-workflow-patterns
*Skill · automation.* Proven patterns for n8n automations.

Architecture patterns for building and debugging n8n workflows: triggers, branching, retries, error paths and data mapping, with checklists for each pattern.

**How it works**
- Picks a pattern: webhook, scheduled, AI agent, data sync
- Plans nodes before building
- Adds error handling from the start

**When to reach for it**
- Designing an automation
- Debugging a flaky workflow

**Try saying**
- `Design an n8n flow that saves new form replies to a sheet and pings me`

A community skill.

### router
*Skill · home network.* Checks the home router from chat.

Answers "who is on my Wi-Fi", shows router status, reads Wi-Fi settings, backs up the config and runs a speed test, through a small local Python script. It is tied to one router model, so it stays private.

**How it works**
- A Python script logs into the router admin page
- Claude calls the script and reads the result

**When to reach for it**
- Who is on my Wi-Fi
- Back up the router config
- Run a speed test

**Try saying**
- `Who's on my Wi-Fi right now?`

Tip: Same idea works for any device with a web admin page: one script, one skill.

Not shared. It only works with one router model.

## Plugins & Hooks

### ponytail
*Plugin · coding mode.* Lazy senior dev mode: the simplest code that works.

Before writing anything, Claude climbs a ladder: does this need to exist, is it already in the codebase, does the standard library do it, does the platform do it. The shortest working change wins. It also has review and audit commands that hunt over-engineering.

**How it works**
- YAGNI first: skip speculative features
- Reuse before writing
- Standard library and native features before dependencies
- Leaves one small check behind for real logic

**When to reach for it**
- Every coding task
- Hunting bloat in a repo

**Try saying**
- `/ponytail-review on this diff`
- `/ponytail-audit the whole repo`

```
claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/DietrichGebert/ponytail)

### humanizer
*Plugin · writing.* Rewrites AI-sounding text in the writer's own voice.

Finds the tells of machine writing (forced lists of three, staged openers, inflated claims, dashes everywhere, one-line closers) and rewrites without changing what the text says.

**How it works**
- Detects known AI writing patterns
- Rewrites only the flagged parts
- Keeps meaning and facts the same

**When to reach for it**
- Anything long that gets published
- Emails, posts, cover letters

**Try saying**
- `/humanizer this LinkedIn post`

```
claude plugin marketplace add blader/humanizer && claude plugin install humanizer@humanizer
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/blader/humanizer)

### linkedin-skills
*Plugin · LinkedIn.* Twelve LinkedIn skills, nine switched on.

Post writing with proven hook formulas, comment and reply drafting, profile audits, a content planner, repurposing and a humanizer pass. I keep the analytics and advocacy skills off.

**How it works**
- Hook library picked by goal: comments, reposts, saves
- Profile audit covers headline, About, banner and featured
- Turn skills off you do not need with skillOverrides

**When to reach for it**
- Writing a post
- Fixing the profile
- Replying to comments

**Try saying**
- `Write a LinkedIn post about this project, contrarian hook`
- `Audit my LinkedIn headline`

```
claude plugin marketplace add sergebulaev/linkedin-skills && claude plugin install linkedin-skills@linkedin-skills
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/sergebulaev/linkedin-skills)

### work-log
*Plugin · my build.* The /work panel: live phases, real counts and badges.

A side panel that shows what the agent is doing: the current task's phases, a progress strip above the prompt, which required skills were used and a weekly badge case for finished work. Built for brains that lose track of long agent runs.

**How it works**
- Claude reports phases with a tiny helper script
- The panel counts searches, pages and file edits by itself
- A badge is earned only for real, finished work

**When to reach for it**
- Following a long task at a glance
- Seeing what is left

**Try saying**
- `/work`

```
claude plugin marketplace add Arin117Kaushik/claude-work-panel && claude plugin install work-log@claude-work-panel
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/Arin117Kaushik/claude-work-panel)

### kanto-night
*Plugin · my build.* A pixel night map behind the chat window.

Swaps the chat background for a dark pixel-art scene. One command switches between a forest, a harbor and a town. It uses game art, so it stays private.

**How it works**
- A plugin mod that paints a scene behind the chat
- The scene changes with /kanto

**When to reach for it**
- Making long sessions feel like a game

**Try saying**
- `/kanto forest`

Private. It uses game art I cannot share.

### skill-lock hook
*Hook · prompt submit.* Makes Claude load the right skills before replying.

Claude often knows a skill exists and skips it. This hook matches every prompt against a table of keywords and injects a line naming the skills that must be loaded first. A second hook logs which skills were actually used.

**How it works**
- UserPromptSubmit: regex table maps prompt words to skills
- Injects a SKILL LOCK line and the output rules
- PostToolUse: logs real Skill calls for the /work panel

**When to reach for it**
- You keep reminding Claude to use a skill
- You want rules repeated on every prompt

**Try saying**
- `Edit the table at the top of skill_lock.py to match your skills`

Tip: Register it in ~/.claude/settings.json under hooks, UserPromptSubmit and PostToolUse.

```
mkdir -p ~/.claude/hooks && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/hooks/skill_lock.py -o ~/.claude/hooks/skill_lock.py
```

Then add it to the hooks section of settings.json.

[Download](../kit/hooks/skill_lock.py)

### ADHD Strict
*Output style.* Replies lead with the answer or the next action.

An output style that changes how every reply is shaped. One line when one line answers it, numbered steps capped at five, concrete time estimates, no recaps, no closing offers and no em dashes.

**How it works**
- Lives in ~/.claude/output-styles/
- Pick it once in the output style setting
- Rules apply to every reply without reminders

**When to reach for it**
- You lose the thread in long replies
- You want answers first

**Try saying**
- `Ask anything. The first line is the answer.`

```
mkdir -p ~/.claude/output-styles && curl -fsSL https://raw.githubusercontent.com/Arin117Kaushik/claude-library/main/kit/output-styles/adhd-strict.md -o ~/.claude/output-styles/adhd-strict.md
```

Then choose ADHD Strict as the output style.

[Download](../kit/output-styles/adhd-strict.md)

### claude-mem (switched off)
*Plugin · memory.* Persistent memory across sessions. Installed, switched off.

Captures tool calls and decisions in the background, compresses them and feeds the relevant parts into the next session. I switched it off in favour of plain memory files I can read and edit.

**How it works**
- A background worker records sessions
- Summaries are stored locally
- Relevant memory is injected at session start

**When to reach for it**
- When file-based memory stops being enough

**Try saying**
- `Wrap anything private in <private> tags to keep it out`

```
claude plugin marketplace add thedotmack/claude-mem && claude plugin install claude-mem@thedotmack
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/thedotmack/claude-mem)

### i-have-adhd (switched off)
*Plugin · output.* ADHD-friendly output rules. Off, replaced by my output style.

Shapes replies for an ADHD reader: next action first, numbered steps, no tangents, wins made visible. Its rules now live in the ADHD Strict output style and the skill-lock hook, so the plugin stays on the shelf.

**How it works**
- A skill with output rules
- Loaded on demand or always on

**When to reach for it**
- A quick start on ADHD-friendly output

```
claude plugin marketplace add ayghri/i-have-adhd && claude plugin install i-have-adhd@i-have-adhd
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/ayghri/i-have-adhd)

### clawd-scenes (switched off)
*Plugin · theme.* Little pixel Clawds behind the chat. Off.

Five small animated scenes with pixel Claude mascots living behind the chat.

**When to reach for it**
- A lighter mood for long sessions

**Try saying**
- `/clawd-scenes`

```
claude plugin marketplace add JessToudic/clawd-scenes && claude plugin install clawd-scenes@clawd-scenes
```

Run in a terminal, or use the same words as /plugin commands inside Claude Code.

[Source](https://github.com/JessToudic/clawd-scenes)

### next-action (switched off)
*Plugin · my build.* One next action pinned above the prompt. Off.

A thin band above the prompt that holds a single next action until it is done. The /work panel took over the job.

**When to reach for it**
- When one pinned step is all you need

**Try saying**
- `/next write the intro`
- `/next done`

Private, not published.

## Local MCP Servers

### obsidian-vault
*MCP · notes.* Reads, searches and edits the notes vault directly.

Gives Claude tools to list, read, search, append and patch notes by heading, plus daily notes and recent changes. It talks to Obsidian through the Local REST API plugin, so edits land in the open vault.

**How it works**
- Obsidian runs the Local REST API plugin
- mcp-obsidian connects with an API key
- Claude gets tools like simple_search and patch_content

**When to reach for it**
- Any vault operation
- Appending to a daily note

**Try saying**
- `Add this to today's daily note under Ideas`
- `Search my vault for notes about pricing`

```
claude mcp add obsidian-vault -e OBSIDIAN_API_KEY=your-key -- uvx mcp-obsidian
```

Install the Local REST API plugin in Obsidian first and copy its key.

[Source](https://github.com/MarkusPfundstein/mcp-obsidian)

### whatsapp
*MCP · messages.* Read-only WhatsApp bridge for work group chats.

Reads group messages and voice notes so a sweep script can sort them into an inbox card. I set the send limit to zero, so Claude can read but never message anyone.

**How it works**
- A Go bridge links to WhatsApp like WhatsApp Web
- A Python MCP server exposes chats and messages
- A 15 minute sweep sorts new messages into tasks

**When to reach for it**
- Catching tasks buried in group chats

**Try saying**
- `What did the team ask me for today?`

Tip: Lock sending at the server level, not just in the prompt.

Follow the setup in the repository. It needs Go and uv.

[Page](https://github.com/lharries/whatsapp-mcp)

### desktop-commander
*MCP · system.* Files, processes and long-running terminal sessions.

Starts and talks to processes, keeps REPL sessions open, searches across folders and edits files inside the directories you allow.

**How it works**
- start_process opens a session
- interact_with_process sends input
- Searches run as sessions you can page through

**When to reach for it**
- Long-running commands
- Python or Node REPL work

**Try saying**
- `Start a Python REPL and load this CSV`

```
npx @wonderwhy-er/desktop-commander@latest setup
```

Adds itself to Claude Desktop. Restart the app after.

[Source](https://github.com/wonderwhy-er/DesktopCommanderMCP)

### pdf-viewer
*MCP · documents.* Opens PDFs in a live viewer to mark up together.

Annotate, highlight, fill form fields and place signatures on a PDF while seeing the result live. Good for forms and contracts.

**How it works**
- Opens the PDF in an interactive viewer
- Claude proposes marks, you review them

**When to reach for it**
- Filling a form
- Reviewing a contract

**Try saying**
- `Open this PDF and fill the form with my details`

A Claude plugin from the claude.ai plugin directory.

### claude-in-chrome
*MCP · browser.* Drives my real Chrome: tabs, clicks, forms, console.

Navigates, reads pages, fills forms, runs page scripts, reads console and network logs and can record a GIF of a run. It works in your real browser, with your sign-ins.

**How it works**
- A Chrome extension connects to Claude
- Claude reads the page tree, then clicks by reference
- Asks before anything outward facing

**When to reach for it**
- Any browser task
- Sites that need your sign-in
- Debugging a web app

**Try saying**
- `Open my GitHub notifications and summarise them`

Install the Claude in Chrome extension.

[Page](https://claude.com/chrome)

### computer-use
*MCP · desktop.* Sees the screen and drives desktop apps.

Screenshots, clicks and typing for native apps that have no other connector. Browsers and terminals get limited access on purpose, so it stays safe.

**How it works**
- You approve each app it may control
- It works from screenshots and clicks

**When to reach for it**
- Native app tasks
- Moving data between apps

**Try saying**
- `Open the Photos app and find last week's screenshots`

Built into the Claude desktop app. Turn it on in settings.

### Claude Browser
*Built-in pane.* The browser pane inside the desktop app.

Opens local dev servers and files next to the chat so a build can be checked without leaving the session. This library was tested in it.

**How it works**
- Claude starts a dev server
- The page opens in a pane beside the chat
- Claude can click, read and screenshot it

**When to reach for it**
- Previewing local builds
- Checking a page renders

**Try saying**
- `Start the dev server and show me the page`

Built into the Claude desktop app.

## Connectors

### Gmail
*Connector.* Search, read, draft and label email.

Finds threads, reads messages, writes drafts and applies labels. I keep sending behind a yes, so Claude drafts and I send.

**How it works**
- Search uses normal Gmail queries
- Drafts appear in your Drafts folder

**When to reach for it**
- Inbox triage
- Drafting replies

**Try saying**
- `Find unread emails from recruiters this week`
- `Draft a reply that says yes to Tuesday`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Google Calendar
*Connector.* Events, free slots and invites.

Lists and edits events, finds open time across calendars and answers invites.

**When to reach for it**
- What is on today
- Finding a slot

**Try saying**
- `When am I free for an hour on Thursday?`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Google Drive
*Connector.* Search and read Drive files.

Finds files by name or content, reads them into the conversation and checks who they are shared with.

**When to reach for it**
- Pulling a doc into a task

**Try saying**
- `Find the latest invoice spreadsheet in my Drive`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Docs, Sheets, Slides
*Connector.* Edit Google documents, sheets and decks.

Reads and writes Google Docs, Sheets values and formulas, and Slides content, so edits land in the shared file instead of a copy.

**When to reach for it**
- Updating a shared sheet
- Editing a deck

**Try saying**
- `Add this week's numbers as a new row in the tracker sheet`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Notion
*Connector.* Pages, databases and the task board.

Searches the workspace, creates pages from templates and queries databases with filters. My task board lives here, and Claude logs, ticks and moves tasks from chat.

**How it works**
- Codewords like "task" and "done" map to database actions
- New pages use a template, never blank

**When to reach for it**
- Logging tasks
- Project pages

**Try saying**
- `task send the invoice by Friday`
- `What is overdue on my board?`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Slack
*Connector.* Read, search and draft Slack messages.

Reads channels and threads, searches history, drafts messages and edits canvases.

**When to reach for it**
- Catching up on a channel

**Try saying**
- `Summarise what I missed in #design today`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Trello
*Connector.* Boards, cards and checklists.

Reads and updates boards, cards and checklists. Handy for daily reporting to someone who lives in Trello.

**When to reach for it**
- Moving pending work onto a board

**Try saying**
- `Add today's unfinished tasks as cards in Pending`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Canva
*Connector.* Generate and edit Canva designs.

Creates designs from a prompt, edits text and images, resizes and exports to PDF or PNG.

**When to reach for it**
- Quick social graphics

**Try saying**
- `Make a square event poster in my brand kit`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Figma
*Connector.* Read designs and write to Figma.

Pulls design context into code, pushes UI into Figma files and draws FigJam diagrams.

**When to reach for it**
- Design to code
- Diagrams

**Try saying**
- `Build this Figma frame as a React component`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Gamma
*Connector.* Decks, docs and webpages from a prompt.

Generates and edits Gamma presentations and exports them to PDF or PowerPoint.

**When to reach for it**
- A fast deck draft

**Try saying**
- `Make a 6 slide deck from these notes`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Granola
*Connector.* Meeting notes and transcripts.

Finds past meetings, reads notes and summaries and searches transcripts for what was actually said.

**When to reach for it**
- What did we decide on that call

**Try saying**
- `What did we agree about the deadline in Monday's call?`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Firecrawl
*Connector.* Web search, scraping and structured data.

Searches the web, scrapes pages to clean markdown and runs catalogued data providers that return typed records instead of raw pages.

**When to reach for it**
- Scraping a page
- Research inputs

**Try saying**
- `Scrape this pricing page into a table`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

### Vercel
*Connector.* Deploys, logs, domains and env vars.

Checks deployments and build logs, reads runtime errors and manages project settings.

**When to reach for it**
- Why did the deploy fail

**Try saying**
- `Why did my last deploy fail?`

Add it in Claude: Settings, then Connectors. It works in claude.ai, the desktop app and Claude Code.

[Page](https://claude.ai/settings/connectors)

## CLI Tools

### python 3.12
*Runtime.* Default for every script.

The one Python everything installs into. Keeping a single interpreter for scripts avoids the classic trap of packages landing in the wrong environment.

**When to reach for it**
- Any script or automation

**Try saying**
- `python -m pip install trafilatura`

Tip: If python points at some tool's private venv, fix PATH order before anything else.

```
winget install Python.Python.3.12
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Page](https://www.python.org/downloads/)

### node 24
*Runtime.* JS tooling and MCP servers.

Most MCP servers and Claude Code itself run on Node. npx runs a package without installing it.

**When to reach for it**
- npm installs
- MCP servers

**Try saying**
- `npx some-mcp-server`

```
winget install OpenJS.NodeJS
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Page](https://nodejs.org)

### bun
*Runtime.* Fast JS runtime and package manager.

A drop-in for node and npm when install or start speed matters.

**When to reach for it**
- Quick JS scripts

**Try saying**
- `bun run script.ts`

```
npm install -g bun
```

[Page](https://bun.sh)

### deno
*Runtime.* TypeScript one-offs with no install step.

Runs TypeScript directly and is sandboxed by default, so a throwaway script cannot touch what you did not allow.

**When to reach for it**
- Throwaway scripts

**Try saying**
- `deno run --allow-net fetch.ts`

```
winget install DenoLand.Deno
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Page](https://deno.com)

### uv
*Python tool.* Runs Python CLIs without installing them.

A very fast installer and runner. uvx runs a Python tool in a throwaway environment, which is how many MCP servers start.

**When to reach for it**
- Trying a Python CLI
- Starting Python MCP servers

**Try saying**
- `uvx mcp-obsidian`

```
winget install astral-sh.uv
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Source](https://github.com/astral-sh/uv)

### pnpm
*Package manager.* npm alternative with a shared store.

Saves disk space by sharing packages across projects. Some repos require it.

**When to reach for it**
- pnpm-based repos

**Try saying**
- `pnpm install`

```
npm install -g pnpm
```

[Page](https://pnpm.io)

### git
*Dev.* Version control for every project and the vault.

My notes vault is a git repo too, so any change Claude makes can be traced and undone.

**When to reach for it**
- Always

**Try saying**
- `git log --oneline -5`

Tip: Put your vault in git before letting an agent edit it.

```
winget install Git.Git
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Page](https://git-scm.com)

### gh
*Dev.* GitHub from the terminal.

Pull requests, issues, releases and repo creation without the browser. Claude uses it to publish projects like this one.

**When to reach for it**
- Opening PRs
- Publishing repos

**Try saying**
- `gh repo create my-tool --public --source .`

```
winget install GitHub.cli
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Page](https://cli.github.com)

### ripgrep
*Dev.* Very fast text search across folders.

Searches thousands of files in a blink and respects .gitignore. Claude's own search tools are built on it.

**When to reach for it**
- Finding anything in files

**Try saying**
- `rg "TODO" -g "*.md"`

```
winget install BurntSushi.ripgrep.MSVC
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Source](https://github.com/BurntSushi/ripgrep)

### ffmpeg
*Media.* Converts, trims and extracts audio and video.

The swiss tool for media. The transcription skills use it to pull audio out of video.

**When to reach for it**
- Any media conversion

**Try saying**
- `ffmpeg -i talk.mp4 -vn talk.mp3`

```
winget install Gyan.FFmpeg
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Page](https://ffmpeg.org)

### yt-dlp
*Media.* Downloads video and audio from most sites.

Feeds the transcription skills and the clip downloader. Keep it updated, sites change often.

**When to reach for it**
- Grabbing a video or its audio

**Try saying**
- `yt-dlp -x --audio-format mp3 <url>`

```
winget install yt-dlp.yt-dlp
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Source](https://github.com/yt-dlp/yt-dlp)

### adb
*Device.* Controls an Android phone over USB or Wi-Fi.

Installs apps, pulls files and drives the phone. Claude uses it to set up phone-side tools.

**When to reach for it**
- Phone automation

**Try saying**
- `adb devices`

Tip: From Git Bash, device paths like /sdcard get rewritten. Call adb from PowerShell or Python.

```
winget install Google.PlatformTools
```

Windows. On macOS use Homebrew, on Linux your package manager.

### scrcpy
*Device.* Mirrors and controls the phone screen.

Shows the phone on the laptop with mouse and keyboard control, with almost no lag.

**When to reach for it**
- Working on the phone from the desk

**Try saying**
- `scrcpy`

```
winget install Genymobile.scrcpy
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Source](https://github.com/Genymobile/scrcpy)

### claude
*AI CLI.* Claude Code itself.

The agent behind everything on these shelves. Skills, agents, hooks and plugins all live under ~/.claude.

**When to reach for it**
- Everything

**Try saying**
- `claude`

```
npm install -g @anthropic-ai/claude-code
```

[Page](https://claude.com/claude-code)

### codex
*AI CLI.* OpenAI's coding agent CLI.

Kept for comparing approaches on code tasks.

**When to reach for it**
- A second opinion on code

**Try saying**
- `codex "explain this repo"`

```
npm install -g @openai/codex
```

### hermes
*AI CLI.* Hermes Agent, a separate local agent.

Runs in its own environment, kept apart from the main Python so it cannot break it.

**When to reach for it**
- Agent experiments

See the Hermes Agent project for install steps.

### agy
*AI CLI.* Antigravity IDE command line.

Opens projects and manages plugins in the Antigravity IDE.

**When to reach for it**
- IDE work

Ships with the Antigravity IDE.

### ollama
*AI CLI.* Runs models locally, fully offline.

Pulls and runs open models on your own machine. Backs an offline fallback agent for when there is no internet or the data is private.

**When to reach for it**
- No internet
- Private data

**Try saying**
- `ollama run qwen3:4b`

Tip: The daemon starts on first command and blocks a while. Start it before you need it.

```
winget install Ollama.Ollama
```

Windows. On macOS use Homebrew, on Linux your package manager.

[Page](https://ollama.com)

## Python Kit

### Web scraping
*Packages.* Pull clean text out of any article.

trafilatura extracts the article body from almost any page, selectolax and beautifulsoup parse HTML, markdownify turns pages into notes, httpx and requests fetch.

**When to reach for it**
- Turning a web page into a note

**Try saying**
- `trafilatura.extract(trafilatura.fetch_url(url))`

```
python -m pip install trafilatura selectolax beautifulsoup4 markdownify httpx
```

Any Python 3.10 or newer.

### Browser control
*Packages.* Headless browsers for sites that block plain requests.

playwright drives a real browser, which gets past most 403 errors that plain HTTP hits. It is also how the screenshots for this page were made.

**When to reach for it**
- Sites that return 403
- Screenshots of pages

**Try saying**
- `page.goto(url); page.screenshot(path="shot.png")`

```
python -m pip install playwright && python -m playwright install chromium
```

### Search
*Packages.* DuckDuckGo search from a script.

ddgs runs web searches from Python without an API key and without getting blocked like plain requests do. Good for token-free research scripts.

**When to reach for it**
- Search inside scripts

**Try saying**
- `DDGS().text("claude code skills", max_results=10)`

```
python -m pip install ddgs
```

Any Python 3.10 or newer.

### Documents
*Packages.* Read and write PDF, Word, PowerPoint and Excel.

pymupdf and pypdf for PDFs, python-docx, python-pptx, openpyxl and xlsxwriter for Office files.

**When to reach for it**
- Generating reports
- Extracting text

**Try saying**
- `pymupdf.open("file.pdf")[0].get_text()`

```
python -m pip install pymupdf pypdf python-docx python-pptx openpyxl xlsxwriter
```

Any Python 3.10 or newer.

### Data
*Packages.* Tables, stats and SQL on local files.

pandas, numpy and scipy for analysis, scikit-learn for quick models, and duckdb for querying CSV files with plain SQL.

**When to reach for it**
- Cleaning a spreadsheet
- Quick analysis

**Try saying**
- `duckdb.sql("select * from 'sales.csv' limit 5")`

```
python -m pip install pandas numpy scipy scikit-learn duckdb
```

Any Python 3.10 or newer.

### Images & audio
*Packages.* Image editing and speech to text.

pillow for everyday image edits, OpenCV for heavier vision work, whisper for transcription.

**When to reach for it**
- Batch image edits
- Transcripts

**Try saying**
- `Image.open("a.png").resize((800, 600))`

```
python -m pip install pillow opencv-contrib-python openai-whisper
```

Any Python 3.10 or newer.

### Google APIs
*Packages.* Sheets, Drive and Gemini from scripts.

google-api-python-client for Drive and Gmail, gspread for Sheets, google-genai for Gemini.

**When to reach for it**
- Scripted sheet updates

**Try saying**
- `gspread.service_account().open("Tracker")`

```
python -m pip install google-api-python-client gspread google-genai
```

Any Python 3.10 or newer.

### App building
*Packages.* Small web apps and CLIs.

flask and fastapi for servers, sqlalchemy for databases, typer and rich for good-looking command line tools.

**When to reach for it**
- A quick local tool

**Try saying**
- `typer.run(main)`

```
python -m pip install fastapi flask sqlalchemy typer rich
```

Any Python 3.10 or newer.
