# The Vault

One file per vault folder: what goes in it, what stays out, and the rules.

From the [Claude Library](https://github.com/Arin117Kaushik/claude-library). Updated 25 Nov 2026.

## 01 Inbox

Capture first, sort later.


### What it is

The front door of the vault. **Every new note lands here first**, whoever writes it: me, an agent saving research, or a scheduled job writing summaries.


### What goes in

- Quick thoughts and voice note transcripts
- Research an agent saved for later
- Podcast and video summaries
- Links and clippings to read


### Rules

- **Placement never delays writing.** If you are unsure where a note belongs, it belongs here.
- Sort once a week: move each note to Work, Learning or Archive, or delete real junk.
- Agents default to this folder when the user does not name one.


### Why it works

Deciding where something goes is a small decision, and small decisions are where capture dies. One default folder removes the decision.


## 02 Work

Active work with deadlines.


### What it is

Everything tied to a client, a project or a deadline. **One subfolder per client or project**, so a brief, its SOPs and its deliverables sit together.


### What goes in

- Briefs and meeting notes
- SOPs and checklists for repeat work
- Contacts and handover notes
- Drafts of deliverables


### Rules

- **If it has a deadline, it lives here.**
- A project folder gets its own CLAUDE.md when an agent works on it often, so the agent knows the brief without being told.
- Finished projects move to Archive as a whole folder.


## 03 Learning

What I am studying right now.


### What it is

Courses, upskill plans, experiments and notes on tools I am learning. **Only what is active**: once I stop studying something, it moves to Archive.


### What goes in

- Learning plans with weekly goals
- Notes from courses and docs
- Small experiments and what they taught me


### Rules

- Write what I tried and what happened, not copied documentation.
- Link each note to the project it helped, so learning shows up where it was used.


## 04 Archive

Finished or old, kept for reference.


### What it is

Where finished projects and old notes go. **Notes are never deleted, they move here.** Search still finds them and links still work.


### What goes in

- Finished client projects, as whole folders
- Old jobs and past experiments
- Superseded versions of config files


### What gets deleted instead

Real junk only: binary exports, zip files, stray media and IDE leftovers. If it is text someone wrote, it is archived.


## 05 Agentic System

The Claude setup itself.


### What it is

The configuration of the AI side: the **capability index** of every agent, skill and tool, the working rules, prompts, templates and agent configs. This library is built from the same facts.


### What goes in

- The capability index, updated whenever something is installed
- Working rules too long for CLAUDE.md
- Prompt templates and agent drafts
- A research source map: where good sources live, per topic


### Rules

- **Keep CLAUDE.md short.** Long rules live here and CLAUDE.md points to them.
- When an agent or skill is added, the index note is updated in the same session.


## 06 System

Automations, scripts and their output.


### What it is

The machinery: scripts, scheduled jobs and what they write. **Not reading material**, so it stays out of the way of real notes.


### What goes in

- Scripts that run on a schedule
- Their state files and logs
- Data exports and automation workflow files


### Rules

- A script that writes notes writes them into Inbox, not here.
- Every script has a one-line description in the folder index.


## Indexes & tags

How everything is found again.


### Indexes

- **HOME.md** is the master index and the startup page. It links every section.
- Each folder has an **_index.md** with one line per note: the link, then what it is.
- Adding a note means adding its line to the folder index. Agents do this too.


### Two kinds of tags

- **Topic tags**: A **Tags:** line under the header, lowercase and comma separated: adhd, podcast, summary, or the source a note came from.
- **Type tags**: In frontmatter for notes with a role: **type/reference**, **type/sop**, **type/index**. They say what kind of note it is across every folder.
- **Status**: Long-lived notes carry **status: active**, so stale ones are easy to find.

Folders say where a note is in its life. Tags say what it is about. Neither tries to do the other's job.


## Rules & setup

The note template, writing rules and a setup prompt.


### Every new note starts like this

```
Created on: {{date}} {{time}}
Tags:
___
```

Three lines, nothing to fill in. **A low bar to start matters more than perfect metadata.**


### Writing rules

- Plain, short sentences. No em dashes, no buzzwords.
- Link related notes with **[[wikilinks]]**.
- Links sit inline next to what they refer to.
- Research that should last goes through the research-doc skill.


### File rules

- Media and downloads live **outside the vault**, in a Downloads folder per project.
- The vault is a **git repository**, so every agent edit can be undone.
- Agents edit through the Local REST API plugin while Obsidian is open.
- A **CLAUDE.md** in the vault root holds the rules every agent follows.


### Set up your own

```
Set up my Obsidian vault with six numbered folders: 01 - Inbox, 02 - Work, 03 - Learning, 04 - Archive, 05 - Agentic System, 06 - System. Add an _index.md in each with a one-line purpose, a HOME.md linking all of them, and a CLAUDE.md with these rules: new notes go to Inbox, every note starts with "Created on / Tags: / ___", archive instead of delete, update the folder _index.md when adding a note, and keep media outside the vault.
```
