import approvedTeams from "../data/approvedTeams.json";
import { TEAMS_47 } from "../data/teams47.js";
export const CHARACTER_SQUADS = {
  ...approvedTeams.teamsByCharacter,
  ...TEAMS_47,
};

// Типові E0S1 кінцеві стати саппортів мети 4.7 — використовуються, коли союзника немає у витрині,
// щоб відряд все одно отримував реалістичні бафи (замість нулів).
export function rankSquadsByShowcase(squads, showcaseCharacters = []) {
  const roster = Array.isArray(showcaseCharacters) ? showcaseCharacters : [];
  if (!Array.isArray(squads) || squads.length < 2 || !roster.length) return squads || [];
  const showcasedIds = new Set(roster.map((character) => String(character.id || "")));
  return squads
    .map((squad, sourceOrder) => ({
      squad,
      sourceOrder,
      rosterMatches: (squad.teammates || []).filter((teammate) => showcasedIds.has(String(teammate.id || ""))).length
    }))
    .sort((a, b) => b.rosterMatches - a.rosterMatches || a.sourceOrder - b.sourceOrder)
    .map(({ squad }) => squad);
}
const SUPPORT_DEFAULT_STATS = {
  "1313": { atk: 3100, def: 1400, hp: 12000, cr: 5, cd: 170, be: 0 },   // Воскресенье
  "1309": { atk: 3300, def: 1600, hp: 13000, cr: 5, cd: 130, be: 0 },   // Зарянка
  "1306": { atk: 3200, def: 1400, hp: 12000, cr: 5, cd: 150, be: 0 },   // Искорка
  "1303": { atk: 2900, def: 1600, hp: 13000, cr: 5, cd: 100, be: 160 }, // Жуань Мэй
  "1304": { atk: 1500, def: 3200, hp: 14000, cr: 5, cd: 100, be: 0 },   // Авантюрин
  "1208": { atk: 1000, def: 1800, hp: 16800, cr: 5, cd: 100, be: 0 },   // Фу Сюань
  "1225": { atk: 2700, def: 1200, hp: 12000, cr: 5, cd: 100, be: 280 }, // Фуга
  "1403": { atk: 3000, def: 1400, hp: 14000, cr: 5, cd: 130, be: 0 },   // Трибби
  "1512": { atk: 3300, def: 1600, hp: 13000, cr: 5, cd: 130, be: 0 },   // Зарянка: Яснопея
  "1217": { atk: 2900, def: 1400, hp: 13000, cr: 5, cd: 100, be: 0 },   // Хохо
  "1414": { atk: 2400, def: 2000, hp: 14000, cr: 5, cd: 100, be: 0 },   // Дань Хэн • Освободитель Пустошей
  "1409": { atk: 2600, def: 1500, hp: 13500, cr: 5, cd: 110, be: 0 },   // Гиацина
  "1513": { atk: 3200, def: 1400, hp: 12000, cr: 80, cd: 160, be: 0 },   // Авантюрин: Прибой
  "1408": { atk: 2800, def: 1400, hp: 12000, cr: 70, cd: 140, be: 0 },   // Яо Гуан
  "1501": { atk: 2600, def: 1400, hp: 12000, cr: 10, cd: 150, be: 0 },   // Искра (Спаркси)
  "1514": { atk: 3300, def: 1400, hp: 12000, cr: 60, cd: 160, be: 0 },   // Аха (Aha)
  "1503": { atk: 1200, def: 3200, hp: 13000, cr: 10, cd: 100, be: 0 },   // Жемчуг (Pearl)
  "8007": { atk: 2800, def: 1400, hp: 12000, cr: 60, cd: 130, be: 0 },   // Первопроходец: Радость
  "1006": { atk: 3400, def: 1400, hp: 12000, cr: 100, cd: 180, be: 0 }   // Серебряный Волк ур. 999
};

