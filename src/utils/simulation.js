import { ROTATIONS } from "../data/rotations.js";

export function runCombatSimulation(char, stats, archetype, lang = "ru") {
  if (!char) return null;
  const isRu = lang === "ru";
  const name = (char.name || "").toLowerCase();
  const charId = String(char.id || "");
  let hp = Number(stats?.hp || 0);
  let atk = Number(stats?.atk || 0);
  let def = Number(stats?.def || 0);
  let spd = Number(stats?.spd || 0);
  let cr = Number(stats?.cr || 0);
  let cd = Number(stats?.cd || 0);
  let be = Number(stats?.be || 0);
  let ehr = Number(stats?.ehr || 0);
  let err = Number(stats?.err || 0);
  let dmg_boost = Number(stats?.dmg_boost || 0);
  if (!atk && !hp && char) {
    const baseMap = {};
    (char.attributes || []).forEach((a) => {
      baseMap[a.field] = a;
    });
    const addMap = {};
    (char.additions || []).forEach((a) => {
      addMap[a.field] = a;
    });
    const getStat = (field) => (baseMap[field]?.value || 0) + (addMap[field]?.value || 0);
    hp = Math.round(getStat("hp")) || 0;
    atk = Math.round(getStat("atk")) || 0;
    def = Math.round(getStat("def")) || 0;
    spd = parseFloat(getStat("spd").toFixed(1)) || 100;
    cr = parseFloat((getStat("crit_rate") * 100).toFixed(1)) || 5;
    cd = parseFloat((getStat("crit_dmg") * 100).toFixed(1)) || 50;
    be = parseFloat(((addMap["break_dmg"]?.value || 0) * 100).toFixed(1)) || 0;
    ehr = parseFloat(((addMap["effect_hit"]?.value || 0) * 100).toFixed(1)) || 0;
    err = parseFloat(((addMap["sp_rate"]?.value || 0) * 100).toFixed(1)) || 0;
    const dmgFields = ["fire_dmg", "physical_dmg", "quantum_dmg", "thunder_dmg", "wind_dmg", "ice_dmg", "imaginary_dmg", "all_dmg"];
    dmgFields.forEach((f) => {
      if (addMap[f]?.value) {
        dmg_boost = Math.max(dmg_boost, parseFloat((addMap[f].value * 100).toFixed(1)));
      }
    });
  }
  const baseDefFactor = 1e3 / (1100 + 1e3);
  const baseResMult = 0.8;
  const baseDmgCoeff = baseDefFactor * baseResMult;
  const effectiveSpd = Math.max(90, spd);
  const actionsPerCycle0 = Math.floor(150 * effectiveSpd / 1e4) + 150 * effectiveSpd % 1e4 / 1e4;
  const actionsPerCycle = Math.floor(100 * effectiveSpd / 1e4) + 100 * effectiveSpd % 1e4 / 1e4;
  const isMortenax = charId === "1507" || name.includes("мортенакс") || name.includes("mortenax");
  const isHimeko = charId === "1003" || name.includes("химеко") || name.includes("himeko") || name.includes("нова") || name.includes("nova");
  const isSunday = charId === "1313" || name.includes("воскресенье") || name.includes("sunday");
  const isYaoGuang = charId === "1408" || name.includes("яо") || name.includes("yao") || name.includes("гуан") || name.includes("爻光");
  const isRobin = charId === "1309" || name.includes("зарянка") || name.includes("robin");
  const isRuanMei = charId === "1303" || name.includes("жуань") || name.includes("ruan");
  const isSparkle = charId === "1306" || name.includes("искорка") || name.includes("sparkle");
  const isBronya = charId === "1101" || name.includes("броня") || name.includes("bronya");
  const isTingyun = charId === "1202" || name.includes("тиньъюнь") || name.includes("тинъюнь") || name.includes("tingyun");
  const isWelt = charId === "1004" || name.includes("вельт") || name.includes("welt");
  const isSilverWolf = charId === "1006" || name.includes("волк") || name.includes("silver");
  const isPela = charId === "1105" || name.includes("пела") || name.includes("pela");
  const isJiaoqiu = charId === "1218" || name.includes("цзяоцю") || name.includes("jiaoqiu");
  const isAventurine = charId === "1304" || name.includes("авантюрин") || name.includes("aventurine");
  const isFuXuan = charId === "1208" || name.includes("фу") || name.includes("fu");
  const isLingsha = charId === "1222" || name.includes("линша") || name.includes("lingsha");
  const isGallagher = charId === "1301" || name.includes("галлахер") || name.includes("gallagher");
  const isHuohuo = charId === "1217" || name.includes("хохо") || name.includes("huohuo");
  const isLuocha = charId === "1203" || name.includes("лоча") || name.includes("luocha");
  const simCr = Math.min(1, (cr + (isMortenax ? 20 : 0)) / 100);
  const simCd = (cd + (isMortenax ? 60 : 0)) / 100;
  const critMultiplier = 1 + simCr * simCd;

  // Уніфікація двигунів: для персонажів з kit-ротацією (src/data/rotations.js) рахуємо
  // персональні метрики з реального кіта — ті самі множники, що й у rotationSimulation.js.
  const kitRotation = ROTATIONS[charId] || null;
  if (kitRotation) {
    const scalingStat = Math.max(1200, kitRotation.hpScale ? hp : atk);
    const totalDmgBonus = 1 + dmg_boost / 100 + (kitRotation.passiveDmgBoost || 0) / 100;
    let rotationTotal = 0;
    let peak = 0;
    kitRotation.instances.forEach((inst) => {
      const instDmg = Math.round(scalingStat * inst.mv * inst.count * inst.targets * totalDmgBonus * critMultiplier * baseDmgCoeff);
      rotationTotal += instDmg;
      const perHit = Math.round(scalingStat * inst.mv * totalDmgBonus * critMultiplier * baseDmgCoeff);
      peak = Math.max(peak, perHit);
    });
    let loopFactor = 1;
    if (kitRotation.ultLoop) {
      loopFactor = Math.min(2.5, Math.max(0.8, (spd / 135) * ((err || 100) / 100) * 1.4));
      rotationTotal = Math.round(rotationTotal * loopFactor);
    }
    const personalDpa = peak;
    const personalDpc = rotationTotal;
    const benchmarkTier = personalDpc >= 9e4 ? "SSS" : personalDpc >= 6e4 ? "SS" : personalDpc >= 4e4 ? "S" : "A";
    return {
      type: "DAMAGE",
      hasDualOutput: false,
      benchmarkTier,
      metric1Label: isRu ? "ПИКОВЫЙ УДАР КИТА (DPA)" : "PEAK KIT HIT (DPA)",
      metric1Value: `${personalDpa.toLocaleString("ru-RU")}`,
      metric2Label: isRu ? "ПОЛНАЯ РОТАЦИЯ КИТА (СОЛО)" : "FULL KIT ROTATION (SOLO)",
      metric2Value: `${personalDpc.toLocaleString("ru-RU")}${loopFactor > 1 ? ` (петля ×${loopFactor.toFixed(2)})` : ""}`,
      metric3Label: isRu ? "КРИТ. МНОЖИТЕЛЬ" : "CRIT MULTIPLIER",
      metric3Value: `${(critMultiplier * 100).toFixed(0)}%`,
      personalDpa,
      personalDpc,
      personalDpaLabel: isRu ? "Пиковый удар по киту (макс. инстанс)" : "Peak kit hit (max instance)",
      personalDpcLabel: isRu ? "Полная ротация кита (соло, без бафов отряда)" : "Full kit rotation (solo, no team buffs)",
      personalMetric3Label: isRu ? "Множитель крита" : "Crit Multiplier",
      personalMetric3Value: `${critMultiplier.toFixed(2)}x (${(simCr * 100).toFixed(0)}% / ${(simCd * 100).toFixed(0)}%)`,
      summaryRu: `Расчёт по реальному киту: полная ротация даёт ~${personalDpc.toLocaleString("ru-RU")} урона соло (пиковый удар ~${personalDpa.toLocaleString("ru-RU")}). Бафы отряда (саппорты из витрины) добавляются в блоке «Симуляция отряда». Числа в игре выше за счёт многократных циклов ротации за бой.`,
      summaryEn: `Kit-accurate calc: full rotation deals ~${personalDpc.toLocaleString("en-US")} damage solo (peak hit ~${personalDpa.toLocaleString("en-US")}). Team buffs (showcase supports) are applied in the team simulation block. In-game numbers are higher due to multiple rotation cycles per fight.`
    };
  }
  if (isMortenax) {
    const zoneDefMult = 1e3 / (1100 * (1 - 0.3) + 1e3);
    const vulnMult = 1 + 0.5;
    const totalDmgBonus = 1 + dmg_boost / 100;
    const motionValue = 1.68;
    const personalDpa = Math.round(hp * motionValue * totalDmgBonus * critMultiplier * zoneDefMult * baseResMult * vulnMult);
    const personalDpc = Math.round(personalDpa * actionsPerCycle);
    const actionsInZone = (142.86 * spd / 1e4).toFixed(1);
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: personalDpc >= 14e4 ? "SSS" : personalDpc >= 1e5 ? "SS" : "S",

      metric1Label: isRu ? "ЛИЧНЫЙ УРОН В ЗОНЕ (DPA)" : "ZONE PERSONAL BURST (DPA)",
      metric1Value: `${personalDpa.toLocaleString("ru-RU")}`,
      metric2Label: isRu ? "СРЕЗ ЗАЩИТЫ И УЯЗВИМОСТЬ" : "DEF SHRED & VULNERABILITY",
      metric2Value: "-30% DEF • +50% УРОНА",
      metric3Label: isRu ? "ХОДОВ В ЗОНЕ (70 SPD)" : "ACTIONS IN 70 SPD ZONE",
      metric3Value: `${actionsInZone}x (${142.86.toFixed(0)} AV)`,

      personalDpa,
      personalDpc,
      personalDpaLabel: isRu ? "Средний урон навыка (168% HP)" : "Avg Skill Damage (168% HP)",
      personalDpcLabel: isRu ? "Личный урон в цикл (100 AV)" : "Personal Cycle Output (100 AV)",
      personalMetric3Label: isRu ? "Крит. масса в Зоне (+20/60)" : "Combat Crit Value (+20/60)",
      personalMetric3Value: `${(simCr * 100).toFixed(0)}% КШ / ${(simCd * 100).toFixed(0)}% КУ (${critMultiplier.toFixed(2)}x)`,

      teamDpsAmp: "+68%",
      teamUtilityBadges: [
        {
          label: isRu ? "УЗЫ ГИБЕЛИ (СВЕРХСПОСОБНОСТЬ)" : "BALEFIRE BIND (ULTIMATE)",
          value: isRu ? "-30.0% Защиты врагов (DEF Shred)" : "-30.0% Enemy DEF Shred",
          desc: isRu ? "Снижает броню всех врагов на 30%, умножая суммарный урон всего отряда на 1.25x." : "Shreds all enemies DEF by 30%, scaling whole team damage by 1.25x."
        },
        {
          label: isRu ? "СТАТУС УЯЗВИМОСТИ" : "VULNERABILITY MULTIPLIER",
          value: isRu ? "+50.0% Получаемого урона" : "+50.0% Vulnerability Taken",
          desc: isRu ? "Враги получают на 50% больше любого прямого урона, ДоТов и бонус-атак союзников." : "Enemies take 50% amplified damage from all ally direct, DoT and follow-up hits."
        },
        {
          label: isRu ? "СИНХРОНИЗАЦИЯ С ОТРЯДОМ" : "ALLY TRIGGER SYNERGY",
          value: isRu ? "Накладывает Узы с атак союзников" : "Procs Balefire on ally attacks",
          desc: isRu ? "Каждая атака союзника накладывает дебафф и накапливает стаки Неистовой ярости для Мортенакса." : "Each ally hit applies Balefire Bind and grants Charge stacks."
        },
        {
          label: isRu ? "ЭКОНОМИЯ ОЧКОВ НАВЫКОВ" : "SKILL POINT EFFICIENCY",
          value: isRu ? "0 Очков навыков (SP Free)" : "0 Skill Points (SP Free)",
          desc: isRu ? "Навык в состоянии Бесконечной ярости расходует только здоровье, оставляя все SP саппортам." : "Skill consumes HP instead of Skill Points, keeping SP positive for team."
        }
      ],
      summaryRu: `В гибридной роли Мортенакс Блейд совмещает дебафф и личный урон: обеспечивает срез защиты (-30% DEF) и статус уязвимости (+50% получаемого урона) через атаки союзников, а также наносит ~${personalDpa.toLocaleString("ru-RU")} расчётного урона за действие от запаса здоровья (${hp.toLocaleString("ru-RU")} HP).`,
      summaryEn: `In a hybrid role, Mortenax Blade combines debuffing and damage: provides -30% DEF shred and +50% vulnerability taken via ally hits while delivering ~${personalDpa.toLocaleString("en-US")} calculated damage per action scaling with ${hp.toLocaleString("en-US")} HP.`
    };
  }
  if (isWelt) {
    const totalDmgBonus = 1 + dmg_boost / 100;
    const motionValue = 2.16;
    const personalDpa = Math.round(atk * motionValue * totalDmgBonus * critMultiplier * baseDmgCoeff);
    const personalDpc = Math.round(personalDpa * actionsPerCycle);
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: personalDpc >= 9e4 ? "SS" : personalDpc >= 65e3 ? "S" : "A",
      metric1Label: isRu ? "ЛИЧНЫЙ УРОН СКИЛЛА (DPA)" : "SKILL BOUNCE BURST (DPA)",
      metric1Value: `${personalDpa.toLocaleString("ru-RU")}`,
      metric2Label: isRu ? "ЗАДЕРЖКА И ЗАМЕДЛЕНИЕ" : "DELAY & SLOW MULTIPLIER",
      metric2Value: "-10% SPD • +40% ЗАДЕРЖКА",
      metric3Label: isRu ? "ОБЩАЯ УЯЗВИМОСТЬ ВРАГА" : "ALL-DAMAGE VULNERABILITY",
      metric3Value: "+12.0% ПОЛУЧАЕМОГО УРОНА",
      personalDpa,
      personalDpc,
      personalDpaLabel: isRu ? "Урон отскоков Навыка (Мнимый)" : "Skill Bounce Imaginary Damage",
      personalDpcLabel: isRu ? "Личный урон за цикл (100 AV)" : "Personal Cycle Output (100 AV)",
      personalMetric3Label: isRu ? "Множитель крита Вельта" : "Crit Multiplier",
      personalMetric3Value: `${critMultiplier.toFixed(2)}x (${(simCr * 100).toFixed(0)}% / ${(simCd * 100).toFixed(0)}%)`,
      teamDpsAmp: "+32%",
      teamUtilityBadges: [
        {
          label: isRu ? "ЗАКЛЮЧЕНИЕ (СВЕРХСПОСОБНОСТЬ)" : "IMPRISONMENT (ULTIMATE)",
          value: isRu ? "+40.0% Задержка действия врагов" : "+40.0% Action Delay",
          desc: isRu ? "Отодвигает действие босса на 40% AV, полностью сбивая механику двойных атак." : "Delays boss actions by 40% AV, disrupting boss action order."
        },
        {
          label: isRu ? "ЗАМЕДЛЕНИЕ СКОРОСТИ" : "ENEMY SPD SLOW",
          value: isRu ? "-10.0% Базовой скорости (SPD)" : "-10.0% Base Enemy SPD",
          desc: isRu ? "Позволяет союзникам совершать на 1-2 хода больше в пределах каждого боевого цикла." : "Enables 1-2 extra team actions per cycle before enemy turn."
        },
        {
          label: isRu ? "СТАТУС ВОЗМЕЗДИЯ (ТАЛАНТ)" : "RETRIBUTION VULNERABILITY",
          value: isRu ? "+12.0% Увеличение урона по врагу" : "+12.0% Vulnerability",
          desc: isRu ? "Замедленные враги получают на 12% больше любого урона от всех союзников." : "Slowed enemies receive 12% increased damage from all party members."
        }
      ],
      summaryRu: `Вельт обеспечивает личный урон (~${personalDpa.toLocaleString("ru-RU")} за навык) и контроль поля боя: задержка действий на 40% и замедление босса на 10% создают дополнительные окна атак союзников с +12% к общему урону отряда.`,
      summaryEn: `Welt combines calculated sub-DPS (~${personalDpa.toLocaleString("en-US")} per skill) with crowd control: 40% action delay, 10% slow and +12% team vulnerability.`
    };
  }
  if (isSilverWolf) {
    const totalDmgBonus = 1 + dmg_boost / 100;
    const motionValue = 3.8;
    const personalDpa = Math.round(atk * motionValue * totalDmgBonus * critMultiplier * (1e3 / (1100 * (1 - 0.45) + 1e3)) * 0.95);
    const personalDpc = Math.round(personalDpa * (actionsPerCycle * 0.65));
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: personalDpc >= 11e4 ? "SSS" : personalDpc >= 75e3 ? "SS" : "S",
      metric1Label: isRu ? "УРОН УЛЬТЫ ВОЛЧИЦЫ (DPA)" : "ULTIMATE SINGLE BURST (DPA)",
      metric1Value: `${personalDpa.toLocaleString("ru-RU")}`,
      metric2Label: isRu ? "СРЕЗ ЗАЩИТЫ БОССА" : "TOTAL DEFENSE SHRED",
      metric2Value: "-45.0% DEF (-53% СО СТАКАМИ)",
      metric3Label: isRu ? "СРЕЗ СОПРОТИВЛЕНИЯ (RES)" : "ELEMENTAL RES PEN",
      metric3Value: "-20.0% RES УЯЗВИМОСТИ",
      personalDpa,
      personalDpc,
      personalDpaLabel: isRu ? "Точечный урон ультимейта" : "Single Target Ultimate Burst",
      personalDpcLabel: isRu ? "Личный урон за цикл (100 AV)" : "Personal Cycle Output (100 AV)",
      personalMetric3Label: isRu ? "Шанс наложения багов (ШПЭ)" : "Debuff Success Rate (EHR)",
      personalMetric3Value: `${ehr.toFixed(1)}% ШПЭ (${Math.min(100, Math.round(ehr / 67 * 100))}% надёжность)`,
      teamDpsAmp: "+58%",
      teamUtilityBadges: [
        {
          label: isRu ? "ВНЕДРЕНИЕ УЯЗВИМОСТИ (НАВЫК)" : "WEAKNESS IMPLANT (SKILL)",
          value: isRu ? "100% Внедрение + -20% RES" : "100% Implant + -20% Element RES",
          desc: isRu ? "Внедряет уязвимость стихии союзника и срезает 20% сопротивления данному элементу." : "Implants ally elemental weakness and shreds 20% resistance."
        },
        {
          label: isRu ? "ГЛОБАЛЬНЫЙ СРЕЗ ЗАЩИТЫ (УЛЬТА)" : "MASSIVE DEF SHRED (ULT)",
          value: isRu ? "-45.0% Защиты цели (DEF)" : "-45.0% Target DEF Shred",
          desc: isRu ? "Сверхспособность на 3 хода обваливает защиту босса почти вдвое, поднимая урон гиперкерри." : "Ultimate reduces enemy DEF by 45% for 3 turns, boosting hypercarry DPS by 38%."
        },
        {
          label: isRu ? "СИСТЕМА БАГОВ (ТАЛАНТ)" : "BUG INJECTION SYSTEM",
          value: isRu ? "-10% SPD • -10% ATK • -8% DEF" : "-10% SPD • -10% ATK • -8% DEF",
          desc: isRu ? "Случайные баги при каждой атаке дополнительно замедляют и ослабляют босса." : "Applies random bugs on each hit reducing speed, attack and armor."
        }
      ],
      summaryRu: `Серебряный Волк внедряет уязвимость стихии союзников (-20% RES), снижает защиту цели на -45% DEF со сверхспособности и наносит ~${personalDpa.toLocaleString("ru-RU")} расчётного урона.`,
      summaryEn: `Silver Wolf implants weakness (-20% RES), reduces target armor by 45% DEF and delivers ~${personalDpa.toLocaleString("en-US")} calculated burst.`
    };
  }
  if (isAventurine) {
    const fuaMotionValue = 1.75;
    const aventurineCr = Math.min(1, (cr + Math.min(48, Math.max(0, (def - 1600) * 0.02))) / 100);
    const aventurineCritMult = 1 + aventurineCr * (cd / 100);
    const totalDmgBonus = 1 + dmg_boost / 100;
    const personalDpa = Math.round(def * fuaMotionValue * totalDmgBonus * aventurineCritMult * baseDmgCoeff);
    const personalDpc = Math.round(personalDpa * (actionsPerCycle + 0.8));
    const shieldPerSkill = Math.round(def * 0.24 + 320);
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: def >= 4e3 ? "SSS" : def >= 3500 ? "SS" : "S",
      metric1Label: isRu ? "УРОН БОНУС-АТАКИ (DPA)" : "FOLLOW-UP DEF BURST (DPA)",
      metric1Value: `${personalDpa.toLocaleString("ru-RU")}`,
      metric2Label: isRu ? "ПРОЧНОСТЬ ЩИТА СО СКИЛЛА" : "SHIELD CAPACITY PER SKILL",
      metric2Value: `${shieldPerSkill.toLocaleString("ru-RU")} HP (КАП x2)`,
      metric3Label: isRu ? "КОМАНДНОЕ СОПРОТИВЛЕНИЕ" : "TEAM EFFECT RES BONUS",
      metric3Value: "+50.0% СОПРОТИВЛЕНИЯ ЭФФЕКТАМ",
      personalDpa,
      personalDpc,
      personalDpaLabel: isRu ? "Урон бонус-атаки (175% Защиты)" : "Follow-up Burst (175% DEF)",
      personalDpcLabel: isRu ? "Личный урон за цикл (с FUA)" : "Personal Cycle Output (with FUA)",
      personalMetric3Label: isRu ? "Боевой КШ с пассивки (макс 48%)" : "Combat Crit Rate (Max 48%)",
      personalMetric3Value: `${(aventurineCr * 100).toFixed(1)}% КШ / ${cd.toFixed(1)}% КУ`,
      teamDpsAmp: "+28%",
      teamUtilityBadges: [
        {
          label: isRu ? "КРИТ. УЯЗВИМОСТЬ (УЛЬТА)" : "CRIT VULNERABILITY (ULT)",
          value: isRu ? "+15.0% Крит. получаемого урона" : "+15.0% Crit DMG Received",
          desc: isRu ? "Статус «Мёртвая петля» увеличивает критический урон всех союзников по цели на 15%." : "Roulette status increases team Crit DMG taken by enemy by 15%."
        },
        {
          label: isRu ? "СТАКАЕМЫЙ ЩИТ УСПЕХА" : "FORTIFIED WAGER SHIELD",
          value: isRu ? `${shieldPerSkill.toLocaleString("ru-RU")} HP (до ${(shieldPerSkill * 2).toLocaleString("ru-RU")} HP)` : `${shieldPerSkill.toLocaleString("en-US")} HP (Max x2)`,
          desc: isRu ? "Щиты обновляются автоматически при бонус-атаках и стакаются до 200% исходной прочности." : "Shield refreshes passively on follow-ups and stacks up to 200% capacity."
        },
        {
          label: isRu ? "ЗАЩИТА ОТ КОНТРОЛЯ" : "EFFECT RESISTANCE AURA",
          value: isRu ? "+50.0% Сопротивления эффектам" : "+50.0% Effect RES to Team",
          desc: isRu ? "Делает всех союзников практически неуязвимыми к заморозке, оглушению и ДоТам." : "Grants massive team crowd control and debuff resistance."
        }
      ],
      summaryRu: `Авантюрин совмещает выживаемость и дополнительный урон: при защите ${def.toLocaleString("ru-RU")} даёт ~${personalDpa.toLocaleString("ru-RU")} урона за бонус-атаку, накладывает +15% крит. уязвимости и создаёт щит прочностью ${shieldPerSkill.toLocaleString("ru-RU")} HP с +50% сопротивления эффектам отряду.`,
      summaryEn: `Aventurine provides team defense and sub-DPS: generates ~${personalDpa.toLocaleString("en-US")} damage per follow-up, applies +15% crit vulnerability and maintains ~${shieldPerSkill.toLocaleString("en-US")} HP shields with +50% effect RES.`
    };
  }
  if (isPela) {
    const personalDpa = Math.round(atk * 1.8 * (1 + dmg_boost / 100) * critMultiplier * baseDmgCoeff);
    const personalDpc = Math.round(personalDpa * actionsPerCycle);
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: spd >= 155 ? "SSS" : spd >= 143 ? "SS" : "S",
      metric1Label: isRu ? "МАССОВЫЙ СРЕЗ ЗАЩИТЫ (AOE)" : "AOE DEFENSE SHRED (ULT)",
      metric1Value: "-42.0% DEF ВСЕМ ВРАГАМ",
      metric2Label: isRu ? "АПТАЙМ ДЕБАФФА ПЕЛЫ" : "DEF SHRED UPTIME (2T ROTATION)",
      metric2Value: err >= 19.4 ? "100% (2 ХОДА / УЛЬТА)" : "85% (3 ХОДА)",
      metric3Label: isRu ? "КОМАНДНЫЙ ШАНС ПОПАДАНИЯ" : "TEAM EFFECT HIT RATE AURA",
      metric3Value: "+10.0% ШПЭ ВСЕМУ ОТРЯДУ",
      personalDpa,
      personalDpc,
      personalDpaLabel: isRu ? "Ледяной урон навыка" : "Skill Ice Damage",
      personalDpcLabel: isRu ? "Личный урон за цикл (100 AV)" : "Personal Cycle Output (100 AV)",
      personalMetric3Label: isRu ? "Скорость генерации SP" : "SP Generation Frequency",
      personalMetric3Value: `+${actionsPerCycle.toFixed(2)} SP / цикл (${spd.toFixed(1)} SPD)`,
      teamDpsAmp: "+36%",
      teamUtilityBadges: [
        {
          label: isRu ? "ЗОНА ОБНУЛЕНИЯ (УЛЬТИМЕЙТ)" : "ZONE SUPPRESSION (ULT)",
          value: isRu ? "-40.0% - 42.0% DEF всем целям" : "-40.0% - 42.0% DEF to all enemies",
          desc: isRu ? "Снижает защиту всех врагов на поле боя, увеличивая прямой урон любого союзника на 32-36%." : "Shreds DEF for all enemies on field, boosting all team hits by 32-36%."
        },
        {
          label: isRu ? "СНЯТИЕ УСИЛЕНИЙ (НАВЫК)" : "BUFF DISPEL (SKILL)",
          value: isRu ? "Снимает 1 бафф с противника" : "Dispels 1 Enemy Buff",
          desc: isRu ? "Мгновенно нейтрализует щиты, баффы воскрешения и вампиризм элитных противников." : "Instantly removes enemy shields, revives and ATK buffs."
        },
        {
          label: isRu ? "ЭНЕРГЕТИЧЕСКАЯ РОТАЦИЯ" : "2-TURN ULT BATTERY",
          value: isRu ? "Ульта каждые 2 хода (ВЭ + Световой день)" : "2-turn Ult Rotation",
          desc: isRu ? "При верви на ВЭ генерирует ульту через базовые атаки, полностью экономя SP для гиперкерри." : "Generates Ult solely through basic ATKs with ERR rope, feeding +SP."
        }
      ],
      summaryRu: `Пела обеспечивает 100% аптайм массового среза защиты (-42% DEF AoE) для всей пачки при скорости ${spd.toFixed(1)} SPD, генерирует +SP в каждом ходе и даёт пассивные +10% ШПЭ союзникам.`,
      summaryEn: `Pela sustains 100% uptime on -42% AoE DEF shred across all enemies at ${spd.toFixed(1)} SPD while remaining fully SP positive.`
    };
  }
  if (isJiaoqiu) {
    const ashenRoastTick = Math.round(atk * 1.8 * (1 + dmg_boost / 100) * baseDmgCoeff);
    const cycleDpc = Math.round(ashenRoastTick * (actionsPerCycle + 1.5));
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: ehr >= 140 ? "SSS" : ehr >= 120 ? "SS" : "S",
      metric1Label: isRu ? "УЯЗВИМОСТЬ К УЛЬТИМЕЙТАМ" : "ULTIMATE DAMAGE VULNERABILITY",
      metric1Value: "+35.0% К УРОНУ УЛЬТ",
      metric2Label: isRu ? "ОБЩАЯ УЯЗВИМОСТЬ КО ВСЕМУ" : "GENERAL ALL-DAMAGE VULNERABILITY",
      metric2Value: "+15.0% ПОЛУЧАЕМОГО УРОНА",
      metric3Label: isRu ? "ТИК ЖАРЕНОГО НА УГЛЯХ" : "ASHEN ROAST DOT TICK",
      metric3Value: `${ashenRoastTick.toLocaleString("ru-RU")} (5 СТАКОВ)`,
      personalDpa: ashenRoastTick,
      personalDpc: cycleDpc,
      personalDpaLabel: isRu ? "Тик ДоТа (Жареное на углях)" : "Ashen Roast DoT Tick",
      personalDpcLabel: isRu ? "Урон ДоТа за цикл (с тиками врагов)" : "DoT Cycle Damage",
      personalMetric3Label: isRu ? "Шанс наложения против боссов" : "Guaranteed Debuff Rate",
      personalMetric3Value: `${ehr.toFixed(1)}% ШПЭ (${ehr >= 140 ? "100% ГАРАНТИЯ" : "НУЖНО 140%"})`,
      teamDpsAmp: "+44%",
      teamUtilityBadges: [
        {
          label: isRu ? "ПОЛЕ ПЕЧИ (УЛЬТИМЕЙТ)" : "PYRE REALM (ULTIMATE)",
          value: isRu ? "+35.0% Урона ультимейтов" : "+35.0% Ultimate DMG Amplification",
          desc: isRu ? "Главный саппорт для Ахерон: накапливает ей заряды Слэша при каждом ходе любого противника." : "Acheron BiS: feeds Slashed Dream charges whenever any enemy acts."
        },
        {
          label: isRu ? "СТАКИ «ЖАРЕНОЕ НА УГЛЯХ»" : "ASHEN ROAST STACKS",
          value: isRu ? "+15.0% Общего входящего урона" : "+15.0% All DMG Received",
          desc: isRu ? "Каждый стак повышает любой урон союзников, достигая максимума при 5 стаках." : "Each stack linearly amplifies all damage dealt by the entire party."
        }
      ],
      summaryRu: `Цзяоцю усиливает урон сверхспособностей (+35% получаемого урона ультимейтов) и даёт +15% к общему урону отряда, нанося ~${ashenRoastTick.toLocaleString("ru-RU")} урона от горения за тик.`,
      summaryEn: `Jiaoqiu amplifies ultimate damage (+35% Ult vulnerability) and adds +15% all-damage vulnerability alongside ~${ashenRoastTick.toLocaleString("en-US")} DoT ticks.`
    };
  }
  if (isGallagher || isLingsha) {
    const baseBreakLv80 = 3767.55;
    const beMultiplier = 1 + be / 100;
    const superBreakDPA = Math.round(baseBreakLv80 * (25 / 30) * beMultiplier * baseDefFactor * 1.5);
    const cycleDpc = Math.round(superBreakDPA * actionsPerCycle);
    const healPerTurn = Math.round(hp * 0.15 + 450);
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: be >= 150 ? "SSS" : be >= 100 ? "SS" : "S",
      metric1Label: isRu ? "УРОН СУПЕРПРОБИТИЯ (DPA)" : "SUPER BREAK BURST (DPA)",
      metric1Value: `${superBreakDPA.toLocaleString("ru-RU")}`,
      metric2Label: isRu ? "УЯЗВИМОСТЬ К ПРОБИТИЮ" : "BREAK DMG VULNERABILITY",
      metric2Value: isLingsha ? "+25.0% УЯЗВИМОСТИ" : "+12.0% УЯЗВИМОСТИ",
      metric3Label: isRu ? "ОТХИЛ ПРИ АТАКЕ СОЮЗНИКОВ" : "HEAL PER ALLY ATTACK",
      metric3Value: `+${healPerTurn.toLocaleString("ru-RU")} HP`,
      personalDpa: superBreakDPA,
      personalDpc: cycleDpc,
      personalDpaLabel: isRu ? "Удар суперпробития по сломанному боссу" : "Super Break Hit on Broken Boss",
      personalDpcLabel: isRu ? "Урон пробития в цикл (100 AV)" : "Personal Cycle Output (100 AV)",
      personalMetric3Label: isRu ? "Эффект пробития персонажа" : "Character Break Effect",
      personalMetric3Value: `${be.toFixed(1)}% ЭП (${be >= 150 ? "БИС ДЛЯ СУПЕРПРОБИТИЯ" : "РЕКОМЕНДУЕТСЯ 150%+"})`,
      teamDpsAmp: isLingsha ? "+34%" : "+24%",
      teamUtilityBadges: [
        {
          label: isRu ? "УЯЗВИМОСТЬ К ПРОБИТИЮ" : "BREAK DAMAGE VULNERABILITY",
          value: isRu ? isLingsha ? "+25.0% Урона пробития цели" : "+12.0% Урона пробития цели" : isLingsha ? "+25.0% Break Vulnerability" : "+12.0% Break Vulnerability",
          desc: isRu ? "Умножает весь урон Суперпробития Светлячка, Бутхилла и Раппы." : "Amplifies all Super Break hits dealt by Firefly, Boothill or Rappa."
        },
        {
          label: isRu ? "АКТИВНОЕ ОЧИЩЕНИЕ (CLEANSE)" : "TEAM DEBUFF CLEANSE",
          value: isRu ? "Снятие дебаффов со всего отряда" : "Full Team Cleanse",
          desc: isRu ? "Снимает эффекты контроля и ДоТы при каждом ходе зайца/ульте." : "Removes CC and DoTs on rabbit turns and ult casts."
        }
      ],
      summaryRu: `${isLingsha ? "Линша" : "Галлахер"} совмещает полное выживание команды с мощным саб-ДПС уроном суперпробития (~${superBreakDPA.toLocaleString("ru-RU")} за атаку) и увеличивает урон пробития союзников на ${isLingsha ? "25%" : "12%"}.`,
      summaryEn: `${isLingsha ? "Lingsha" : "Gallagher"} delivers total team sustain alongside massive Super Break sub-DPS (~${superBreakDPA.toLocaleString("en-US")} per hit) and Break vulnerability.`
    };
  }
  if (isSunday) {
    const cdTransfer = Math.round(12 + cd * 0.3);
    const teamDpsAmp = Math.round(65 + cd / 200 * 20);
    return {
      type: "SUPPORT",
      hasDualOutput: false,
      benchmarkTier: cd >= 220 && spd >= 134 ? "SSS" : cd >= 180 ? "SS" : "S",
      metric1Label: isRu ? "ПЕРЕДАЧА КРИТ. УРОНА (УЛЬТА)" : "CRIT DMG GRANT (ULTIMATE)",
      metric1Value: `+${cdTransfer.toFixed(1)}% КУ ЦЕЛИ`,
      metric2Label: isRu ? "МГНОВЕННОЕ ПРОДВИЖЕНИЕ ХОДА" : "ACTION ADVANCE PER SKILL",
      metric2Value: "100% AV (СЛЕДУЮЩИЙ ХОД)",
      metric3Label: isRu ? "ЗАЛИВКА ЭНЕРГИИ УЛЬТИМЕЙТА" : "ENERGY RECHARGE FEED",
      metric3Value: "+40 EP ЦЕЛИ (+50 С СИГНОЙ)",
      teamDpsAmp: `+${teamDpsAmp}%`,
      teamUtilityBadges: [
        {
          label: isRu ? "МГНОВЕННОЕ ПРОДВИЖЕНИЕ (НАВЫК)" : "100% ACTION ADVANCE (SKILL)",
          value: isRu ? "100% Продвижение действия" : "100% Action Advance",
          desc: isRu ? "Мгновенно передаёт ход выбранному керри или призванному существу (позволяет ходить дважды подряд)." : "Immediately advances target or summoned unit action by 100%."
        },
        {
          label: isRu ? "ПЕРЕДАЧА КРИТ. УРОНА" : "CRIT DMG CONVERSION",
          value: isRu ? `+${cdTransfer.toFixed(1)}% КУ от базы (${cd.toFixed(1)}% КУ)` : `+${cdTransfer.toFixed(1)}% CD (Sunday: ${cd.toFixed(1)}% CD)`,
          desc: isRu ? "Масштабируется от собственного КУ Сандея: 12% + 30% от его крит. урона." : "Scales from Sunday's own CD: formula 12% + 30% of his CD."
        },
        {
          label: isRu ? "УСИЛЕНИЕ УРОНА НАВЫКА" : "DIRECT DMG BOOST",
          value: isRu ? "+50.0% Урона цели (+30% призванным)" : "+50.0% Target DMG (+30% Summons)",
          desc: isRu ? "Прямой бонус к урону керри на 2 хода, продлевающийся при наличии саммонов." : "Direct bonus to hypercarry damage lasting 2 turns."
        },
        {
          label: isRu ? "ЗАЛИВКА ЭНЕРГИИ" : "ULTIMATE BATTERY",
          value: isRu ? "+40 Единиц энергии ульты" : "+40 Energy Feed to Target",
          desc: isRu ? "Заливает энергию керри, позволяя реализовывать 2-3 ходовую ротацию ультимейта." : "Restores target energy enabling consistent 2-3 turn Ult rotations."
        }
      ],
      summaryRu: `Воскресенье продвигает действие выбранного керри на 100%, передаёт +${cdTransfer.toFixed(1)}% КУ (рассчитано от собственных ${cd.toFixed(1)}% КУ), даёт +50% общего урона и восполняет 40 единиц энергии.`,
      summaryEn: `Sunday advances ally action by 100%, transfers +${cdTransfer.toFixed(1)}% Crit DMG (from ${cd.toFixed(1)}% personal CD), adds +50% DMG boost and restores 40 energy.`
    };
  }
  if (isYaoGuang) {
    const isSpeedCap = spd >= 160;
    const teamDpsAmp = isSpeedCap ? 80 : 65;
    return {
      type: "SUPPORT",
      hasDualOutput: false,
      benchmarkTier: spd >= 160 && cr >= 70 ? "SSS" : spd >= 145 ? "SS" : "S",
      metric1Label: isRu ? "ПРОДВИЖЕНИЕ ДЕЙСТВИЙ ОТРЯДА" : "TEAM ACTION ACCELERATION",
      metric1Value: isSpeedCap ? "+40.0% AV (160+ SPD)" : "+25.0% AV",
      metric2Label: isRu ? "ГЕНЕРАЦИЯ ОЧКОВ НАВЫКОВ" : "SKILL POINT GENERATION",
      metric2Value: "+4 SP ЗА РОТАЦИЮ",
      metric3Label: isRu ? "КОМАНДНАЯ КРИТ. АУРА" : "TEAM CRIT RATE & DMG AURA",
      metric3Value: "+20% КШ • +50% КУ ОТРЯДУ",
      teamDpsAmp: `+${teamDpsAmp}%`,
      teamUtilityBadges: [
        {
          label: isRu ? "СВЕРХСКОРОСТНОЕ ПРОДВИЖЕНИЕ" : "HYPERSPEED ADVANCE",
          value: isRu ? `+40% AV ускорение (${spd.toFixed(1)} SPD)` : `+40% AV advance (${spd.toFixed(1)} SPD)`,
          desc: isRu ? "При скорости 160+ даёт колоссальный буст порядка ходов отряду в нулевом цикле." : "Grants immense team action order acceleration at 160+ SPD."
        },
        {
          label: isRu ? "БАТАРЕЯ ОЧКОВ ДЕЙСТВИЙ" : "SP BATTERY SYSTEM",
          value: isRu ? "+4 Очка навыков в цикле" : "+4 SP Generated per Cycle",
          desc: isRu ? "Полностью покрывает расход SP для прожорливых ДПС вроде Дань Хэна ПЛ или Ахерон." : "Completely covers heavy SP consumption for Dan Heng IL or Acheron."
        },
        {
          label: isRu ? "КРИТИЧЕСКАЯ АУРА СВЕТА" : "CRIT RATE & DMG AURA",
          value: isRu ? "+20% Крит. шанс • +50% Крит. урон" : "+20% Crit Rate • +50% Crit DMG",
          desc: isRu ? "При соблюдении порога 70% КШ даёт мощную ауру урона для всех союзников." : "Aura granting +20% CR / +50% CD to whole team when 70% CR reached."
        }
      ],
      summaryRu: `Яо Гуан обеспечивает гиперскоростное продвижение отряда (+40% AV при скорости ${spd.toFixed(1)} SPD), генерирует +4 SP за ротацию и даёт ауру +20% КШ и +50% КУ всей команде.`,
      summaryEn: `Yao Guang delivers hyperspeed team advance (+40% AV at ${spd.toFixed(1)} SPD), feeds +4 SP per cycle and empowers team with +20% CR and +50% CD aura.`
    };
  }
  if (isRobin) {
    const atkTransfer = Math.round(atk * 0.228 + 200);
    const addDmgHit = Math.round(atk * 1.2 * (1 + cd / 100) * baseDefFactor * baseResMult);
    return {
      type: "HYBRID_SUBDPS",
      hasDualOutput: true,
      benchmarkTier: atk >= 4e3 ? "SSS" : atk >= 3500 ? "SS" : "S",
      metric1Label: isRu ? "ДОП. УРОН В КОНЦЕРТЕ (DPA)" : "ADDITIONAL CONCERT HIT (DPA)",
      metric1Value: `${addDmgHit.toLocaleString("ru-RU")} ЗА УДАР`,
      metric2Label: isRu ? "ЗАЛИВКА СИЛЫ АТАКИ ОТРЯДУ" : "TEAM ATK GRANT (CONCERT)",
      metric2Value: `+${atkTransfer.toLocaleString("ru-RU")} ATK (${atk.toLocaleString("ru-RU")} РОБИН)`,
      metric3Label: isRu ? "МАССОВОЕ ПРОДВИЖЕНИЕ ХОДА" : "TEAM ACTION ADVANCE",
      metric3Value: "100% AV ВСЕМУ ОТРЯДУ",
      personalDpa: addDmgHit,
      personalDpc: Math.round(addDmgHit * 8),

      personalDpaLabel: isRu ? "Физ. урон за каждую атаку союзника" : "Phys DMG per ally attack",
      personalDpcLabel: isRu ? "Суммарный доп. урон в Концерте" : "Total Concert DMG (8 hits)",
      personalMetric3Label: isRu ? "Сила атаки Робин" : "Robin Base Attack",
      personalMetric3Value: `${atk.toLocaleString("ru-RU")} ATK`,
      teamDpsAmp: "+65%",
      teamUtilityBadges: [
        {
          label: isRu ? "100% МАССОВОЕ ПРОДВИЖЕНИЕ" : "100% TEAM ACTION ADVANCE",
          value: isRu ? "100% Продвижение ВСЕГО отряда" : "100% Full Team Action Advance",
          desc: isRu ? "Ультимейт немедленно заставляет ходить всех трёх союзников подряд." : "Ultimate immediately advances all 3 allies to act immediately."
        },
        {
          label: isRu ? "ЗАЛИВКА СИЛЫ АТАКИ" : "TEAM ATK BOOST",
          value: isRu ? `+${atkTransfer.toLocaleString("ru-RU")} Силы атаки отряду` : `+${atkTransfer.toLocaleString("en-US")} ATK to whole team`,
          desc: isRu ? "Формула: 22.8% от силы атаки Робин + 200 ATK." : "Scales from Robin ATK: formula 22.8% ATK + 200."
        },
        {
          label: isRu ? "БУСТ ВСЕГО УРОНА И БОНУС-АТАК" : "ALL-DMG & FUA CRIT BOOST",
          value: isRu ? "+50% Урона • +25% КУ бонус-атак" : "+50% All DMG • +25% FUA Crit DMG",
          desc: isRu ? "Пассивно усиливает весь исходящий урон отряда на 50% и КУ бонус-атак на 25%." : "Passively amplifies team damage by 50% and follow-up Crit DMG by 25%."
        }
      ],
      summaryRu: `Робин объединяет мгновенное 100% продвижение хода всего отряда с колоссальной заливкой силы атаки (+${atkTransfer.toLocaleString("ru-RU")} ATK) и наносит ~${addDmgHit.toLocaleString("ru-RU")} физического урона за каждую атаку союзников.`,
      summaryEn: `Robin pairs instantaneous 100% whole-team action advance with massive +${atkTransfer.toLocaleString("en-US")} ATK transfer and ~${addDmgHit.toLocaleString("en-US")} physical sub-DPS hit on each ally attack.`
    };
  }
  if (isRuanMei) {
    const isBeCap = be >= 180;
    const teamDmgBonus = isBeCap ? 68 : Math.round(36 + be / 180 * 32);
    return {
      type: "SUPPORT",
      hasDualOutput: false,
      benchmarkTier: be >= 180 && spd >= 143 ? "SSS" : be >= 160 ? "SS" : "S",
      metric1Label: isRu ? "ЭФФЕКТИВНОСТЬ ПРОБИТИЯ" : "WEAKNESS BREAK EFFICIENCY",
      metric1Value: "+50.0% СКОРОСТИ ПРОБИТИЯ",
      metric2Label: isRu ? "ПРОБИТИЕ СОПРОТИВЛЕНИЯ (RES PEN)" : "ALL-TYPE RES PEN",
      metric2Value: "+25.0% СО СВЕРХСПОСОБНОСТИ",
      metric3Label: isRu ? "ОБЩИЙ БОНУС УРОНА ОТРЯДА" : "TEAM TOTAL DAMAGE BOOST",
      metric3Value: `+${teamDmgBonus}% УРОНА (${be.toFixed(0)}% ЭП)`,
      teamDpsAmp: "+62%",
      teamUtilityBadges: [
        {
          label: isRu ? "ЭФФЕКТИВНОСТЬ ПРОБИТИЯ" : "50% BREAK EFFICIENCY",
          value: isRu ? "+50% Эффективность истощения стойкости" : "+50% Toughness Reduction Speed",
          desc: isRu ? "Позволяет пробивать полоску уязвимости боссов в полтора раза быстрее." : "Depletes boss toughness bars 1.5x faster."
        },
        {
          label: isRu ? "ПРОБИТИЕ ВСЕХ СОПРОТИВЛЕНИЙ" : "ALL-TYPE RES PEN",
          value: isRu ? "+25.0% Пробития всех стихий" : "+25.0% All-Type RES PEN",
          desc: isRu ? "Самый редкий и мощный мультипликатор урона в HSR, игнорирующий природную защиту." : "Rarest multiplier in HSR, penetrating natural elemental resistances."
        },
        {
          label: isRu ? "ПАССИВНОЕ УСКОРЕНИЕ ОТРЯДА" : "PASSIVE TEAM SPD",
          value: isRu ? "+10.0% Скорости (SPD) отряду" : "+10.0% Team Speed Boost",
          desc: isRu ? "Даёт всей команде +10% скорости пассивно, дотягивая керри до брейкпоинтов 134/143 SPD." : "Passively adds 10% SPD to entire team, unlocking 134/143 breakpoints."
        },
        {
          label: isRu ? "ЗАТЯГИВАНИЕ ПРОБИТИЯ" : "ACTION RECOVERY DELAY",
          value: isRu ? "Задержка восстановления босса на 20% ЭП + 10%" : "Delays boss recovery by 20% BE + 10%",
          desc: isRu ? "Удерживает босса в сломанном состоянии, продлевая окно суперпробития." : "Extends broken state duration for Super Break damage windows."
        }
      ],
      summaryRu: `Жуань Мэй обеспечивает непревзойдённый универсальный бафф: +50% к скорости пробития уязвимостей, +25% пробития всех сопротивлений (RES PEN), +${teamDmgBonus}% общего урона отряда и пассивные +10% скорости.`,
      summaryEn: `Ruan Mei delivers unmatched universal amplification: +50% weakness break efficiency, +25% all-type RES PEN, +${teamDmgBonus}% team damage and passive +10% SPD.`
    };
  }
  if (isSparkle) {
    const cdTransfer = Math.round(45 + cd * 0.24);
    return {
      type: "SUPPORT",
      hasDualOutput: false,
      benchmarkTier: cd >= 220 && spd >= 160 ? "SSS" : cd >= 180 ? "SS" : "S",
      metric1Label: isRu ? "ПЕРЕДАЧА КРИТ. УРОНА" : "CRIT DMG CONVERSION",
      metric1Value: `+${cdTransfer.toFixed(1)}% КУ ЦЕЛИ`,
      metric2Label: isRu ? "ПРОДВИЖЕНИЕ ДЕЙСТВИЯ (НАВЫК)" : "ACTION ADVANCE (SKILL)",
      metric2Value: "+50.0% AV ХОДА",
      metric3Label: isRu ? "ЗАЛИВКА И КАП ОЧКОВ НАВЫКОВ" : "SP GENERATION & CAP EXPANSION",
      metric3Value: "+4 SP С УЛЬТЫ (МАКС. 7 SP)",
      teamDpsAmp: "+56%",
      teamUtilityBadges: [
        {
          label: isRu ? "ПЕРЕДАЧА КУ" : "CRIT DMG GRANT",
          value: isRu ? `+${cdTransfer.toFixed(1)}% КУ цели (от ${cd.toFixed(1)}% Искорки)` : `+${cdTransfer.toFixed(1)}% CD (Sparkle: ${cd.toFixed(1)}% CD)`,
          desc: isRu ? "Формула: 24% от КУ Искорки + 45% базового крит. урона." : "Scales from Sparkle CD: 24% of her CD + 45%."
        },
        {
          label: isRu ? "ЛИМИТ ОЧКОВ НАВЫКОВ" : "MAX SP INCREASE",
          value: isRu ? "Увеличение пула SP до 7 единиц" : "Expands SP limit to 7",
          desc: isRu ? "Увеличивает максимальный запас очков навыков с 5 до 7 и заливает 4 SP с ульты." : "Increases max SP cap from 5 to 7 and restores 4 SP per ultimate."
        },
        {
          label: isRu ? "УСИЛЕНИЕ УРОНА ОТРЯДА" : "TEAM DMG BOOST",
          value: isRu ? "+48.0% Урона отряду" : "+48.0% Team DMG Boost",
          desc: isRu ? "Усиливает весь урон союзников при расходовании очков действий." : "Amplifies damage when party members consume Skill Points."
        }
      ],
      summaryRu: `Искорка ликвидирует дефицит очков навыков (+4 SP с ульты, лимит 7 SP), продвигает действие керри на 50% и заливает колоссальные +${cdTransfer.toFixed(1)}% крит. урона.`,
      summaryEn: `Sparkle eliminates SP scarcity (+4 SP ult burst, max 7 SP cap), provides 50% action advance and feeds +${cdTransfer.toFixed(1)}% Crit DMG.`
    };
  }
  if (isBronya) {
    const cdTransfer = Math.round(20 + cd * 0.16);
    return {
      type: "SUPPORT",
      hasDualOutput: false,
      benchmarkTier: cd >= 200 && spd >= 134 ? "SSS" : cd >= 160 ? "SS" : "S",
      metric1Label: isRu ? "ПЕРЕДАЧА КРИТ. УРОНА (УЛЬТА)" : "CRIT DMG GRANT (ULTIMATE)",
      metric1Value: `+${cdTransfer.toFixed(1)}% КУ ОТРЯДУ`,
      metric2Label: isRu ? "МГНОВЕННОЕ ПРОДВИЖЕНИЕ (НАВЫК)" : "100% ACTION ADVANCE (SKILL)",
      metric2Value: "100% AV + СНЯТИЕ ДЕБАФФА",
      metric3Label: isRu ? "ПРЯМОЙ БУСТ УРОНА НАВЫКА" : "DIRECT SKILL DMG BOOST",
      metric3Value: "+66.0% УРОНА ЦЕЛИ",
      teamDpsAmp: "+52%",
      teamUtilityBadges: [
        {
          label: isRu ? "100% ПРОДВИЖЕНИЕ ХОДА" : "100% ACTION ADVANCE",
          value: isRu ? "100% AV цели + Очищение дебаффа" : "100% AV + Dispel 1 Debuff",
          desc: isRu ? "Немедленно даёт ход союзнику и снимает 1 эффект ослабления." : "Immediately grants turn to targeted ally and cleanses 1 debuff."
        },
        {
          label: isRu ? "ПЕРЕДАЧА КРИТ. УРОНА И АТАКИ" : "CRIT DMG & ATK GRANT",
          value: isRu ? `+${cdTransfer.toFixed(1)}% КУ • +55% ATK` : `+${cdTransfer.toFixed(1)}% CD • +55% ATK`,
          desc: isRu ? "Сверхспособность усиливает КУ всего отряда (16% от КУ Брони + 20%) и даёт +55% ATK." : "Ultimate grants +55% ATK and transfers 16% of Bronya CD + 20%."
        }
      ],
      summaryRu: `Броня обеспечивает мгновенное повторное действие керри (+100% AV) с очищением ослаблений, даёт +66% урона со скилла и передаёт +${cdTransfer.toFixed(1)}% КУ отряду.`,
      summaryEn: `Bronya delivers immediate ally replay (+100% AV) with debuff cleanse, +66% skill DMG boost and +${cdTransfer.toFixed(1)}% team Crit DMG.`
    };
  }
  if (isTingyun) {
    return {
      type: "SUPPORT",
      hasDualOutput: false,
      benchmarkTier: spd >= 160 && atk >= 2600 ? "SSS" : spd >= 145 ? "SS" : "S",
      metric1Label: isRu ? "ЗАЛИВКА ЭНЕРГИИ УЛЬТЫ" : "ULTIMATE ENERGY BATTERY",
      metric1Value: "+50-60 EP МГНОВЕННО",
      metric2Label: isRu ? "УСИЛЕНИЕ УРОНА ЦЕЛИ" : "TARGET DMG AMPLIFICATION",
      metric2Value: "+50.0% УРОНА НА 2 ХОДА",
      metric3Label: isRu ? "ЗАЛИВКА СИЛЫ АТАКИ" : "SKILL ATK BOOST",
      metric3Value: `+55.0% ATK (${atk.toLocaleString("ru-RU")} БАЗА)`,
      teamDpsAmp: "+45%",
      teamUtilityBadges: [
        {
          label: isRu ? "БАТАРЕЯ ЭНЕРГИИ" : "50-60 ENERGY BATTERY",
          value: isRu ? "+50 EP (+60 на Э6) цели" : "+50 EP (+60 at E6) to target",
          desc: isRu ? "Мгновенно заполняет шкалу ультимейта керри." : "Instantly recharges hypercarry energy pool."
        },
        {
          label: isRu ? "ДОПОЛНИТЕЛЬНЫЙ ЭЛЕКТРО УРОН" : "ADDITIONAL LIGHTNING DMG",
          value: isRu ? "+40% Дополнительного урона" : "+40% Additional Lightning Hit",
          desc: isRu ? "Благословлённый союзник наносит доп. урон от силы атаки Тиньъюнь." : "Blessed ally deals additional Lightning damage scaling on Tingyun ATK."
        }
      ],
      summaryRu: `Тиньъюнь выступает ключевой батарейкой отряда: мгновенно заливает 50-60 EP энергии в ультимейт ДПС, даёт +50% урона и +55% силы атаки при скорости ${spd.toFixed(1)} SPD.`,
      summaryEn: `Tingyun acts as the essential battery: feeds 50-60 energy, +50% damage boost and +55% ATK at ${spd.toFixed(1)} SPD.`
    };
  }
  if (isFuXuan) {
    const redirection = "65.0%";
    const crBonus = "+12.0% КШ ОТРЯДУ";
    const hpBonus = "+6.0% МАКС. HP";
    return {
      type: "SUSTAIN",
      hasDualOutput: false,
      benchmarkTier: hp >= 7500 && def >= 1400 ? "SSS" : hp >= 6500 ? "SS" : "S",
      metric1Label: isRu ? "ПЕРЕНАПРАВЛЕНИЕ УРОНА ОТРЯДА" : "TEAM DAMAGE REDIRECTION",
      metric1Value: `${redirection} В ФУ СЮАНЬ`,
      metric2Label: isRu ? "КОМАНДНЫЙ КРИТ. ШАНС" : "TEAM CRIT RATE AURA",
      metric2Value: crBonus,
      metric3Label: isRu ? "БЛОКИРОВКА ЭФФЕКТОВ КОНТРОЛЯ" : "CROWD CONTROL NEGATION",
      metric3Value: "100% БЛОК (МАТРИЦА)",
      teamDpsAmp: "+22%",
      teamUtilityBadges: [
        {
          label: isRu ? "МАТРИЦА ПРОВИДЕНИЯ" : "MATRIX OF PRESCIENCE",
          value: isRu ? "65% Урона союзников перенаправляется на Фу Сюань" : "65% ally damage redirected to Fu Xuan",
          desc: isRu ? "Полностью предотвращает ваншоты союзников боссами MoC 12." : "Prevents any ally one-shots from MoC 12 bosses."
        },
        {
          label: isRu ? "КРИТИЧЕСКИЙ БАФФ" : "TEAM CRIT RATE BUFF",
          value: isRu ? "+12.0% КШ • +6.0% Макс. HP" : "+12.0% Crit Rate • +6.0% Max HP",
          desc: isRu ? "Пока активна Матрица, весь отряд получает +12% крит. шанса пассивно." : "Grants passive +12% CR to whole party while Matrix is active."
        },
        {
          label: isRu ? "ИММУНИТЕТ К КОНТРОЛЮ" : "100% CC IMMUNITY",
          value: isRu ? "1 Блокировка контроля на активацию" : "1 CC Block per Matrix Refresh",
          desc: isRu ? "Игнорирует заморозку, оглушение или подчинение союзников." : "Negates stun, freeze or dominate once per Matrix cast."
        }
      ],
      summaryRu: `Фу Сюань делает отряд практически неуязвимым: перенаправляет на себя 65% входящего урона, блокирует эффекты контроля и даёт команде +12% крит. шанса и +6% HP при собственном запасе ${hp.toLocaleString("ru-RU")} HP.`,
      summaryEn: `Fu Xuan guarantees team survivability: redirects 65% of all damage, negates crowd control and grants +12% Crit Rate to party at ${hp.toLocaleString("en-US")} HP.`
    };
  }
  switch (archetype) {
    case "BREAK_DPS": {
      const baseBreakLv80 = 3767.55;
      const beMultiplier = 1 + be / 100;
      const superBreakDPA = Math.round(baseBreakLv80 * (30 / 30) * beMultiplier * baseDefFactor * 1.5);
      const totalDPC = Math.round(superBreakDPA * actionsPerCycle);
      return {
        type: "DAMAGE",
        hasDualOutput: false,
        metric1Label: isRu ? "УРОН СУПЕРПРОБИТИЯ (DPA)" : "SUPER BREAK HIT (DPA)",
        metric1Value: `${superBreakDPA.toLocaleString("ru-RU")}`,
        metric2Label: isRu ? "DPS ЗА ЦИКЛ (100 AV)" : "CYCLE DPS (100 AV)",
        metric2Value: `${totalDPC.toLocaleString("ru-RU")}`,
        metric3Label: isRu ? "ЧАСТОТА ХОДОВ В ЦИКЛЕ" : "ACTIONS PER CYCLE",
        metric3Value: `${actionsPerCycle.toFixed(2)}x (${actionsPerCycle0.toFixed(2)}x в Цикле 0)`,
        summaryRu: `Симуляция против босса MoC 12 (90 ур.): суперпробитие наносит ~${superBreakDPA.toLocaleString("ru-RU")} урона за действие при ${be.toFixed(0)}% ЭП.`,
        summaryEn: `Simulated vs MoC 12 Lv.90 Boss: Super Break deals ~${superBreakDPA.toLocaleString("en-US")} per hit at ${be.toFixed(0)}% BE.`,
        benchmarkTier: totalDPC >= 28e4 ? "SSS" : totalDPC >= 2e5 ? "SS" : totalDPC >= 14e4 ? "S" : "A"
      };
    }
    case "DOT_DPS": {
      const dotMultiplier = 2.4;
      const totalDmgBonus = 1 + dmg_boost / 100;
      const ehrFactor = Math.min(1, (1 + ehr / 100) * 0.65);
      const dotTick = Math.round(atk * dotMultiplier * totalDmgBonus * baseDmgCoeff * ehrFactor);
      const dotDPC = Math.round(dotTick * (actionsPerCycle + 1));
      return {
        type: "DAMAGE",
        hasDualOutput: false,
        metric1Label: isRu ? "ТИК ДОТА (DPA)" : "DOT TICK (DPA)",
        metric1Value: `${dotTick.toLocaleString("ru-RU")}`,
        metric2Label: isRu ? "УРОН ЗА ЦИКЛ С ДЕТОНАЦИЕЙ" : "CYCLE DAMAGE W/ DETONATION",
        metric2Value: `${dotDPC.toLocaleString("ru-RU")}`,
        metric3Label: isRu ? "ШАНС НАЛОЖЕНИЯ (ПРОТИВ 40% СЭ)" : "HIT CHANCE (VS 40% RES)",
        metric3Value: `${(ehrFactor * 100).toFixed(1)}%`,
        summaryRu: `Периодический урон боссу: ~${dotTick.toLocaleString("ru-RU")} за срабатывание. При детонациях суммарно ~${dotDPC.toLocaleString("ru-RU")} в цикл.`,
        summaryEn: `Boss DoT tick: ~${dotTick.toLocaleString("en-US")} per proc. Aggregated cycle output ~${dotDPC.toLocaleString("en-US")}.`,
        benchmarkTier: dotDPC >= 22e4 ? "SSS" : dotDPC >= 16e4 ? "SS" : dotDPC >= 11e4 ? "S" : "A"
      };
    }
    case "PRESERVATION_DEF":
    case "PRESERVATION_HP": {
      const shieldPerSkill = Math.round(def * 0.24 + 320);
      const teamEhpMultiplier = ((1 + def / 1200) * 1.45).toFixed(2);
      return {
        type: "SUSTAIN",
        hasDualOutput: false,
        metric1Label: isRu ? "ПРОЧНОСТЬ ЩИТА СО СКИЛЛА" : "SHIELD CAPACITY PER SKILL",
        metric1Value: `${shieldPerSkill.toLocaleString("ru-RU")} HP`,
        metric2Label: isRu ? "ЭФФЕКТИВНАЯ ЖИВУЧЕСТЬ ОТРЯДА" : "TEAM EFFECTIVE HP (EHP)",
        metric2Value: `${teamEhpMultiplier}x БАЗЫ`,
        metric3Label: isRu ? "ЧАСТОТА ОБНОВЛЕНИЯ ЩИТА" : "SHIELD REFRESH RATE",
        metric3Value: `${actionsPerCycle.toFixed(2)}x в цикл (${spd.toFixed(1)} SPD)`,
        summaryRu: `Защитный барьер: генерирует ${shieldPerSkill.toLocaleString("ru-RU")} прочности за ход, увеличивая выживаемость команды в ${teamEhpMultiplier} раза.`,
        summaryEn: `Protective Barrier: provides ${shieldPerSkill.toLocaleString("en-US")} shield capacity per action, multiplying team EHP by ${teamEhpMultiplier}x.`,
        benchmarkTier: def >= 4e3 ? "SSS" : def >= 3500 ? "SS" : "S"
      };
    }
    case "ABUNDANCE_HEAL":
    case "ABUNDANCE_HP":
    case "ABUNDANCE_BREAK": {
      const isLuochaChar = charId === "1203" || name.includes("лоча") || name.includes("luocha");
      const healPerTurn = isLuochaChar ? Math.round(atk * 0.6 + 800) : Math.round(hp * 0.12 + 180);
      const teamCleanseRate = isLuochaChar ? "100% (АВТОМАТИЧЕСКИ)" : spd >= 145 ? "100% (КАЖДЫЙ ХОД)" : "80% (ПО ТРЕБОВАНИЮ)";
      return {
        type: "SUSTAIN",
        hasDualOutput: false,
        metric1Label: isRu ? "ЛЕЧЕНИЕ ЗА ДЕЙСТВИЕ" : "HEAL PER ACTION",
        metric1Value: `+${healPerTurn.toLocaleString("ru-RU")} HP`,
        metric2Label: isRu ? isLuochaChar ? "АВТОМАТИЧЕСКИЙ ОТХИЛ И СНЯТИЕ" : "ГОТОВНОСТЬ СНЯТИЯ ОСЛАБЛЕНИЙ" : isLuochaChar ? "AUTO-HEAL & CLEANSE" : "CLEANSE READINESS",
        metric2Value: teamCleanseRate,
        metric3Label: isRu ? isLuochaChar ? "ГЕНЕРАЦИЯ SP В ЦИКЛЕ" : "СКОРОСТЬ ВОССТАНОВЛЕНИЯ" : isLuochaChar ? "SP GENERATION IN CYCLE" : "RECOVERY FREQUENCY",
        metric3Value: isLuochaChar ? `+${actionsPerCycle.toFixed(2)} SP / цикл (${spd.toFixed(1)} SPD)` : `${actionsPerCycle.toFixed(2)}x ходов в цикл (${spd.toFixed(1)} SPD)`,
        summaryRu: isLuochaChar ? `Лоча (Изобилие) против босса MoC 12: мгновенно лечит союзников с HP < 50% без расхода очков навыков (~${healPerTurn.toLocaleString("ru-RU")} HP за срабатывание), снимает баффы с противников ультимейтом и генерирует стабильные +SP.` : `Исцеление: восстанавливает ~${healPerTurn.toLocaleString("ru-RU")} HP за действие и надёжно удерживает здоровье отряда выше 90%.`,
        summaryEn: isLuochaChar ? `Luocha (Abundance) vs MoC 12 Boss: auto-heals allies below 50% HP without SP cost (~${healPerTurn.toLocaleString("en-US")} HP per proc), strips boss buffs with ultimate and remains fully SP positive.` : `Sustain Healing: restores ~${healPerTurn.toLocaleString("en-US")} HP per turn, maintaining team above 90% HP.`,
        benchmarkTier: (isLuochaChar ? atk >= 2800 : hp >= 5500) && spd >= 134 ? "SSS" : spd >= 120 ? "SS" : "S"
      };
    }
    case "HP_CRIT_DPS":
    case "CRIT_DPS":
    default: {
      const isHpScale = archetype === "HP_CRIT_DPS";
      const scalingStat = Math.max(1200, isHpScale ? hp : atk);
      const isHimekoChar = charId === "1003" || name.includes("химеко") || name.includes("himeko") || name.includes("нова") || name.includes("nova");
      const effectiveCr = isHimekoChar ? Math.min(1, simCr + 0.15) : simCr;
      const effectiveCritMult = 1 + effectiveCr * simCd;
      const motionValue = isHimekoChar ? 2.8 : 2.4;
      const totalDmgBonus = 1 + (dmg_boost + (isHimekoChar ? 20 : 0)) / 100;
      const dpa = Math.round(scalingStat * motionValue * totalDmgBonus * effectiveCritMult * baseDmgCoeff);
      const effectiveActions = isHimekoChar ? actionsPerCycle + 1.2 : actionsPerCycle;
      const dpc = Math.round(dpa * effectiveActions);
      return {
        type: "DAMAGE",
        hasDualOutput: false,
        metric1Label: isRu ? isHimekoChar ? "УРОН НАВЫКА / УЛЬТЫ (DPA)" : "СРЕДНИЙ УРОН ЗА УДАР (DPA)" : isHimekoChar ? "SKILL / ULT BURST (DPA)" : "AVG DAMAGE PER HIT (DPA)",
        metric1Value: `${dpa.toLocaleString("ru-RU")}`,
        metric2Label: isRu ? isHimekoChar ? "DPS ЗА ЦИКЛ (С ПОБЕДНЫМ КУРАЖОМ)" : "DPS ЗА ЦИКЛ (100 AV)" : isHimekoChar ? "CYCLE DPS (W/ VICTORY RUSH)" : "CYCLE DPS (100 AV)",
        metric2Value: `${dpc.toLocaleString("ru-RU")}`,
        metric3Label: isRu ? isHimekoChar ? "КРИТ. МНОЖИТЕЛЬ (+15% КШ ПАССИВКА)" : "ОЖИДАЕМЫЙ МНОЖИТЕЛЬ КРИТА" : isHimekoChar ? "CRIT MULTIPLIER (+15% CR PASSIVE)" : "EXPECTED CRIT MULTIPLIER",
        metric3Value: `${effectiveCritMult.toFixed(2)}x (${(effectiveCr * 100).toFixed(0)}% / ${(simCd * 100).toFixed(0)}%)`,
        summaryRu: isHimekoChar ? `Химеко (включая Нову) против босса MoC 12: наносит ~${dpa.toLocaleString("ru-RU")} с навыка и сверхспособности, а с учётом бонус-атак Победного куража (Victory Rush) суммарный урон за цикл достигает ~${dpc.toLocaleString("ru-RU")} при боевом множителе крита ${effectiveCritMult.toFixed(2)}x.` : `Симуляция боя против босса MoC 12: средний удар наносит ~${dpa.toLocaleString("ru-RU")}, суммарный урон за цикл ~${dpc.toLocaleString("ru-RU")} при множителе крита ${critMultiplier.toFixed(2)}x.`,
        summaryEn: isHimekoChar ? `Himeko (including Nova) vs MoC 12 Boss: deals ~${dpa.toLocaleString("en-US")} per skill/ultimate, scaling to ~${dpc.toLocaleString("en-US")} cycle output including Victory Rush follow-up attacks at ${effectiveCritMult.toFixed(2)}x crit expectation.` : `Simulated vs MoC 12 Boss: average attack delivers ~${dpa.toLocaleString("en-US")}, totaling ~${dpc.toLocaleString("en-US")} per cycle at ${critMultiplier.toFixed(2)}x crit expectation.`,
        benchmarkTier: dpc >= 5e4 ? "SSS" : dpc >= 35e3 ? "SS" : dpc >= 22e3 ? "S" : dpc >= 14e3 ? "A" : "B"
      };
    }
  }
}
