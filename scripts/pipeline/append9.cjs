const fs = require("fs");
const p = "C:/Users/Vanya/Documents/WEB/Nous Matrix/docs/combat-audit-2026-11-16.md";
const section = `
## §9. Раунд 4 — kit-verified ротации для всего каталога (2026-11-17)

Коммит \`c94cd6d\`. Источник данных — офлайн-снимок Prydwen (зеркало OSPROD)
от 2026-11-17: SSR-HTML тянется \`curl.exe\` (node-fetch блокируется
Cloudflare), определения способностей парсятся из RSC-пейлоада (блочный
парсер по 6-значным ID; уровневая конвенция подтверждена на эталонах:
Seele 1.0/3.6/7.2 → 100%/360%/720%). Стоимость ульты и роли — из
roster-меты Prydwen (\`energyUltimate\`).

### Что сделано

- **44 новых kit-verified записи** в \`src/data/rotations.js\` (всего
  54 kit-verified + 1 draft). Цикл-шаблон: 2× навык (если наносит урон)
  + N× базовая (N добирает энергию ульты) + ульт. Число повторов — общее
  документированное допущение; множители/энергия — кит.
- Для саппортов/хилеров без урона в ульте (Bronya, Natasha, Lynx,
  Tingyun, Bailu, Huohuo, Hanya, Ruan Mei, Sparkle, Sunday, Yao Guang,
  Trailblazer Elation) — цикл «только базовые + ульт», ульт —
  энергетическое событие (mv 0).
- Смежный урон (Blast) смоделирован \`adjacentMv\`; мультитай-атаки —
  предупреждение в noteRu/noteEn (множитель за один удар).
- Движок не менялся.

### Классификация manual-списка (34 персонажа, без записей)

- **summon/memosprite талант** (9): Topaz & Numby, Jing Yuan, Lingsha,
  Aglaea, Cyrene, Dan Heng • Permansor Terrae, Robin • Summeretto,
  Trailblazer (Remembrance), March 7th • Evernight.
- **multi-instance skill/ult** (11): Welt, Asta, Saber, Clara, Sampo,
  Misha, Cipher, Evanescia, Gilgamesh, Trailblazer (Destruction — 2 режима
  ульты), Trailblazer (Harmony).
- **transform/summon ульта** (4): Rappa, Phainon, Himeko • Nova,
  Mortenax Blade.
- **ульт 0 энергии / спецмодель** (6): Feixiao, Acheron, Pearl,
  Silver Wolf LV.999, Aventurine • Waveflair, Aeon ★ Aha.
- **DEF-скейлинг** (2): Aventurine, Trailblazer (Preservation).
- **enhanced-basic state** (2): Boothill, Sparxie.
- Март 7 (1001) и Март 7 • Охотница (1224) — сгенерированы (киты сняты
  после снятия рати-лимита Cloudflare).

### Исключения с документированием (в noteRu/noteEn каждой записи)

DoT-урон кита (Kafka, Black Swan, Guinaifen, Jiaoqiu, Hysilens),
бонус-атаки таланта (Himeko, Herta, Yanqing, Xueyi, Moze, Jade,
Dr. Ratio, Boothill-класс), состояния/стаки кита, If-условия кита,
энергия союзников, эйдолоны (E0).

### Тесты

\`scripts/test-round4.mjs\` — **44/44 PASS**: kit-пайплайн задействован
(официальные множители кита), урон конечен и > 0, энергетический цикл
замыкается без энергии союзников. Регрессия 10 прежних kit-verified
проходит; известное задокументированное поведение: у Гиацины (1409)
цикл 135 < 140 без ERR/энергии союзников (предупреждение движка,
описано в её noteRu ещё в раунде 3).

### Известные ограничения

- Смешанный ATK/HP-скейлинг в пределах одной ротации движок не
  поддерживает — такие киты попадают в manual.
- Уровневая конвенция (Basic Lv.6, остальные Lv.10) подтверждена на 4
  эталонах; расхождения Prydwen↔OSPROD не обнаружены.
`;
fs.appendFileSync(p, section, "utf8");
console.log("appended", section.length, "chars");
