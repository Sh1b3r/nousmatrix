// Rotation generator v3: builds kit-verified rotation entries from extracted
// Prydwen kit JSONs. All multipliers/energy come from the kit capture; per-cycle
// repeat counts are a generic documented assumption. Conditional passives,
// DoT and talent follow-up damage are excluded and documented in notes.
// Manual (not generated): summon/memosprite talents, enhanced-state boxes,
// transform/summon ultimates, multi-instance skills, DEF-based scaling,
// 0-energy ultimates (special models), uncaptured kits.
// Usage: node generate.cjs  (needs ../kits/*.json from extract-kits.cjs
// and _roster.json; paths below assume running from scripts/pipeline).
const fs = require("fs");
const path = require("path");

const here = __dirname;
const kitsDir = path.join(here, "kits");
const catalog = require("../../src/data/teamStatistics.json");
const roster = require(path.join(kitsDir, "_roster.json"));

const DONE = new Set(["1102", "1213", "1015", "1310", "1407", "1409", "1212", "1205", "1404", "1405"]);
const SLUG_ALIASES = {
  "1001": "march-7th", "1014": "saber", "1224": "march-7th-swordmaster",
  "1225": "tingyun-fugue", "1413": "march-7th-evernight", "1507": "blade-mortenax",
  "1112": "topaz", "1102": "seele", "1511": "aha"
};

