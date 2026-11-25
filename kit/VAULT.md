# The Vault

How my notes vault is laid out, tagged and kept tidy.

Generated from the [Claude Library](https://github.com/Arin117Kaushik/claude-library). Updated 25 Nov 2026.

## Why it looks like this

One Obsidian vault is my second brain and the shared memory between me and Claude. Agents read it, write to it and follow its rules, so the structure has to be obvious to a person and to a model at the same time.

Six numbered folders, one index note per folder, one master index. No deep trees at the top level: the number tells you where something is in its life, the tags tell you what it is about.


## The folders

- **01 Inbox**: Capture first, sort later. Every new note lands here: quick thoughts, agent research, podcast summaries, saved links. Placement is never a reason to delay writing something down.
- **02 Work**: Active work. One folder per client or project, holding briefs, SOPs, contacts and deliverables. If it has a deadline, it lives here.
- **03 Learning**: What I am studying right now: AI agents, automation, courses, upskill plans and experiments.
- **04 Archive**: Finished or old material kept for reference. Notes are never deleted, they move here. Real junk (binary exports, zip files, media clutter) is deleted instead.
- **05 Agentic System**: The Claude setup itself: the capability index, working rules, prompts, templates and agent configs. This library is generated from the same facts.
- **06 System**: Automations, scripts, data exports and the output of scheduled jobs. Machinery, not reading material.


## Indexes

- HOME.md is the master index. It links every section.
- Each folder has an _index.md with one line per note: the link, then what it is in a short phrase.
- Adding a note means adding its line to that folder's _index.md. Agents do this too.
- A CLAUDE.md in the vault root holds the rules any agent must follow here.


## How tags work

Two layers. Folders say where a note sits in its life. Tags say what it is about and what kind of note it is.

- **Topic tags**: A Tags: line under the header, lowercase and comma separated: adhd, podcast, summary, or the source a note came from. Search and the tag pane run on these.
- **Type tags**: In frontmatter for notes with a role: type/reference, type/sop, type/index. They answer "what kind of note is this" across every folder.
- **Status**: Long-lived reference notes carry status: active in frontmatter, so stale ones are easy to find.


## Every new note starts like this

```
Created on: {{date}} {{time}}
Tags:
___
```

Three lines, nothing else to fill in. A low bar to start writing matters more than perfect metadata.


## Writing rules

- Plain, short sentences. No em dashes, no buzzwords, no filler superlatives.
- Link related notes with [[wikilinks]] so the graph does the remembering.
- Links sit inline next to what they refer to, never collected at the bottom.
- Headers name the subject. How a note was made goes in the body or nowhere.
- Research that should last goes through the research-doc skill, so every research note has the same shape.


## File rules

- Downloads, images and media go outside the vault, in a Downloads folder per project. The vault stays text.
- Archive notes, never delete them. Delete only real junk.
- The vault is a git repository, so every agent edit can be traced and undone.
- Agents reach the vault through the Local REST API plugin and the obsidian MCP server, not raw file writes, when Obsidian is open.
- Folder colors come from a CSS snippet keyed to the number prefixes, so the sidebar reads at a glance.


## For your agent

Paste this into Claude in an empty vault to set up the same skeleton. Change the folder names to fit your life.

```
Set up my Obsidian vault with six numbered folders: 01 - Inbox, 02 - Work, 03 - Learning, 04 - Archive, 05 - Agentic System, 06 - System. Add an _index.md in each with a one-line purpose, a HOME.md linking all of them, and a CLAUDE.md with these rules: new notes go to Inbox, every note starts with "Created on / Tags: / ___", archive instead of delete, update the folder _index.md when adding a note, and keep media outside the vault.
```
