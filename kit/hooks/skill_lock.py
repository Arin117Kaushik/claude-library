"""Skill lock. UserPromptSubmit: matches the prompt to the skills CLAUDE.md makes mandatory, tells Claude to call them first,
and logs what was required. PostToolUse on Skill/Agent (arg: used) logs what was actually used. The /work panel reads skill_lock.json."""
import json, re, sys, time, pathlib
OUT = pathlib.Path.home() / '.claude' / 'adhd-progress' / 'skill_lock.json'
RULES = [
    (r'\b(code|script|python|function|plugin|mod|hook|config|refactor|install|api|json|regex|bug|fix|debug)\b', ['ponytail'], 'code or config work'),
    (r'\b(bug|error|broken|not working|doesn.?t work|fails?|failed|crash|blank|glitch|stuck)\b', ['systematic-debugging'], 'a bug or odd behavior'),
    (r'\b(ui|css|html|layout|redesign|restyle|frontend|landing page|dashboard|looks? (bad|good|ugly|horrible)|the design)\b', ['antislop', 'antislop-ui', 'impeccable'], 'UI or looks'),
    (r'\b(build|create|make|add|design|set ?up)\b.{0,30}\b(feature|command|app|tool|panel|plugin|mod|skill|page|system|hook|workflow|automation)\b', ['brainstorming', 'writing-plans'], 'building something new'),
    (r'\b(email|linkedin|post|caption|bio|cover letter|newsletter|substack)\b', ['humanizer'], 'writing the user will send or publish'),
    (r'\bcaption', ['caption-writer-sms'], 'a social caption'),
    (r'\b(research|look into|find out|compare)\b', ['agent:Oracle'], 'research'),
    (r'\b(job|resume|cv|interview|apply|application|recruiter)\b', ['agent:Aurther'], 'the job hunt'),
    (r'\b(should i|which is better|pros and cons|worth it)\b', ['agent:Stark'], 'a decision'),
    (r'\b(new skill|write a skill|skill file)\b', ['writing-skills'], 'making a skill'),
]


OUTPUT = (
    "OUTPUT LOCK (the user has ADHD; these are the /i-have-adhd rules, always on, strict). "
    "1) The first line is the answer or the one next action. If one line answers it, send one line. Simple question: 1 to 3 short lines, never a paragraph. "
    "2) No preamble (\"Let me\", \"I'll\", \"Sure\", \"Looking at\"), no recap of what you did, no closers or offers (\"Let me know\", \"Want me to\", \"Hope this helps\"). End when the answer ends. "
    "3) Multi step: numbered list, fewest steps, max 5 items, one action each. Say which step is done and what is next. "
    "4) Give concrete time estimates (\"about 15 minutes\"), never \"some work\". "
    "5) Errors: cause and fix in plain words, no \"uh oh\". Show what now works, in concrete terms. "
    "6) No tangents, no \"by the way\", no hedging filler, no idioms. A second issue becomes one separate line at the end. "
    "7) Only break this if he says \"explain\" or \"walk me through\" (then explain fully, still no preamble or closer), before a destructive action (confirm first), or after three failed fixes (name the wrong assumption, ask one question). "
    "Pre send check: delete the first sentence if it announces, the last if it recaps or offers, every hedge. Then check: could he act from the first line alone?"
)

def load():
    try:
        return json.loads(OUT.read_text(encoding='utf-8'))
    except Exception:
        return {'required': [], 'used': [], 'history': []}


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'ask'
    data = json.load(sys.stdin)
    st = load()
    if mode == 'used':
        ti = data.get('tool_input') or {}
        name = ti.get('skill') or ('agent:' + str(ti.get('subagent_type') or 'general'))
        if not name.startswith('agent:'):
            name = name.split(':')[-1]  # plugin skills log as plugin:skill
        if name not in st['used']:
            st['used'].append(name)
        st['history'] = (st.get('history', []) + [{'ts': time.time(), 'required': st['required'], 'used': st['used']}])[-10:]
    else:
        p = (data.get('prompt') or '').lower()
        if p.startswith('<') or len(p) < 4:
            return
        print(OUTPUT)
        hits, why = [], []
        for rx, names, label in RULES:
            if re.search(rx, p):
                why.append(label)
                hits += [n for n in names if n not in hits]
        st = {'required': hits, 'used': [], 'ts': time.time(), 'history': st.get('history', [])[-9:]}
        if hits:
            sk = [h for h in hits if not h.startswith('agent:')]
            ag = [h[6:] for h in hits if h.startswith('agent:')]
            msg = "SKILL LOCK (the user's rule, not optional). This prompt touches: " + ', '.join(why) + '. '
            if sk:
                msg += 'Before your first reply or tool call, call the Skill tool for: ' + ', '.join(sk) + '. '
            if ag:
                msg += 'Use the agent: ' + ', '.join(ag) + '. '
            msg += 'If one truly does not apply, say so in one line instead of silently skipping. Before claiming done, run verification-before-completion.'
            print(msg)
    OUT.write_text(json.dumps(st), encoding='utf-8')


if __name__ == '__main__':
    main()
