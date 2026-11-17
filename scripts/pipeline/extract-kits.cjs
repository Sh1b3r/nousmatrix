// Offline Prydwen kit extractor. Fetches SSR HTML via curl.exe (node fetch gets
// 403 from Cloudflare), parses skill boxes + RSC ability definitions
// (defs-parser.cjs), resolves #N[i] placeholders at the convention levels:
// Basic Lv.6 (params row 5), Skill/Ult/Talent/Technique Lv.10 (row 9).
// params is a matrix [levelIndex][paramIndex-1].
// Usage: node extract-kits.cjs <outDir> <slug1> <slug2> ...
// Requires TEMP env var for defs-parser path (or edit the require below).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { extractDefinitions } = require(path.join(__dirname, "defs-parser.cjs"));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s) {
  return decodeEntities(String(s).replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function parseBoxes(html) {
  const boxes = [];
  const parts = html.split('<div class="box">');
  for (const part of parts.slice(1)) {
    const cut = part.indexOf('<div class="flex-1">');
    const chunk = part.slice(0, cut > 0 ? cut : Math.min(part.length, 8000));
    const kindM = chunk.match(/skill-icon[^"]*">([\s\S]*?)<\/div>/);
    const nameM = chunk.match(/skill-name">([^<]+)</);
    if (!nameM) continue;
    const levelM = chunk.match(/class="level"[^>]*>(\d+)</);
    const energies = [...chunk.matchAll(/Energy gain:\s*<span>(\d+)</g)].map((m) => Number(m[1]));
    const costM = chunk.match(/(\d+) energy cost/);
    const descM = chunk.match(/skill-with-coloring[^"]*">([\s\S]*?)<\/div>/);
    boxes.push({
      kind: kindM ? stripTags(kindM[1]) : "",
      name: stripTags(nameM[1]),
      level: levelM ? Number(levelM[1]) : null,
      energies,
      ultCost: costM ? Number(costM[1]) : null,
      desc: descM ? stripTags(descM[1]) : ""
    });
  }
  return boxes;
}

// Resolve #N[i] refs against a definition's params at the convention level.
function resolveDesc(def, isBasic) {
  const idx = isBasic ? 5 : 9;
  return String(def.desc).replace(/#(\d+)\[i\]/g, (_, n) => {
    const row = def.params && def.params[Math.min(idx, (def.params.length || 1) - 1)];
    if (!row) return "#ERR";
    const v = row[Number(n) - 1];
    if (typeof v !== "number") return String(v);
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
  });
}

function main() {
  const [outDir, ...slugs] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  for (const slug of slugs) {
    const url = `https://www.prydwen.gg/star-rail/characters/${slug}/`;
    try {
      const html = execFileSync("curl.exe", [
        "-sL", "--max-time", "30",
        "-A", UA,
        "-H", "Accept: text/html,application/xhtml+xml",
        "-H", "Accept-Language: en-US,en;q=0.9",
        url
      ], { maxBuffer: 20 * 1024 * 1024, encoding: "utf8" });
      if (!html || html.length < 10000) { console.log(`${slug}: empty/short response`); continue; }
      if (html.includes("Just a moment") && !html.includes("definitions")) {
        console.log(`${slug}: Cloudflare challenge`);
        continue;
      }
      const defs = extractDefinitions(html);
      if (!defs) { console.log(`${slug}: DEFS null`); continue; }
      const boxes = parseBoxes(html);
      const abilities = [];
      let unresolved = 0;
      for (const b of boxes) {
        const def = Object.values(defs).find((d) => d.name === b.name);
        if (!def) { abilities.push({ ...b, resolved: false }); unresolved++; continue; }
        const isBasic = String(def.type_text || "").toLowerCase().includes("basic");
        abilities.push({
          kind: b.kind, name: b.name, level: b.level, energies: b.energies,
          ultCost: b.ultCost,
          typeText: def.type_text, effectText: def.effect_text,
          maxLevel: def.max_level,
          text: resolveDesc(def, isBasic)
        });
      }
      const out = { slug, url, capturedOn: "2026-11-17", abilities };
      fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(out, null, 1), "utf8");
      console.log(`${slug}: OK ${abilities.length} boxes${unresolved ? ` (${unresolved} unresolved)` : ""}`);
    } catch (e) {
      console.log(`${slug}: FAIL ${e.message}`);
    }
  }
}
main();
