import { resolveRelicSetInfo } from "./setDefinitions.js";
export const CDN_MIRRORS = [
  "https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/",
  "https://testingcf.jsdelivr.net/gh/Mar-7th/StarRailRes@master/",
  "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/"
];
export const CDN_BASE = CDN_MIRRORS[0];
export function iconUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${CDN_BASE}${path}`;
}
export function handleImageFallback(e, originalPath) {
  if (!e || !e.target || !originalPath) return;
  const currentSrc = e.target.src || "";
  const tryIndex = parseInt(e.target.dataset.tryIndex || "0", 10);
  if (tryIndex + 1 < CDN_MIRRORS.length) {
    const nextMirror = CDN_MIRRORS[tryIndex + 1];
    e.target.dataset.tryIndex = String(tryIndex + 1);
    e.target.src = `${nextMirror}${originalPath}`;
  }
}
export function getCharAvatarPath(char) {
  if (!char) return "";
  if (char.id) {
    return `icon/avatar/${char.id}.png`;
  }
  return char.icon || "";
}
export function getCharHeadIcon(char) {
  if (!char) return "";
  return iconUrl(getCharAvatarPath(char));
}

export const ELEMENT_ICONS = {
  physical: "icon/element/Physical.png",
  fire: "icon/element/Fire.png",
  ice: "icon/element/Ice.png",
  thunder: "icon/element/Thunder.png",
  lightning: "icon/element/Thunder.png",
  wind: "icon/element/Wind.png",
  quantum: "icon/element/Quantum.png",
  imaginary: "icon/element/Imaginary.png"
};

export const PATH_ICONS = {
  warrior: "icon/path/Warrior.png",
  destruction: "icon/path/Warrior.png",
  rogue: "icon/path/Rogue.png",
  hunt: "icon/path/Rogue.png",
  thehunt: "icon/path/Rogue.png",
  mage: "icon/path/Mage.png",
  erudition: "icon/path/Mage.png",
  shaman: "icon/path/Shaman.png",
  harmony: "icon/path/Harmony.png",
  warlock: "icon/path/Warlock.png",
  nihility: "icon/path/Nihility.png",
  knight: "icon/path/Knight.png",
  preservation: "icon/path/Knight.png",
  priest: "icon/path/Priest.png",
  abundance: "icon/path/Priest.png",
  memory: "icon/path/Memory.png",
  remembrance: "icon/path/Remembrance.png"
};

export function resolveElementIcon(elem) {
  if (!elem) return null;
  if (elem.icon) return elem.icon;
  const key = String(elem.id || elem.name || "").toLowerCase().replace(/[\s-]+/g, "");
  return ELEMENT_ICONS[key] || null;
}

export function resolvePathIcon(path) {
  if (!path) return null;
  if (path.icon) return path.icon;
  const key = String(path.id || path.name || "").toLowerCase().replace(/[\s-]+/g, "");
  return PATH_ICONS[key] || null;
}
export function detectCharacterBuildRole(char, stats, relics = [], lang = "ru") {
  if (!char) return null;
  const isRu = lang === "ru";
  const name = char.name || "";
  const lowerName = name.toLowerCase();
  const charId = String(char.id || "");
  const path = char.path?.id || "";
  const { hp = 0, atk = 0, def = 0, spd = 0, cr = 0, cd = 0, cv = 0, be = 0, ehr = 0, eres = 0, err = 0, heal = 0 } = stats || {};
  const resolvedSets = relics.map((r) => resolveRelicSetInfo(r, "ru"));
  const setNames = resolvedSets.map((s) => s?.name || "").join(" ").toLowerCase();
  const setIds = relics.map((r) => String(r.set_id || "")).concat(resolvedSets.map((s) => String(s?.def?.id || "")));
  const bodyRelic = relics.find((r) => r.type === 3 || r.pos === 3 || String(r.type).toUpperCase() === "BODY" || String(r.id).endsWith("3"));
  const bootsRelic = relics.find((r) => r.type === 4 || r.pos === 4 || String(r.type).toUpperCase() === "FOOT" || String(r.id).endsWith("4"));
  const sphereRelic = relics.find((r) => r.type === 5 || r.pos === 5 || String(r.type).toUpperCase() === "NECK" || String(r.type).toUpperCase() === "SPHERE" || String(r.id).endsWith("5"));
  const ropeRelic = relics.find((r) => r.type === 6 || r.pos === 6 || String(r.type).toUpperCase() === "OBJECT" || String(r.type).toUpperCase() === "ROPE" || String(r.id).endsWith("6"));
  const bodyStat = bodyRelic?.main_affix?.field || "";
  const bootsStat = bootsRelic?.main_affix?.field || "";
  const sphereStat = sphereRelic?.main_affix?.field || "";
  const ropeStat = ropeRelic?.main_affix?.field || "";
  const isCritBody = bodyStat === "crit_rate" || bodyStat === "crit_dmg";
  const isEhrBody = bodyStat === "effect_hit";
  const isErrRope = ropeStat === "sp_rate" || err >= 15;
  const hasSupportPlanar = setIds.some((id) => ["308", "317", "310", "302", "312"].includes(id)) || /вонвак|русалк|киль|флот|пенакони/i.test(setNames);
  const hasDpsPlanar = setIds.some((id) => ["306", "311", "309", "315", "314", "313"].includes(id)) || /салсотто|глатирамер|арена|дуран|идзумо|сигони/i.test(setNames);
  const isMortenax = charId === "1507" || lowerName.includes("мортенакс") || lowerName.includes("mortenax");
  if (isMortenax) {
    let supportScore = 0;
    let dpsScore = 0;
    if (hasSupportPlanar) supportScore += 35;
    if (isErrRope) supportScore += 30;
    if (setNames.includes("кузнец")) supportScore += 20;
    if (spd >= 145) supportScore += 20;
    else if (spd >= 134) supportScore += 10;
    if (hasDpsPlanar) dpsScore += 35;
    if (isCritBody) dpsScore += 25;
    if (sphereStat.includes("fire") || sphereStat.includes("dmg")) dpsScore += 20;
    if (cv >= 150) dpsScore += 20;
    if (dpsScore > supportScore && (hasDpsPlanar || isCritBody) && !isErrRope && !hasSupportPlanar) {
      return {
        type: "DPS",
        role: "DPS",
        icon: "dps",
        labelRu: "ОГНЕННЫЙ ГИПЕРКЕРРИ (ДПС)",
        labelEn: "FIRE HYPERCARRY DPS",
        descRu: "Сборка под личный урон: упор на Крит. массу (+100 CV в Зоне) и максимальное HP для взрывных атак под баффами гармонии.",
        descEn: "Personal hypercarry build: prioritizing Crit Value (+100 CV inside Zone) and Max HP for massive offensive scaling.",
        confidence: Math.min(99, Math.max(80, Math.round(dpsScore))),
        targetArchetype: "HP_CRIT_DPS"
      };
    }
    if (supportScore >= 40 && dpsScore >= 40) {
      return {
        type: "HYBRID",
        role: "HYBRID",
        icon: "hybrid",
        labelRu: "ГИБРИД (ДЕБАФФЕР + САБ-ДПС)",
        labelEn: "HYBRID DEBUFFER & SUB-DPS",
        descRu: "Сбалансированная гибридная сборка: быстрый перезапуск Зоны (таймер 70 SPD) и бафф отряда через Кузнеца/Вонвак в связке с личными критами.",
        descEn: "Balanced hybrid build: fast Zone timer cycle (70 SPD) and team buffs via Master Smith/Vonwacq paired with personal crit damage.",
        confidence: Math.min(98, Math.round(50 + (supportScore + dpsScore) / 2.5)),
        targetArchetype: "MORTENAX_HYBRID"
      };
    }
    return {
      type: "SUPPORT",
      role: "SUPPORT",
      icon: "support",
      labelRu: "САППОРТ-ДЕБАФФЕР (ТАЙМЕР ЗОНЫ / БАФФ ОТРЯДА)",
      labelEn: "ZONE DEBUFFER & TEAM SUPPORT",
      descRu: "Персонаж собран как саппорт: упор на скорость (для опережения таймера Зоны 70 SPD), ВЭ и баффы отряда («Поддержание огня» +15% урона союзникам от 4-pc Кузнеца).",
      descEn: "Built as Team Support Debuffer: prioritized Speed (lapping 70 SPD zone countdown), ERR, and team buffs (Master Smith 4-pc Kindle Flame).",
      confidence: Math.min(99, Math.max(82, Math.round(supportScore))),
      targetArchetype: "MORTENAX_SUPPORT"
    };
  }
  const isWelt = charId === "1004" || lowerName.includes("вельт") || lowerName.includes("welt");
  if (isWelt) {
    let supportScore = 0;
    let dpsScore = 0;
    if (isEhrBody) supportScore += 35;
    if (ehr >= 50) supportScore += 25;
    if (isErrRope) supportScore += 25;
    if (hasSupportPlanar || setNames.includes("пангалакти")) supportScore += 20;
    if (spd >= 134) supportScore += 15;
    if (isCritBody) dpsScore += 35;
    if (sphereStat.includes("imaginary") || sphereStat.includes("dmg")) dpsScore += 25;
    if (cv >= 130) dpsScore += 25;
    if (hasDpsPlanar || setNames.includes("пустыни") || setNames.includes("первооткрыватель")) dpsScore += 25;
    if (supportScore > dpsScore || isEhrBody || ehr >= 60) {
      return {
        type: "SUPPORT",
        role: "SUPPORT",
        icon: "support",
        labelRu: "САППОРТ-ДЕБАФФЕР (КОНТРОЛЬ И ЗАМЕДЛЕНИЕ)",
        labelEn: "CROWD CONTROL & VULNERABILITY SUPPORT",
        descRu: "Сборка на контроль поля боя: высокий ШПЭ (67%+) для гарантированного Заключения и 100% аптайма уязвимости (+12% урона от ульты).",
        descEn: "Crowd control & debuff build: high EHR (67%+) to guarantee Imprisonment, Slow, and 100% Vulnerability uptime.",
        confidence: Math.min(99, Math.max(82, Math.round(supportScore))),
        targetArchetype: "NIHILITY_DEBUFF"
      };
    }
    return {
      type: "DPS",
      role: "DPS",
      icon: "dps",
      labelRu: "МНИМЫЙ ДПС / САБ-ДПС (КРИТЫ)",
      labelEn: "IMAGINARY CRIT DPS",
      descRu: "Сборка под личный урон: высокий КШ/КУ и мнимый урон для реализации высоких множителей навыка и ультимейта.",
      descEn: "Personal damage build: prioritized Crit Rate/DMG and Imaginary DMG to maximize skill and ultimate bounce multipliers.",
      confidence: Math.min(99, Math.max(80, Math.round(dpsScore))),
      targetArchetype: "CRIT_DPS"
    };
  }
  const isWolf = charId === "1006" || lowerName.includes("волк") || lowerName.includes("silver");
  const isSW999 = isWolf && (lowerName.includes("999") || lowerName.includes("ур") || lowerName.includes("lv"));
  if (isWolf) {
    if (isSW999) {
      if (cv >= 150 || isCritBody && sphereStat.includes("imaginary")) {
        return {
          type: "DPS",
          role: "DPS",
          icon: "dps",
          labelRu: "МНИМЫЙ САБ-ДПС (КРИТЫ)",
          labelEn: "IMAGINARY CRIT SUB-DPS",
          descRu: "Критовая сборка Серебряного Волка ур. 999: нанесение высокого личного мнимого урона в дополнение к наложению дебаффов.",
          descEn: "Silver Wolf Lv.999 Crit Sub-DPS build: outputs massive personal Imaginary damage alongside debuffs.",
          confidence: 90,
          targetArchetype: "CRIT_DPS"
        };
      }
      ;
    }
    if (cv >= 150 || isCritBody && sphereStat.includes("quantum")) {
      return {
        type: "DPS",
        role: "DPS",
        icon: "dps",
        labelRu: "КВАНТОВЫЙ САБ-ДПС (КРИТЫ)",
        labelEn: "QUANTUM CRIT SUB-DPS",
        descRu: "Критовая сборка (E2+ / Саб-ДПС): нанесение высокого личного квантового урона в дополнение к наложению дебаффов.",
        descEn: "Crit Sub-DPS build (E2+ optimized): outputs significant personal Quantum damage alongside debuffs.",
        confidence: 90,
        targetArchetype: "CRIT_DPS"
      };
    }
    return {
      type: "SUPPORT",
      role: "SUPPORT",
      icon: "support",
      labelRu: "КВАНТОВЫЙ ДЕБАФФЕР (САППОРТ)",
      labelEn: "QUANTUM DEBUFFER SUPPORT",
      descRu: "Классический саппорт: приоритет ШПЭ (96%+ / 67% с сигной) и высокой скорости (145-160+) для гарантированного внедрения уязвимостей.",
      descEn: "Classic debuffer support: prioritized EHR (96%+ / 67% with sig) and high SPD (145-160+) for 100% weakness implant.",
      confidence: 95,
      targetArchetype: "NIHILITY_DEBUFF"
    };
  }
  const isAven = charId === "1304" || lowerName.includes("авантюрин") || lowerName.includes("aventurine");
  if (isAven) {
    if (cv >= 120 || bodyStat === "crit_dmg" || hasDpsPlanar) {
      return {
        type: "HYBRID",
        role: "HYBRID",
        icon: "hybrid",
        labelRu: "ГИБРИДНЫЙ САБ-ДПС (КРИТЫ + ЩИТ)",
        labelEn: "HYBRID SUB-DPS (CRIT & SHIELD)",
        descRu: "Гибридная сборка: тело на Крит. Урон и бонус-атаки при сохранении базового порога 4000 защиты для пассивного бонуса +48% КШ.",
        descEn: "Hybrid build: Crit DMG body and offensive planar sets while maintaining 4000 DEF for the talent +48% CR bonus.",
        confidence: 92,
        targetArchetype: "PRESERVATION_DEF"
      };
    }
    return {
      type: "SUPPORT",
      role: "SUPPORT",
      icon: "support",
      labelRu: "ЩИТОВИК-СУСТЕЙН (МАКС. ЗАЩИТА)",
      labelEn: "PURE SHIELDER / SUSTAIN",
      descRu: "Классический сустейн: максимизация Защиты (4000+ DEF) для непробиваемого щита всей команды.",
      descEn: "Pure shielder: maximized DEF (4000+ DEF) for impenetrable teamwide shield uptime.",
      confidence: 96,
      targetArchetype: "PRESERVATION_DEF"
    };
  }
  const isJiaoqiu = charId === "1218" || lowerName.includes("цзяоцю") || lowerName.includes("jiaoqiu");
  if (isJiaoqiu) {
    if (sphereStat.includes("fire") && cv >= 110) {
      return {
        type: "DPS",
        role: "DPS",
        icon: "dps",
        labelRu: "ОГНЕННЫЙ DOT САБ-ДПС",
        labelEn: "FIRE DOT SUB-DPS",
        descRu: "Сборка с уклоном в личный периодический урон (Огненная сфера + АТК%).",
        descEn: "Sub-DPS build focused on personal Burn DoT damage scaling.",
        confidence: 88,
        targetArchetype: "DOT_DPS"
      };
    }
    return {
      type: "SUPPORT",
      role: "SUPPORT",
      icon: "support",
      labelRu: "ДЕБАФФЕР-САППОРТ (ГЕНЕРАТОР СТАКОВ)",
      labelEn: "ULTIMATE ENHANCER & STACK BUFFER",
      descRu: "Сборка под генерацию стаков (Ахерон/отряд): максимальная скорость (160+) и 140%+ ШПЭ для мгновенного наложения Посола.",
      descEn: "Built for stack generation and Ult vulnerability: maximum speed (160+) and 140%+ EHR.",
      confidence: 96,
      targetArchetype: "NIHILITY_DEBUFF"
    };
  }
  const isMarchHunt = (charId === "1224" || lowerName.includes("март")) && (path === "Rogue" || path === "Hunt");
  if (isMarchHunt) {
    if (be >= 100 || ropeStat === "break_dmg") {
      return {
        type: "SUPPORT",
        role: "SUPPORT",
        icon: "support",
        labelRu: "ПРОБИВНОЙ САППОРТ (СУПЕР-ПРОБИТИЕ)",
        labelEn: "SUPER BREAK SPEED ENABLER",
        descRu: "Сборка в отряды пробития (Светлячок/Бутхилл): упор на Эффект Пробития и скорость.",
        descEn: "Built for Super Break teams: prioritized Break Effect and high Speed.",
        confidence: 90,
        targetArchetype: "BREAK_DPS"
      };
    }
    return {
      type: "DPS",
      role: "DPS",
      icon: "dps",
      labelRu: "КРИТОВЫЙ ДПС (БОНУС-АТАКИ)",
      labelEn: "FOLLOW-UP CRIT DPS",
      descRu: "Сборка в отряды бонус-атак (Фэйсяо/Рацио): упор на КШ, КУ и Силу атаки.",
      descEn: "Built for follow-up attack teams (Feixiao/Ratio): prioritized CR, CD, and ATK.",
      confidence: 92,
      targetArchetype: "CRIT_DPS"
    };
  }
  if (path === "Priest" || path === "Abundance") {
    return {
      type: "SUPPORT",
      role: "SUPPORT",
      icon: "heal",
      labelRu: "ЦЕЛИТЕЛЬ-СУСТЕЙН (ИЗОБИЛИЕ)",
      labelEn: "HEALER / SUSTAIN (ABUNDANCE)",
      descRu: "Сборка на эффективное лечение, снятие ослаблений и выживание команды.",
      descEn: "Built for team healing, cleanse, and survival.",
      confidence: 98,
      targetArchetype: heal > 0 ? be > 100 ? "ABUNDANCE_BREAK" : "ABUNDANCE_HP" : "ABUNDANCE_HP"
    };
  }
  if (path === "Knight" || path === "Preservation") {
    return {
      type: "SUPPORT",
      role: "SUPPORT",
      icon: "support",
      labelRu: "ЩИТОВИК-СУСТЕЙН (СОХРАНЕНИЕ)",
      labelEn: "SHIELDER / SUSTAIN (PRESERVATION)",
      descRu: "Сборка на прочность щитов и командное снижение урона.",
      descEn: "Built for maximum team shielding and damage reduction.",
      confidence: 98,
      targetArchetype: def > hp ? "PRESERVATION_DEF" : "PRESERVATION_HP"
    };
  }
  if (path === "Shaman" || path === "Harmony") {
    return {
      type: "SUPPORT",
      role: "SUPPORT",
      icon: "buffer",
      labelRu: "БАФФЕР-САППОРТ (ГАРМОНИЯ)",
      labelEn: "BUFFER / ENABLER (HARMONY)",
      descRu: "Сборка на усиление урона, продвижение ходов и генерацию очков действий команды.",
      descEn: "Built for amplifying team damage, action advance, and buff uptime.",
      confidence: 98,
      targetArchetype: lowerName.includes("яо") ? "HARMONY_SPD" : lowerName.includes("жуань") ? "HARMONY_BREAK" : cd >= 150 ? "HARMONY_CRIT" : "HARMONY_ATK"
    };
  }
  return {
    type: "DPS",
    role: "DPS",
    icon: "dps",
    labelRu: "БОЕВОЙ ДПС (УРОН ОТРЯДА)",
    labelEn: "MAIN DPS (DAMAGE DEALER)",
    descRu: "Сборка на нанесение максимального урона.",
    descEn: "Built for maximizing offensive damage output.",
    confidence: 95,
    targetArchetype: be >= 180 ? "BREAK_DPS" : cr < 40 && ehr > 40 ? "DOT_DPS" : hp > 5500 ? "HP_CRIT_DPS" : "CRIT_DPS"
  };
}
export function evaluateRelicMainStat(relic, archetype, char) {
  if (!relic || !relic.main_affix) {
    return { status: "optimal", scoreBonus: 0, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
  }
  const slotType = Number(relic.type);
  const field = relic.main_affix.field || "";
  const charLowerName = (char?.name || "").toLowerCase();
  const isSW999Char = (charLowerName.includes("волк") || charLowerName.includes("silver")) && (charLowerName.includes("999") || charLowerName.includes("ур") || charLowerName.includes("lv"));
  let charElemId = (char?.element?.id || "").toLowerCase();
  if (isSW999Char) {
    charElemId = "imaginary";
  }
  const charElemField = charElemId ? `${charElemId}_dmg` : "";
  if (slotType === 1 || slotType === 2) {
    return {
      status: "optimal",
      scoreBonus: 2,
      labelRu: "ВЕРНЫЙ СТАТ",
      labelEn: "OPTIMAL"
    };
  }
  if (slotType === 3) {
    switch (archetype) {
      case "CRIT_DPS":
        if (field === "crit_rate" || field === "crit_dmg") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (КРИТЫ)", labelEn: "OPTIMAL (CRIT)" };
        }
        if (field === "atk") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ (АТК%)", labelEn: "VIABLE (ATK%)", recommendedRu: "Крит. Шанс / Крит. Урон", recommendedEn: "CRIT Rate / CRIT DMG" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Крит. Шанс или Крит. Урон",
          recommendedEn: "CRIT Rate or CRIT DMG"
        };
      case "HP_CRIT_DPS":
        if (field === "crit_rate" || field === "crit_dmg") {
          return { status: "optimal", scoreBonus: 3.5, labelRu: "ВЕРНЫЙ СТАТ (КРИТЫ)", labelEn: "OPTIMAL (CRIT)" };
        }
        if (field === "hp") {
          return { status: "optimal", scoreBonus: 2.5, labelRu: "ВЕРНЫЙ СТАТ (HP%)", labelEn: "OPTIMAL (HP%)" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Крит. Шанс, Крит. Урон или HP%",
          recommendedEn: "CRIT Rate, CRIT DMG or HP%"
        };
      case "MORTENAX_SUPPORT":
        if (field === "hp" || field === "crit_rate" || field === "crit_dmg") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        if (field === "def" || field === "effect_hit") {
          return { status: "viable", scoreBonus: 1, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "HP%, Крит. Шанс или Крит. Урон",
          recommendedEn: "HP%, CRIT Rate or CRIT DMG"
        };
      case "MORTENAX_HYBRID":
        if (field === "crit_rate" || field === "crit_dmg" || field === "hp") {
          return { status: "optimal", scoreBonus: 3.5, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Крит. Шанс, Крит. Урон или HP%",
          recommendedEn: "CRIT Rate, CRIT DMG or HP%"
        };
      case "BREAK_DPS":
        if (field === "atk" || field === "hp" || field === "def" || field === "crit_rate" || field === "crit_dmg") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Сила атаки% или HP%",
          recommendedEn: "ATK% or HP%"
        };
      case "DOT_DPS":
        if (field === "atk" || field === "effect_hit") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        if (field === "hp" || field === "def") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE", recommendedRu: "АТК% или ШПЭ", recommendedEn: "ATK% or EHR" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Сила атаки% или Шанс попадания эффектов",
          recommendedEn: "ATK% or Effect Hit Rate"
        };
      case "HARMONY_CRIT":
        if (field === "crit_dmg") {
          return { status: "optimal", scoreBonus: 4, labelRu: "ВЕРНЫЙ СТАТ (КУ)", labelEn: "OPTIMAL (CD)" };
        }
        if (field === "hp" || field === "def") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ (ВЫЖИВАЕМОСТЬ)", labelEn: "VIABLE (SURVIVAL)", recommendedRu: "Крит. Урон", recommendedEn: "CRIT DMG" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Крит. Урон (бафф союзников масштабируется от КУ)",
          recommendedEn: "CRIT DMG (buff scales off character CD)"
        };
      case "HARMONY_ATK":
        if (field === "atk") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (АТК%)", labelEn: "OPTIMAL (ATK%)" };
        }
        if (field === "hp" || field === "def") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE", recommendedRu: "Сила атаки%", recommendedEn: "ATK%" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Сила атаки%",
          recommendedEn: "ATK%"
        };
      case "HARMONY_BREAK":
        if (field === "hp" || field === "def") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        if (field === "atk") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "HP% или Защита%",
          recommendedEn: "HP% or DEF%"
        };
      case "PRESERVATION_DEF":
        if (field === "def" || field === "crit_dmg") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        if (field === "crit_rate" || field === "hp") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Защита% (или Крит. Урон для Авантюрина)",
          recommendedEn: "DEF% (or CRIT DMG for Aventurine)"
        };
      case "PRESERVATION_HP":
        if (field === "hp" || field === "def") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "HP% или Защита%",
          recommendedEn: "HP% or DEF%"
        };
      case "ABUNDANCE_HP":
      case "ABUNDANCE_BREAK":
        if (field === "heal_rate" || field === "hp") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (ИСЦЕЛЕНИЕ)", labelEn: "OPTIMAL (HEAL)" };
        }
        if (field === "def" || archetype === "ABUNDANCE_BREAK" && field === "atk") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Исходящее исцеление или HP%",
          recommendedEn: "Outgoing Healing Boost or HP%"
        };
      case "ABUNDANCE_ATK":
        if (field === "heal_rate" || field === "atk") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
        }
        if (field === "hp") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Исходящее исцеление или Сила атаки%",
          recommendedEn: "Outgoing Healing or ATK%"
        };
      case "NIHILITY_DEBUFF":
        if (field === "effect_hit" || field === "crit_rate" || field === "crit_dmg") {
          return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (ШПЭ)", labelEn: "OPTIMAL (EHR)" };
        }
        if (field === "hp" || field === "def" || field === "atk") {
          return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
        }
        return {
          status: "wrong",
          scoreBonus: -18,
          labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
          labelEn: "WRONG MAIN STAT",
          recommendedRu: "Шанс попадания эффектов (ШПЭ)",
          recommendedEn: "Effect Hit Rate"
        };
      default:
        return { status: "optimal", scoreBonus: 0, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
    }
  }
  if (slotType === 4) {
    if (field === "spd") {
      return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (СКОР)", labelEn: "OPTIMAL (SPD)" };
    }
    if (archetype === "CRIT_DPS" || archetype === "BREAK_DPS" || archetype === "DOT_DPS") {
      if (field === "atk") {
        return { status: "optimal", scoreBonus: 2, labelRu: "ВЕРНЫЙ СТАТ (АТК%)", labelEn: "OPTIMAL (ATK%)" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Скорость или Сила атаки%",
        recommendedEn: "Speed or ATK%"
      };
    }
    if (archetype === "HP_CRIT_DPS" || archetype === "MORTENAX_SUPPORT" || archetype === "MORTENAX_HYBRID") {
      if (field === "hp") {
        return { status: "optimal", scoreBonus: 2, labelRu: "ВЕРНЫЙ СТАТ (HP%)", labelEn: "OPTIMAL (HP%)" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Скорость или HP%",
        recommendedEn: "Speed or HP%"
      };
    }
    if (archetype === "HARMONY_ATK") {
      if (field === "atk") {
        return { status: "optimal", scoreBonus: 2, labelRu: "ВЕРНЫЙ СТАТ (АТК%)", labelEn: "OPTIMAL (ATK%)" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Скорость или Сила атаки%",
        recommendedEn: "Speed or ATK%"
      };
    }
    if (archetype === "PRESERVATION_DEF") {
      if (field === "def") {
        return { status: "optimal", scoreBonus: 2, labelRu: "ВЕРНЫЙ СТАТ (ЗАЩ%)", labelEn: "OPTIMAL (DEF%)" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Скорость или Защита%",
        recommendedEn: "Speed or DEF%"
      };
    }
    if (archetype === "PRESERVATION_HP" || archetype === "ABUNDANCE_HP") {
      if (field === "hp") {
        return { status: "optimal", scoreBonus: 2, labelRu: "ВЕРНЫЙ СТАТ (HP%)", labelEn: "OPTIMAL (HP%)" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Скорость или HP%",
        recommendedEn: "Speed or HP%"
      };
    }
    if (field === "hp" || field === "def") {
      return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE", recommendedRu: "Скорость", recommendedEn: "Speed" };
    }
    return {
      status: "wrong",
      scoreBonus: -18,
      labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
      labelEn: "WRONG MAIN STAT",
      recommendedRu: "Скорость",
      recommendedEn: "Speed"
    };
  }
  if (slotType === 5) {
    const isMatchingElement = charElemField && field === charElemField;
    const isOtherElement = field.endsWith("_dmg") && !isMatchingElement;
    if (isOtherElement) {
      return {
        status: "wrong",
        scoreBonus: -20,
        labelRu: "ЧУЖАЯ СТИХИЯ",
        labelEn: "WRONG ELEMENT",
        recommendedRu: "Бонус стихийного урона персонажа или АТК%",
        recommendedEn: "Matching Element DMG or ATK%"
      };
    }
    if (archetype === "CRIT_DPS" || archetype === "BREAK_DPS" || archetype === "DOT_DPS") {
      if (isMatchingElement) {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (СТИХИЯ)", labelEn: "OPTIMAL (ELEM)" };
      }
      if (field === "atk") {
        return { status: "optimal", scoreBonus: 2, labelRu: "ВЕРНЫЙ СТАТ (АТК%)", labelEn: "OPTIMAL (ATK%)" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Бонус урона стихии или Сила атаки%",
        recommendedEn: "Elemental DMG Boost or ATK%"
      };
    }
    if (archetype === "HP_CRIT_DPS" || archetype === "MORTENAX_SUPPORT" || archetype === "MORTENAX_HYBRID") {
      if (isMatchingElement || field === "hp") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Бонус стихийного урона или HP%",
        recommendedEn: "Elemental DMG or HP%"
      };
    }
    if (archetype === "HARMONY_ATK") {
      if (isMatchingElement || field === "atk") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
      }
      if (field === "hp" || field === "def") {
        return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Сила атаки% или HP%/ЗАЩ%",
        recommendedEn: "ATK% or HP%/DEF%"
      };
    }
    if (archetype === "PRESERVATION_DEF") {
      if (field === "def" || isMatchingElement) {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (ЗАЩ%)", labelEn: "OPTIMAL (DEF%)" };
      }
      if (field === "hp") {
        return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Защита%",
        recommendedEn: "DEF%"
      };
    }
    if (archetype === "PRESERVATION_HP" || archetype === "ABUNDANCE_HP") {
      if (field === "hp") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (HP%)", labelEn: "OPTIMAL (HP%)" };
      }
      if (field === "def") {
        return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "HP%",
        recommendedEn: "HP%"
      };
    }
    if (archetype === "ABUNDANCE_ATK") {
      if (field === "atk") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (АТК%)", labelEn: "OPTIMAL (ATK%)" };
      }
      if (field === "hp") {
        return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Сила атаки%",
        recommendedEn: "ATK%"
      };
    }
    if (field === "hp" || field === "def" || isMatchingElement) {
      return { status: "optimal", scoreBonus: 2, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
    }
    if (field === "atk") {
      return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
    }
    return {
      status: "wrong",
      scoreBonus: -18,
      labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
      labelEn: "WRONG MAIN STAT",
      recommendedRu: "HP% или Защита%",
      recommendedEn: "HP% or DEF%"
    };
  }
  if (slotType === 6) {
    if (archetype.startsWith("HARMONY") || archetype.startsWith("ABUNDANCE") || archetype === "NIHILITY_DEBUFF") {
      if (field === "sp_rate") {
        return { status: "optimal", scoreBonus: 4, labelRu: "ВЕРНЫЙ СТАТ (ВЭ)", labelEn: "OPTIMAL (ERR)" };
      }
      if (archetype === "HARMONY_BREAK" && field === "break_dmg") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (ЭП)", labelEn: "OPTIMAL (BE)" };
      }
      if (archetype === "ABUNDANCE_BREAK" && field === "break_dmg") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (ЭП)", labelEn: "OPTIMAL (BE)" };
      }
      if (archetype === "ABUNDANCE_ATK" && field === "atk") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (АТК%)", labelEn: "OPTIMAL (ATK%)" };
      }
      if (archetype === "ABUNDANCE_HP" && field === "hp") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (HP%)", labelEn: "OPTIMAL (HP%)" };
      }
      if (field === "hp" || field === "def" || field === "atk") {
        return {
          status: "viable",
          scoreBonus: 0,
          labelRu: "ДОПУСТИМЫЙ",
          labelEn: "VIABLE",
          recommendedRu: "Восстановление энергии (ВЭ)",
          recommendedEn: "Energy Regeneration Rate (ERR)"
        };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Восстановление энергии (ВЭ)",
        recommendedEn: "Energy Regeneration Rate (ERR)"
      };
    }
    if (archetype === "PRESERVATION_DEF") {
      if (field === "def" || field === "sp_rate") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
      }
      if (field === "hp") {
        return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Защита% или ВЭ",
        recommendedEn: "DEF% or ERR"
      };
    }
    if (archetype === "PRESERVATION_HP") {
      if (field === "hp" || field === "sp_rate") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
      }
      if (field === "def") {
        return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ", labelEn: "VIABLE" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "HP% или ВЭ",
        recommendedEn: "HP% or ERR"
      };
    }
    if (archetype === "BREAK_DPS") {
      if (field === "break_dmg") {
        return { status: "optimal", scoreBonus: 4, labelRu: "ВЕРНЫЙ СТАТ (ЭП)", labelEn: "OPTIMAL (BE)" };
      }
      if (field === "atk") {
        return { status: "viable", scoreBonus: 1, labelRu: "ДОПУСТИМЫЙ (АТК%)", labelEn: "VIABLE (ATK%)", recommendedRu: "Эффект пробития (ЭП)", recommendedEn: "Break Effect (BE)" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Эффект пробития (ЭП)",
        recommendedEn: "Break Effect (BE)"
      };
    }
    if (archetype === "HP_CRIT_DPS" || archetype === "MORTENAX_SUPPORT" || archetype === "MORTENAX_HYBRID") {
      if (field === "hp" || field === "sp_rate") {
        return { status: "optimal", scoreBonus: 3.5, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "HP% или ВЭ",
        recommendedEn: "HP% or ERR"
      };
    }
    if (archetype === "DOT_DPS") {
      if (field === "atk" || field === "sp_rate") {
        return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
      }
      return {
        status: "wrong",
        scoreBonus: -18,
        labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
        labelEn: "WRONG MAIN STAT",
        recommendedRu: "Сила атаки% или ВЭ",
        recommendedEn: "ATK% or ERR"
      };
    }
    if (field === "atk") {
      return { status: "optimal", scoreBonus: 3, labelRu: "ВЕРНЫЙ СТАТ (АТК%)", labelEn: "OPTIMAL (ATK%)" };
    }
    if (field === "sp_rate") {
      return { status: "viable", scoreBonus: 1, labelRu: "ДОПУСТИМЫЙ (ВЭ)", labelEn: "VIABLE (ERR)" };
    }
    if (field === "break_dmg") {
      return { status: "viable", scoreBonus: 0, labelRu: "ДОПУСТИМЫЙ (ЭП)", labelEn: "VIABLE (BE)" };
    }
    return {
      status: "wrong",
      scoreBonus: -18,
      labelRu: "НЕПОДХОДЯЩИЙ СТАТ",
      labelEn: "WRONG MAIN STAT",
      recommendedRu: "Сила атаки%",
      recommendedEn: "ATK%"
    };
  }
  return { status: "optimal", scoreBonus: 0, labelRu: "ВЕРНЫЙ СТАТ", labelEn: "OPTIMAL" };
}
function erf(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}
function zScoreToTopPercent(z) {
  const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
  const top = (1 - cdf) * 100;
  return Math.min(99, Math.max(0.2, top));
}
export function determineCharacterMetrics(char, archetype, stats) {
  const { hp, atk, def, spd, cr, cd, cv, be, ehr, eres, heal, err } = stats;
  const name = char?.name || "";
  const lowerName = name.toLowerCase();
  const charId = String(char?.id || "");
  const isWolf = charId === "1006" || lowerName.includes("волк") || lowerName.includes("silver");
  const isSW999 = isWolf && (lowerName.includes("999") || lowerName.includes("ур") || lowerName.includes("lv"));
  if (isSW999 || isWolf && cv >= 140) {
    const spdStatus = spd >= 160 ? "[160+ CAP]" : spd >= 145 ? "[145+ OK]" : spd >= 134 ? "[134+ OK]" : "[SLOW]";
    const cvStatus = cv >= 240 ? "[ELITE]" : cv >= 200 ? "[TOP]" : cv >= 160 ? "[OK]" : "[LOW]";
    return {
      primary: {
        labelRu: "СКОРОСТЬ (SPD)",
        labelEn: "SPEED (SPD)",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: "КРИТ. МАССА (CV)",
        labelEn: "CRIT VALUE (CV)",
        display: `${cv.toFixed(1)} CV`,
        percent: Math.min(100, Math.max(10, cv / 260 * 100)),
        status: cvStatus
      }
    };
  }
  const isMortenax = charId === "1507" || lowerName.includes("мортенакс") || lowerName.includes("mortenax");
  if (isMortenax) {
    if (archetype === "MORTENAX_SUPPORT") {
      const spdStatus2 = spd >= 160 ? "[160+ HYPER]" : spd >= 145 ? "[145+ ZONE TUNED]" : spd >= 134 ? "[134+ OK]" : "[SLOW]";
      const hpStatus = hp >= 7e3 ? "[7000+ TANK]" : hp >= 6e3 ? "[6000+ OK]" : "[LOW]";
      return {
        primary: {
          labelRu: "СКОРОСТЬ (ТАЙМЕР ЗОНЫ 70 SPD)",
          labelEn: "SPEED (70 SPD ZONE TIMER)",
          display: `${spd.toFixed(1)} SPD`,
          percent: Math.min(100, spd / 160 * 100),
          status: spdStatus2
        },
        secondary: {
          labelRu: "ВЭ И ВЫЖИВАЕМОСТЬ (ВЭ + HP)",
          labelEn: "ERR & TEAM SURVIVAL",
          display: `${err > 0 ? (100 + err).toFixed(1) + "% ВЭ / " : ""}${hp} HP`,
          percent: Math.min(100, Math.max(10, hp / 7500 * 100)),
          status: hpStatus
        }
      };
    }
    const spdStatus = spd >= 160 ? "[160+ HYPER]" : spd >= 145 ? "[145+ ZONE TUNED]" : spd >= 134 ? "[134+ OK]" : "[SLOW]";
    const cvStatus = cv >= 240 ? "[ELITE]" : cv >= 200 ? "[TOP]" : cv >= 150 ? "[OK]" : "[LOW]";
    return {
      primary: {
        labelRu: "СКОРОСТЬ (ТАЙМЕР ЗОНЫ 70 SPD)",
        labelEn: "SPEED (70 SPD ZONE TIMER)",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: "КРИТ. МАССА (+100 CV В ЗОНЕ)",
        labelEn: "CRIT VALUE (+100 CV IN ZONE)",
        display: `${cv.toFixed(1)} CV`,
        percent: Math.min(100, Math.max(10, cv / 260 * 100)),
        status: cvStatus
      }
    };
  }
  if (archetype === "NIHILITY_DEBUFF" || isWolf) {
    const isJiaoqiu = lowerName.includes("цзяоцю") || lowerName.includes("jiaoqiu");
    const isWelt = charId === "1004" || lowerName.includes("вельт") || lowerName.includes("welt");
    const targetEhr = isJiaoqiu ? 140 : isWolf ? 96 : isWelt ? 67 : 67;
    const spdStatus = spd >= 160 ? "[160+ CAP]" : spd >= 145 ? "[145+ OK]" : spd >= 134 ? "[134+ OK]" : "[SLOW]";
    const ehrStatus = ehr >= targetEhr ? `[${targetEhr}% CAP]` : `[${ehr.toFixed(0)}% / ${targetEhr}%]`;
    return {
      primary: {
        labelRu: "СКОРОСТЬ (SPD)",
        labelEn: "SPEED (SPD)",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: "ШАНС ПОПАДАНИЯ ЭФФЕКТОВ",
        labelEn: "EFFECT HIT RATE (EHR)",
        display: `${ehr.toFixed(1)}% EHR`,
        percent: Math.min(100, ehr / targetEhr * 100),
        status: ehrStatus
      }
    };
  }
  const isYaoGuang = lowerName.includes("яо") || lowerName.includes("yao") || lowerName.includes("гуан") || lowerName.includes("guang") || lowerName.includes("爻光");
  if (archetype === "HARMONY_SPD" || isYaoGuang) {
    const spdStatus = spd >= 160 ? "[160+ CAP]" : spd >= 145 ? "[145+ OK]" : spd >= 134 ? "[134+ OK]" : "[SLOW]";
    const crStatus = cr >= 70 ? "[70%+ ELITE]" : cr >= 50 ? "[50%+ TARGET]" : "[<50% LOW]";
    return {
      primary: {
        labelRu: "СКОРОСТЬ (SPD)",
        labelEn: "SPEED (SPD)",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: isYaoGuang ? "КРИТ. ШАНС (ПАССИВКА 160+ СКОР)" : "ВОССТАНОВЛЕНИЕ ЭНЕРГИИ",
        labelEn: isYaoGuang ? "CRIT RATE (160+ SPD PASSIVE)" : "ENERGY REGENERATION (ERR)",
        display: isYaoGuang ? `${cr.toFixed(1)}% CR` : err > 0 ? `+${err.toFixed(1)}% ERR` : "100% (БАЗА)",
        percent: isYaoGuang ? Math.min(100, cr / 70 * 100) : Math.min(100, Math.max(20, err / 24.4 * 100)),
        status: isYaoGuang ? crStatus : err >= 19.4 ? "[ВЕРВЬ ВЭ]" : "[НУЖНА ВЭ]"
      }
    };
  }
  if (archetype === "HARMONY_CRIT") {
    const spdStatus = spd >= 160 ? "[160+ HYPER]" : spd >= 134 ? "[134+ TUNED]" : "[SLOW]";
    const cdStatus = cd >= 200 ? "[200%+ ELITE]" : cd >= 160 ? "[160%+ OK]" : "[LOW]";
    return {
      primary: {
        labelRu: "СКОРОСТЬ (SPD)",
        labelEn: "SPEED (SPD)",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: "КРИТ. УРОН (СКАЛЕЙЛЕР)",
        labelEn: "CRIT DMG (BUFF SCALE)",
        display: `${cd.toFixed(1)}% CD`,
        percent: Math.min(100, cd / 220 * 100),
        status: cdStatus
      }
    };
  }
  if (archetype === "BREAK_DPS") {
    const beStatus = be >= 360 ? "[360%+ ELITE]" : be >= 250 ? "[250%+ READY]" : "[LOW]";
    const spdStatus = spd >= 154 ? "[154+ OK]" : spd >= 145 ? "[145+ OK]" : "[SLOW]";
    return {
      primary: {
        labelRu: "ЭФФЕКТ ПРОБИТИЯ (BE)",
        labelEn: "BREAK EFFECT (BE)",
        display: `${be.toFixed(1)}% BE`,
        percent: Math.min(100, be / 360 * 100),
        status: beStatus
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spdStatus
      }
    };
  }
  if (archetype === "HARMONY_BREAK") {
    const beStatus = be >= 180 ? "[180% CAP]" : `[-${Math.max(0, Math.round(180 - be))}% ДО КАПА]`;
    const spdStatus = spd >= 145 ? "[145+ TALIA]" : spd >= 134 ? "[134+ OK]" : "[SLOW]";
    return {
      primary: {
        labelRu: "ЭФФЕКТ ПРОБИТИЯ (BE)",
        labelEn: "BREAK EFFECT (BE)",
        display: `${be.toFixed(1)}% BE`,
        percent: Math.min(100, be / 180 * 100),
        status: beStatus
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spdStatus
      }
    };
  }
  if (archetype === "HARMONY_ATK") {
    const isTingyun = lowerName.includes("тинъюнь") || lowerName.includes("tingyun");
    if (isTingyun) {
      return {
        primary: {
          labelRu: "СКОРОСТЬ (SPD)",
          labelEn: "SPEED (SPD)",
          display: `${spd.toFixed(1)} SPD`,
          percent: Math.min(100, spd / 160 * 100),
          status: spd >= 160 ? "[160+ CAP]" : spd >= 145 ? "[145+ OK]" : "[SLOW]"
        },
        secondary: {
          labelRu: "СИЛА АТАКИ (ATK)",
          labelEn: "ATTACK (ATK CAP)",
          display: `${Math.round(atk)} ATK`,
          percent: Math.min(100, atk / 2600 * 100),
          status: atk >= 2600 ? "[2600 CAP]" : `[-${Math.max(0, Math.round(2600 - atk))} ДО КАПА]`
        }
      };
    }
    return {
      primary: {
        labelRu: "СИЛА АТАКИ (ATK)",
        labelEn: "ATTACK POWER (ATK)",
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, atk / 4200 * 100),
        status: atk >= 4e3 ? "[4000+ CAP]" : atk >= 3500 ? "[3500+ OK]" : "[LOW]"
      },
      secondary: {
        labelRu: "ВОССТАНОВЛЕНИЕ ЭНЕРГИИ",
        labelEn: "ENERGY REGENERATION (ERR)",
        display: err > 0 ? `+${err.toFixed(1)}% ERR` : "100% (БАЗА)",
        percent: Math.min(100, Math.max(20, err / 24.4 * 100)),
        status: err >= 19.4 ? "[ВЕРВЬ ВЭ]" : "[НУЖНА ВЭ]"
      }
    };
  }
  if (archetype === "DOT_DPS") {
    const isBlackSwan = lowerName.includes("лебедь") || lowerName.includes("black swan");
    if (isBlackSwan) {
      return {
        primary: {
          labelRu: "ШАНС ПОПАДАНИЯ ЭФФЕКТОВ",
          labelEn: "EFFECT HIT RATE (EHR)",
          display: `${ehr.toFixed(1)}% EHR`,
          percent: Math.min(100, ehr / 120 * 100),
          status: ehr >= 120 ? "[120% CAP]" : `[-${Math.max(0, 120 - ehr).toFixed(1)}% ДО КАПА]`
        },
        secondary: {
          labelRu: "ПОРОГ СКОРОСТИ",
          labelEn: "SPEED BREAKPOINT",
          display: `${spd.toFixed(1)} SPD`,
          percent: Math.min(100, spd / 160 * 100),
          status: spd >= 134 ? "[134+ OK]" : "[SLOW]"
        }
      };
    }
    return {
      primary: {
        labelRu: "СИЛА АТАКИ (ATK)",
        labelEn: "ATTACK POWER (ATK)",
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, atk / 4e3 * 100),
        status: atk >= 3800 ? "[3800+ TOP]" : atk >= 3400 ? "[3400+ OK]" : "[LOW]"
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spd >= 146 ? "[146+ OK]" : spd >= 134 ? "[134+ OK]" : "[SLOW]"
      }
    };
  }
  if (archetype === "PRESERVATION_DEF") {
    return {
      primary: {
        labelRu: "ЗАЩИТА (DEF)",
        labelEn: "DEFENCE (DEF)",
        display: `${Math.round(def)} DEF`,
        percent: Math.min(100, def / 4e3 * 100),
        status: def >= 4e3 ? "[4000 CAP]" : `[-${Math.max(0, 4e3 - Math.round(def))} ДО КАПА]`
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spd >= 134 ? "[134+ OK]" : "[SLOW]"
      }
    };
  }
  if (archetype === "PRESERVATION_HP") {
    return {
      primary: {
        labelRu: "МАКС. HP",
        labelEn: "MAX HP",
        display: `${Math.round(hp)} HP`,
        percent: Math.min(100, hp / 8500 * 100),
        status: hp >= 7500 ? "[7500+ OK]" : "[LOW]"
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spd >= 134 ? "[134+ OK]" : "[SLOW]"
      }
    };
  }
  if (archetype === "ABUNDANCE_BREAK") {
    return {
      primary: {
        labelRu: "ЭФФЕКТ ПРОБИТИЯ (BE)",
        labelEn: "BREAK EFFECT (BE)",
        display: `${be.toFixed(1)}% BE`,
        percent: Math.min(100, be / 150 * 100),
        status: be >= 150 ? "[150% CAP]" : `[-${Math.max(0, Math.round(150 - be))}% ДО КАПА]`
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spd >= 145 ? "[145+ OK]" : spd >= 134 ? "[134+ OK]" : "[SLOW]"
      }
    };
  }
  if (archetype === "ABUNDANCE_ATK") {
    return {
      primary: {
        labelRu: "СИЛА АТАКИ (ATK)",
        labelEn: "ATTACK POWER (ATK)",
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, atk / 3e3 * 100),
        status: atk >= 2800 ? "[2800+ OK]" : "[LOW]"
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spd >= 134 ? "[134+ OK]" : "[SLOW]"
      }
    };
  }
  if (archetype === "ABUNDANCE_HP") {
    return {
      primary: {
        labelRu: "МАКС. HP",
        labelEn: "MAX HP",
        display: `${Math.round(hp)} HP`,
        percent: Math.min(100, hp / 7500 * 100),
        status: hp >= 6500 ? "[6500+ OK]" : "[LOW]"
      },
      secondary: {
        labelRu: "ПОРОГ СКОРОСТИ",
        labelEn: "SPEED BREAKPOINT",
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, spd / 160 * 100),
        status: spd >= 134 ? "[134+ OK]" : "[SLOW]"
      }
    };
  }
  if (archetype === "HP_CRIT_DPS") {
    const isCastorice = lowerName.includes("castorice") || lowerName.includes("касторице") || charId === "1407";
    const hpTarget = isCastorice ? 9500 : 7500;
    const hpMinOk = isCastorice ? 8500 : 7e3;
    return {
      primary: {
        labelRu: "КРИТ. МАССА (CV)",
        labelEn: "CRIT VALUE (CV)",
        display: `${cv.toFixed(1)} CV`,
        percent: Math.min(100, Math.max(10, cv / 260 * 100)),
        status: cv >= 230 ? "[ELITE]" : cv >= 180 ? "[TOP]" : "[LOW]"
      },
      secondary: {
        labelRu: "МАКС. HP (СКАЛЕЙЛЕР)",
        labelEn: "MAX HP (SCALING)",
        display: `${Math.round(hp)} HP`,
        percent: Math.min(100, hp / hpTarget * 100),
        status: hp >= hpMinOk ? "[OK]" : "[LOW]"
      }
    };
  }
  const isNoSpeedDps = lowerName.includes("ахерон") || lowerName.includes("acheron") || charId === "1308" || lowerName.includes("химеко") || lowerName.includes("himeko") || lowerName.includes("нова") || lowerName.includes("nova") || lowerName.includes("клара") || lowerName.includes("clara") || lowerName.includes("юньли") || lowerName.includes("yunli") || spd < 115;
  if (isNoSpeedDps) {
    const isAcheron = lowerName.includes("ахерон") || lowerName.includes("acheron") || charId === "1308";
    const isHimeko = lowerName.includes("химеко") || lowerName.includes("himeko") || lowerName.includes("нова") || lowerName.includes("nova");
    const atkTarget = isAcheron ? 3800 : isHimeko ? 3200 : 3400;
    const atkStatus = atk >= atkTarget ? `[${atkTarget}+ TOP]` : atk >= atkTarget - 400 ? "[OK]" : "[LOW]";
    const cvStatus = cv >= 240 ? "[ELITE]" : cv >= 200 ? "[TOP]" : cv >= 160 ? "[OK]" : "[LOW]";
    return {
      primary: {
        labelRu: "КРИТ. МАССА (CV)",
        labelEn: "CRIT VALUE (CV)",
        display: `${cv.toFixed(1)} CV`,
        percent: Math.min(100, Math.max(10, cv / 260 * 100)),
        status: cvStatus
      },
      secondary: {
        labelRu: "СИЛА АТАКИ (ATK)",
        labelEn: "ATTACK POWER (ATK)",
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, atk / atkTarget * 100),
        status: atkStatus
      }
    };
  }
  return {
    primary: {
      labelRu: "КРИТ. МАССА (CV)",
      labelEn: "CRIT VALUE (CV)",
      display: `${cv.toFixed(1)} CV`,
      percent: Math.min(100, Math.max(10, cv / 260 * 100)),
      status: cv >= 240 ? "[ELITE]" : cv >= 200 ? "[TOP]" : cv >= 160 ? "[OK]" : "[LOW]"
    },
    secondary: {
      labelRu: "ПОРОГ СКОРОСТИ",
      labelEn: "SPEED BREAKPOINT",
      display: `${spd.toFixed(1)} SPD`,
      percent: Math.min(100, spd / 160 * 100),
      status: spd >= 134 ? "[134+ OK]" : "[SLOW]"
    }
  };
}

export function getSubAffixWeight(field, archetype) {
  const f = field || "";
  switch (archetype) {
    case "PRESERVATION_DEF":
      if (f === "def") return 1;
      if (f === "crit_dmg" || f === "crit_rate" || f === "spd") return 0.9;
      if (f === "effect_res") return 0.75;
      if (f === "hp") return 0.35;
      return 0;
    case "PRESERVATION_HP":
      if (f === "hp") return 1;
      if (f === "def" || f === "spd") return 0.9;
      if (f === "effect_res") return 0.8;
      return 0;
    case "ABUNDANCE_ATK":
      if (f === "atk" || f === "spd") return 1;
      if (f === "effect_res") return 0.8;
      if (f === "hp" || f === "def") return 0.4;
      return 0;
    case "ABUNDANCE_HP":
      if (f === "hp" || f === "spd") return 1;
      if (f === "effect_res") return 0.8;
      if (f === "def") return 0.5;
      return 0;
    case "ABUNDANCE_BREAK":
      if (f === "break_dmg" || f === "spd") return 1;
      if (f === "effect_res") return 0.75;
      if (f === "hp" || f === "def" || f === "atk") return 0.4;
      return 0;
    case "HARMONY_CRIT":
      if (f === "crit_dmg" || f === "spd") return 1;
      if (f === "effect_res") return 0.75;
      if (f === "hp" || f === "def") return 0.45;
      return 0;
    case "HARMONY_SPD":
      if (f === "spd") return 1;
      if (f === "effect_res") return 0.85;
      if (f === "hp" || f === "def") return 0.5;
      return 0;
    case "HARMONY_ATK":
      if (f === "atk" || f === "spd") return 1;
      if (f === "effect_res") return 0.75;
      if (f === "hp" || f === "def") return 0.45;
      return 0;
    case "HARMONY_BREAK":
      if (f === "break_dmg" || f === "spd") return 1;
      if (f === "effect_res") return 0.75;
      if (f === "hp" || f === "def") return 0.45;
      return 0;
    case "BREAK_DPS":
      if (f === "break_dmg" || f === "spd") return 1;
      if (f === "atk") return 0.8;
      return 0;
    case "DOT_DPS":
      if (f === "atk" || f === "spd") return 1;
      if (f === "effect_hit") return 0.9;
      if (f === "break_dmg") return 0.4;
      return 0;
    case "HP_CRIT_DPS":
      if (f === "crit_rate" || f === "crit_dmg") return 1;
      if (f === "hp") return 0.95;
      if (f === "spd") return 0.85;
      return 0;
    case "MORTENAX_SUPPORT":
      if (f === "spd") return 1;
      if (f === "hp") return 0.95;
      if (f === "effect_res") return 0.8;
      if (f === "def") return 0.7;
      if (f === "crit_rate" || f === "crit_dmg") return 0.5;
      return 0;
    case "MORTENAX_HYBRID":
      if (f === "spd" || f === "crit_rate" || f === "crit_dmg") return 1;
      if (f === "hp") return 0.95;
      if (f === "effect_res") return 0.7;
      if (f === "def") return 0.5;
      return 0;
    case "NIHILITY_DEBUFF":
      if (f === "effect_hit" || f === "spd") return 1;
      if (f === "crit_rate" || f === "crit_dmg") return 0.8;
      if (f === "atk") return 0.5;
      if (f === "effect_res") return 0.5;
      return 0;
    default: // CRIT_DPS
      if (f === "crit_rate" || f === "crit_dmg") return 1;
      if (f === "atk" || f === "spd") return 0.85;
      if (f === "break_dmg") return 0.2;
      return 0;
  }
}

export function calculateCharacterAudit(char, lang = "ru") {
  if (!char) return null;
  if (Array.isArray(char.ornaments) && char.ornaments.length > 0) {
    const currentRelics = Array.isArray(char.relics) ? char.relics : [];
    const existingIds = new Set(currentRelics.map((r) => r.id || `${r.type}_${r.name}`));
    const merged = [...currentRelics];
    char.ornaments.forEach((orn) => {
      if (!existingIds.has(orn.id || `${orn.type}_${orn.name}`)) {
        merged.push(orn);
      }
    });
    char.relics = merged;
  }
  const isRu = lang === "ru";
  const name = char.name || "";
  const path = char.path?.id || "";
  const baseMap = {};
  (char.attributes || []).forEach((a) => {
    baseMap[a.field] = a;
  });
  const addMap = {};
  (char.additions || []).forEach((a) => {
    addMap[a.field] = a;
  });
  const getStat = (field) => (baseMap[field]?.value || 0) + (addMap[field]?.value || 0);
  const hp = Math.round(getStat("hp"));
  const atk = Math.round(getStat("atk"));
  const def = Math.round(getStat("def"));
  const spd = parseFloat(getStat("spd").toFixed(1));
  const cr = parseFloat((getStat("crit_rate") * 100).toFixed(1));
  const cd = parseFloat((getStat("crit_dmg") * 100).toFixed(1));
  const cv = parseFloat((cr * 2 + cd).toFixed(1));
  const be = parseFloat(((addMap["break_dmg"]?.value || 0) * 100).toFixed(1));
  const ehr = parseFloat(((addMap["effect_hit"]?.value || 0) * 100).toFixed(1));
  const eres = parseFloat(((addMap["effect_res"]?.value || 0) * 100).toFixed(1));
  const heal = parseFloat(((addMap["heal_rate"]?.value || 0) * 100).toFixed(1));
  const err = parseFloat(((addMap["sp_rate"]?.value || 0) * 100).toFixed(1));
  const dmgFields = ["fire_dmg", "physical_dmg", "quantum_dmg", "thunder_dmg", "wind_dmg", "ice_dmg", "imaginary_dmg", "all_dmg"];
  let dmg_boost = 0;
  dmgFields.forEach((f) => {
    if (addMap[f]?.value) {
      dmg_boost = Math.max(dmg_boost, parseFloat((addMap[f].value * 100).toFixed(1)));
    }
  });
  const ropeRelic = (char.relics || []).find((r) => {
    if (!r) return false;
    const num = Number(r.type ?? r.pos);
    if (num === 6) return true;
    const typeStr = String(r.type || r.type_name || "").toUpperCase();
    if (typeStr === "OBJECT" || typeStr === "ROPE" || typeStr.includes("ВЕРВ")) return true;
    const idStr = String(r.id || r.tid || "");
    return idStr.length === 5 && idStr.endsWith("6");
  });
  const ropeStat = ropeRelic?.main_affix?.field || "";
  const detectedRole = detectCharacterBuildRole(
    char,
    { hp, atk, def, spd, cr, cd, cv, be, ehr, eres, heal, err },
    char.relics || [],
    isRu ? "ru" : "en"
  );
  let archetype = detectedRole?.targetArchetype || "CRIT_DPS";
  const charId = String(char.id || "");
  const lowerName = name.toLowerCase();
  const isWolfChar = charId === "1006" || lowerName.includes("волк") || lowerName.includes("silver");
  const isWolf999 = isWolfChar && (lowerName.includes("999") || lowerName.includes("ур") || lowerName.includes("lv"));
  if (isWolf999 && (!char.element || char.element.id !== "Imaginary")) {
    char.element = {
      id: "Imaginary",
      name: isRu ? "Мнимый" : "Imaginary",
      color: "#F4D258",
      icon: "icon/element/Imaginary.png"
    };
  }
  if (!detectedRole || detectedRole.role === "DPS") {
    const isYaoGuang = lowerName.includes("яо") || lowerName.includes("yao") || lowerName.includes("гуан") || lowerName.includes("guang") || lowerName.includes("爻光");
    if ((charId === "1205" || lowerName.includes("блэйд") || lowerName.includes("blade")) && charId !== "1507") {
      archetype = "HP_CRIT_DPS";
    } else if (charId === "1407" || lowerName.includes("касторице") || lowerName.includes("castorice")) {
      archetype = "HP_CRIT_DPS";
    } else if (isWolf999 || isWolfChar && cv >= 150) {
      archetype = "CRIT_DPS";
    } else if (isYaoGuang) {
      archetype = "HARMONY_SPD";
    } else if (isWolfChar) {
      archetype = "NIHILITY_DEBUFF";
    } else if (charId === "1308" || lowerName.includes("ахерон") || lowerName.includes("acheron")) {
      archetype = "CRIT_DPS";
    } else if (charId === "1304" || lowerName.includes("авантюрин") || lowerName.includes("aventurine") || path === "Knight" && def > 2500) {
      archetype = "PRESERVATION_DEF";
    } else if (charId === "1208" || lowerName.includes("фу сюань") || lowerName.includes("fu xuan")) {
      archetype = "PRESERVATION_HP";
    } else if (charId === "1203" || lowerName.includes("лоча") || lowerName.includes("luocha")) {
      archetype = "ABUNDANCE_ATK";
    } else if (charId === "1313" || lowerName.includes("воскресенье") || lowerName.includes("sunday") || lowerName.includes("искорка") || lowerName.includes("sparkle") || lowerName.includes("броня") || lowerName.includes("bronya")) {
      archetype = "HARMONY_CRIT";
    } else if (charId === "1309" || lowerName.includes("зарянка") || lowerName.includes("robin") || lowerName.includes("тинъюнь") || lowerName.includes("tingyun")) {
      archetype = "HARMONY_ATK";
    } else if (charId === "1307" || lowerName.includes("жуань") || lowerName.includes("ruan mei")) {
      archetype = "HARMONY_BREAK";
    } else if (charId === "1310" || lowerName.includes("светлячок") || lowerName.includes("firefly") || lowerName.includes("бутхилл") || lowerName.includes("boothill") || lowerName.includes("раппа") || lowerName.includes("rappa") || be > 180) {
      archetype = "BREAK_DPS";
    } else if (charId === "1005" || lowerName.includes("кафка") || lowerName.includes("kafka") || lowerName.includes("лебедь") || lowerName.includes("black swan") || lowerName.includes("сампо") || lowerName.includes("sampo") || lowerName.includes("гуйнайфэнь") || lowerName.includes("guinaifen") || path === "Warlock" && cr < 40 && ehr > 40 && !lowerName.includes("blade") && charId !== "1205") {
      archetype = "DOT_DPS";
    } else if (path === "Warlock" && (lowerName.includes("пела") || lowerName.includes("pela") || lowerName.includes("волк") || lowerName.includes("silver") || lowerName.includes("цзяоцю") || lowerName.includes("jiaoqiu"))) {
      archetype = "NIHILITY_DEBUFF";
    } else if (path === "Priest" || heal > 0) {
      if (lowerName.includes("галлахер") || lowerName.includes("gallagher") || lowerName.includes("линша") || lowerName.includes("lingsha") || be > 100) {
        archetype = "ABUNDANCE_BREAK";
      } else {
        archetype = "ABUNDANCE_HP";
      }
    }
  }
  let totalRollsCount = 0;
  let usefulRollsSum = 0;
  let relicScores = [];
  (char.relics || []).forEach((rel, idx) => {
    let pScore = 0;
    let pTotal = 0;
    (rel.sub_affix || []).forEach((sub) => {
      const upgrades = Math.max(0, (sub.count || 1) - 1);
      pTotal += upgrades;
      totalRollsCount += upgrades;
      const weight = getSubAffixWeight(sub.field, archetype);
      pScore += upgrades * weight;
      usefulRollsSum += upgrades * weight;
    });
    const mainEval = evaluateRelicMainStat(rel, archetype, char);
    rel.main_eval = mainEval;
    pScore += mainEval.scoreBonus;
    relicScores.push({ idx, pScore, pTotal, mainEval });
  });
  let weakestRelicIndex = 0;
  let minScore = 999;
  relicScores.forEach((r) => {
    if (r.pScore < minScore) {
      minScore = r.pScore;
      weakestRelicIndex = r.idx;
    }
  });
  const rollEfficiency = totalRollsCount > 0 ? usefulRollsSum / totalRollsCount * 100 : 75;
  let statPoints = 0;
  let bottleneck = "";
  let actions = [];
  switch (archetype) {
    case "PRESERVATION_DEF": {
      const defRatio = Math.min(1, def / 4e3);
      const spdBonus = spd >= 134 ? 12 : spd / 134 * 8;
      const cvBonus = Math.min(15, cv / 180 * 15);
      statPoints = defRatio * 73 + spdBonus + cvBonus;
      if (def >= 4e3) {
        bottleneck = isRu ? `Защита (${def}) закрывает максимальный порог таланта (+48% КШ). Билд полностью оптимизирован.` : `DEF (${def}) reaches the 4000 talent cap (+48% CRIT Rate). Build is highly optimized.`;
        actions.push({
          title: isRu ? "Сборка завершена (End-Game Tier)" : "Build Complete (End-Game Tier)",
          desc: isRu ? "Избыточную защиту можно безопасно перевести в Крит. Урон и Скорость." : "Excess DEF rolls can be shifted to CRIT DMG and SPD."
        });
      } else {
        bottleneck = isRu ? `Защита (${def}) ниже капа 4000. Талант недополучает ${Math.round((4e3 - def) * 0.024)}% бесплатного Крит. Шанса.` : `DEF (${def}) is below the 4000 cap, losing ${Math.round((4e3 - def) * 0.024)}% free CRIT Rate.`;
        actions.push({
          title: isRu ? "Приоритет: 4000 Защиты" : "Priority: Reach 4,000 DEF",
          desc: isRu ? `Доберите ${4e3 - def} защиты через соединительную вервь или сабстаты.` : `Gain ${4e3 - def} more DEF on link rope or substats.`
        });
      }
      break;
    }
    case "HARMONY_CRIT": {
      const cdRatio = Math.min(1, cd / 200);
      const spdRatio = spd >= 160 ? 30 : spd >= 134 ? 24 : spd / 134 * 18;
      const errBonus = err >= 19 ? 15 : 5;
      const resBonus = Math.min(10, eres / 30 * 10);
      statPoints = cdRatio * 45 + spdRatio + errBonus + resBonus;
      if (spd < 134) {
        bottleneck = isRu ? `Скорость (${spd}) ниже брейкпоинта 134.0 SPD (не хватает ${(134 - spd).toFixed(1)}). Теряется ход в первом цикле.` : `Speed (${spd}) is below 134.0 SPD by ${(134 - spd).toFixed(1)}, losing an action in Cycle 0.`;
        actions.push({
          title: isRu ? "Приоритет: 134.0 Скорости" : "Priority: Reach 134.0 SPD",
          desc: isRu ? "Добрав 1-2 сабстата скорости, вы получите дополнительное продвижение союзника в первом цикле." : "Gain 1-2 speed substats for an immediate Cycle 0 action advance."
        });
      } else if (cd < 180) {
        bottleneck = isRu ? `Крит. урон (${cd}%) можно увеличить до 200%+, чтобы усилить передаваемый бафф союзнику.` : `CRIT DMG (${cd}%) can be pushed to 200%+ to maximize the active buff transfer.`;
        actions.push({
          title: isRu ? "Приоритет: Крит. Урон" : "Priority: Scale CRIT DMG",
          desc: isRu ? "Каждые 10% КУ прямо увеличивают урон вашего гиперкерри." : "Every 10% CD directly boosts your main carry damage."
        });
      } else {
        bottleneck = isRu ? `Сбалансированная сборка Гармонии (${cd}% КУ, ${spd} СКОР, ${err}% ВЭ).` : `High tier Harmony build (${cd}% CD, ${spd} SPD, ${err}% ERR).`;
        actions.push({
          title: isRu ? "Оптимизация: Замена худшего артефакта" : "Optimization: Replace Worst Relic",
          desc: isRu ? `Замените слот ${weakestRelicIndex + 1} на реликвию с большим количеством полезных роллов.` : `Replace slot ${weakestRelicIndex + 1} with higher roll value.`
        });
      }
      break;
    }
    case "HARMONY_SPD": {
      const spdRatio = spd >= 160 ? 55 : spd >= 145 ? 45 : spd / 145 * 35;
      const errBonus = err >= 19.4 ? 25 : err > 0 ? 15 : 5;
      const survBonus = Math.min(20, hp / 4500 * 10 + def / 1200 * 10);
      statPoints = spdRatio + errBonus + survBonus;
      if (spd < 145) {
        bottleneck = isRu ? `Скорость (${spd}) ниже ключевого брейкпоинта 145-160 SPD. Саппорту необходима максимальная скорость для ротации.` : `Speed (${spd}) is below the key 145-160 SPD breakpoint. High SPD is essential for turn advance.`;
        actions.push({
          title: isRu ? "Приоритет: 160.0 Скорости" : "Priority: Push to 160.0 SPD",
          desc: isRu ? "Установите сапоги на Скорость и доберите сабстаты скорости." : "Equip SPD boots and prioritize speed substats."
        });
      } else if (err < 19.4) {
        bottleneck = isRu ? `Отсутствует вервь на Восстановление энергии (+19.4% ВЭ). Ультимейт заряжается медленнее.` : `Missing Energy Regeneration Rate rope (+19.4% ERR). Ultimate uptime is delayed.`;
        actions.push({
          title: isRu ? "Приоритет: Вервь ВЭ" : "Priority: ERR Link Rope",
          desc: isRu ? "Используйте вервь со статом Восстановление энергии." : "Equip an Energy Regeneration Rate main stat rope."
        });
      } else {
        bottleneck = isRu ? `Отличная скоростная сборка саппорта (${spd} СКОР, +${err}% ВЭ). Закрывает все ротации.` : `High-speed support build (${spd} SPD, +${err}% ERR). Full rotation capability.`;
        actions.push({
          title: isRu ? "Сборка готова к эндгейму" : "Endgame Ready",
          desc: isRu ? "Скорость и ротации полностью оптимизированы." : "Speed and rotations are fully optimized."
        });
      }
      break;
    }
    case "ABUNDANCE_ATK": {
      const atkRatio = Math.min(1, atk / 3e3);
      const spdRatio = spd >= 134 ? 25 : spd / 134 * 20;
      const healBonus = heal >= 30 ? 20 : 10;
      const resBonus = Math.min(15, eres / 50 * 15);
      statPoints = atkRatio * 40 + spdRatio + healBonus + resBonus;
      if (spd < 134) {
        bottleneck = isRu ? `Скорость (${spd}) ниже 134 SPD. Замедляет ротацию авто-хила и авто-снятие дебаффов.` : `Speed (${spd}) is below 134 SPD, slowing automatic healing triggers and cleanse.`;
        actions.push({
          title: isRu ? "Приоритет: 134.0 Скорости" : "Priority: Reach 134.0 SPD",
          desc: isRu ? "Скоростные сапоги позволят быстрее активировать поле исцеления." : "Speed boots ensure faster field refresh."
        });
      } else if (atk < 2600) {
        bottleneck = isRu ? `Сила атаки (${atk}) ниже оптимальных 2800+. Исходящее лечение снижено.` : `ATK (${atk}) is below optimal 2800+ benchmark. Passive healing output is reduced.`;
        actions.push({
          title: isRu ? "Приоритет: Сила Атаки%" : "Priority: ATK% Scaling",
          desc: isRu ? "Доберите АТК% на соединительной верви или планарной сфере." : "Gain ATK% on rope or planar sphere."
        });
      } else {
        bottleneck = isRu ? `Отличная сборка (${atk} АТК, ${heal}% исцеления, ${spd} СКОР). Закрывает весь хай-энд контент.` : `Solid ATK-scaling healer build (${atk} ATK, ${heal}% heal, ${spd} SPD).`;
        actions.push({
          title: isRu ? "Сборка завершена" : "Build Complete",
          desc: isRu ? "Ротация и исцеление полностью соответствуют эндовым активностям." : "Fully endgame ready."
        });
      }
      break;
    }
    case "BREAK_DPS": {
      const beRatio = Math.min(1, be / 360);
      const spdRatio = spd >= 150 ? 35 : spd / 150 * 28;
      const atkBonus = Math.min(15, atk / 2500 * 15);
      statPoints = beRatio * 50 + spdRatio + atkBonus;
      if (be < 300) {
        bottleneck = isRu ? `Эффект пробития (${be}%) отстает от нормы 360% для Супер-пробития.` : `Break Effect (${be}%) is below the 360% super break threshold.`;
        actions.push({
          title: isRu ? "Приоритет: Эффект Пробития" : "Priority: Break Effect",
          desc: isRu ? "Криты не нужны: замените куски с роллами в КУ/КШ на чистое Пробитие и Скорость." : "Crits are useless: swap to pure Break Effect and SPD."
        });
      } else {
        bottleneck = isRu ? `Эффект пробития (${be}%) и Скорость (${spd}) закрывают тайминги ультимейта.` : `Break Effect (${be}%) and SPD (${spd}) satisfy all Cycle 0 breakpoints.`;
        actions.push({
          title: isRu ? "Сборка завершена" : "Build Complete",
          desc: isRu ? "Топовый ранг супер-пробития." : "Top tier break build."
        });
      }
      break;
    }
    case "MORTENAX_SUPPORT": {
      const spdRatio = spd >= 160 ? 45 : spd >= 145 ? 40 : spd >= 134 ? 35 : spd / 134 * 25;
      const hpRatio = Math.min(30, hp / 7e3 * 30);
      const errRatio = err >= 15 || ropeStat === "sp_rate" ? 25 : 12;
      statPoints = spdRatio + hpRatio + errRatio;
      if (spd < 134) {
        bottleneck = isRu ? `Скорость (${spd}) ниже порога 134.0 SPD. Саппорт-сборка требует высокой скорости для опережения таймера Зоны (70 SPD) и генерации очков действий/ультимейта.` : `Speed (${spd}) is below 134.0 SPD. Support build requires high speed to cycle the 70 SPD Zone timer.`;
        actions.push({
          title: isRu ? "Приоритет: 134-145+ Скорости" : "Priority: 134-145+ Speed",
          desc: isRu ? "Сапоги на Скорость (+25 SPD) обязательны для быстрой перезарядки Зоны и обновления баффа Кузнеца." : "Speed boots are mandatory for cycling Zone and refreshing Master Smith buff."
        });
      } else {
        bottleneck = isRu ? `Отличная сборка Саппорта-Дебаффера (${spd} SPD, ${hp} HP). Успевает накладывать срез защиты и поддерживать бафф +15% урона отряду до сброса Зоны.` : `Optimized Support Debuffer build (${spd} SPD, ${hp} HP). Reliably refreshes team buffs within the 70 SPD countdown.`;
        actions.push({
          title: isRu ? "Сборка Саппорта оптимизирована" : "Support Build Optimized",
          desc: isRu ? "Высокая скорость опережает таймер Зоны, а вервь на ВЭ/сет Кузнеца усиливают весь отряд." : "High speed laps the zone timer while Master Smith & ERR support the team."
        });
      }
      break;
    }
    case "MORTENAX_HYBRID": {
      const spdRatio = spd >= 145 ? 35 : spd >= 134 ? 30 : spd / 134 * 20;
      const cvRatio = Math.min(35, cv / 220 * 35);
      const hpRatio = Math.min(30, hp / 7e3 * 30);
      statPoints = spdRatio + cvRatio + hpRatio;
      if (spd < 134) {
        bottleneck = isRu ? `Скорость (${spd}) ниже порога 134.0 SPD. Для гибридной сборки важно успевать реализовать криты и баффы внутри Зоны 70 SPD.` : `Speed (${spd}) is below 134.0 SPD. Hybrid build must lap the 70 SPD zone countdown.`;
        actions.push({
          title: isRu ? "Приоритет: 134-145+ Скорости" : "Priority: 134-145+ Speed",
          desc: isRu ? "Сапоги на Скорость (+25 SPD) максимизируют число атак внутри Зоны." : "Speed boots maximize actions inside the Zone."
        });
      } else {
        bottleneck = isRu ? `Сбалансированная гибридная сборка (${spd} SPD, ${cv} CV, ${hp} HP). Сочетает командный бафф с высоким личным уроном.` : `Balanced hybrid build (${spd} SPD, ${cv} CV, ${hp} HP). Combines team buffing with personal damage.`;
        actions.push({
          title: isRu ? "Гибридный билд сбалансирован" : "Hybrid Build Balanced",
          desc: isRu ? "Успешное опережение таймера Зоны в связке с бонусом +100 CV в стойке «Infinite Fury»." : 'Successfully laps the zone timer paired with +100 CV inside "Infinite Fury".'
        });
      }
      break;
    }
    default: {
      const isMortenax = charId === "1507" || lowerName.includes("мортенакс") || lowerName.includes("mortenax");
      const isSlowDps = !isMortenax && (lowerName.includes("ахерон") || lowerName.includes("acheron") || charId === "1308" || lowerName.includes("химеко") || lowerName.includes("himeko") || lowerName.includes("нова") || lowerName.includes("nova") || lowerName.includes("клара") || lowerName.includes("clara") || lowerName.includes("юньли") || lowerName.includes("yunli") || archetype === "HP_CRIT_DPS" || spd < 115);
      const cvRatio = Math.min(1, cv / 260);
      const spdRatio = isSlowDps ? 20 : spd >= 134 ? 20 : spd / 134 * 15;
      const atkRatio = archetype === "HP_CRIT_DPS" ? Math.min(15, hp / 7500 * 15) : Math.min(15, atk / 2800 * 15);
      statPoints = cvRatio * 65 + spdRatio + atkRatio;
      if (isMortenax) {
        if (spd < 134) {
          bottleneck = isRu ? `Скорость (${spd}) ниже порога 134.0 SPD. Зона «Infinite Fury» ограничена таймером на 70 SPD: без высокой скорости персонаж не успевает совершить 3+ действия до рассеивания стойки.` : `Speed (${spd}) is below 134.0 SPD. The "Infinite Fury" Zone is bound to a 70 SPD countdown: high speed is required to take 3+ turns before it expires.`;
          actions.push({
            title: isRu ? "Приоритет №1: 134-145+ Скорости" : "Priority #1: Reach 134-145+ SPD",
            desc: isRu ? "Сапоги на Скорость (+25 SPD) и сабстаты критически важны для максимального числа ходов и ультимейтов внутри Зоны." : "Speed boots (+25 SPD) and substats are mandatory to maximize turns and ultimates inside the Zone."
          });
        } else {
          bottleneck = isRu ? `Отличная скоростная сборка под таймер Зоны (${spd} SPD, ${cv} CV, ${hp} HP). Позволяет совершать 3+ действия внутри стойки «Infinite Fury».` : `Optimized high-speed build for the Zone timer (${spd} SPD, ${cv} CV, ${hp} HP). Unlocks 3+ actions inside "Infinite Fury".`;
          actions.push({
            title: isRu ? "Сборка оптимизирована под таймер Зоны" : "Zone Optimized",
            desc: isRu ? "Скорость закрывает тайминг зоны на 70 SPD, а ульт добавляет бесплатные +20% КШ и +60% КУ (+100 CV)." : "Speed satisfies the 70 SPD countdown, and Ult supplies +20% CR / +60% CD (+100 CV)."
          });
        }
      } else if (cr < 70 && cd > 160) {
        bottleneck = isRu ? `Дисбаланс критов: Крит. Шанс (${cr}%) отстает от Крит. Урона (${cd}%). Теряется стабильность ротации.` : `Imbalanced CRIT ratio: CRIT Rate (${cr}%) lags behind CRIT DMG (${cd}%).`;
        actions.push({
          title: isRu ? "Приоритет: Стабилизация Крит. Шанса" : "Priority: Stabilize CRIT Rate",
          desc: isRu ? "Соотношение 1:2 дает наибольшую среднюю ротацию урона." : "Target 1:2 ratio to maximize expected damage per rotation."
        });
      } else if (!isSlowDps && spd < 134) {
        bottleneck = isRu ? `Скорость (${spd}) ниже порога 134.0 SPD. Теряется 1 действие в Цикле 0 Зала Забвения.` : `Speed (${spd}) is below 134.0 SPD. The character misses an extra turn in Cycle 0.`;
        actions.push({
          title: isRu ? "Приоритет: 134.0 Скорости" : "Priority: Reach 134.0 SPD",
          desc: isRu ? "Доберите 1-2 сабстата скорости для получения 2 действий в первом цикле." : "Gain 1-2 speed substats to unlock 2 actions in Cycle 0."
        });
      } else if (isSlowDps && archetype !== "HP_CRIT_DPS" && atk < 3e3) {
        bottleneck = isRu ? `Сила атаки (${atk}) ниже рекомендуемой для гиперкерри (3200+ АТК). Сборка ориентирована на чистый урон без затрат на скорость.` : `ATK (${atk}) is below recommended hypercarry benchmark (3200+ ATK). Focus on pure damage without speed investment.`;
        actions.push({
          title: isRu ? "Приоритет: Сила Атаки%" : "Priority: Scale ATK%",
          desc: isRu ? "Сапоги на Силу атаки% максимизируют урон атак и ультимейта." : "ATK% boots maximize skill and ultimate damage."
        });
      } else {
        bottleneck = isRu ? isSlowDps ? `Сбалансированная сборка на максимальный урон (CV ${cv}, ${archetype === "HP_CRIT_DPS" ? `${hp} HP` : `${atk} АТК`}). Скорость не требуется.` : `Сбалансированная боевая сборка (CV ${cv}, SPD ${spd}).` : isSlowDps ? `Optimal max-damage build (CV ${cv}, ${archetype === "HP_CRIT_DPS" ? `${hp} HP` : `${atk} ATK`}). No speed required.` : `Solid balanced build (CV ${cv}, SPD ${spd}).`;
        actions.push({
          title: isRu ? "Оптимизация: Замена худшего артефакта" : "Optimization: Replace Worst Relic",
          desc: isRu ? `Замените слот ${weakestRelicIndex + 1} на реликвию с большим количеством роллов в криты.` : `Upgrade slot ${weakestRelicIndex + 1} with offensive rolls.`
        });
      }
      break;
    }
  }
  const slotNamesRu = ["Голова", "Руки", "Тело", "Сапоги", "Планарная сфера", "Соединительная вервь"];
  const slotNamesEn = ["Head", "Hands", "Body", "Feet", "Planar Sphere", "Link Rope"];
  const wrongMainRelics = relicScores.filter((r) => r.mainEval?.status === "wrong");
  if (wrongMainRelics.length > 0) {
    const worstMain = wrongMainRelics[0];
    const sName = isRu ? slotNamesRu[worstMain.idx] || `Слот ${worstMain.idx + 1}` : slotNamesEn[worstMain.idx] || `Slot ${worstMain.idx + 1}`;
    const recText = isRu ? worstMain.mainEval.recommendedRu : worstMain.mainEval.recommendedEn;
    actions.unshift({
      title: isRu ? `Критично: Неверный главный стат (${sName})` : `Critical: Wrong Main Stat (${sName})`,
      desc: isRu ? `На реликвии «${sName}» активен неподходящий главный стат. Для вашего архетипа необходимо заменить на: ${recText}.` : `Slot "${sName}" has incompatible main stat. For this archetype, switch to: ${recText}.`
    });
    bottleneck = isRu ? `Критическая потеря урона/эффективности: ${sName} имеет неподходящий главный стат. Срочно замените на: ${recText}.` : `Critical efficiency loss: ${sName} has incompatible main stat. Priority replacement: ${recText}.`;
  }
  let mainStatPenalty = 0;
  relicScores.forEach((r) => {
    if (r.mainEval?.status === "wrong") mainStatPenalty += 14;
    else if (r.mainEval?.status === "viable") mainStatPenalty += 2;
  });
  statPoints = Math.max(15, statPoints - mainStatPenalty);
  const planarRelics = (char.relics || []).filter((r, idx) => {
    if (!r) return false;
    const num = Number(r.type ?? r.pos);
    if (num === 5 || num === 6) return true;
    const typeStr = String(r.type || r.type_name || "").toUpperCase();
    if (typeStr === "NECK" || typeStr === "OBJECT" || typeStr === "SPHERE" || typeStr === "ROPE" || typeStr.includes("СФЕР") || typeStr.includes("ВЕРВ")) return true;
    const idStr = String(r.id || r.tid || "");
    if (idStr.length === 5 && (idStr.endsWith("5") || idStr.endsWith("6"))) return true;
    return char.relics.length >= 6 && idx >= 4;
  });
  let planarRollsTotal = 0;
  let planarUsefulRolls = 0;
  let planarUsefulRollsWeighted = 0;
  let planarCv = 0;
  planarRelics.forEach((r) => {
    (r.sub_affix || []).forEach((sub) => {
      const upgrades = Math.max(0, (sub.count || 1) - 1);
      planarRollsTotal += upgrades;
      if (sub.field === "crit_rate") {
        planarCv += (sub.value || 0) * 200;
      } else if (sub.field === "crit_dmg") {
        planarCv += (sub.value || 0) * 100;
      }
      const weight = getSubAffixWeight(sub.field, archetype);
      if (weight >= 0.5) {
        planarUsefulRolls += upgrades;
      }
      planarUsefulRollsWeighted += upgrades * weight;
    });
  });
  const pInfo0 = planarRelics.length > 0 ? resolveRelicSetInfo(planarRelics[0], isRu ? "ru" : "en") : null;
  const pInfo1 = planarRelics.length > 1 ? resolveRelicSetInfo(planarRelics[1], isRu ? "ru" : "en") : null;
  const planarSet = pInfo0?.name || (planarRelics.length > 0 ? planarRelics[0].set_name || "" : "");
  const isPlanarSetComplete = planarRelics.length === 2 && (planarRelics[0].set_id === planarRelics[1].set_id || pInfo0?.name && pInfo0.name === pInfo1?.name);
  const planarEfficiency = planarRollsTotal > 0 ? Math.min(100, Math.round((planarUsefulRollsWeighted / planarRollsTotal) * 100)) : 75;
  let planarCondition = "";
  let isConditionMet = true;
  if (/Салсотто|Salsotto/i.test(planarSet)) {
    isConditionMet = cr >= 50;
    planarCondition = isConditionMet ? isRu ? `50%+ КШ выполнено (${cr}% ) • Бонус +15% к ульту/бонус-атаке активен` : `50%+ CR achieved (${cr}% ) • +15% Ult/FUA DMG active` : isRu ? `Требуется 50% КШ (текущий: ${cr}% ) • Бонус сета не активирован!` : `Requires 50% CR (current: ${cr}% ) • Inactive!`;
  } else if (/Гламот|Глатирамер|Glamoth/i.test(planarSet)) {
    if (spd >= 160) {
      isConditionMet = true;
      planarCondition = isRu ? `160+ СКОР выполнено (${spd} ) • Максимальный бонус +18% урона активен` : `160+ SPD achieved (${spd} ) • Max +18% DMG active`;
    } else if (spd >= 135) {
      isConditionMet = true;
      planarCondition = isRu ? `135+ СКОР выполнено (${spd} ) • Бонус +12% урона активен` : `135+ SPD achieved (${spd} ) • +12% DMG active`;
    } else {
      isConditionMet = false;
      planarCondition = isRu ? `Требуется 135 СКОР (текущая: ${spd} ) • Бонус урона не активирован!` : `Requires 135 SPD (current: ${spd} ) • Inactive!`;
    }
  } else if (/Арена|Rutilant/i.test(planarSet)) {
    isConditionMet = cr >= 70;
    planarCondition = isConditionMet ? isRu ? `70%+ КШ выполнено (${cr}% ) • Бонус +20% к базовой атаке и навыку активен` : `70%+ CR achieved (${cr}% ) • +20% Basic/Skill DMG active` : isRu ? `Требуется 70% КШ (текущий: ${cr}% ) • Бонус урона не активирован!` : `Requires 70% CR (current: ${cr}% ) • Inactive!`;
  } else if (/Киль|Keel/i.test(planarSet)) {
    isConditionMet = eres >= 30;
    planarCondition = isConditionMet ? isRu ? `30%+ СЭ выполнено (${eres}% ) • Бонус отряда +10% Крит. Урона активен` : `30%+ E-RES achieved (${eres}% ) • Team +10% CD active` : isRu ? `Требуется 30% СЭ (текущее: ${eres}% ) • Бонус критов не активирован!` : `Requires 30% E-RES (current: ${eres}% ) • Inactive!`;
  } else if (/Герта|Space Sealing|Запечатывающ/i.test(planarSet)) {
    isConditionMet = spd >= 120;
    planarCondition = isConditionMet ? isRu ? `120+ СКОР выполнено (${spd} ) • Дополнительные +12% Силы Атаки активны` : `120+ SPD achieved (${spd} ) • Extra +12% ATK active` : isRu ? `Требуется 120 СКОР (текущая: ${spd} ) • Доп. атака не активирована!` : `Requires 120 SPD (current: ${spd} ) • Inactive!`;
  } else if (/Флот|Ageless/i.test(planarSet)) {
    isConditionMet = spd >= 120;
    planarCondition = isConditionMet ? isRu ? `120+ СКОР выполнено (${spd} ) • Бонус отряда +8% Силы Атаки активен` : `120+ SPD achieved (${spd} ) • Team +8% ATK active` : isRu ? `Требуется 120 СКОР (текущая: ${spd} ) • Бафф отряда не активирован!` : `Requires 120 SPD (current: ${spd} ) • Inactive!`;
  } else if (/Калпаги|Лотосовый фонарь|Kalpagni/i.test(planarSet)) {
    isConditionMet = spd >= 145;
    planarCondition = isConditionMet ? isRu ? `145+ СКОР выполнено (${spd} ) • +40% Эффекта Пробития по огненной уязвимости` : `145+ SPD achieved (${spd} ) • +40% BE on Fire weakness` : isRu ? `Требуется 145 СКОР (текущая: ${spd} )` : `Requires 145 SPD (current: ${spd} )`;
  } else if (/Талия|Talia/i.test(planarSet)) {
    isConditionMet = spd >= 145;
    planarCondition = isConditionMet ? isRu ? `145+ СКОР выполнено (${spd} ) • Максимальный бонус +36% Эффекта Пробития активен` : `145+ SPD achieved (${spd} ) • Max +36% Break Effect active` : isRu ? `Требуется 145 СКОР (текущая: ${spd} ) • Доп. +20% ЭП не активированы!` : `Requires 145 SPD (current: ${spd} ) • Inactive!`;
  } else if (/Вонвак|Vonwacq/i.test(planarSet)) {
    isConditionMet = spd >= 120;
    planarCondition = isConditionMet ? isRu ? `120+ СКОР выполнено (${spd} ) • +5% ВЭ и продвижение действия на 40% активно` : `120+ SPD achieved (${spd} ) • +5% ERR & 40% Action Advance active` : isRu ? `Требуется 120 СКОР (текущая: ${spd} )` : `Requires 120 SPD (current: ${spd} )`;
  } else if (/Белобог|Belobog/i.test(planarSet)) {
    isConditionMet = ehr >= 50;
    planarCondition = isConditionMet ? isRu ? `50%+ ШПЭ выполнено (${ehr}% ) • Максимальный бонус +30% Защиты активен` : `50%+ EHR achieved (${ehr}% ) • Max +30% DEF active` : isRu ? `Требуется 50% ШПЭ (текущий: ${ehr}% ) • Доп. +15% ЗАЩ не активированы!` : `Requires 50% EHR (current: ${ehr}% ) • Inactive!`;
  } else if (/Дифференциатор|Differentiator/i.test(planarSet)) {
    isConditionMet = cd >= 120;
    planarCondition = isConditionMet ? isRu ? `120%+ КУ выполнено (${cd}% ) • +16% КУ и +60% КШ на первую атаку активны` : `120%+ CD achieved (${cd}% ) • +16% CD & +60% CR on 1st hit active` : isRu ? `Требуется 120% КУ (текущий: ${cd}% )` : `Requires 120% CD (current: ${cd}% )`;
  } else if (/Безмолвная страна костей|Кост|Останков|Bone Collection/i.test(planarSet)) {
    isConditionMet = hp >= 5e3;
    planarCondition = isConditionMet ? isRu ? `5000+ HP выполнено (${hp} ) • +12% HP и +28% Крит. Урона владельцу и миньонам активно` : `5000+ HP achieved (${hp} ) • +12% HP & +28% CD active` : isRu ? `Требуется 5000 HP (текущее: ${hp} )` : `Requires 5000 HP (current: ${hp} )`;
  } else if (/Древо|Giant Tree/i.test(planarSet)) {
    isConditionMet = spd >= 135;
    planarCondition = isConditionMet ? isRu ? `135+ СКОР выполнено (${spd} ) • +6% СКОР и максимальный бафф активен` : `135+ SPD achieved (${spd} ) • +6% SPD & max buff active` : isRu ? `Требуется 135 СКОР (текущая: ${spd} )` : `Requires 135 SPD (current: ${spd} )`;
  } else if (/Банан|Banan/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+16% Крит. Урона активно • Дополнительно +32% КУ при наличии призванного существа " : "+16% CRIT DMG active • +32% extra CD when summons present ";
  } else if (/Русалка|затопленные берега|Лушака|Lushaka/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+5% ВЭ и +12% Силы Атаки первому союзнику в отряде (если владелец не на 1 слоте) " : "+5% ERR & +12% ATK to 1st slot ally (if wearer not in slot 1) ";
  } else if (/Пенакони|Penacony/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+5% ВЭ и +10% урона союзникам той же стихии " : "+5% ERR & +10% DMG to same-element allies ";
  } else if (/Пангалакти|Pan-Cosmic/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? `+10% ШПЭ и +${Math.min(25, Math.round(ehr * 0.25))}% Силы Атаки от ШПЭ ` : `+10% EHR & +${Math.min(25, Math.round(ehr * 0.25))}% ATK from EHR `;
  } else if (/Сигони|Sigonia/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+4% КШ и до +40% Крит. Урона за поверженных врагов" : "+4% CR & up to +40% CD on enemy defeated";
  } else if (/Изум|Идзумо|Izumo/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+12% Силы Атаки и +12% КШ при наличии союзника того же пути" : "+12% ATK & +12% CR with same-path ally";
  } else if (/Дуран|Duran/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "До 5 стаков: +25% к бонус-атакам и +25% Крит. Урона" : "Up to 5 stacks: +25% FUA DMG & +25% CD";
  } else if (/Миг радости бога|радости бога|миг радости|радост|Moment of Joy|Joy/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+6% Скорости активно • Действие продвигается вперёд на 40% при входе в бой с Радостью " : "+6% SPD active • 40% Action Advance at battle start with Elation ";
  } else if (/Подпространственный центр|контроля аномалий|Subspace ASC Center/i.test(planarSet)) {
    isConditionMet = spd >= 145;
    planarCondition = isConditionMet ? isRu ? `145+ СКОР выполнено (${spd} ) • +6% СКОР и +15% Эффекта Пробития всем союзникам активны ` : `145+ SPD achieved (${spd} ) • +6% SPD & +15% Break Effect for all allies active ` : isRu ? `Требуется 145 СКОР (текущая: ${spd} ) • Бонус команды не активирован!` : `Requires 145 SPD (current: ${spd} ) • Team bonus inactive!`;
  } else if (/Tengoku|Тэнгоку|Стрим/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+8% КШ активно • Дополнительно +24% Крит. Урона при наличии спутника/призыва " : "+8% CR active • +24% CRIT DMG with summon/servant ";
  } else if (/Amphoreus|Амфореус/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+12% HP и усиление урона союзников активно " : "+12% HP & team DMG amplification active ";
  } else if (/Punklorde|Панклорд/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? "+6% Скорости и бонус атаки от ШПЭ активны " : "+6% SPD & ATK bonus from EHR active ";
  } else {
    const matchingSet = (char.relic_sets || []).find((s) => s.name === planarSet || planarSet && s.name && planarSet.includes(s.name));
    const setDesc = matchingSet?.desc || "";
    if (/\b160\b/.test(setDesc)) {
      isConditionMet = spd >= 160;
      planarCondition = isConditionMet ? isRu ? `160+ СКОР выполнено (${spd} ) • Полный бонус сета активен` : `160+ SPD achieved (${spd} ) • Full set bonus active` : isRu ? `Требуется 160 СКОР (текущая: ${spd} )` : `Requires 160 SPD (current: ${spd} )`;
    } else if (/\b145\b/.test(setDesc)) {
      isConditionMet = spd >= 145;
      planarCondition = isConditionMet ? isRu ? `145+ СКОР выполнено (${spd} ) • Бонус сета активен` : `145+ SPD achieved (${spd} ) • Set bonus active` : isRu ? `Требуется 145 СКОР (текущая: ${spd} )` : `Requires 145 SPD (current: ${spd} )`;
    } else if (/\b135\b/.test(setDesc)) {
      isConditionMet = spd >= 135;
      planarCondition = isConditionMet ? isRu ? `135+ СКОР выполнено (${spd} ) • Бонус сета активен` : `135+ SPD achieved (${spd} ) • Set bonus active` : isRu ? `Требуется 135 СКОР (текущая: ${spd} )` : `Requires 135 SPD (current: ${spd} )`;
    } else if (/\b120\b/.test(setDesc)) {
      isConditionMet = spd >= 120;
      planarCondition = isConditionMet ? isRu ? `120+ СКОР выполнено (${spd} ) • Бонус сета активен` : `120+ SPD achieved (${spd} ) • Set bonus active` : isRu ? `Требуется 120 СКОР (текущая: ${spd} )` : `Requires 120 SPD (current: ${spd} )`;
    } else if (/\b5000\b/.test(setDesc)) {
      isConditionMet = hp >= 5e3;
      planarCondition = isConditionMet ? isRu ? `5000+ HP выполнено (${hp} ) • Бонус сета активен` : `5000+ HP achieved (${hp} ) • Set bonus active` : isRu ? `Требуется 5000 HP (текущее: ${hp} )` : `Requires 5000 HP (current: ${hp} )`;
    } else if (/\b70%\b/.test(setDesc) && /крит|crit/i.test(setDesc)) {
      isConditionMet = cr >= 70;
      planarCondition = isConditionMet ? isRu ? `70%+ КШ выполнено (${cr}% ) • Бонус сета активен` : `70%+ CR achieved (${cr}% ) • Set bonus active` : isRu ? `Требуется 70% КШ (текущий: ${cr}% )` : `Requires 70% CR (current: ${cr}% )`;
    } else if (/\b50%\b/.test(setDesc) && /крит|crit/i.test(setDesc)) {
      isConditionMet = cr >= 50;
      planarCondition = isConditionMet ? isRu ? `50%+ КШ выполнено (${cr}% ) • Бонус сета активен` : `50%+ CR achieved (${cr}% ) • Set bonus active` : isRu ? `Требуется 50% КШ (текущий: ${cr}% )` : `Requires 50% CR (current: ${cr}% )`;
    } else {
      isConditionMet = true;
      planarCondition = isRu ? isPlanarSetComplete ? `Сет «${planarSet}» активен (2/2) ` : `Разорванный планарный сет ` : isPlanarSetComplete ? `Set "${planarSet}" active (2/2) ` : `Broken planar set `;
    }
  }
  let planarSynergyBonus = 0;
  if (isPlanarSetComplete) {
    planarSynergyBonus += 3.5;
    if (isConditionMet) {
      planarSynergyBonus += 3;
    } else {
      planarSynergyBonus -= 2.5;
      actions.push({
        title: isRu ? "Условие планарного сета не активировано" : "Planar Set Condition Inactive",
        desc: planarCondition
      });
    }
  } else if (planarRelics.length === 2) {
    planarSynergyBonus -= 5;
    actions.push({
      title: isRu ? "Разорванный планарный сет (1/2 + 1/2)" : "Broken Planar Set (1/2 + 1/2)",
      desc: isRu ? `На персонаже надеты планарки из разных наборов («${planarRelics[0].set_name}» и «${planarRelics[1].set_name}»). Соберите 2 предмета одного сета для получения пассивного бонуса.` : `Equipped planars are from different sets. Equip 2 pieces of the same set to activate 2-Pc passive.`
    });
  }
  const cavernRelics = (char.relics || []).filter((r) => r.type >= 1 && r.type <= 4);
  let cavernRollsTotal = 0;
  let cavernUsefulRolls = 0;
  let cavernUsefulRollsWeighted = 0;
  let cavernCv = 0;
  cavernRelics.forEach((r) => {
    (r.sub_affix || []).forEach((sub) => {
      const upgrades = Math.max(0, (sub.count || 1) - 1);
      cavernRollsTotal += upgrades;
      if (sub.field === "crit_rate") {
        cavernCv += (sub.value || 0) * 200;
      } else if (sub.field === "crit_dmg") {
        cavernCv += (sub.value || 0) * 100;
      }
      const weight = getSubAffixWeight(sub.field, archetype);
      if (weight >= 0.5) {
        cavernUsefulRolls += upgrades;
      }
      cavernUsefulRollsWeighted += upgrades * weight;
    });
  });
  const cavernEfficiency = cavernRollsTotal > 0 ? Math.min(100, Math.round((cavernUsefulRollsWeighted / cavernRollsTotal) * 100)) : 75;
  const cavernSetCounts = {};
  cavernRelics.forEach((r) => {
    const info = resolveRelicSetInfo(r, isRu ? "ru" : "en");
    const sId = info?.def?.ids?.[0] || info?.name || r.set_id || r.set_name || "unknown";
    const sName = info?.name || r.set_name || (isRu ? `Сет #${sId}` : `Set #${sId}`);
    cavernSetCounts[sId] = cavernSetCounts[sId] || { count: 0, name: sName };
    cavernSetCounts[sId].count += 1;
  });
  const cavernGroups = Object.values(cavernSetCounts).sort((a, b) => b.count - a.count);
  let cavernSynergyBonus = 0;
  let cavernSetLabel = "";
  let cavernStatusText = "";
  let isCavernComplete = false;
  if (cavernGroups.length > 0 && cavernGroups[0].count >= 4) {
    isCavernComplete = true;
    cavernSynergyBonus = 4;
    cavernSetLabel = ` 4/4 ${cavernGroups[0].name}`;
    cavernStatusText = isRu ? `Полный комплект 4/4 активен («${cavernGroups[0].name}») • Бонус сета активирован ` : `Full 4/4 set active ("${cavernGroups[0].name}") • Set passive unlocked `;
  } else if (cavernGroups.length >= 2 && cavernGroups[0].count >= 2 && cavernGroups[1].count >= 2) {
    isCavernComplete = true;
    cavernSynergyBonus = 3;
    cavernSetLabel = ` 2/4 ${cavernGroups[0].name} + 2/4 ${cavernGroups[1].name}`;
    cavernStatusText = isRu ? `Комбинация 2/4 + 2/4 активна • Получены два 2-Pc бонуса сетов ` : `Combination 2/4 + 2/4 active • Two 2-Pc set bonuses unlocked `;
  } else if (cavernGroups.length > 0 && cavernGroups[0].count >= 2) {
    isCavernComplete = false;
    cavernSynergyBonus = 0.5;
    cavernSetLabel = isRu ? `2/4 ${cavernGroups[0].name} (1/4 + 1/4 Разорван )` : `2/4 ${cavernGroups[0].name} (1/4 + 1/4 Broken )`;
    cavernStatusText = isRu ? `Активирован только 2-Pc бонус («${cavernGroups[0].name}»). Две реликвии надеты без сета ` : `Only 2-Pc bonus active ("${cavernGroups[0].name}"). 2 pieces are off-set `;
    actions.push({
      title: isRu ? "Неполный пещерный комплект (2/4)" : "Incomplete Cavern Set (2/4)",
      desc: isRu ? `Активирован только 2-Pc бонус («${cavernGroups[0].name}»). Соберите 4 предмета или второй 2-Pc сет для значительного усиления.` : `Only 2-Pc bonus active. Equip 4 pieces or a second 2-Pc set for major stat amplification.`
    });
  } else if (cavernRelics.length === 4) {
    isCavernComplete = false;
    cavernSynergyBonus = -4;
    cavernSetLabel = isRu ? "РАЗОРВАННЫЙ ПЕЩЕРНЫЙ СЕТ " : "BROKEN CAVERN SET ";
    cavernStatusText = isRu ? `Все 4 пещерные реликвии надеты из разных наборов. Бонусы сетов не действуют ` : `All 4 cavern relics are from mismatched sets with 0 active set passives `;
    actions.push({
      title: isRu ? "Разорванный пещерный сет (0 бонусов)" : "Broken Cavern Relics (0 set bonuses)",
      desc: isRu ? "Все 4 пещерные реликвии надеты из разных сетов без активных бонусов наборов. Соберите 4 предмета одного сета или 2+2." : "All 4 cavern relics are from mismatched sets with 0 active set passives. Equip a full 4-Pc or 2+2 set."
    });
  }
  statPoints = Math.max(15, statPoints + planarSynergyBonus + cavernSynergyBonus);
  const finalScore = Math.min(99.4, Math.max(45, statPoints * 0.7 + rollEfficiency * 0.3));
  const zScore = (finalScore - 68) / 11.5;
  const topPercent = zScoreToTopPercent(zScore);
  const characterMetrics = determineCharacterMetrics(char, archetype, {
    hp,
    atk,
    def,
    spd,
    cr,
    cd,
    cv,
    be,
    ehr,
    eres,
    heal,
    err
  });
  return {
    score: finalScore.toFixed(1),
    topPercent: topPercent.toFixed(1),
    rollEfficiency: rollEfficiency.toFixed(1),
    cv: cv.toFixed(1),
    spd: spd.toFixed(1),
    archetype,
    detectedRole,
    stats: {
      hp,
      atk,
      def,
      spd,
      cr,
      cd,
      cv,
      be,
      ehr,
      eres,
      heal,
      err,
      dmg_boost
    },
    primaryMetric: characterMetrics.primary,
    secondaryMetric: characterMetrics.secondary,
    bottleneck,
    actions,
    weakestRelicIndex,
    cavern: {
      label: cavernSetLabel,
      setName: cavernGroups.length > 0 ? cavernGroups[0].name : "",
      isComplete: isCavernComplete,
      efficiency: cavernEfficiency,
      cv: cavernCv.toFixed(1),
      condition: cavernStatusText,
      rollsTotal: cavernRollsTotal,
      usefulRolls: Math.round(cavernUsefulRolls),
      groups: cavernGroups
    },
    planar: {
      setName: planarSet,
      isComplete: isPlanarSetComplete,
      efficiency: planarEfficiency,
      cv: planarCv.toFixed(1),
      condition: planarCondition,
      rollsTotal: planarRollsTotal,
      usefulRolls: Math.round(planarUsefulRolls)
    }
  };
}
