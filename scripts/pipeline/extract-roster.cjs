// Extracts the Prydwen HSRDataProvider roster (all characters) from any
// character page SSR HTML saved earlier (e.g. seele.html). Roster meta is
// needed by generate.cjs: nameEn, defaultRole and energyUltimate per slug.
// Usage: node extract-roster.cjs <saved-page.html> <outDir>
// Writes <outDir>/_roster.json keyed by slug.
const fs = require("fs");
const path = require("path");

const [page, outDir] = process.argv.slice(2);
const html = fs.readFileSync(page, "utf8");

// Flight payload escapes: structural quotes are \" in the raw HTML.
const re = /\\"unitId\\":\\"(\d+)\\"[\s\S]{0,600}?\\"slug\\":\\"([a-z0-9-]+)\\"[\s\S]{0,600}?\\"name\\":\\"([^"\\]+)\\"[\s\S]{0,800}?\\"defaultRole\\":\\"([^"\\]*)\\"[\s\S]{0,800}?\\"energyUltimate\\":(\d+|null)/g;

const roster = {};
let m;
while ((m = re.exec(html))) {
  const [, unitId, slug, name, role, energy] = m;
  if (roster[slug]) continue;
  roster[slug] = {
    unitId,
    nameEn: name,
    role: role || "",
    energyUltimate: energy === "null" ? null : Number(energy)
  };
}

const n = Object.keys(roster).length;
if (n < 80) { console.log("SUSPICIOUS: only", n, "entries — payload shape changed?"); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "_roster.json"), JSON.stringify(roster, null, 1), "utf8");
console.log("roster entries:", n);
const noEn = Object.entries(roster).filter(([, r]) => r.energyUltimate == null).map(([s]) => s);
if (noEn.length) console.log("null energyUltimate:", noEn.join(", ") || "none");
