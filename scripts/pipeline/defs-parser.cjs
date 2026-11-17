// RSC ability-definitions parser (module). File-level bytes are double-escaped:
// structural quotes = `\"` (1 backslash), in-string quotes = `\\\"` (3 backslashes),
// in-string newlines = `\\n` (2 backslashes + n). String values decode via
// JSON.parse twice (unesc, tries=2).

function unesc(raw, tries = 2) {
  let v = raw;
  for (let i = 0; i < tries; i++) {
    try { v = JSON.parse('"' + v + '"'); } catch { break; }
  }
  return v;
}

// Scan a double-escaped string value starting at index `start` (first char after
// the opening structural quote). Stops at the structural closing quote: a quote
// preceded by exactly 1 backslash. In-string quotes carry 3 backslashes.
function scanString(html, start) {
  let i = start;
  let run = 0;
  while (i < html.length) {
    const c = html[i];
    if (c === "\\") { run++; i++; continue; }
    if (c === '"') {
      if (run === 1) return html.slice(start, i - 1); // structural end (drop the backslash)
      run = 0; i++; continue;                      // in-string quote or plain
    }
    run = 0; i++;
  }
  return html.slice(start, i);
}

// Find the position right after `\"<field>\":\"` (structural).
function findField(html, from, field) {
  const marker = '\\"' + field + '\\":\\"';
  const idx = html.indexOf(marker, from);
  return idx < 0 ? -1 : idx + marker.length;
}

// Extract ability definitions from the RSC payload by block-splitting on
// 6-digit ids: `\"110201\":{\"id\":\"110201\"`. Fields are pulled with targeted
// scans; desc/name/type_text/effect_text decode through JSON.parse twice.
function extractDefinitions(html) {
  const re = /\\"(\d{6})\\":{\\"id\\":\\"(\d{6})\\"/g;
  const marks = [...html.matchAll(re)];
  if (!marks.length) return null;
  const defs = {};
  marks.forEach((m, k) => {
    const start = m.index;
    const end = k + 1 < marks.length ? marks[k + 1].index : Math.min(html.length, start + 40000);
    const block = html.slice(start, end);
    const id = m[1];
    const get = (field) => {
      const p = findField(block, 0, field);
      return p < 0 ? "" : unesc(scanString(block, p));
    };
    const paramsM = block.match(/\\"params\\":(\[.*?\]),\\"/s);
    let params = null;
    try { params = paramsM ? JSON.parse(paramsM[1]) : null; } catch { params = null; }
    const maxM = block.match(/\\"max_level\\":(\d+)/);
    defs[id] = {
      id,
      desc: get("desc"),
      name: get("name"),
      params,
      type_text: get("type_text"),
      effect_text: get("effect_text"),
      max_level: maxM ? Number(maxM[1]) : null
    };
  });
  return defs;
}

module.exports = { extractDefinitions, unesc, scanString, findField };