// Stat-dependent бафы саппорта: считаются от реальных статов из витрины,
// а при отсутствии союзника в витрине — от SUPPORT_DEFAULT_STATS (типичный E0S1).
function computeSupportBuffs(rec, s = {}) {
  const id = String(rec.id || "");
  const buffs = { ...rec.buffValues };
  const tag = `${rec.nameRu || ""} ${rec.nameEn || ""}`.toLowerCase();
  let descRu = null;
  let descEn = null;
  const num = (v) => (typeof v === "number" ? v : 0);

  if (id === "1514" || tag.includes("аха") || tag.includes("aha")) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 65);
    buffs.resPen = Math.max(num(buffs.resPen), 25);
    buffs.allVuln = Math.max(num(buffs.allVuln), 30);
    descRu = `Эон Радости 4.7 (Аха): статус «Эманатор Радости», срез Max HP боссов, +65% урон Радости, +30% уязвимость`;
    descEn = `4.7 Elation Aeon (Aha): «Emanator of Elation» status, Boss Max HP reduction, +65% Elation DMG, +30% Vuln`;
  } else if (id === "1503" || tag.includes("жемчуг") || tag.includes("pearl")) {
    buffs.teamShield = true;
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 25);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 30);
    descRu = `Лучший сустейн Радости (Жемчуг): заряды «Настоящий хит», блокировка урона, лечение от ЗАЩ, продвижение действий`;
    descEn = `Best 4.7 Elation Sustain (Pearl): «Real Hit» stacks, incoming DMG block, DEF-based heals, action advance`;
  } else if (id === "1513" || tag.includes("прибой") || tag.includes("waveflair")) {
    buffs.critVuln = Math.max(num(buffs.critVuln), 15);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 40);
    buffs.elationBuff = 100;
    descRu = `Радость 4.7: комбо-атаки Радости, след «Revel in Surging Waves» (+100% статов Радости), +15% крит. уязвимости цели, фаза Aha Instant`;
    descEn = `4.7 Elation: coordinated Elation strikes, «Revel in Surging Waves» (+100% Elation stats), +15% Crit Vuln, Aha Instant phase`;
  } else if (id === "1408" || tag.includes("яо") || tag.includes("yao")) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.resPen = Math.max(num(buffs.resPen), 25);
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 35);
    descRu = `Премиум Саппорт Радости 4.7: +25% All-Type RES PEN, синхронный навык Радости, мгновенный вход в Invincible Player`;
    descEn = `Premier 4.7 Elation Support: +25% All-Type RES PEN, simultaneous team Elation skill, instant Invincible Player charge`;
  } else if (id === "1501" || tag.includes("спаркси") || tag.includes("sparxie") || (tag.includes("искра") && !tag.includes("искорка"))) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 50);
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 30);
    descRu = `Саппорт Радости 4.7: триггер Mystery Boxes, механика Thrill, генерация SP Радости, сет «Миг радости бога», +50% урон`;
    descEn = `4.7 Elation Support: Mystery Box procs, Thrill mechanic, Elation SP battery, Moment of Joy synergy, +50% DMG`;
  } else if (id === "8007" || id === "8008" || tag.includes("гг") || tag.includes("первопроходец") || tag.includes("trailblazer")) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 30);
    descRu = `Радость 4.7: статус «Certified Banger», генерация Панчлайнов, +50% урон Радости всему отряду`;
    descEn = `4.7 Elation: «Certified Banger» status, Punchline generation, +50% team Elation DMG`;
  } else if (id === "1313" || tag.includes("воскресенье") || tag.includes("sunday")) {
    const cd = num(s.cd) || 170;
    const cdGrant = parseFloat((12 + cd * 0.3).toFixed(1));
    buffs.cdGrant = cdGrant;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 40);
    descRu = `100% Продвижение, передача +${cdGrant}% КУ (от реальных ${cd.toFixed(1)}% КУ), +50% Урон, +40 энергии`;
    descEn = `100% Target Advance, +${cdGrant}% Crit DMG transfer (from ${cd.toFixed(1)}% CD), +50% DMG, +40 Energy`;
  } else if (id === "1309" || id === "1512" || tag.includes("Зарянка") || tag.includes("зарянка") || tag.includes("robin")) {
    const atk = num(s.atk) || 3300;
    const atkGrant = Math.round(atk * 0.228 + 200);
    buffs.atkGrant = atkGrant;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.fuaCd = Math.max(num(buffs.fuaCd), 25);
    descRu = `100% Продвижение всего отряда, +${atkGrant} ATK (от реальных ${atk} ATK), +50% Урон, +25% КУ бонус-атак`;
    descEn = `100% Team Advance, +${atkGrant} ATK (from ${atk} ATK), +50% DMG, +25% FUA Crit DMG`;
  } else if (id === "1306" || tag.includes("искорка") || tag.includes("sparkle")) {
    const cd = num(s.cd) || 150;
    const cdGrant = parseFloat((45 + cd * 0.24).toFixed(1));
    buffs.cdGrant = cdGrant;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 48);
    descRu = `+50% Продвижение, передача +${cdGrant}% КУ (от реальных ${cd.toFixed(1)}% КУ), +48% Урон, лимит 7 SP`;
    descEn = `+50% Advance, +${cdGrant}% Crit DMG transfer (from ${cd.toFixed(1)}% CD), +48% DMG, max 7 SP`;
  } else if (id === "1303" || tag.includes("жуань") || tag.includes("ruan")) {
    const be = num(s.be) || 160;
    const dmg = be >= 180 ? 68 : Math.round(36 + (be / 180) * 32);
    buffs.dmgBoost = dmg;
    buffs.resPen = Math.max(num(buffs.resPen), 25);
    buffs.beBoost = Math.max(num(buffs.beBoost), num(buffs.breakEff), 50);
    descRu = `+50% Эффективность пробития, +25% All-Type RES PEN, +10% SPD, +${dmg}% Урон (${be.toFixed(0)}% ЭП)`;
    descEn = `+50% Break Efficiency, +25% All-Type RES PEN, +10% SPD, +${dmg}% DMG (${be.toFixed(0)}% BE)`;
  } else if ((id === "1304" || tag.includes("авантюрин")) && id !== "1513" && !tag.includes("прибой") && !tag.includes("waveflair")) {
    const def = num(s.def) || 3200;
    const crGrant = Math.min(48, Math.max(0, Math.round((def - 1600) * 0.02)));
    buffs.crGrant = crGrant;
    descRu = `Щиты отряда, +${crGrant}% КШ (от реальных ${def} ЗАЩ, пассивка «Транзитный поток»)`;
    descEn = `Team shields, +${crGrant}% CRIT Rate (from ${def} DEF, «Transit Flow» trace)`;
  } else if (id === "1208" || tag.includes("фу сюань")) {
    buffs.crGrant = Math.max(num(buffs.crGrant), 12);
    descRu = `Матрица Предзнаменования: +12% КШ всем союзникам, снижение входящего урона`;
    descEn = `Matrix of Prescience: +12% CRIT Rate to all allies, incoming DMG reduction`;
  } else if (id === "1225" || tag.includes("фуга")) {
    buffs.beBoost = Math.max(num(buffs.beBoost), 50);
    descRu = `+50% Эффективность пробития отряда, Экзо-пробитие (снижение стойкости)`;
    descEn = `+50% team Break Effect, Exo-Toughness (toughness reduction)`;
  } else if (id === "1403" || tag.includes("трибби")) {
    buffs.allVuln = Math.max(num(buffs.allVuln), 24);
    descRu = `+24% получаемого урона всеми типами (Королева Барбели), -10% DEF при ЭП-пробитии`;
    descEn = `+24% All-Type vulnerability (Queen Barbel), -10% DEF on BE break`;
  } else if (id === "1505" || tag.includes("георгина") || tag.includes("dahlia")) {
    buffs.superBreakFactor = 1.8;
    buffs.beBoost = Math.max(num(buffs.beBoost), 60);
    buffs.breakEff = Math.max(num(buffs.breakEff), 50);
    descRu = `Ключевой брейк-саппорт 4.7: разгон суперпробития (1.8×), +${buffs.beBoost}% ЭП отряду, +50% эффективность стойкости`;
    descEn = `Premier 4.7 Break Support: Super Break multiplier (1.8×), +${buffs.beBoost}% BE to team, +50% Break Efficiency`;
  } else if (id === "1409" || tag.includes("гиацина") || tag.includes("hyacine")) {
    buffs.crGrant = Math.max(num(buffs.crGrant), 12);
    buffs.teamShield = true;
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 20);
    descRu = `Сохранение 4.7: надёжные щиты, исцеление, +12% КШ команде, +20 энергии`;
    descEn = `4.7 Sustain: reliable shields, heals, +12% CRIT Rate to team, +20 energy`;
  } else if (id === "1217" || tag.includes("хохо") || tag.includes("huohuo")) {
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 20);
    buffs.atkGrant = Math.max(num(buffs.atkGrant), 1200);
    descRu = `Сустейн (Хохо): заливка +20% энергии отряду, бафф +40% ATK, непрерывное снятие ослаблений`;
    descEn = `Sustain (Huohuo): +20% team energy regen, +40% ATK boost, continuous cleanse`;
  } else if (id === "1414" || tag.includes("освободитель") || tag.includes("permansor")) {
    buffs.teamShield = true;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 20);
    descRu = `Сохранение 4.7 (Дань Хэн • Освободитель Пустошей): мощные командные щиты, снижение входящего урона, защита от ваншотов`;
    descEn = `4.7 Preservation (Dan Heng • Permansor Terrae): strong team shields, damage reduction, one-shot protection`;
  } else if (id === "1507" || tag.includes("мортенакс") || tag.includes("mortenax")) {
    buffs.allVuln = Math.max(num(buffs.allVuln), 50);
    buffs.defShred = Math.max(num(buffs.defShred), 30);
    descRu = `Нихилия 4.7 (Зона Balefire Bind): +50% уязвимости всех типов, -30% DEF, генератор зарядов при действии каждого союзника`;
    descEn = `4.7 Nihility (Balefire Bind Zone): +50% All-Type vulnerability, -30% DEF, charge generator on every ally action`;
  } else if (id === "1508" || tag.includes("рин тосака") || tag.includes("rin tohsaka")) {
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 30);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 40);
    descRu = `Fate Саппорт: заливка +30 энергии, генерация монет, +40% урон навички`;
    descEn = `Fate Support: +30 energy feed, coins, +40% Skill DMG`;
  } else if (id === "1006" || tag.includes("999")) {
    buffs.defShred = Math.max(num(buffs.defShred), 45);
    buffs.allVuln = Math.max(num(buffs.allVuln), 20);
    descRu = `Радость 4.7: взрывной урон Радости, -45% DEF, +20% уязвимости, механика Топового лутбокса`;
    descEn = `4.7 Elation: Elation burst, -45% DEF, +20% Vuln, Top Loot Box mechanics`;
  }
  return { buffs, descRu, descEn };
}

