// Writes the Markdown versions of the library into kit/, so people and agents can read it without the 3D page.
// Run from the repo root: node tools/export.mjs
import { writeFileSync } from 'node:fs';
import { library } from '../library.js';
import { desk } from '../desk.js';

const sections = (list) => list.map((s) => {
  if (s.h) return `\n## ${s.h}\n`;
  if (s.p) return `${s.p}\n`;
  if (s.list) return s.list.map((x) => `- ${x}`).join('\n') + '\n';
  if (s.pairs) return s.pairs.map(([a, b]) => `- **${a}**: ${b}`).join('\n') + '\n';
  if (s.code) return '```\n' + s.code + '\n```\n';
  return '';
}).join('\n');

const header = (title, line) => `# ${title}\n\n${line}\n\nGenerated from the [Claude Library](https://github.com/Arin117Kaushik/claude-library). Updated ${library.updated}.\n`;

writeFileSync('kit/VAULT.md', header(desk.folder.n, desk.folder.b) + sections(desk.folder.sections));
writeFileSync('kit/RULES.md', header(desk.rulebook.n, desk.rulebook.b) + sections(desk.rulebook.sections));

const phone = desk.phone.menus.map((m) => `\n## ${m.name}\n\n` + m.items.map((i) => {
  const links = (i.links || []).map((l) => `[${l.label}](${l.href})`).join(' · ');
  return `- **${i.n}**${i.by ? ` by ${i.by}` : ''}: ${i.d}${i.why ? ' ' + i.why : ''}${links ? ' ' + links : ''}`;
}).join('\n')).join('\n');
writeFileSync('kit/OBSIDIAN.md', header('Obsidian plugins and look', desk.phone.b) + phone + '\n');

const book = (b) => {
  const g = b.get || {};
  const lines = [`### ${b.n}${b.off ? ' (switched off)' : ''}`, `*${b.k}.* ${b.b}`, '', b.w];
  if (b.how) lines.push('', '**How it works**', ...b.how.map((x) => `- ${x}`));
  if (b.u) lines.push('', '**When to reach for it**', ...b.u.map((x) => `- ${x}`));
  if (b.ex) lines.push('', '**Try saying**', ...b.ex.map((x) => `- \`${x}\``));
  if (b.tip) lines.push('', `Tip: ${b.tip}`);
  if (g.cmd) lines.push('', '```', g.cmd, '```');
  if (g.note) lines.push('', g.note);
  const links = [g.file && `[Download](../${g.file})`, g.link && `[Page](${g.link})`, b.s && b.s !== g.link && `[Source](${b.s})`].filter(Boolean);
  if (links.length) lines.push('', links.join(' · '));
  return lines.join('\n');
};
const lib = library.shelves.map((s) => `\n## ${s.name}\n\n` + s.books.map(book).join('\n\n')).join('\n');
writeFileSync('kit/LIBRARY.md', header(library.title, library.tagline) + lib + '\n');
console.log('Wrote kit/LIBRARY.md, kit/VAULT.md, kit/RULES.md, kit/OBSIDIAN.md');
