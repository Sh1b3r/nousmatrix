const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { extractDefinitions } = require("./defs-parser.cjs");

const outDir = path.join(__dirname, "kits");
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

const targetSlugs = [
  "saber", "topaz", "jing-yuan", "feixiao", "lingsha", "aventurine",
  "acheron", "misha", "boothill", "rappa", "aglaea", "cipher", "phainon",
  "march-7th-evernight", "dan-heng-permansor-terrae", "cyrene", "sparxie",
  "pearl", "evanescia", "silver-wolf-lv-999", "blade-mortenax", "gilgamesh",
  "aha", "robin-summeretto", "aventurine-waveflair", "trailblazer-preservation",
  "trailblazer-harmony", "trailblazer-remembrance"
];

for (const slug of targetSlugs) {
  const filePath = path.join(outDir, `${slug}.json`);
  if (fs.existsSync(filePath)) {
    console.log(`[ALREADY EXISTS] ${slug}`);
    continue;
  }
  const url = `https://www.prydwen.gg/star-rail/characters/${slug}/`;
  try {
    const html = execFileSync("curl.exe", [
      "-sL", "--max-time", "25",
      "-A", UA,
      "-H", "Accept: text/html,application/xhtml+xml",
      "-H", "Accept-Language: en-US,en;q=0.9",
      url
    ], { maxBuffer: 20 * 1024 * 1024, encoding: "utf8" });

    if (!html || html.length < 10000) {
      console.log(`[SKIP: SHORT] ${slug}`);
      continue;
    }
    const defs = extractDefinitions(html);
    if (!defs) {
      console.log(`[SKIP: NO DEFS] ${slug}`);
      continue;
    }
    const boxes = parseBoxes(html);
    const abilities = [];
    for (const b of boxes) {
      const def = Object.values(defs).find((d) => d.name === b.name);
      if (!def) {
        abilities.push({ ...b, resolved: false });
        continue;
      }
      const isBasic = String(def.type_text || "").toLowerCase().includes("basic");
      abilities.push({
        kind: b.kind, name: b.name, level: b.level, energies: b.energies,
        ultCost: b.ultCost,
        typeText: def.type_text, effectText: def.effect_text,
        maxLevel: def.max_level,
        text: resolveDesc(def, isBasic)
      });
    }
    const out = { slug, url, capturedOn: "2026-11-18", abilities };
    fs.writeFileSync(filePath, JSON.stringify(out, null, 1), "utf8");
    console.log(`[OK] ${slug}: ${abilities.length} abilities`);
  } catch (err) {
    console.log(`[ERR] ${slug}: ${err.message}`);
  }
}
