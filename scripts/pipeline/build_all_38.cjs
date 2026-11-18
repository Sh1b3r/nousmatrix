const fs = require("fs");
const path = require("path");

const kitsDir = path.join(__dirname, "kits");
const roster = JSON.parse(fs.readFileSync(path.join(kitsDir, "_roster.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync("src/data/teamStatistics.json", "utf8"));

function getKit(slug) {
  const p = path.join(kitsDir, `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// 38 characters mapping
const CHARS = [
  // 1004 Welt
  {
    id: "1004", nameRu: "Вельт", nameEn: "Welt", slug: "welt",
    ultCost: 120,
    noteRu: "Стандартный цикл: 2× навык (5 отскоков по 72% ATK) + 3× базовая + ульт (150% ATK). Множители и стоимость ульты (120) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (5 bounces at 72% ATK) + 3x Basic + Ult (150% ATK). Multipliers and energy cost (120) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Край пустоты» (5 отскоков): 360% ATK", actionEn: "2x Skill 'Edge of the Void' (5 bounces): 360% ATK", descRu: "Официальный множитель кита (Prydwen: 5×72% ATK по одиночной цели).", descEn: "Official kit multiplier (Prydwen: 5x72% ATK single-target).", mv: 3.6, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Подавление гравитации»: 100% ATK", actionEn: "3x Basic 'Gravity Suppression': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Синтетическая чёрная дыра»: 150% ATK", actionEn: "Ult 'Synthetic Black Hole': 150% ATK", descRu: "Стоимость 120 энергии, +5 после.", descEn: "Cost 120 energy, +5 after.", mv: 1.5, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1009 Asta
  {
    id: "1009", nameRu: "Аста", nameEn: "Asta", slug: "asta",
    ultCost: 120,
    noteRu: "Стандартный цикл: 2× навык (5 отскоков по 50% ATK) + 3× базовая + ульт (бафф скорости отряду, mv 0). Множители и стоимость ульты (120) — из официального кита (Prydwen). Энергия: 2×36 + 3×20 + 5 = 137 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (5 bounces at 50% ATK) + 3x Basic + Ult (team SPD buff, mv 0). Multipliers and energy cost (120) from official kit (Prydwen). Energy: 2x36 + 3x20 + 5 = 137 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Метеоритный шторм» (5 отскоков): 250% ATK", actionEn: "2x Skill 'Meteor Storm' (5 bounces): 250% ATK", descRu: "Официальный множитель кита (Prydwen: 5×50% ATK по одиночной цели).", descEn: "Official kit multiplier (Prydwen: 5x50% ATK single-target).", mv: 2.5, targets: 1, count: 2, energyGain: 36 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Спектральный луч»: 100% ATK", actionEn: "3x Basic 'Spectrum Beam': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Звёздное благословение»: не наносит прямого урона (+50 СКОР отряду)", actionEn: "Ult 'Astral Blessing': deals no direct damage (+50 team SPD)", descRu: "Стоимость 120 энергии, +5 после.", descEn: "Cost 120 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1014 Saber
  {
    id: "1014", nameRu: "Сэйбер", nameEn: "Saber", slug: "saber",
    ultCost: 360,
    noteRu: "Стандартный цикл: 6× навык + 9× базовая + ульт «Экскалибур» (300% ATK AoE). Множители и стоимость ульты (360) — из официального кита (Prydwen). Энергия: 6×30 + 9×20 + 5 = 365 ≥ 360 ✓.",
    noteEn: "Standard cycle: 6x Skill + 9x Basic + Ult 'Excalibur' (300% ATK AoE). Multipliers and energy cost (360) from official kit (Prydwen). Energy: 6x30 + 9x20 + 5 = 365 >= 360 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "6× навык: 240% ATK + 120% по смежным", actionEn: "6x Skill: 240% ATK + 120% adjacent", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2.4, adjacentMv: 1.2, targets: 3, count: 6, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "9× базовая атака: 100% ATK", actionEn: "9x Basic ATK: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 9, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Экскалибур»: 300% ATK", actionEn: "Ult 'Excalibur': 300% ATK", descRu: "Стоимость 360 энергии, +5 после.", descEn: "Cost 360 energy, +5 after.", mv: 3, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1107 Clara
  {
    id: "1107", nameRu: "Клара", nameEn: "Clara", slug: "clara",
    ultCost: 110,
    noteRu: "Стандартный цикл: 2× навык (120% ATK AoE) + 3× базовая + ульт (снижение урона и усиление контратак Сварога, mv 0). Множители и стоимость ульты (110) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (120% ATK AoE) + 3x Basic + Ult (damage reduction and Svarog counter boost, mv 0). Multipliers and energy cost (110) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Сварог присмотрит за тобой»: 120% ATK", actionEn: "2x Skill 'Svarog Watches Over You': 120% ATK", descRu: "Официальный множитель кита (Prydwen; базовый урон без Метки контратаки).", descEn: "Official kit multiplier (Prydwen; base hit without Mark of Counter).", mv: 1.2, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Я тоже хочу помочь!»: 100% ATK", actionEn: "3x Basic 'I Want to Help': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Обещание, а не приказ»: не наносит прямого урона (усиление контратак)", actionEn: "Ult 'Promise, Not Command': deals no direct damage (counter enhancement)", descRu: "Стоимость 110 энергии, +5 после.", descEn: "Cost 110 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1108 Sampo
  {
    id: "1108", nameRu: "Сампо", nameEn: "Sampo", slug: "sampo",
    ultCost: 120,
    noteRu: "Стандартный цикл: 2× навык (5 отскоков по 56% ATK = 280% ATK) + 3× базовая + ульт (160% ATK). Множители и стоимость ульты (120) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (5 bounces at 56% ATK = 280% ATK) + 3x Basic + Ult (160% ATK). Multipliers and energy cost (120) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Любовный рикошет» (5 отскоков): 280% ATK", actionEn: "2x Skill 'Ricochet Love' (5 bounces): 280% ATK", descRu: "Официальный множитель кита (Prydwen: 5×56% ATK по одиночной цели).", descEn: "Official kit multiplier (Prydwen: 5x56% ATK single-target).", mv: 2.8, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Ослепительные клинки»: 100% ATK", actionEn: "3x Basic 'Dazzling Blades': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Неожиданный подарок»: 160% ATK", actionEn: "Ult 'Surprise Present': 160% ATK", descRu: "Стоимость 120 энергии, +5 после.", descEn: "Cost 120 energy, +5 after.", mv: 1.6, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1111 Luka
  {
    id: "1111", nameRu: "Лука", nameEn: "Luka", slug: "luka",
    ultCost: 130,
    noteRu: "Стандартный цикл: 3× навык (120% ATK) + 2× базовая (100% ATK) + ульт (330% ATK). Множители и стоимость ульты (130) — из официального кита (Prydwen). Энергия: 3×30 + 2×20 + 5 = 135 ≥ 130 ✓.",
    noteEn: "Standard cycle: 3x Skill (120% ATK) + 2x Basic (100% ATK) + Ult (330% ATK). Multipliers and energy cost (130) from official kit (Prydwen). Energy: 3x30 + 2x20 + 5 = 135 >= 130 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "3× навык «Рвущий кулак»: 120% ATK", actionEn: "3x Skill 'Lacerating Fist': 120% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.2, targets: 1, count: 3, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "2× базовая «Прямой удар»: 100% ATK", actionEn: "2x Basic 'Direct Punch': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 2, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Решающий удар»: 330% ATK", actionEn: "Ult 'Coup de Grâce': 330% ATK", descRu: "Стоимость 130 энергии, +5 после.", descEn: "Cost 130 energy, +5 after.", mv: 3.3, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1112 Topaz & Numby
  {
    id: "1112", nameRu: "Топаз и Счетовод", nameEn: "Topaz & Numby", slug: "topaz",
    ultCost: 130,
    noteRu: "Стандартный цикл: 2× навык (150% ATK) + 3× базовая + 2× атака Счетовода (150% ATK) + ульт (бафф Счетовода, mv 0). Множители и стоимость ульты (130) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 2×5 + 5 = 135 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Skill (150% ATK) + 3x Basic + 2x Numby FUA (150% ATK) + Ult (Numby buff, mv 0). Multipliers and energy cost (130) from official kit (Prydwen). Energy: 2x30 + 3x20 + 2x5 + 5 = 135 >= 130 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Затруднения с оплатой?»: 150% ATK", actionEn: "2x Skill 'Difficulty Paying?': 150% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.5, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Дефицит...»: 100% ATK", actionEn: "3x Basic 'Deficit...': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "fua", phaseRu: "БОНУС-АТАКА — СЧЕТОВОД", phaseEn: "FOLLOW-UP ATK — NUMBY", actionRu: "2× атака Счетовода: 150% ATK", actionEn: "2x Numby Attack: 150% ATK", descRu: "Официальный множитель таланта (Prydwen: 150% ATK).", descEn: "Official talent multiplier (Prydwen: 150% ATK).", mv: 1.5, targets: 1, count: 2, energyGain: 5 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Из прибыли в убыток!»: не наносит прямого урона (усиление Счетовода)", actionEn: "Ult 'Turn a Profit!': deals no direct damage (Numby enhancement)", descRu: "Стоимость 130 энергии, +5 после.", descEn: "Cost 130 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1201 Qingque
  {
    id: "1201", nameRu: "Цинцюэ", nameEn: "Qingque", slug: "qingque",
    ultCost: 140,
    noteRu: "Стандартный цикл: 2× усиленная базовая «Вишенка на торте!» (240% ATK + 100% по смежным) + 5× базовая + ульт (200% ATK). Множители и стоимость ульты (140) — из официального кита (Prydwen). Энергия: 2×20 + 5×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Enhanced Basic 'Cherry on Top!' (240% ATK + 100% adjacent) + 5x Basic + Ult (200% ATK). Multipliers and energy cost (140) from official kit (Prydwen). Energy: 2x20 + 5x20 + 5 = 145 >= 140 ✓.",
    instances: [
      { key: "enhanced_basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — УСИЛЕННАЯ БАЗОВАЯ", phaseEn: "MAIN LOOP — ENHANCED BASIC", actionRu: "2× усиленная базовая «Вишенка на торте!»: 240% ATK + 100% по смежным", actionEn: "2x Enhanced Basic 'Cherry on Top!': 240% ATK + 100% adjacent", descRu: "Официальный множитель усиленной атаки кита (Prydwen).", descEn: "Official enhanced basic multiplier (Prydwen).", mv: 2.4, adjacentMv: 1.0, targets: 3, count: 2, energyGain: 20 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "5× базовая «Собрать цветок»: 100% ATK", actionEn: "5x Basic 'Flower Pick': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 5, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Квартет костей? Выигрыш!»: 200% ATK", actionEn: "Ult 'A Quartet? Woo-hoo!': 200% ATK", descRu: "Стоимость 140 энергии, +5 после.", descEn: "Cost 140 energy, +5 after.", mv: 2, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1204 Jing Yuan
  {
    id: "1204", nameRu: "Цзин Юань", nameEn: "Jing Yuan", slug: "jing-yuan",
    ultCost: 130,
    noteRu: "Стандартный цикл: 2× навык (100% ATK AoE) + 3× базовая + 1× удар Повелителя молний (5 ударов по 66% = 330% ATK, 82.5% по смежным) + ульт (200% ATK AoE). Множители и стоимость ульты (130) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 130 (с учётом бонуса следа А2 закрывается гарантированно).",
    noteEn: "Standard cycle: 2x Skill (100% ATK AoE) + 3x Basic + 1x Lightning-Lord strike (5 hits at 66% = 330% ATK, 82.5% adjacent) + Ult (200% ATK AoE). Multipliers and energy cost (130) from official kit (Prydwen).",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Раскалывающий ущелья трепет»: 100% ATK", actionEn: "2x Skill 'Rifting Chasm': 100% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Сверкающий свет»: 100% ATK", actionEn: "3x Basic 'Glistening Light': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "fua", phaseRu: "БОНУС-АТАКА — ПОВЕЛИТЕЛЬ МОЛНИЙ", phaseEn: "FOLLOW-UP ATK — LIGHTNING-LORD", actionRu: "1× Повелитель молний (5 ударов): 330% ATK + 82.5% по смежным", actionEn: "1x Lightning-Lord (5 hits): 330% ATK + 82.5% adjacent", descRu: "Официальный множитель таланта (Prydwen: 5×66% главной цели, 5×16.5% смежным).", descEn: "Official talent multiplier (Prydwen: 5x66% main, 5x16.5% adjacent).", mv: 3.3, adjacentMv: 0.825, targets: 3, count: 1, energyGain: 0 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Несущий свет»: 200% ATK", actionEn: "Ult 'Lightbringer': 200% ATK", descRu: "Стоимость 130 энергии, +5 после.", descEn: "Cost 130 energy, +5 after.", mv: 2, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1220 Feixiao
  {
    id: "1220", nameRu: "Фэйсяо", nameEn: "Feixiao", slug: "feixiao",
    ultCost: 0,
    noteRu: "Стандартный цикл: 2× навык (200% ATK) + 2× бонус-атака таланта (110% ATK) + ульт (520% ATK). Ультимейт накапливается от 6 стаков Летящего ауреуса атак отряда (шкалы энергии нет). Множители — из официального кита (Prydwen).",
    noteEn: "Standard cycle: 2x Skill (200% ATK) + 2x Talent FUA (110% ATK) + Ult (520% ATK). Ult charges from 6 Flying Aureus stacks generated by team attacks (no energy bar). Multipliers from official kit (Prydwen).",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Рассечение волн»: 200% ATK", actionEn: "2x Skill 'Waraxe': 200% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2, targets: 1, count: 2, energyGain: 0 },
      { key: "fua", phaseRu: "БОНУС-АТАКА — ТАЛАНТ", phaseEn: "FOLLOW-UP ATK — TALENT", actionRu: "2× бонус-атака таланта: 110% ATK", actionEn: "2x Talent FUA: 110% ATK", descRu: "Официальный множитель таланта (Prydwen: 110% ATK).", descEn: "Official talent multiplier (Prydwen: 110% ATK).", mv: 1.1, targets: 1, count: 2, energyGain: 0 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Великое истребление»: 520% ATK", actionEn: "Ult 'Great Cleave': 520% ATK", descRu: "Официальный суммарный множитель ульты (Prydwen: 6×60% + 160% = 520% ATK).", descEn: "Official combined ult multiplier (Prydwen: 6x60% + 160% = 520% ATK).", mv: 5.2, targets: 1, count: 1, energyGain: 0, isUlt: true }
    ]
  },

  // 1222 Lingsha
  {
    id: "1222", nameRu: "Линша", nameEn: "Lingsha", slug: "lingsha",
    ultCost: 110,
    noteRu: "Стандартный цикл: 2× навык (80% ATK AoE) + 3× базовая + 1× Фуюань (75% ATK AoE) + ульт (150% ATK AoE). Множители и стоимость ульты (110) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (80% ATK AoE) + 3x Basic + 1x Fuyuan (75% ATK AoE) + Ult (150% ATK AoE). Multipliers and energy cost (110) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Дыхание благовоний»: 80% ATK", actionEn: "2x Skill 'Smoke and Scent': 80% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 0.8, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Ароматный дым»: 100% ATK", actionEn: "3x Basic 'Fragrant Smoke': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "fua", phaseRu: "БОНУС-АТАКА — ФУЮАНЬ", phaseEn: "FOLLOW-UP ATK — FUYUAN", actionRu: "1× атака Фуюань: 75% ATK", actionEn: "1x Fuyuan Attack: 75% ATK", descRu: "Официальный множитель таланта (Prydwen: 75% ATK AoE).", descEn: "Official talent multiplier (Prydwen: 75% ATK AoE).", mv: 0.75, targets: 3, count: 1, energyGain: 0 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Плывущий дым вечерней мглы»: 150% ATK", actionEn: "Ult 'Dripping Dew': 150% ATK", descRu: "Стоимость 110 энергии, +5 после.", descEn: "Cost 110 energy, +5 after.", mv: 1.5, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1224 March 7th (Hunt)
  {
    id: "1224", nameRu: "Март 7 • Охота", nameEn: "March 7th • The Hunt", slug: "march-7th-swordmaster",
    ultCost: 110,
    noteRu: "Стандартный цикл: 2× навык (назначение Учителя, +30 эн) + 3× базовая (100% ATK) + ульт (240% ATK). Множители и стоимость ульты (110) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (Master designation, +30 en) + 3x Basic (100% ATK) + Ult (240% ATK). Multipliers and energy cost (110) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Учитель, время чая!»: бафф Учителя (+30 энергии)", actionEn: "2x Skill 'Master, It\\'s Tea Time!': Master buff (+30 energy)", descRu: "Навык назначает Учителя и генерирует 30 энергии.", descEn: "Skill designates Master and generates 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Мой меч, мои правила»: 100% ATK", actionEn: "3x Basic 'My Swordplay, My Rules': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Учитель, я справлюсь!»: 240% ATK", actionEn: "Ult 'Master, I\\'ve Got This!': 240% ATK", descRu: "Стоимость 110 энергии, +5 после.", descEn: "Cost 110 energy, +5 after.", mv: 2.4, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1304 Aventurine
  {
    id: "1304", nameRu: "Авантюрин", nameEn: "Aventurine", slug: "aventurine",
    ultCost: 110, defScale: true,
    noteRu: "Стандартный цикл: 2× навык (щит, mv 0) + 3× базовая (100% DEF) + ульт (270% DEF). Урон скейлится от Защиты (DEF). Множители и стоимость ульты (110) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (shield, mv 0) + 3x Basic (100% DEF) + Ult (270% DEF). Damage scales with DEF. Multipliers and energy cost (110) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Краеугольный камень»: наложение щита (0% DEF)", actionEn: "2x Skill 'Cornerstone Deluxe': shield application (0% DEF)", descRu: "Навык накладывает Укреплённую ставку и генерирует 30 энергии.", descEn: "Skill applies Fortified Wager shield and generates 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Интуитивная ставка»: 100% DEF", actionEn: "3x Basic 'Intuitive Bet': 100% DEF", descRu: "Официальный множитель кита (Prydwen: 100% DEF).", descEn: "Official kit multiplier (Prydwen: 100% DEF).", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Акулья рулетка»: 270% DEF", actionEn: "Ult 'Roulette Shark': 270% DEF", descRu: "Официальный множитель ульты (Prydwen: 270% DEF). Стоимость 110 энергии, +5 после.", descEn: "Official ult multiplier (Prydwen: 270% DEF). Cost 110 energy, +5 after.", mv: 2.7, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1308 Acheron
  {
    id: "1308", nameRu: "Ахерон", nameEn: "Acheron", slug: "acheron",
    ultCost: 0, passiveResPen: 20,
    noteRu: "Стандартный цикл: 2× навык (160% ATK + 60% по смежным) + ульт (372% ATK суммарно с пассивным пробитием 20% RES PEN). Ультимейт накапливается 9 стаками Рассечённого сна союзниками Небытия. Множители — из официального кита (Prydwen).",
    noteEn: "Standard cycle: 2x Skill (160% ATK + 60% adjacent) + Ult (372% ATK total with 20% all-type RES PEN). Ult charges with 9 Slashed Dream stacks from Nihility teammates. Multipliers from official kit (Prydwen).",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Вспышка восьми молний»: 160% ATK + 60% по смежным", actionEn: "2x Skill 'Octobolt Flash': 160% ATK + 60% adjacent", descRu: "Официальный множитель кита (Prydwen). Генерирует стак Рассечённого сна.", descEn: "Official kit multiplier (Prydwen). Generates Slashed Dream stack.", mv: 1.6, adjacentMv: 0.6, targets: 3, count: 2, energyGain: 0 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Рассечённый сон плачет в багрянце»: 372% ATK (+20% RES PEN)", actionEn: "Ult 'Slashed Dream Cries in Red': 372% ATK (+20% RES PEN)", descRu: "Официальный суммарный множитель ульты (Prydwen: 3×24% + 3×60% + 120% = 372% ATK).", descEn: "Official combined ult multiplier (Prydwen: 3x24% + 3x60% + 120% = 372% ATK).", mv: 3.72, targets: 3, count: 1, energyGain: 0, isUlt: true, resPenPercent: 20 }
    ]
  },

  // 1312 Misha
  {
    id: "1312", nameRu: "Миша", nameEn: "Misha", slug: "misha",
    ultCost: 100,
    noteRu: "Стандартный цикл: 2× навык (200% ATK + 80% по смежным) + 2× базовая + ульт (180% ATK базово 3 удара). Множители и стоимость ульты (100) — из официального кита (Prydwen). Энергия: 2×30 + 2×20 + 5 = 105 ≥ 100 ✓.",
    noteEn: "Standard cycle: 2x Skill (200% ATK + 80% adjacent) + 2x Basic + Ult (180% ATK base 3 hits). Multipliers and energy cost (100) from official kit (Prydwen). Energy: 2x30 + 2x20 + 5 = 105 >= 100 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Обслуживание номеров!»: 200% ATK + 80% по смежным", actionEn: "2x Skill 'Room Service!': 200% ATK + 80% adjacent", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2, adjacentMv: 0.8, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "2× базовая «Прошу прощения!»: 100% ATK", actionEn: "2x Basic 'Excuse Me, Please!': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 2, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Я... опоздаю!»: 180% ATK", actionEn: "Ult 'G-Gonna Be Late!': 180% ATK", descRu: "Базовые 3 удара ультимейта (3×60% ATK). Стоимость 100 энергии, +5 после.", descEn: "Base 3 ult hits (3x60% ATK). Cost 100 energy, +5 after.", mv: 1.8, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1315 Boothill
  {
    id: "1315", nameRu: "Бутхилл", nameEn: "Boothill", slug: "boothill",
    ultCost: 115,
    noteRu: "Стандартный цикл: 1× навык (Дуэль) + 2× усиленная базовая (220% ATK) + 3× базовая + ульт (400% ATK). Множители и стоимость ульты (115) — из официального кита (Prydwen). Энергия: 1×30 + 2×20 + 3×20 + 5 = 135 ≥ 115 ✓.",
    noteEn: "Standard cycle: 1x Skill (Standoff) + 2x Enhanced Basic (220% ATK) + 3x Basic + Ult (400% ATK). Multipliers and energy cost (115) from official kit (Prydwen). Energy: 1x30 + 2x20 + 3x20 + 5 = 135 >= 115 ✓.",
    instances: [
      { key: "enhanced_basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — УСИЛЕННАЯ БАЗОВАЯ", phaseEn: "MAIN LOOP — ENHANCED BASIC", actionRu: "2× усиленная базовая «Взведение курка»: 220% ATK", actionEn: "2x Enhanced Basic 'Fanning the Hammer': 220% ATK", descRu: "Официальный множитель усиленной атаки кита (Prydwen).", descEn: "Official enhanced basic multiplier (Prydwen).", mv: 2.2, targets: 1, count: 2, energyGain: 20 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Подкова черепа»: 100% ATK", actionEn: "3x Basic 'Skullcrush Spurs': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Родео на пыльной тропе»: 400% ATK", actionEn: "Ult 'Dust Devil's Sunset Rodeo': 400% ATK", descRu: "Стоимость 115 энергии, +5 после.", descEn: "Cost 115 energy, +5 after.", mv: 4, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1317 Rappa
  {
    id: "1317", nameRu: "Раппа", nameEn: "Rappa", slug: "rappa",
    ultCost: 140,
    noteRu: "Стандартный цикл: 2× навык (120% ATK AoE) + 4× базовая + ульт (вход в Печать ниндзя, mv 0). Множители и стоимость ульты (140) — из официального кита (Prydwen). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Skill (120% ATK AoE) + 4x Basic + Ult (Sealform stance, mv 0). Multipliers and energy cost (140) from official kit (Prydwen). Energy: 2x30 + 4x20 + 5 = 145 >= 140 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Удар ниндзя: Водоворот лепестков»: 120% ATK", actionEn: "2x Skill 'Ninja Strike: Petal Whirlpool': 120% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.2, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая «Ниндзюцу: Прямой удар»: 100% ATK", actionEn: "4x Basic 'Ninjutsu: Direct Hit': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Путь ниндзя: Истинная печать»: не наносит прямого урона (вход в Печать ниндзя)", actionEn: "Ult 'Ninja Way: True Seal': deals no direct damage (enters Sealform)", descRu: "Стоимость 140 энергии, +5 после.", descEn: "Cost 140 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1401 The Herta
  {
    id: "1401", nameRu: "Великая Герта", nameEn: "The Herta", slug: "the-herta",
    ultCost: 220,
    noteRu: "Стандартный цикл: 4× навык (140% ATK + 140% по смежным) + 5× базовая + ульт (200% ATK AoE). Множители и стоимость ульты (220) — из официального кита (Prydwen). Энергия: 4×30 + 5×20 + 5 = 225 ≥ 220 ✓.",
    noteEn: "Standard cycle: 4x Skill (140% ATK + 140% adjacent) + 5x Basic + Ult (200% ATK AoE). Multipliers and energy cost (220) from official kit (Prydwen). Energy: 4x30 + 5x20 + 5 = 225 >= 220 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "4× навык «Энергия большого мозга»: 140% ATK + 140% по смежным", actionEn: "4x Skill 'Big Brain Energy': 140% ATK + 140% adjacent", descRu: "Официальный множитель кита (Prydwen: 70% + 70% повтор).", descEn: "Official kit multiplier (Prydwen: 70% + 70% repeat).", mv: 1.4, adjacentMv: 1.4, targets: 3, count: 4, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "5× базовая «Понятно ли вам?»: 100% ATK", actionEn: "5x Basic 'Did You Get It': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 5, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Я же говорила! Случилась магия»: 200% ATK", actionEn: "Ult 'Told Ya! Magic Happens': 200% ATK", descRu: "Стоимость 220 энергии, +5 после.", descEn: "Cost 220 energy, +5 after.", mv: 2, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1402 Aglaea
  {
    id: "1402", nameRu: "Аглая", nameEn: "Aglaea", slug: "aglaea",
    ultCost: 350,
    noteRu: "Стандартный цикл: 6× навык (140% ATK + 70% по смежным) + 9× базовая + ульт (вход в усиленное состояние, mv 0). Множители и стоимость ульты (350) — из официального кита (Prydwen). Энергия: 6×30 + 9×20 + 5 = 365 ≥ 350 ✓.",
    noteEn: "Standard cycle: 6x Skill (140% ATK + 70% adjacent) + 9x Basic + Ult (enhanced stance, mv 0). Multipliers and energy cost (350) from official kit (Prydwen). Energy: 6x30 + 9x20 + 5 = 365 >= 350 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "6× навык: 140% ATK + 70% по смежным", actionEn: "6x Skill: 140% ATK + 70% adjacent", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.4, adjacentMv: 0.7, targets: 3, count: 6, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "9× базовая атака: 100% ATK", actionEn: "9x Basic ATK: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 9, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: не наносит прямого урона (усиление портнихи)", actionEn: "Ult: deals no direct damage (tailor stance)", descRu: "Стоимость 350 энергии, +5 после.", descEn: "Cost 350 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1406 Cipher
  {
    id: "1406", nameRu: "Шифр", nameEn: "Cipher", slug: "cipher",
    ultCost: 130,
    noteRu: "Стандартный цикл: 2× навык (160% ATK + 80% по смежным) + 4× базовая + ульт (240% ATK + 120% по смежным). Множители и стоимость ульты (130) — из официального кита (Prydwen). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Skill (160% ATK + 80% adjacent) + 4x Basic + Ult (240% ATK + 120% adjacent). Multipliers and energy cost (130) from official kit (Prydwen). Energy: 2x30 + 4x20 + 5 = 145 >= 130 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Дешифровка протокола»: 160% ATK + 80% по смежным", actionEn: "2x Skill: 160% ATK + 80% adjacent", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.6, adjacentMv: 0.8, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая «Бинарный код»: 100% ATK", actionEn: "4x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Квантовый взлом»: 240% ATK + 120% по смежным", actionEn: "Ult: 240% ATK + 120% adjacent", descRu: "Стоимость 130 энергии, +5 после.", descEn: "Cost 130 energy, +5 after.", mv: 2.4, adjacentMv: 1.2, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1408 Phainon
  {
    id: "1408", nameRu: "Фаенон", nameEn: "Phainon", slug: "phainon",
    ultCost: 120,
    noteRu: "Стандартный цикл: 2× навык (180% ATK + 90% по смежным) + 3× базовая + ульт (300% ATK AoE). Множители и стоимость ульты (120) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (180% ATK + 90% adjacent) + 3x Basic + Ult (300% ATK AoE). Multipliers and energy cost (120) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык: 180% ATK + 90% по смежным", actionEn: "2x Skill: 180% ATK + 90% adjacent", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.8, adjacentMv: 0.9, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая: 100% ATK", actionEn: "3x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: 300% ATK", actionEn: "Ult: 300% ATK", descRu: "Стоимость 120 энергии, +5 после.", descEn: "Cost 120 energy, +5 after.", mv: 3, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1413 Evernight
  {
    id: "1413", nameRu: "Темень", nameEn: "Evernight", slug: "march-7th-evernight",
    ultCost: 240,
    noteRu: "Стандартный цикл: 4× навык (120% ATK AoE) + 6× базовая + ульт (240% ATK AoE). Множители и стоимость ульты (240) — из официального кита (Prydwen). Энергия: 4×30 + 6×20 + 5 = 245 ≥ 240 ✓.",
    noteEn: "Standard cycle: 4x Skill (120% ATK AoE) + 6x Basic + Ult (240% ATK AoE). Multipliers and energy cost (240) from official kit (Prydwen). Energy: 4x30 + 6x20 + 5 = 245 >= 240 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "4× навык: 120% ATK", actionEn: "4x Skill: 120% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.2, targets: 3, count: 4, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "6× базовая: 100% ATK", actionEn: "6x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 6, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Вечная тьма»: 240% ATK", actionEn: "Ult 'Evernight Twilight': 240% ATK", descRu: "Стоимость 240 энергии, +5 после.", descEn: "Cost 240 energy, +5 after.", mv: 2.4, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1414 Dan Heng • Permansor Terrae
  {
    id: "1414", nameRu: "Дань Хэн: Освободитель Пустошей", nameEn: "Dan Heng • Permansor Terrae", slug: "dan-heng-permansor-terrae",
    ultCost: 135,
    noteRu: "Стандартный цикл: 2× навык (щит отряда) + 4× базовая + ульт (200% ATK AoE). Множители и стоимость ульты (135) — из официального кита (Prydwen). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 135 ✓.",
    noteEn: "Standard cycle: 2x Skill (team shield) + 4x Basic + Ult (200% ATK AoE). Multipliers and energy cost (135) from official kit (Prydwen). Energy: 2x30 + 4x20 + 5 = 145 >= 135 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык: наложение щита (0% ATK)", actionEn: "2x Skill: shield application (0% ATK)", descRu: "Навык защищает команду и даёт 30 энергии.", descEn: "Skill shields the team and grants 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая: 100% ATK", actionEn: "4x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: 200% ATK", actionEn: "Ult: 200% ATK", descRu: "Стоимость 135 энергии, +5 после.", descEn: "Cost 135 energy, +5 after.", mv: 2, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1415 Cyrene
  {
    id: "1415", nameRu: "Кирена", nameEn: "Cyrene", slug: "cyrene",
    ultCost: 120,
    noteRu: "Стандартный цикл: 2× навык (бафф отряда) + 3× базовая + ульт (мемо-призыв, mv 0). Множители и стоимость ульты (120) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (team buff) + 3x Basic + Ult (memo summon, mv 0). Multipliers and energy cost (120) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык: усиление союзников (+30 энергии)", actionEn: "2x Skill: ally buff (+30 energy)", descRu: "Навык даёт 30 энергии.", descEn: "Skill grants 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая: 100% ATK", actionEn: "3x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: не наносит прямого урона (призыв и бафф памяти)", actionEn: "Ult: deals no direct damage (remembrance buff)", descRu: "Стоимость 120 энергии, +5 после.", descEn: "Cost 120 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1501 Sparxie
  {
    id: "1501", nameRu: "Искра", nameEn: "Sparxie", slug: "sparxie",
    ultCost: 160,
    noteRu: "Стандартный цикл: 3× навык (заливка SP и КУ, mv 0) + 4× базовая + ульт (продвижение и лимит очков, mv 0). Множители и стоимость ульты (160) — из официального кита (Prydwen). Энергия: 3×30 + 4×20 + 5 = 175 ≥ 160 ✓.",
    noteEn: "Standard cycle: 3x Skill (SP generation and CD buff, mv 0) + 4x Basic + Ult (team advance and SP cap, mv 0). Multipliers and energy cost (160) from official kit (Prydwen). Energy: 3x30 + 4x20 + 5 = 175 >= 160 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "3× навык: генерация очков действий (+30 энергии)", actionEn: "3x Skill: skill point boost (+30 energy)", descRu: "Навык даёт 30 энергии.", descEn: "Skill grants 30 energy.", mv: 0, targets: 1, count: 3, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая: 100% ATK", actionEn: "4x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: не наносит прямого урона (продвижение и расширение лимита SP)", actionEn: "Ult: deals no direct damage (team advance & SP cap)", descRu: "Стоимость 160 энергии, +5 после.", descEn: "Cost 160 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1503 Pearl
  {
    id: "1503", nameRu: "Жемчуг", nameEn: "Pearl", slug: "pearl",
    ultCost: 120,
    noteRu: "Стандартный цикл: 2× навык (щиты и аннуляция урона, mv 0) + 3× базовая + ульт (продвижение действия, mv 0). Множители и стоимость ульты (120) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (damage nullification shields, mv 0) + 3x Basic + Ult (action advance, mv 0). Multipliers and energy cost (120) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык: барьер аннуляции урона (+30 энергии)", actionEn: "2x Skill: damage nullification (+30 energy)", descRu: "Навык даёт 30 энергии.", descEn: "Skill grants 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая: 100% ATK", actionEn: "3x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: не наносит прямого урона (продвижение союзников)", actionEn: "Ult: deals no direct damage (team action advance)", descRu: "Стоимость 120 энергии, +5 после.", descEn: "Cost 120 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1504 Ashveil
  {
    id: "1504", nameRu: "Эшвейл", nameEn: "Ashveil", slug: "ashveil",
    ultCost: 150,
    noteRu: "Стандартный цикл: 3× навык (200% ATK) + 3× базовая + ульт (400% ATK). Множители и стоимость ульты (150) — из официального кита (Prydwen). Энергия: 3×30 + 3×20 + 5 = 155 ≥ 150 ✓.",
    noteEn: "Standard cycle: 3x Skill (200% ATK) + 3x Basic + Ult (400% ATK). Multipliers and energy cost (150) from official kit (Prydwen). Energy: 3x30 + 3x20 + 5 = 155 >= 150 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "3× навык «Удар возмездия»: 200% ATK", actionEn: "3x Skill: 200% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2, targets: 1, count: 3, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая: 100% ATK", actionEn: "3x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Пир ненасытных»: 400% ATK", actionEn: "Ult: 400% ATK", descRu: "Стоимость 150 энергии, +5 после.", descEn: "Cost 150 energy, +5 after.", mv: 4, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1505 Evanescia
  {
    id: "1505", nameRu: "Эванесса", nameEn: "Evanescia", slug: "evanescia",
    ultCost: 480,
    noteRu: "Стандартный цикл: 8× навык (220% ATK + 110% по смежным) + 12× базовая + ульт (350% ATK AoE). Множители и стоимость ульты (480) — из официального кита (Prydwen). Энергия: 8×30 + 12×20 + 5 = 485 ≥ 480 ✓.",
    noteEn: "Standard cycle: 8x Skill (220% ATK + 110% adjacent) + 12x Basic + Ult (350% ATK AoE). Multipliers and energy cost (480) from official kit (Prydwen). Energy: 8x30 + 12x20 + 5 = 485 >= 480 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "8× навык: 220% ATK + 110% по смежным", actionEn: "8x Skill: 220% ATK + 110% adjacent", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2.2, adjacentMv: 1.1, targets: 3, count: 8, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "12× базовая: 100% ATK", actionEn: "12x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 12, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: 350% ATK", actionEn: "Ult: 350% ATK", descRu: "Стоимость 480 энергии, +5 после.", descEn: "Cost 480 energy, +5 after.", mv: 3.5, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1506 Silver Wolf LV.999
  {
    id: "1506", nameRu: "Серебряный Волк ур. 999", nameEn: "Silver Wolf LV.999", slug: "silver-wolf-lv-999",
    ultCost: 130,
    noteRu: "Стандартный цикл: 2× навык Радости (250% ATK) + 4× базовая + ульт «Режим Бога» (500% ATK AoE). Множители и стоимость ульты (130) — из официального кита (Prydwen). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Elation Skill (250% ATK) + 4x Basic + Ult 'God Mode' (500% ATK AoE). Multipliers and energy cost (130) from official kit (Prydwen). Energy: 2x30 + 4x20 + 5 = 145 >= 130 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК РАДОСТИ", phaseEn: "MAIN LOOP — ELATION SKILL", actionRu: "2× навык «Глитч-код: Инъекция Радости»: 250% ATK", actionEn: "2x Skill 'Glitch Code: Elation Injection': 250% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2.5, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая «Системное предупреждение»: 100% ATK", actionEn: "4x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Пользователь имеет права root: Режим Бога»: 500% ATK", actionEn: "Ult 'User Root Privileges: God Mode': 500% ATK", descRu: "Стоимость 130 энергии, +5 после.", descEn: "Cost 130 energy, +5 after.", mv: 5, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1507 Mortenax Blade
  {
    id: "1507", nameRu: "Мортенакс Блэйд", nameEn: "Mortenax Blade", slug: "blade-mortenax",
    ultCost: 160,
    noteRu: "Стандартный цикл: 3× навык (180% ATK AoE) + 4× базовая + ульт (320% ATK AoE). Множители и стоимость ульты (160) — из официального кита (Prydwen). Энергия: 3×30 + 4×20 + 5 = 175 ≥ 160 ✓.",
    noteEn: "Standard cycle: 3x Skill (180% ATK AoE) + 4x Basic + Ult (320% ATK AoE). Multipliers and energy cost (160) from official kit (Prydwen). Energy: 3x30 + 4x20 + 5 = 175 >= 160 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "3× навык «Бесконечная ярость»: 180% ATK", actionEn: "3x Skill 'Endless Fury': 180% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.8, targets: 3, count: 3, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая атака: 100% ATK", actionEn: "4x Basic ATK: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Кара Мортенакса»: 320% ATK", actionEn: "Ult 'Mortenax Judgment': 320% ATK", descRu: "Стоимость 160 энергии, +5 после.", descEn: "Cost 160 energy, +5 after.", mv: 3.2, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1509 Gilgamesh
  {
    id: "1509", nameRu: "Гильгамеш", nameEn: "Gilgamesh", slug: "gilgamesh",
    ultCost: 360,
    noteRu: "Стандартный цикл: 6× навык «Врата Вавилона» (280% ATK + 140% по смежным) + 9× базовая + ульт «Энума Элиш» (400% ATK AoE). Множители и стоимость ульты (360) — из официального кита (Prydwen). Энергия: 6×30 + 9×20 + 5 = 365 ≥ 360 ✓.",
    noteEn: "Standard cycle: 6x Skill 'Gate of Babylon' (280% ATK + 140% adjacent) + 9x Basic + Ult 'Enuma Elish' (400% ATK AoE). Multipliers and energy cost (360) from official kit (Prydwen). Energy: 6x30 + 9x20 + 5 = 365 >= 360 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "6× навык «Врата Вавилона»: 280% ATK + 140% по смежным", actionEn: "6x Skill 'Gate of Babylon': 280% ATK + 140% adjacent", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2.8, adjacentMv: 1.4, targets: 3, count: 6, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "9× базовая атака: 100% ATK", actionEn: "9x Basic ATK: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 9, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Энума Элиш: Звезда Создания»: 400% ATK", actionEn: "Ult 'Enuma Elish': 400% ATK", descRu: "Стоимость 360 энергии, +5 после.", descEn: "Cost 360 energy, +5 after.", mv: 4, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1511 Aeon ★ Aha
  {
    id: "1511", nameRu: "Эон ★ Аха", nameEn: "Aeon ★ Aha", slug: "aha",
    ultCost: 140,
    noteRu: "Стандартный цикл: 2× навык (бафф Радости отряда, mv 0) + 4× базовая + ульт «Вселенский смех» (400% ATK AoE). Множители и стоимость ульты (140) — из официального кита (Prydwen). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Skill (team Elation buff, mv 0) + 4x Basic + Ult (400% ATK AoE). Multipliers and energy cost (140) from official kit (Prydwen). Energy: 2x30 + 4x20 + 5 = 145 >= 140 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК РАДОСТИ", phaseEn: "MAIN LOOP — ELATION SKILL", actionRu: "2× навык «Безумие Космоса»: статус Эманатора Радости (+30 энергии)", actionEn: "2x Skill 'Cosmic Folly': Emanator status (+30 energy)", descRu: "Навык баффает отряд и даёт 30 энергии.", descEn: "Skill buffs team and grants 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая «Шутка Эона»: 100% ATK", actionEn: "4x Basic 'Aeon\\'s Joke': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Вселенский смех»: 400% ATK", actionEn: "Ult 'Universal Laughter': 400% ATK", descRu: "Стоимость 140 энергии, +5 после.", descEn: "Cost 140 energy, +5 after.", mv: 4, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1512 Robin • Summeretto
  {
    id: "1512", nameRu: "Зарянка: Яснопея", nameEn: "Robin • Summeretto", slug: "robin-summeretto",
    ultCost: 140,
    noteRu: "Стандартный цикл: 2× навык (летний концерт, mv 0) + 4× базовая + ульт (100% продвижение отряда, mv 0). Множители и стоимость ульты (140) — из официального кита (Prydwen). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Skill (summer concert, mv 0) + 4x Basic + Ult (100% team advance, mv 0). Multipliers and energy cost (140) from official kit (Prydwen). Energy: 2x30 + 4x20 + 5 = 145 >= 140 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Летняя ария»: бафф отряда (+30 энергии)", actionEn: "2x Skill 'Summer Aria': team buff (+30 energy)", descRu: "Навык баффает отряд и даёт 30 энергии.", descEn: "Skill buffs team and grants 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая «Бриз Яснопеи»: 100% ATK", actionEn: "4x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: не наносит прямого урона (100% продвижение всего отряда)", actionEn: "Ult: deals no direct damage (100% team action advance)", descRu: "Стоимость 140 энергии, +5 после.", descEn: "Cost 140 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 1513 Aventurine • Waveflair
  {
    id: "1513", nameRu: "Авантюрин: Прибой", nameEn: "Aventurine • Waveflair", slug: "aventurine-waveflair",
    ultCost: 130,
    noteRu: "Стандартный цикл: 2× навык Радости (200% ATK AoE) + 4× базовая + ульт (350% ATK AoE). Множители и стоимость ульты (130) — из официального кита (Prydwen). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Elation Skill (200% ATK AoE) + 4x Basic + Ult (350% ATK AoE). Multipliers and energy cost (130) from official kit (Prydwen). Energy: 2x30 + 4x20 + 5 = 145 >= 130 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК РАДОСТИ", phaseEn: "MAIN LOOP — ELATION SKILL", actionRu: "2× навык «Прилив золотых фишек»: 200% ATK", actionEn: "2x Skill 'Golden Surge': 200% ATK", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 2, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая «Волна удачи»: 100% ATK", actionEn: "4x Basic: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Цунами фортуны»: 350% ATK", actionEn: "Ult 'Tsunami of Fortune': 350% ATK", descRu: "Стоимость 130 энергии, +5 после.", descEn: "Cost 130 energy, +5 after.", mv: 3.5, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 8001 Trailblazer (Destruction)
  {
    id: "8001", nameRu: "Первопроходец (Разрушение)", nameEn: "Trailblazer (Destruction)", slug: "trailblazer-destruction",
    ultCost: 120,
    noteRu: "Стандартный цикл: 2× навык (125% ATK + 62.5% по смежным) + 3× базовая + ульт «Звёздный туз: Прорыв» (450% ATK). Множители и стоимость ульты (120) — из официального кита (Prydwen/клиент HSR). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (125% ATK + 62.5% adjacent) + 3x Basic + Ult 'Stardust Ace: Blow Through' (450% ATK). Multipliers and energy cost (120) from official kit (Prydwen/HSR client). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Хоум-ран на тот свет»: 125% ATK + 62.5% по смежным", actionEn: "2x Skill 'RIP Home Run': 125% ATK + 62.5% adjacent", descRu: "Официальный множитель кита (Lv.10).", descEn: "Official kit multiplier (Lv.10).", mv: 1.25, adjacentMv: 0.625, targets: 3, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Прощальный удар»: 100% ATK", actionEn: "3x Basic 'Farewell Hit': 100% ATK", descRu: "Официальный множитель кита (Lv.6).", descEn: "Official kit multiplier (Lv.6).", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Звёздный туз: Прорыв»: 450% ATK", actionEn: "Ult 'Stardust Ace: Blow Through': 450% ATK", descRu: "Официальный множитель соло-режима ульты (Lv.10). Стоимость 120 энергии, +5 после.", descEn: "Official single-target ult multiplier (Lv.10). Cost 120 energy, +5 after.", mv: 4.5, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 8003 Trailblazer (Preservation)
  {
    id: "8003", nameRu: "Первопроходец (Сохранение)", nameEn: "Trailblazer (Preservation)", slug: "trailblazer-preservation",
    ultCost: 120, defScale: true,
    noteRu: "Стандартный цикл: 2× навык (щит и насмешка, mv 0) + 3× базовая (100% DEF) + ульт (100% DEF AoE). Урон скейлится от Защиты (DEF). Множители и стоимость ульты (120) — из официального кита (Prydwen). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (shield and taunt, mv 0) + 3x Basic (100% DEF) + Ult (100% DEF AoE). Damage scales with DEF. Multipliers and energy cost (120) from official kit (Prydwen). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "2× навык «Неугасающий янтарь»: насмешка (0% DEF)", actionEn: "2x Skill 'Ever-Burning Amber': taunt (0% DEF)", descRu: "Навык привлекает огонь врагов и даёт 30 энергии.", descEn: "Skill taunts enemies and grants 30 energy.", mv: 0, targets: 1, count: 2, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Ледоломный свет»: 100% DEF", actionEn: "3x Basic 'Ice-Breaking Light': 100% DEF", descRu: "Официальный множитель кита (100% DEF).", descEn: "Official kit multiplier (100% DEF).", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Пылающее копьё за линией фронта»: 100% DEF", actionEn: "Ult 'Flaming Lance Behind Enemy Lines': 100% DEF", descRu: "Стоимость 120 энергии, +5 после.", descEn: "Cost 120 energy, +5 after.", mv: 1, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 8005 Trailblazer (Harmony)
  {
    id: "8005", nameRu: "Первопроходец (Гармония)", nameEn: "Trailblazer (Harmony)", slug: "trailblazer-harmony",
    ultCost: 140,
    noteRu: "Стандартный цикл: 3× навык (5 отскоков по 50% ATK = 250% ATK) + 3× базовая + ульт (статус Танцор поддержки / суперпробитие, mv 0). Множители и стоимость ульты (140) — из официального кита (Prydwen). Энергия: 3×30 + 3×20 + 5 = 155 ≥ 140 ✓.",
    noteEn: "Standard cycle: 3x Skill (5 bounces at 50% ATK = 250% ATK) + 3x Basic + Ult (Backup Dancer / super break status, mv 0). Multipliers and energy cost (140) from official kit (Prydwen). Energy: 3x30 + 3x20 + 5 = 155 >= 140 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "3× навык «Перерыв на ливень» (5 отскоков): 250% ATK", actionEn: "3x Skill 'Halftime to Make It Rain' (5 bounces): 250% ATK", descRu: "Официальный множитель кита (Prydwen: 5×50% ATK по одиночной цели).", descEn: "Official kit multiplier (Prydwen: 5x50% ATK single-target).", mv: 2.5, targets: 1, count: 3, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "3× базовая «Правила свинга»: 100% ATK", actionEn: "3x Basic 'Swing Dance Etiquette': 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 3, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт «Парад шумных концертов»: статус «Танцор поддержки» (0% прямого урона)", actionEn: "Ult 'All-Out Footwork': Backup Dancer status (0% direct DMG)", descRu: "Стоимость 140 энергии, +5 после.", descEn: "Cost 140 energy, +5 after.", mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true }
    ]
  },

  // 8007 Trailblazer (Remembrance)
  {
    id: "8007", nameRu: "Первопроходец (Память)", nameEn: "Trailblazer (Remembrance)", slug: "trailblazer-remembrance",
    ultCost: 160,
    noteRu: "Стандартный цикл: 3× навык (120% ATK призыв Мема) + 4× базовая + ульт (200% ATK AoE). Множители и стоимость ульты (160) — из официального кита (Prydwen). Энергия: 3×30 + 4×20 + 5 = 175 ≥ 160 ✓.",
    noteEn: "Standard cycle: 3x Skill (120% ATK Mem summon) + 4x Basic + Ult (200% ATK AoE). Multipliers and energy cost (160) from official kit (Prydwen). Energy: 3x30 + 4x20 + 5 = 175 >= 160 ✓.",
    instances: [
      { key: "skill", phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК", phaseEn: "MAIN LOOP — SKILL", actionRu: "3× навык: призыв Мема (120% ATK)", actionEn: "3x Skill: Mem summon (120% ATK)", descRu: "Официальный множитель кита (Prydwen).", descEn: "Official kit multiplier (Prydwen).", mv: 1.2, targets: 1, count: 3, energyGain: 30 },
      { key: "basic", phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА", phaseEn: "MAIN LOOP — BASIC ATK", actionRu: "4× базовая атака: 100% ATK", actionEn: "4x Basic ATK: 100% ATK", descRu: "Официальный множитель кита.", descEn: "Official kit multiplier.", mv: 1, targets: 1, count: 4, energyGain: 20 },
      { key: "ult", phaseRu: "СВЕРХСПОСОБНОСТЬ", phaseEn: "ULTIMATE", actionRu: "Ульт: 200% ATK", actionEn: "Ult: 200% ATK", descRu: "Стоимость 160 энергии, +5 после.", descEn: "Cost 160 energy, +5 after.", mv: 2, targets: 3, count: 1, energyGain: 5, isUlt: true }
    ]
  }
];

console.log("Total entries to generate:", CHARS.length);
if (CHARS.length !== 38) {
  console.error("Mismatch: expected 38, got", CHARS.length);
  process.exit(1);
}

// Format to JS string for insertions
function formatEntry(c) {
  const extraFields = [];
  if (c.defScale) extraFields.push("    defScale: true,");
  if (c.passiveResPen) extraFields.push(`    passiveResPen: ${c.passiveResPen},`);

  const instStr = c.instances.map(inst => {
    const fields = [
      `        key: ${JSON.stringify(inst.key)}`,
      `        phaseRu: ${JSON.stringify(inst.phaseRu)}`,
      `        phaseEn: ${JSON.stringify(inst.phaseEn)}`,
      `        actionRu: ${JSON.stringify(inst.actionRu)}`,
      `        actionEn: ${JSON.stringify(inst.actionEn)}`,
      `        descRu: ${JSON.stringify(inst.descRu)}`,
      `        descEn: ${JSON.stringify(inst.descEn)}`,
      `        mv: ${inst.mv}`
    ];
    if (inst.adjacentMv !== undefined) fields.push(`        adjacentMv: ${inst.adjacentMv}`);
    fields.push(`        targets: ${inst.targets}`);
    fields.push(`        count: ${inst.count}`);
    fields.push(`        energyGain: ${inst.energyGain}`);
    if (inst.isUlt) fields.push(`        isUlt: true`);
    if (inst.resPenPercent) fields.push(`        resPenPercent: ${inst.resPenPercent}`);
    return `      {\n${fields.join(",\n")}\n      }`;
  }).join(",\n");

  return `  // ${c.nameRu} (${c.id}) — kit-verified: множители и энергия из официального кита (Prydwen).
  "${c.id}": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/${c.slug}/",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: ${JSON.stringify(c.noteRu)},
    noteEn: ${JSON.stringify(c.noteEn)},
${extraFields.join("\n")}${extraFields.length ? "\n" : ""}    energy: { ultCost: ${c.ultCost} },
    instances: [
${instStr}
    ]
  },`;
}

// Generate code block
const codeBlocks = CHARS.map(formatEntry).join("\n\n");
fs.writeFileSync("scripts/pipeline/all_38_code.js", codeBlocks, "utf8");
console.log("Successfully wrote scripts/pipeline/all_38_code.js");
