// Renders generated.json entries into src/data/rotations.js (inserted before
// the final "};" in the same formatting style as the hand-written entries).
// Requires kits dir next to it (see generate.cjs).
const fs = require("fs");
const path = require("path");

const here = __dirname;
const g = require(path.join(here, "generated.json"));
const cat = require("../../src/data/teamStatistics.json");
const target = path.join(here, "..", "..", "src", "data", "rotations.js");

let s = fs.readFileSync(target, "utf8");
if (s.slice(-3) !== "};\n") { console.log("unexpected tail:", JSON.stringify(s.slice(-10))); process.exit(1); }

const J = (v) => JSON.stringify(v);
const blocks = [];
for (const o of g.ok) {
  const m = cat.charactersById[o.id] || {};
  const nameRu = m.nameRu || m.nameEn || o.slug;
  const e = o.entry;
  const lines = [];
  lines.push(`  // ${nameRu} (${o.id}) — kit-verified: множители и энергия из официального кита (Prydwen).`);
  lines.push(`  ${J(o.id)}: {`);
  lines.push(`    status: "kit-verified",`);
  lines.push(`    gameVersion: ${J(e.gameVersion)},`);
  lines.push(`    buffUptimeStatus: ${J(e.buffUptimeStatus)},`);
  lines.push(`    evidence: [`);
  for (const ev of e.evidence) {
    lines.push(`      {`);
    lines.push(`        type: ${J(ev.type)},`);
    lines.push(`        source: ${J(ev.source)},`);
    lines.push(`        url: ${J(ev.url)},`);
    lines.push(`        capturedOn: ${J(ev.capturedOn)},`);
    lines.push(`        note: ${J(ev.note)}`);
    lines.push(`      }`);
  }
  lines.push(`    ],`);
  lines.push(`    noteRu: ${J(e.noteRu)},`);
  lines.push(`    noteEn: ${J(e.noteEn)},`);
  if (e.hpScale) lines.push(`    hpScale: true,`);
  lines.push(`    energy: { ultCost: ${e.energy.ultCost} },`);
  lines.push(`    instances: [`);
  e.instances.forEach((inst, i) => {
    lines.push(`      {`);
    lines.push(`        key: ${J(inst.key)},`);
    lines.push(`        phaseRu: ${J(inst.phaseRu)},`);
    lines.push(`        phaseEn: ${J(inst.phaseEn)},`);
    lines.push(`        actionRu: ${J(inst.actionRu)},`);
    lines.push(`        actionEn: ${J(inst.actionEn)},`);
    lines.push(`        descRu: ${J(inst.descRu)},`);
    lines.push(`        descEn: ${J(inst.descEn)},`);
    lines.push(`        mv: ${inst.mv},`);
    if (inst.adjacentMv !== undefined) lines.push(`        adjacentMv: ${inst.adjacentMv},`);
    lines.push(`        targets: ${inst.targets},`);
    lines.push(`        count: ${inst.count},`);
    lines.push(`        energyGain: ${inst.energyGain}${inst.isUlt ? ", isUlt: true" : ""}`);
    lines.push(`      }${i < e.instances.length - 1 ? "," : ""}`);
  });
  lines.push(`    ]`);
  lines.push(`  },`);
  blocks.push(lines.join("\n"));
}

// junction: the previous (last) entry currently ends with "};" without a comma
const idx = s.lastIndexOf("};");
s = s.slice(0, idx).replace(/}\s*$/, "},") + "\n" + blocks.join("\n\n") + "\n" + s.slice(idx);
fs.writeFileSync(target, s, "utf8");
console.log("inserted", blocks.length, "entries; file size", s.length);
