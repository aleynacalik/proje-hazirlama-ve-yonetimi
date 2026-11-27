// Run from repository root after installing the project's dependencies.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const configPath = path.resolve('src/config/processConfig.ts');
const readmePath = path.resolve('README.md');
const values = {
  reactionName: 'Aspergillus niger ile Sitrik Asit Üretimi',
  tempMin: 28, tempOptimal: 30, tempMax: 32,
  tempCriticalLow: 25, tempCriticalHigh: 37,
  phMin: 2, phOptimal: 2.5, phMax: 3,
  phCriticalLow: 1.5, phCriticalHigh: 4,
  baseYieldPct: 80,
  literatureNote: 'Aerobik glukoz fermantasyonu ile sitrik asit üretimi. Net denklem: C6H12O6 + 1.5 O2 → C6H8O7 + 2 H2O. Üretim evresi hedefi: 30 °C ve pH 2.5. Teorik verim yaklaşık 1.067 g/g glukoz. İdeal bant, kritik eşikler ve %80 baz verim demo varsayımıdır; tesis güvenlik sınırı değildir. Kaynaklar: https://doi.org/10.1016/j.biortech.2020.124426 ; https://doi.org/10.1093/jimb/kuaf007 ; https://doi.org/10.1186/s12934-019-1064-6',
};
const source = fs.readFileSync(configPath, 'utf8');
const readme = fs.readFileSync(readmePath, 'utf8');
function parse(code) {
  const tree = ts.createSourceFile(configPath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (tree.parseDiagnostics.length) throw new Error('TypeScript sözdizimi hatası; dosya değiştirilmedi.');
  return tree;
}
const tree = parse(source);
const matches = [];
function propertyName(p) {
  return p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : undefined;
}
function visit(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const ids = node.properties.filter(p => ts.isPropertyAssignment(p) && propertyName(p) === 'presetId');
    if (ids.length === 1 && ts.isStringLiteral(ids[0].initializer) && ids[0].initializer.text === 'fermentation') matches.push(node);
  }
  ts.forEachChild(node, visit);
}
visit(tree);
if (matches.length !== 1) throw new Error('Tek bir fermentation preset bulunamadı; dosya değiştirilmedi.');
const edits = [];
for (const [key, value] of Object.entries(values)) {
  const props = matches[0].properties.filter(p => propertyName(p) === key);
  if (props.length !== 1 || !ts.isPropertyAssignment(props[0])) throw new Error(`Beklenen alan eksik veya belirsiz: ${key}. Dosya değiştirilmedi.`);
  const init = props[0].initializer;
  edits.push({ start: init.getStart(tree), end: init.getEnd(), value: JSON.stringify(value) });
}
let updated = source;
for (const edit of edits.sort((a,b) => b.start-a.start)) updated = updated.slice(0, edit.start) + edit.value + updated.slice(edit.end);
parse(updated);
const link = 'docs/kimya-proses-notu.md';
const eol = readme.includes('\r\n') ? '\r\n' : '\n';
const updatedReadme = readme.includes(link) ? readme : readme.trimEnd() + eol + eol + '## Kimya katkısı' + eol + eol + '- [Kimyasal proses, parametreler ve kaynaklar](docs/kimya-proses-notu.md)' + eol + '- [Kimya ekip veri şablonu](docs/kimya-ekip-sablonu.md)' + eol;
if (process.argv.includes('--check')) { console.log('Kimya alanları doğrulandı. Henüz değişiklik yapılmadı.'); process.exit(0); }
if (updated !== source) fs.writeFileSync(configPath, updated, 'utf8');
if (updatedReadme !== readme) fs.writeFileSync(readmePath, updatedReadme, 'utf8');
console.log('Kimya preset ve README güncellendi. Varsayılan proses ve diğer ekip alanları korunmuştur.');