export function matchSquadWithShowcase(squad, showcaseCharacters = [], lang = "ru") {
  if (!squad || !Array.isArray(squad.teammates)) return [];
  return squad.teammates.map((rec) => {
    const matchedChar = (showcaseCharacters || []).find((c) => {
      const cId = String(c.id || "");
      const recId = String(rec.id || "");
      // Showcase stats are valid only for the exact character ID. Similar roles,
      // aliases and alternate versions do not imply equivalent kits or gear.
      return cId === recId;
    });
    const isRu = lang === "ru";
    const fallbackName = isRu ? rec.nameRu || rec.names?.[0] || "Союзник" : rec.nameEn || rec.names?.[1] || rec.names?.[0] || "Teammate";
    const characterName = matchedChar?.name || fallbackName;
    const characterIcon = matchedChar?.avatar?.icon || matchedChar?.icon || rec.icon || (rec.id ? `icon/character/${rec.id}.png` : null);
    if (matchedChar) {
      const baseMap = {};
      (matchedChar.attributes || []).forEach((a) => {
        baseMap[a.field] = a;
      });
      const addMap = {};
      (matchedChar.additions || []).forEach((a) => {
        addMap[a.field] = a;
      });
      const getStat = (field) => (baseMap[field]?.value || 0) + (addMap[field]?.value || 0);
      const realHp = Math.round(getStat("hp"));
      const realAtk = Math.round(getStat("atk"));
      const realDef = Math.round(getStat("def"));
      const realSpd = parseFloat(getStat("spd").toFixed(1));
      const realCr = parseFloat((getStat("crit_rate") * 100).toFixed(1));
      const realCd = parseFloat((getStat("crit_dmg") * 100).toFixed(1));
      const realBe = parseFloat(((addMap["break_dmg"]?.value || 0) * 100).toFixed(1));
      const realEhr = parseFloat(((addMap["effect_hit"]?.value || 0) * 100).toFixed(1));
      const computed = computeSupportBuffs(rec, {
        atk: realAtk, def: realDef, hp: realHp, spd: realSpd, cr: realCr, cd: realCd, be: realBe, ehr: realEhr
      });
      const dynamicBuffs = { ...computed.buffs };
      let dynamicBuffDescRu = computed.descRu || rec.buffDescRu;
      let dynamicBuffDescEn = computed.descEn || rec.buffDescEn;

      // Проверка планарного сета 329 («Миг радости бога») на союзнике из витрины
      const hasSet329 = (matchedChar.relic_sets || []).some(
        (rs) => rs.id === "329" || /Миг радости|Moment of Joy|329/i.test(rs.name || "")
      );
      if (hasSet329) {
        dynamicBuffs.teamAdvance = Math.max(Number(dynamicBuffs.teamAdvance) || 0, 40);
        dynamicBuffs.teamSpd = (Number(dynamicBuffs.teamSpd) || 0) + 6;
        dynamicBuffDescRu += isRu ? " • Сет 329: +6% СКОР, 40% продвижение действия" : " • Set 329: +6% SPD, 40% action advance";
        dynamicBuffDescEn += " • Set 329: +6% SPD, 40% action advance";
      }
      return {
        ...rec,
        matchedChar,
        characterName,
        characterIcon,
        isEquippedInShowcase: true,
        realStats: {
          hp: realHp,
          atk: realAtk,
          def: realDef,
          spd: realSpd,
          cr: realCr,
          cd: realCd,
          be: realBe,
          ehr: realEhr
        },
        dynamicBuffs,
        dynamicBuffDescRu,
        dynamicBuffDescEn
      };
    }
    const defaults = SUPPORT_DEFAULT_STATS[String(rec.id || "")];
    const defaultStats = defaults || { atk: 3000, def: 1600, hp: 13000, cr: 5, cd: 120, be: 100 };
    const computed = computeSupportBuffs(rec, defaultStats);
    return {
      ...rec,
      matchedChar: null,
      characterName,
      characterIcon,
      isEquippedInShowcase: false,
      realStats: null,
      defaultStats,
      dynamicBuffs: computed.buffs,
      dynamicBuffDescRu: (computed.descRu || rec.buffDescRu) + (lang === "ru" ? " (типовые E0S1, союзник не у витрины)" : " (typical E0S1, teammate not in showcase)"),
      dynamicBuffDescEn: (computed.descEn || rec.buffDescEn) + " (typical E0S1, teammate not in showcase)"
    };
  });
}