function nameRe(name) { return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// Anchored damage matches. Refs were resolved at convention levels
// (Basic Lv.6 -> params row 5, others Lv.10 -> row 9), so a resolved value
// like 1.5 means 150%. Patterns cover:
//  A: "deals <Elem> DMG ... equal to X% (of) <Name|the Name|this character|her|his|its>'s? ATK|Max HP"
//  B (inverted): "X% of <Name>'s ATK as <Elem> DMG"
function buildRegexes(charName) {
  const parts = charName.split(" • ");
  const alts = [...new Set([nameRe(charName), ...parts.map(nameRe), nameRe(parts[parts.length - 1])])].filter(Boolean).join("|");
  const subj = "(?:(?:the )?(?:" + alts + "|this character)'s|her|his|its|their)";
  return {
    a: new RegExp("(?:deals )?(?:Physical|Fire|Ice|Lightning|Wind|Quantum|Imaginary|True) DMG[^.;\\n]{0,90}?equal to ([\\d.]+)%\\s*(?:of )?" + subj + " ?(ATK|Max HP|DEF)", "gi"),
    b: new RegExp("([\\d.]+)%\\s*(?:of )?" + subj + " (ATK|Max HP|DEF) as (?:Physical|Fire|Ice|Lightning|Wind|Quantum|Imaginary|True) DMG", "gi")
  };
}

function dmgMatches(text, charName) {
  const re = buildRegexes(charName);
  const res = [];
  for (const m of text.matchAll(re.a)) res.push({ pct: Number(m[1]), scale: m[2], index: m.index });
  for (const m of text.matchAll(re.b)) res.push({ pct: Number(m[1]), scale: m[2], index: m.index });
  res.sort((x, y) => x.index - y.index);
  return res;
}

// count multi-hit phrases that directly follow an anchored damage match
function hitCount(text, match) {
  const win = text.slice(match.index, match.index + 140);
  const m = win.match(/(\d+) instance|(\d+) time|hits per action/i);
  return m ? Math.max(Number(m[1]) || 0, Number(m[2]) || 0) : 1;
}

function parseDamage(text, charName, effectText, kind, excludedBits) {
  const t = text.replace(/\s+/g, " ");
  const ms = dmgMatches(t, charName);
  const primary = ms[0] || null;
  let adjacent = null;
  if (ms.length >= 2) {
    const win = t.slice(ms[1].index, ms[1].index + 120);
    const pre = t.slice(Math.max(0, ms[1].index - 100), ms[1].index);
    if (/adjacent|splash|other enemy targets/.test(win)) adjacent = ms[1];
    else if (excludedBits && /Additional [A-Za-z]+ DMG|chance to trigger/.test(pre + win)) {
      excludedBits.push(kind + ":conditional-additional");
    } else return { primary, adjacent: null, hits: hitCount(t, primary), targets: 0, aoe: false, matches: ms.length, complex: true, text: t };
  }
  const hits = primary ? hitCount(t, primary) : 1;
  const eff = (effectText || "").toLowerCase();
  const win1 = primary ? t.slice(primary.index, primary.index + 140) : "";
  let targets = 1, aoe = false;
  if (/to all (enemies|enemy targets|allies)/i.test(win1) || /random enemy/i.test(win1)) { targets = 3; aoe = true; }
  else if (adjacent || /adjacent/i.test(win1)) { targets = 3; }
  else if (eff.includes("aoe") || eff.includes("bounce") || eff.includes("random")) { targets = 3; aoe = true; }
  else if (eff.includes("blast")) { targets = 3; }
  return { primary, adjacent, hits, targets, aoe, matches: ms.length, text: t };
}

function hasDamage(d) { return d && d.primary && d.primary.pct > 0; }

const out = [];
const manual = [];
const ids = Object.keys(catalog.charactersById).filter((k) => /^\d+$/.test(k));

for (const id of ids) {
  if (DONE.has(id)) continue;
  const meta = catalog.charactersById[id];
  const slug = SLUG_ALIASES[id] || meta.slug;
  const ros = roster[slug];
  const file = path.join(kitsDir, slug + ".json");
  if (!ros || !fs.existsSync(file)) { manual.push([id, meta.nameEn, "kit not captured"]); continue; }
  const kit = JSON.parse(fs.readFileSync(file, "utf8"));
  const core = kit.abilities;
  const basic = core.find((a) => a.kind === "Basic ATK");
  const skill = core.find((a) => a.kind === "Skill");
  const ult = core.find((a) => a.kind === "Ultimate");
  const talent = core.find((a) => a.kind === "Talent");
  const talentText = talent ? ((talent.text || talent.desc) + "") : "";

  const ultCost = ros.energyUltimate;
  if (!ultCost) { manual.push([id, meta.nameEn, "ult energy 0 (special model)"]); continue; }

  // complexity gates
  if (core.some((a) => /Enhanced|Reinforced|Special/.test(a.kind))) { manual.push([id, meta.nameEn, "enhanced-state box"]); continue; }
  if (/summon|memosprite|servant|Numby|Lightning-Lord/i.test(talentText)) { manual.push([id, meta.nameEn, "summon/memosprite talent"]); continue; }
  if (!basic || !ult) { manual.push([id, meta.nameEn, "missing basic/ult box"]); continue; }
  if (/Enhance/.test(ult.kind)) { manual.push([id, meta.nameEn, "ult is an enhance/transform state"]); continue; }
  const ultRaw = ((ult.text || ult.desc) + "");
  if (/takes control of|transforms into|enters the "[A-Za-z]/i.test(ultRaw)) { manual.push([id, meta.nameEn, "transform/summon ult"]); continue; }
  if (skill && skill.effectText === "Enhance") { manual.push([id, meta.nameEn, "skill is an enhance state"]); continue; }
  const coreTexts = core.filter((a) => ["Skill", "Talent", "Ultimate"].includes(a.kind)).map((a) => ((a.text || a.desc) + "").replace(/\s+/g, " ")).join(" ");
  if (/Enhanced Basic|Basic ATK (gets|is|will be) Enhanced|Enhanced Basic Attack/i.test(coreTexts)) { manual.push([id, meta.nameEn, "enhanced-basic state"]); continue; }

  const charName = ros.nameEn;
  const condExtras = [];
  const b = parseDamage(basic.text || basic.desc, charName, basic.effectText, "basic", condExtras);
  const s = skill ? parseDamage(skill.text || skill.desc, charName, skill.effectText, "skill", condExtras) : null;
  const u = parseDamage(ult.text || ult.desc, charName, ult.effectText, "ult", condExtras);

  if (!hasDamage(b)) { manual.push([id, meta.nameEn, "basic has no anchored DMG multiplier"]); continue; }
  if (s && s.complex) { manual.push([id, meta.nameEn, "multi-instance skill"]); continue; }
  if (u.complex) { manual.push([id, meta.nameEn, "multi-instance ult"]); continue; }
  if (s && s.adjacent && s.primary && s.adjacent.pct > s.primary.pct) { manual.push([id, meta.nameEn, "skill has a larger second wave"]); continue; }
  if (u.adjacent && u.primary && u.adjacent.pct > u.primary.pct) { manual.push([id, meta.nameEn, "ult has a larger second wave"]); continue; }

  // DEF-based scaling anywhere in the core damage text (skip shield absorption)
  const rawCore = [basic, skill, ult].filter(Boolean).map((a) => ((a.text || a.desc) + "").replace(/\s+/g, " ")).join(" ");
  const defM = rawCore.match(/(DMG[^.;\n]{0,90}?(?:equal to|plus) [\d.]+% of (?:the )?[A-Za-z .•]{0,30}'s DEF)/);
  if (defM && !/absorb/i.test(defM[1])) { manual.push([id, meta.nameEn, "DEF-based scaling"]); continue; }

  const basicEn = basic.energies[0] != null ? basic.energies[0] : 20;
  const skillEn = s && skill.energies[0] != null ? skill.energies[0] : null;
  const ultEn = ult.energies[0] != null ? ult.energies[0] : 5;
  if (!basicEn) { manual.push([id, meta.nameEn, "basic gains no energy (transform model)"]); continue; }

  const scales = [b, s, u].filter(hasDamage).map((d) => d.primary.scale);
  if (scales.length && new Set(scales).size > 1) { manual.push([id, meta.nameEn, "mixed ATK/HP scaling"]); continue; }
  const hpScale = scales[0] === "hp";

  const multihit = [];
  if (b.hits > 1) multihit.push("basic");
  if (hasDamage(s) && s.hits > 1) multihit.push("skill");
  if (hasDamage(u) && u.hits > 1) multihit.push("ult");

  // cycle composition: 2x skill (if it deals damage and regains energy) + N basics + 1 ult
  let skillCount = 0, basicCount = 0;
  if (hasDamage(s) && skillEn) {
    skillCount = 2;
    basicCount = Math.max(1, Math.ceil((ultCost - ultEn - 2 * skillEn) / basicEn));
  } else {
    basicCount = Math.max(1, Math.ceil((ultCost - ultEn) / basicEn));
  }
  const filler = skillCount * (skillEn || 0) + basicCount * basicEn;
  const closes = filler >= ultCost - ultEn;

  const scaleRu = hpScale ? "Max HP" : "ATK";
  const scaleEn = scaleRu;
  const pct = (d) => Math.round(d.primary.pct * 100);
  const adjPct = (d) => (d.adjacent ? ` + ${Math.round(d.adjacent.pct * 100)}% по смежным` : "");
  const adjPctEn = (d) => (d.adjacent ? ` + ${Math.round(d.adjacent.pct * 100)}% adjacent` : "");

  const instances = [];
  if (skillCount > 0) {
    instances.push({
      key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL",
      actionRu: `${skillCount}× навык «${skill.name}»: ${pct(s)}% ${scaleRu}${adjPct(s)}`,
      actionEn: `${skillCount}x Skill '${skill.name}': ${pct(s)}% ${scaleEn}${adjPctEn(s)}`,
      descRu: "Официальный множитель кита (Prydwen). Число применений за цикл — общее документированное допущение.",
      descEn: "Official kit multiplier (Prydwen). Per-cycle use count is a generic documented assumption.",
      mv: s.primary.pct, adjacentMv: s.adjacent ? s.adjacent.pct : undefined,
      targets: s.targets, count: skillCount, energyGain: skillEn
    });
  }
  instances.push({
    key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK",
    actionRu: `${basicCount}× базовая «${basic.name}»: ${pct(b)}% ${scaleRu}${adjPct(b)}`,
    actionEn: `${basicCount}x Basic '${basic.name}': ${pct(b)}% ${scaleEn}${adjPctEn(b)}`,
    descRu: "Официальный множитель кита (Prydwen). Число применений добирает энергию ульты — допущение.",
    descEn: "Official kit multiplier (Prydwen). Basic count tops up the ult energy — an assumption.",
    mv: b.primary.pct, adjacentMv: b.adjacent ? b.adjacent.pct : undefined,
    targets: b.targets, count: basicCount, energyGain: basicEn
  });
  if (hasDamage(u)) {
    instances.push({
      key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE",
      actionRu: `Ульт «${ult.name}»: ${pct(u)}% ${scaleRu}${adjPct(u)}`,
      actionEn: `Ult '${ult.name}': ${pct(u)}% ${scaleEn}${adjPctEn(u)}`,
      descRu: `Стоимость ${ultCost} энергии, +${ultEn} после.`,
      descEn: `Costs ${ultCost} energy, +${ultEn} after.`,
      mv: u.primary.pct, adjacentMv: u.adjacent ? u.adjacent.pct : undefined,
      targets: u.targets, count: 1, energyGain: ultEn, isUlt: true
    });
  } else {
    instances.push({
      key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE",
      actionRu: `Ульт «${ult.name}»: не наносит урона (лечение/бафф)`,
      actionEn: `Ult '${ult.name}': deals no damage (heal/buff)`,
      descRu: `В цикле учтена только энергетика ульты: стоимость ${ultCost}, +${ultEn} после.`,
      descEn: `Only the ult's energy budget is counted: cost ${ultCost}, +${ultEn} after.`,
      mv: 0, targets: 1, count: 1, energyGain: ultEn, isUlt: true
    });
  }

  const spNet = skillCount - basicCount;
  const excludedBits = condExtras.map((x) => "доп. условный урон (" + x + ")");
  const allText = core.map((a) => ((a.text || a.desc) + "").toLowerCase()).join(" ");
  if (/burn|bleed|shock|wind shear|frost|maim|dmg over time/.test(allText)) excludedBits.push("DoT-урон кита");
  if (/follow-up/.test(allText)) excludedBits.push("бонус-атаки таланта");
  if (/state|stack/.test(allText)) excludedBits.push("состояния/стаки кита");
  if (/if the (enemy|target)/.test(allText)) excludedBits.push("условные бонусы кита (If-условия)");
  const exclRu = excludedBits.join(", ") || "условные пассивы";
  const exclEnMap = { "DoT-урон кита": "kit DoT damage", "бонус-атаки таланта": "talent follow-up attacks", "состояния/стаки кита": "kit states/stacks" };
  const exclEn = excludedBits.map((x) => exclEnMap[x] || (/доп. условный урон \((\w+):/.test(x) ? "conditional additional " + x.match(/доп. условный урон \((\w+):/)[1] + " damage" : x)).join(", ") || "conditional passives";

  const noteRu = `Стандартный цикл: ${skillCount ? skillCount + "× навык + " : ""}${basicCount}× базовая + ульт${hasDamage(u) ? "" : " (ульт без урона — только энергетика)"}. Множители, энергия способностей и стоимость ульты (${ultCost}) — из официального кита (Prydwen, зеркало OSPROD, снимок 2026-11-17, Basic Lv.6 / остальные Lv.10). Число повторов за цикл — общее документированное допущение (энергия: ${filler} ≥ ${ultCost - ultEn} ✓${closes ? "" : " — НЕ замыкается"}). SP: ${spNet >= 0 ? "+" + spNet : spNet} за цикл. Не включено (аптайм/условия не подтверждены): ${exclRu}, энергия союзников, эйдолоны (E0).${multihit.length ? ` ВНИМАНИЕ: мультитай-атаки (${multihit.join(", ")}) — множитель указан за один удар.` : ""}`;
  const noteEn = `Standard cycle: ${skillCount ? skillCount + "x Skill + " : ""}${basicCount}x Basic + Ultimate${hasDamage(u) ? "" : " (the ult deals no damage — energy budget only)"}. Multipliers, ability energy, and the ult cost (${ultCost}) come from the official kit (Prydwen, OSPROD mirror, captured 2026-11-17, Basic Lv.6 / others Lv.10). Per-cycle repeat counts are a generic documented assumption (energy: ${filler} >= ${ultCost - ultEn} ✓${closes ? "" : " — does NOT close"}). SP: ${spNet >= 0 ? "+" + spNet : spNet} per cycle. Excluded (uptime/conditions unverified): ${exclEn}, ally energy, eidolons (E0).${multihit.length ? ` NOTE: multi-hit attacks (${multihit.join(", ")}) — the multiplier is per single hit.` : ""}`;

  out.push({
    id, slug, ultCost, closes, multihit: multihit.join(","),
    entry: {
      status: "kit-verified",
      gameVersion: "4.7",
      buffUptimeStatus: "unverified",
      evidence: [{
        type: "official-kit-mirror", source: "prydwen.gg",
        url: kit.url, capturedOn: kit.capturedOn,
        note: `Basic ${pct(b)}% ${scaleEn}${b.adjacent ? `/${Math.round(b.adjacent.pct * 100)}% adj` : ""} (en ${basicEn}); Skill ${hasDamage(s) ? `${pct(s)}%${s.adjacent ? `/${Math.round(s.adjacent.pct * 100)}% adj` : ""} (en ${skillEn})` : "no damage"}; Ult ${hasDamage(u) ? `${pct(u)}%${u.adjacent ? `/${Math.round(u.adjacent.pct * 100)}% adj` : ""}` : "no damage"}, ${ultCost} energy cost (+${ultEn}); Talent: ${(talentText || "n/a").slice(0, 200)}.`
      }],
      noteRu, noteEn,
      ...(hpScale ? { hpScale: true } : {}),
      energy: { ultCost },
      instances
    }
  });
}

fs.writeFileSync(path.join(here, "generated.json"), JSON.stringify({ ok: out, manual }, null, 1), "utf8");
console.log("generated:", out.length, "manual:", manual.length);
console.log("\n--- MANUAL ---");
manual.forEach((m) => console.log(m.join(" | ")));
console.log("\n--- FLAGS ---");
out.forEach((o) => { if (o.multihit || !o.closes) console.log(o.id, o.slug, o.multihit ? "MULTIHIT:" + o.multihit : "", o.closes ? "" : "ENERGY-FAIL"); });
