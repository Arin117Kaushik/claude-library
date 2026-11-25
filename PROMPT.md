# Build your own library: one prompt

Copy everything inside the box below into Claude Code (best: it can read your setup and build the site for you), Claude, or ChatGPT. The agent interviews you first, then builds your own version of this pixel library: your tools on the shelves, your notes system and rules on the desk.

You don't need Obsidian or my setup. The interview adapts to whatever you use.

```text
You are going to build me a personal "AI setup library": a pixel-art 3D room where every tool,
agent, skill, plugin, integration and app I use is a book on a shelf, and a desk holds how I
organize my notes, the apps behind my workspace, and the rules I give my AI. Each item opens
like a real book with pages that explain what it is, how it works, when I use it, example
prompts, and how someone else can install it.

Use this open-source project as the engine. Do not rebuild it from scratch:
https://github.com/Arin117Kaushik/claude-library
- library.js holds the shelves and books. desk.js holds the desk items. Everything else is the
  engine (three.js room, page curl reader, phone UI, catalog search) and stays as is.
- Read README.md, library.js and desk.js first so you know the exact data shape before you
  write anything.

STEP 1: INTERVIEW ME
Ask before you build. If you have an AskUserQuestion tool (Claude Code), use it: up to 4
questions per call, 2 to 4 options each, your recommended option first. If you don't, ask in
chat in short numbered rounds and wait for my answers. Never ask what you can find out by
looking. Skip any question my earlier answers already settle.

Round 1: what goes in the room
1. Where do I work with AI? (Claude Code / Claude app or claude.ai / ChatGPT / Cursor or
   another editor / a mix). This decides what you can scan and what I must list for you.
2. Which shelves do I want? Multi-select: agents or custom GPTs / skills / plugins and
   extensions / MCP servers and connectors / CLI tools / code packages / prompt templates /
   automations (n8n, Zapier, Make) / something else.
3. How should you collect my tools? (Scan my machine, I confirm the list / I paste a list /
   both).
4. What should the room be called, and whose name goes on it?

Round 2: the desk
5. Where do my notes live? (Obsidian / Notion / Apple Notes / Logseq or another outliner /
   Google Docs or Drive / plain folders / I don't keep notes). This becomes the file
   organizer: one file per top-level folder, section or database.
6. Which desk items do I want? Multi-select: the notes organizer / a handbook of my AI working
   rules / a phone listing the plugins, extensions or apps behind my workspace / none.
7. Where do my AI rules live, if anywhere? (CLAUDE.md files / ChatGPT custom instructions or
   memory / Cursor rules / a doc / nowhere yet). If nowhere, offer to draft a short handbook
   from my answers.

Round 3: privacy and publishing
8. What must stay out? Multi-select: client and employer names / personal or health details /
   file paths and usernames / anything marked private. Default to hiding all of them.
9. Where will it live? (Public GitHub repo with GitHub Pages / private repo / only on my
   machine).
10. Any personal touch? Optional: a poster on the wall (only art I own or am allowed to
    share), a desk pet instead of the fishbowl, a mascot for the handbook chapters.

STEP 2: COLLECT, DON'T GUESS
- If you can read my files (Claude Code), scan instead of asking. Useful places:
  ~/.claude/skills/*/SKILL.md, ~/.claude/agents/*.md, a project's .claude/agents/,
  ~/.claude/settings.json (enabledPlugins, hooks, outputStyle), ~/.claude.json (mcpServers),
  the output of `claude mcp list`, installed CLIs (check versions), my notes app's folders and
  plugin list (for Obsidian: .obsidian/community-plugins.json and each plugin's manifest.json).
- Write every description from the real source: the SKILL.md, the agent file, the plugin's
  README or manifest. If you can't read a source, say so and ask me. Never invent what a tool
  does, a version number, an author or a link.
- Show me the full inventory grouped by shelf before writing any files, and let me remove items.
- Never copy secrets. Strip API keys, tokens and env values out of anything you read.

STEP 3: BUILD
1. Get the engine: `npx degit Arin117Kaushik/claude-library my-library` (or download the
   repo). Work in that folder.
2. Rewrite library.js with my shelves and books. Every book needs n (name), k (kind),
   b (one-line blurb) and w (what it does). Add how, u (when to use), ex (example prompts),
   tip and get ({ cmd, note, file, link }) where you know them. Pick a spine color and glyph
   per shelf.
3. Rewrite desk.js: files (my notes structure), phone (menus of my workspace plugins or apps,
   with real links), handbook (my rules as chapters, each with title, art, intro and sections).
   Remove any desk item I said no to, and its references in app.js.
4. Remove the original owner's personal things: assets/poster.png (unless I gave you art),
   the kit/ folder contents, and the poster credit in README and LICENSE. Put my own agent
   files or skills in kit/ only if I want them shared, with personal details stripped.
5. Update the page title, owner name, README and LICENSE for me. Keep the credit line for the
   original project.
6. Run `node tools/export.mjs` to regenerate the Markdown in kit/.

STEP 4: CHECK, THEN PUBLISH
- Serve it with `python -m http.server 8791` and open http://127.0.0.1:8791. Open at least one
  book per shelf and every desk item. If you can run tools/shoot.py, run it and fix any failure.
- Read every page for private details from my "stay out" list before anything goes public.
- Ask me before creating a repo, pushing, or turning on GitHub Pages.

If you are a chat assistant without file access (ChatGPT, claude.ai): still run the interview,
then give me complete library.js and desk.js files to paste into my copy of the repo, plus the
exact steps to run and publish it.

Writing style for every page: short plain sentences, specific facts, no em dashes, no hype
words. Write like a person explaining their own toolbox to a friend.
```

## What it asks and why

| Question | Why it matters |
|---|---|
| Where you work with AI | Claude Code can scan your machine. ChatGPT users list their tools instead. |
| Which shelves | Nobody has the same mix. Shelves you skip don't appear. |
| How to collect | Scanning is fast and accurate. Pasting works anywhere. |
| Where notes live | The vault organizer becomes your Notion, Apple Notes or folders. |
| Desk items | Keep the handbook, swap the phone for your own apps, or drop the desk. |
| Where your rules live | CLAUDE.md, custom instructions or Cursor rules all become the handbook. |
| What stays out | Client names, health details and paths stay off the page by default. |
| Where it lives | Public site, private repo or just your laptop. |

The interview takes about five minutes. The build takes Claude Code about 20 to 40 minutes, depending on how many tools you have.
