// Review helper: prints all generated entries compactly (id, cost, instances)
// plus the manual list. Requires generated.json (from generate.cjs).
const g = require(require("path").join(__dirname, "generated.json"));
const cat = require("../../src/data/teamStatistics.json");
for (const o of g.ok) {
  const m = cat.charactersById[o.id] || {};
  const inst = o.entry.instances.map((i) => `${i.key}:${Math.round(i.mv * 100)}%${i.adjacentMv ? "+" + Math.round(i.adjacentMv * 100) + "%adj" : ""}x${i.count}t${i.targets}e${i.energyGain}${i.isUlt ? "U" : ""}`).join(" | ");
  console.log(o.id, (m.nameEn || o.slug).padEnd(28), "cost" + o.ultCost, inst);
}
console.log("\nMANUAL: " + g.manual.length);
