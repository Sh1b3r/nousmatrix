// Public, versioned damage-board definitions. A scenario may be published only
// when every player is evaluated against the same character investment, team,
// enemy wave and cycle assumption. This deliberately follows the Akasha model:
// a result is meaningful only inside the named scenario.

const ACHERON_E0S1_MORTENAX_WELT_HUOHUO = {
  id: "acheron-e0s1-mortenax-welt-huohuo-moc12-v1",
  status: "published",
  gameVersion: "4.7",
  calculationVersion: "damage-cycle-v1",
  characterId: "1308",
  nameRu: "Ахерон E0S1 — Мортенакс Блэйд · Вельт · Хохо",
  nameEn: "Acheron E0S1 — Mortenax Blade · Welt · Huohuo",
  metricRu: "Расчётный урон полного цикла",
  metricEn: "Standardized full-cycle damage",
  methodologyRu: "Сравниваются только Ахерон E0 с сигнатурным конусом S1, уровнем 80 и прокачанными основными навыками. Союзники и их баффы фиксированы; урон рассчитывается по одной и той же волне Воспоминаний хаоса 4.7. Это сценарный расчёт для сравнения реликвий, а не запись живого боя.",
  methodologyEn: "Only level 80 E0 Acherons with the S1 signature Light Cone and levelled core skills are compared. Allies and their buffs are fixed; damage uses the same Memory of Chaos 4.7 wave. This is a scenario calculation for comparing relics, not a recorded live battle.",
  requirements: {
    characterLevel: 80,
    eidolon: 0,
    lightCone: { id: "23024", superimposition: 1, level: 80 },
    coreSkillLevels: { BPSkill: 10, Ultra: 10, Talent: 10 }
  },
  // The target is pinned by the 4.7 game-data snapshot, not the current date.
  enemy: {
    mode: "moc",
    enemyDataReferenceDate: "2026-11-22",
    enemySide: 1,
    enemyStageIndex: -1,
    enemyWaveIndex: -1
  },
  teammates: [
    {
      id: "1507",
      nameRu: "Мортенакс Блэйд",
      nameEn: "Mortenax Blade",
      names: ["Мортенакс Блэйд", "Mortenax Blade"],
      roleRu: "Дебафф / усилитель",
      roleEn: "Debuffer / amplifier",
      // Balefire Bind in the fixed Zone window: -30% DEF and +50% DMG taken.
      dynamicBuffs: { defShred: 30, allVuln: 50 },
      dynamicBuffDescRu: "Зона Мортенакса: −30% ЗАЩ и +50% получаемого урона у врагов.",
      dynamicBuffDescEn: "Mortenax Zone: −30% enemy DEF and +50% DMG Taken."
    },
    {
      id: "1004",
      nameRu: "Вельт",
      nameEn: "Welt",
      names: ["Вельт", "Welt"],
      roleRu: "Небытие / усилитель",
      roleEn: "Nihility / amplifier",
      // Fixed fully-ramped scenario assumption, stated in the public guide.
      dynamicBuffs: { defShred: 40, dmgBoost: 100 },
      dynamicBuffDescRu: "Вельт: фиксированное полностью разогнанное окно −40% ЗАЩ и +100% урона.",
      dynamicBuffDescEn: "Welt: fixed fully-ramped window with −40% DEF and +100% DMG."
    },
    {
      id: "1217",
      nameRu: "Хохо",
      nameEn: "Huohuo",
      names: ["Хохо", "Huohuo"],
      roleRu: "Исцеление / АТК",
      roleEn: "Healing / ATK",
      dynamicBuffs: { atkPercent: 40 },
      dynamicBuffDescRu: "Сверхспособность Хохо: +40% АТК.",
      dynamicBuffDescEn: "Huohuo Ultimate: +40% ATK."
    }
  ],
  sources: [
    {
      title: "Acheron Build Guide — Prydwen",
      url: "https://www.prydwen.gg/star-rail/characters/acheron",
      retrievedAt: "2026-11-22",
      use: "kit, Mortenax/Welt synergy and fixed-window assumptions"
    },
    {
      title: "TurnBasedGameData 4.7 snapshot",
      url: "https://github.com/DimbreathBot/TurnBasedGameData/tree/dad9155eb00fdeda31fb8456507c53590d49071f",
      retrievedAt: "2026-11-22",
      use: "pinned Memory of Chaos enemy wave"
    },
    {
      title: "NousMatrix project-owner validated team",
      retrievedAt: "2026-11-22",
      use: "E0 team selection: Mortenax Blade, Welt, Huohuo"
    }
  ]
};

const FEIXIAO_E0S1_ROBIN_TOPAZ_AVENTURINE = {
  id: "feixiao-e0s1-robin-topaz-aventurine-moc12-v1",
  status: "published",
  gameVersion: "4.7",
  calculationVersion: "damage-cycle-v1",
  characterId: "1220",
  nameRu: "Фэйсяо E0S1 — Зарянка · Топаз · Авантюрин",
  nameEn: "Feixiao E0S1 — Robin · Topaz · Aventurine",
  metricRu: "Расчётный урон полного цикла",
  metricEn: "Standardized full-cycle damage",
  methodologyRu: "Сравниваются только Фэйсяо E0 с сигнатурным конусом S1, уровнем 80 и прокачанными основными навыками. Союзники и их баффы фиксированы; урон рассчитывается по одной и той же волне Воспоминаний хаоса 4.7.",
  methodologyEn: "Only level 80 E0 Feixiao with S1 signature Light Cone and levelled core skills are compared. Allies and their buffs are fixed against the same MoC 4.7 wave.",
  requirements: {
    characterLevel: 80,
    eidolon: 0,
    lightCone: { id: "23031", superimposition: 1, level: 80 },
    coreSkillLevels: { BPSkill: 10, Ultra: 10, Talent: 10 }
  },
  enemy: { mode: "moc", enemyDataReferenceDate: "2026-11-22", enemySide: 1, enemyStageIndex: -1, enemyWaveIndex: -1 },
  teammates: [
    {
      id: "1309",
      nameRu: "Зарянка",
      nameEn: "Robin",
      names: ["Зарянка", "Robin"],
      roleRu: "Гармония / баффер",
      roleEn: "Harmony / buffer",
      dynamicBuffs: { atkPercent: 45, dmgBoost: 50, critDmg: 45 },
      dynamicBuffDescRu: "Зарянка: +45% АТК, +50% урона и +45% крит. урона (включая бонус-атаки).",
      dynamicBuffDescEn: "Robin: +45% ATK, +50% DMG and +45% CRIT DMG (including follow-ups)."
    },
    {
      id: "1112",
      nameRu: "Топаз",
      nameEn: "Topaz",
      names: ["Топаз", "Topaz"],
      roleRu: "Охота / саб-ДД",
      roleEn: "Hunt / sub-DPS",
      dynamicBuffs: { allVuln: 50 },
      dynamicBuffDescRu: "Метка Топаз: +50% получаемого урона от бонус-атак.",
      dynamicBuffDescEn: "Topaz Proof of Debt: +50% follow-up DMG taken."
    },
    {
      id: "1304",
      nameRu: "Авантюрин",
      nameEn: "Aventurine",
      names: ["Авантюрин", "Aventurine"],
      roleRu: "Сохранение / дебафф",
      roleEn: "Preservation / debuff",
      dynamicBuffs: { critDmg: 15 },
      dynamicBuffDescRu: "Сверхспособность Авантюрина: +15% крит. урона по цели.",
      dynamicBuffDescEn: "Aventurine Ultimate: +15% CRIT DMG against target."
    }
  ],
  sources: [
    { title: "Feixiao Build Guide — Prydwen", url: "https://www.prydwen.gg/star-rail/characters/feixiao", retrievedAt: "2026-11-22", use: "kit & team synergy" },
    { title: "TurnBasedGameData 4.7 snapshot", url: "https://github.com/DimbreathBot/TurnBasedGameData/tree/dad9155eb00fdeda31fb8456507c53590d49071f", retrievedAt: "2026-11-22", use: "MoC enemy wave" }
  ]
};

const FIREFLY_E0S1_RUANMEI_HMC_LINGSHA = {
  id: "firefly-e0s1-ruanmei-hmc-lingsha-moc12-v1",
  status: "published",
  gameVersion: "4.7",
  calculationVersion: "damage-cycle-v1",
  characterId: "1310",
  nameRu: "Светлячок E0S1 — Жуань Мэй · ГГ Гармонии · Линша",
  nameEn: "Firefly E0S1 — Ruan Mei · Harmony TB · Lingsha",
  metricRu: "Расчётный урон полного цикла",
  metricEn: "Standardized full-cycle damage",
  methodologyRu: "Сравниваются только Светлячок E0 с сигнатурным конусом S1, уровнем 80 и прокачанными основными навыками. Союзники и их баффы фиксированы; урон рассчитывается по одной и той же волне Воспоминаний хаоса 4.7.",
  methodologyEn: "Only level 80 E0 Firefly with S1 signature Light Cone and levelled core skills are compared. Allies and their buffs are fixed against the same MoC 4.7 wave.",
  requirements: {
    characterLevel: 80,
    eidolon: 0,
    lightCone: { id: "23025", superimposition: 1, level: 80 },
    coreSkillLevels: { BPSkill: 10, Ultra: 10, Talent: 10 }
  },
  enemy: { mode: "moc", enemyDataReferenceDate: "2026-11-22", enemySide: 1, enemyStageIndex: -1, enemyWaveIndex: -1 },
  teammates: [
    {
      id: "1303",
      nameRu: "Жуань Мэй",
      nameEn: "Ruan Mei",
      names: ["Жуань Мэй", "Ruan Mei"],
      roleRu: "Гармония / пробитие",
      roleEn: "Harmony / break",
      dynamicBuffs: { breakEffect: 20, resPen: 25, spdPercent: 10 },
      dynamicBuffDescRu: "Жуань Мэй: +20% эффекта пробития, +25% пробития сопротивления и +10% СКОР.",
      dynamicBuffDescEn: "Ruan Mei: +20% Break Effect, +25% All-Type RES PEN and +10% SPD."
    },
    {
      id: "8006",
      nameRu: "Первопроходец (Гармония)",
      nameEn: "Trailblazer (Harmony)",
      names: ["Первопроходец (Гармония)", "Trailblazer (Harmony)"],
      roleRu: "Гармония / суперпробитие",
      roleEn: "Harmony / super break",
      dynamicBuffs: { breakEffect: 63 },
      dynamicBuffDescRu: "ГГ Гармонии: +63% эффекта пробития и активация Суперпробития.",
      dynamicBuffDescEn: "Harmony TB: +63% Break Effect and Super Break enablement."
    },
    {
      id: "1222",
      nameRu: "Линша",
      nameEn: "Lingsha",
      names: ["Линша", "Lingsha"],
      roleRu: "Изобилие / пробитие",
      roleEn: "Abundance / break",
      dynamicBuffs: { allVuln: 25 },
      dynamicBuffDescRu: "Линша: +25% получаемого урона пробития по врагам.",
      dynamicBuffDescEn: "Lingsha: +25% Break DMG taken by enemies."
    }
  ],
  sources: [
    { title: "Firefly Build Guide — Prydwen", url: "https://www.prydwen.gg/star-rail/characters/firefly", retrievedAt: "2026-11-22", use: "kit & team synergy" },
    { title: "TurnBasedGameData 4.7 snapshot", url: "https://github.com/DimbreathBot/TurnBasedGameData/tree/dad9155eb00fdeda31fb8456507c53590d49071f", retrievedAt: "2026-11-22", use: "MoC enemy wave" }
  ]
};

const THEHERTA_E0S1_JADE_ROBIN_LINGSHA = {
  id: "theherta-e0s1-jade-robin-lingsha-moc12-v1",
  status: "published",
  gameVersion: "4.7",
  calculationVersion: "damage-cycle-v1",
  characterId: "1401",
  nameRu: "Великая Герта E0S1 — Яшма · Зарянка · Линша",
  nameEn: "The Herta E0S1 — Jade · Robin · Lingsha",
  metricRu: "Расчётный урон полного цикла",
  metricEn: "Standardized full-cycle damage",
  methodologyRu: "Сравниваются только Великая Герта E0 с сигнатурным конусом S1, уровнем 80 и прокачанными основными навыками. Союзники и их баффы фиксированы; урон рассчитывается по одной и той же волне Воспоминаний хаоса 4.7.",
  methodologyEn: "Only level 80 E0 The Herta with S1 signature Light Cone and levelled core skills are compared. Allies and their buffs are fixed against the same MoC 4.7 wave.",
  requirements: {
    characterLevel: 80,
    eidolon: 0,
    lightCone: { id: "23037", superimposition: 1, level: 80 },
    coreSkillLevels: { BPSkill: 10, Ultra: 10, Talent: 10 }
  },
  enemy: { mode: "moc", enemyDataReferenceDate: "2026-11-22", enemySide: 1, enemyStageIndex: -1, enemyWaveIndex: -1 },
  teammates: [
    {
      id: "1314",
      nameRu: "Яшма",
      nameEn: "Jade",
      names: ["Яшма", "Jade"],
      roleRu: "Эрудиция / саб-ДД",
      roleEn: "Erudition / sub-DPS",
      dynamicBuffs: { spdFlat: 30 },
      dynamicBuffDescRu: "Сборщик долгов Яшмы: +30 СКОР для Великой Герты.",
      dynamicBuffDescEn: "Jade Debt Collector: +30 SPD for The Herta."
    },
    {
      id: "1309",
      nameRu: "Зарянка",
      nameEn: "Robin",
      names: ["Зарянка", "Robin"],
      roleRu: "Гармония / баффер",
      roleEn: "Harmony / buffer",
      dynamicBuffs: { atkPercent: 45, dmgBoost: 50, critDmg: 20 },
      dynamicBuffDescRu: "Зарянка: +45% АТК, +50% урона и +20% крит. урона.",
      dynamicBuffDescEn: "Robin: +45% ATK, +50% DMG and +20% CRIT DMG."
    },
    {
      id: "1222",
      nameRu: "Линша",
      nameEn: "Lingsha",
      names: ["Линша", "Lingsha"],
      roleRu: "Изобилие / стаки",
      roleEn: "Abundance / stacks",
      dynamicBuffs: {},
      dynamicBuffDescRu: "Линша: массовое лечение и генерация стаков для Герты.",
      dynamicBuffDescEn: "Lingsha: AoE sustain and stack generation for The Herta."
    }
  ],
  sources: [
    { title: "The Herta Build Guide — Prydwen", url: "https://www.prydwen.gg/star-rail/characters/the-herta", retrievedAt: "2026-11-22", use: "kit & team synergy" },
    { title: "TurnBasedGameData 4.7 snapshot", url: "https://github.com/DimbreathBot/TurnBasedGameData/tree/dad9155eb00fdeda31fb8456507c53590d49071f", retrievedAt: "2026-11-22", use: "MoC enemy wave" }
  ]
};

const JINGLIU_E0S1_BRONYA_RUANMEI_HUOHUO = {
  id: "jingliu-e0s1-bronya-ruanmei-huohuo-moc12-v1",
  status: "published",
  gameVersion: "4.7",
  calculationVersion: "damage-cycle-v1",
  characterId: "1212",
  nameRu: "Цзинлю E0S1 — Броня · Жуань Мэй · Хохо",
  nameEn: "Jingliu E0S1 — Bronya · Ruan Mei · Huohuo",
  metricRu: "Расчётный урон полного цикла",
  metricEn: "Standardized full-cycle damage",
  methodologyRu: "Сравниваются только Цзинлю E0 с сигнатурным конусом S1, уровнем 80 и прокачанными основными навыками. Союзники и их баффы фиксированы; урон рассчитывается по одной и той же волне Воспоминаний хаоса 4.7.",
  methodologyEn: "Only level 80 E0 Jingliu with S1 signature Light Cone and levelled core skills are compared. Allies and their buffs are fixed against the same MoC 4.7 wave.",
  requirements: {
    characterLevel: 80,
    eidolon: 0,
    lightCone: { id: "23014", superimposition: 1, level: 80 },
    coreSkillLevels: { BPSkill: 10, Ultra: 10, Talent: 10 }
  },
  enemy: { mode: "moc", enemyDataReferenceDate: "2026-11-22", enemySide: 1, enemyStageIndex: -1, enemyWaveIndex: -1 },
  teammates: [
    {
      id: "1101",
      nameRu: "Броня",
      nameEn: "Bronya",
      names: ["Броня", "Bronya"],
      roleRu: "Гармония / продвижение",
      roleEn: "Harmony / advance",
      dynamicBuffs: { dmgBoost: 66, atkPercent: 55, critDmg: 50 },
      dynamicBuffDescRu: "Броня: +66% урона, +55% АТК и +50% крит. урона.",
      dynamicBuffDescEn: "Bronya: +66% DMG, +55% ATK and +50% CRIT DMG."
    },
    {
      id: "1303",
      nameRu: "Жуань Мэй",
      nameEn: "Ruan Mei",
      names: ["Жуань Мэй", "Ruan Mei"],
      roleRu: "Гармония / баффер",
      roleEn: "Harmony / buffer",
      dynamicBuffs: { dmgBoost: 68, resPen: 25, spdPercent: 10 },
      dynamicBuffDescRu: "Жуань Мэй: +68% урона, +25% пробития сопротивления и +10% СКОР.",
      dynamicBuffDescEn: "Ruan Mei: +68% DMG, +25% All-Type RES PEN and +10% SPD."
    },
    {
      id: "1217",
      nameRu: "Хохо",
      nameEn: "Huohuo",
      names: ["Хохо", "Huohuo"],
      roleRu: "Исцеление / АТК",
      roleEn: "Healing / ATK",
      dynamicBuffs: { atkPercent: 40 },
      dynamicBuffDescRu: "Сверхспособность Хохо: +40% АТК.",
      dynamicBuffDescEn: "Huohuo Ultimate: +40% ATK."
    }
  ],
  sources: [
    { title: "Jingliu Build Guide — Prydwen", url: "https://www.prydwen.gg/star-rail/characters/jingliu", retrievedAt: "2026-11-22", use: "kit & team synergy" },
    { title: "TurnBasedGameData 4.7 snapshot", url: "https://github.com/DimbreathBot/TurnBasedGameData/tree/dad9155eb00fdeda31fb8456507c53590d49071f", retrievedAt: "2026-11-22", use: "MoC enemy wave" }
  ]
};

const DHIL_E0S1_SPARKLE_TINGYUN_HUOHUO = {
  id: "dhil-e0s1-sparkle-tingyun-huohuo-moc12-v1",
  status: "published",
  gameVersion: "4.7",
  calculationVersion: "damage-cycle-v1",
  characterId: "1213",
  nameRu: "Даня ПЛ E0S1 — Искорка · Тинъюнь · Хохо",
  nameEn: "DHIL E0S1 — Sparkle · Tingyun · Huohuo",
  metricRu: "Расчётный урон полного цикла",
  metricEn: "Standardized full-cycle damage",
  methodologyRu: "Сравниваются только Дань Хэн: Пожиратель Луны E0 с сигнатурным конусом S1, уровнем 80 и прокачанными основными навыками. Союзники и их баффы фиксированы; урон рассчитывается по одной и той же волне Воспоминаний хаоса 4.7.",
  methodologyEn: "Only level 80 E0 Dan Heng IL with S1 signature Light Cone and levelled core skills are compared. Allies and their buffs are fixed against the same MoC 4.7 wave.",
  requirements: {
    characterLevel: 80,
    eidolon: 0,
    lightCone: { id: "23015", superimposition: 1, level: 80 },
    coreSkillLevels: { BPSkill: 10, Ultra: 10, Talent: 10 }
  },
  enemy: { mode: "moc", enemyDataReferenceDate: "2026-11-22", enemySide: 1, enemyStageIndex: -1, enemyWaveIndex: -1 },
  teammates: [
    {
      id: "1306",
      nameRu: "Искорка",
      nameEn: "Sparkle",
      names: ["Искорка", "Sparkle"],
      roleRu: "Гармония / Крит",
      roleEn: "Harmony / CRIT",
      dynamicBuffs: { critDmg: 95, dmgBoost: 48, atkPercent: 15 },
      dynamicBuffDescRu: "Искорка: +95% крит. урона, +48% урона и +15% АТК.",
      dynamicBuffDescEn: "Sparkle: +95% CRIT DMG, +48% DMG and +15% ATK."
    },
    {
      id: "1202",
      nameRu: "Тинъюнь",
      nameEn: "Tingyun",
      names: ["Тинъюнь", "Tingyun"],
      roleRu: "Гармония / Энергия",
      roleEn: "Harmony / Energy",
      dynamicBuffs: { atkPercent: 50, dmgBoost: 50 },
      dynamicBuffDescRu: "Тинъюнь: +50% АТК, +50% урона и залив энергии.",
      dynamicBuffDescEn: "Tingyun: +50% ATK, +50% DMG and Energy regen."
    },
    {
      id: "1217",
      nameRu: "Хохо",
      nameEn: "Huohuo",
      names: ["Хохо", "Huohuo"],
      roleRu: "Исцеление / АТК",
      roleEn: "Healing / ATK",
      dynamicBuffs: { atkPercent: 40 },
      dynamicBuffDescRu: "Сверхспособность Хохо: +40% АТК.",
      dynamicBuffDescEn: "Huohuo Ultimate: +40% ATK."
    }
  ],
  sources: [
    { title: "Dan Heng • Imbibitor Lunae Guide — Prydwen", url: "https://www.prydwen.gg/star-rail/characters/dan-heng-imbibitor-lunae", retrievedAt: "2026-11-22", use: "kit & team synergy" },
    { title: "TurnBasedGameData 4.7 snapshot", url: "https://github.com/DimbreathBot/TurnBasedGameData/tree/dad9155eb00fdeda31fb8456507c53590d49071f", retrievedAt: "2026-11-22", use: "MoC enemy wave" }
  ]
};

const AGLAEA_E0S1_SUNDAY_ROBIN_HUOHUO = {
  id: "aglaea-e0s1-sunday-robin-huohuo-moc12-v1",
  status: "published",
  gameVersion: "4.7",
  calculationVersion: "damage-cycle-v1",
  characterId: "1402",
  nameRu: "Аглая E0S1 — Воскресенье · Зарянка · Хохо",
  nameEn: "Aglaea E0S1 — Sunday · Robin · Huohuo",
  metricRu: "Расчётный урон полного цикла",
  metricEn: "Standardized full-cycle damage",
  methodologyRu: "Сравниваются только Аглая E0 с сигнатурным конусом S1, уровнем 80 и прокачанными основными навыками. Союзники и их баффы фиксированы; урон рассчитывается по одной и той же волне Воспоминаний хаоса 4.7.",
  methodologyEn: "Only level 80 E0 Aglaea with S1 signature Light Cone and levelled core skills are compared. Allies and their buffs are fixed against the same MoC 4.7 wave.",
  requirements: {
    characterLevel: 80,
    eidolon: 0,
    lightCone: { id: "23036", superimposition: 1, level: 80 },
    coreSkillLevels: { BPSkill: 10, Ultra: 10, Talent: 10 }
  },
  enemy: { mode: "moc", enemyDataReferenceDate: "2026-11-22", enemySide: 1, enemyStageIndex: -1, enemyWaveIndex: -1 },
  teammates: [
    {
      id: "1313",
      nameRu: "Воскресенье",
      nameEn: "Sunday",
      names: ["Воскресенье", "Sunday"],
      roleRu: "Гармония / призыв",
      roleEn: "Harmony / summon",
      dynamicBuffs: { critRate: 20, critDmg: 75, dmgBoost: 80 },
      dynamicBuffDescRu: "Воскресенье: +20% крит. шанса, +75% крит. урона и +80% урона с духом памяти.",
      dynamicBuffDescEn: "Sunday: +20% CRIT Rate, +75% CRIT DMG and +80% DMG with memosprite."
    },
    {
      id: "1309",
      nameRu: "Зарянка",
      nameEn: "Robin",
      names: ["Зарянка", "Robin"],
      roleRu: "Гармония / баффер",
      roleEn: "Harmony / buffer",
      dynamicBuffs: { atkPercent: 45, dmgBoost: 50, critDmg: 20 },
      dynamicBuffDescRu: "Зарянка: +45% АТК, +50% урона и +20% крит. урона.",
      dynamicBuffDescEn: "Robin: +45% ATK, +50% DMG and +20% CRIT DMG."
    },
    {
      id: "1217",
      nameRu: "Хохо",
      nameEn: "Huohuo",
      names: ["Хохо", "Huohuo"],
      roleRu: "Исцеление / энергия",
      roleEn: "Healing / Energy",
      dynamicBuffs: { atkPercent: 40 },
      dynamicBuffDescRu: "Сверхспособность Хохо: +40% АТК и залив энергии.",
      dynamicBuffDescEn: "Huohuo Ultimate: +40% ATK and Energy regen."
    }
  ],
  sources: [
    { title: "Aglaea Build Guide — Prydwen", url: "https://www.prydwen.gg/star-rail/characters/aglaea", retrievedAt: "2026-11-22", use: "kit & team synergy" },
    { title: "TurnBasedGameData 4.7 snapshot", url: "https://github.com/DimbreathBot/TurnBasedGameData/tree/dad9155eb00fdeda31fb8456507c53590d49071f", retrievedAt: "2026-11-22", use: "MoC enemy wave" }
  ]
};

export const DAMAGE_LEADERBOARD_SCENARIOS = Object.freeze([
  ACHERON_E0S1_MORTENAX_WELT_HUOHUO,
  FEIXIAO_E0S1_ROBIN_TOPAZ_AVENTURINE,
  FIREFLY_E0S1_RUANMEI_HMC_LINGSHA,
  THEHERTA_E0S1_JADE_ROBIN_LINGSHA,
  JINGLIU_E0S1_BRONYA_RUANMEI_HUOHUO,
  DHIL_E0S1_SPARKLE_TINGYUN_HUOHUO,
  AGLAEA_E0S1_SUNDAY_ROBIN_HUOHUO
]);

export function getDamageLeaderboardScenario(id) {
  return DAMAGE_LEADERBOARD_SCENARIOS.find((scenario) => scenario.id === String(id || "")) || null;
}

export function getDamageLeaderboardScenariosForCharacter(characterId) {
  return DAMAGE_LEADERBOARD_SCENARIOS.filter((scenario) =>
    scenario.status === "published" && scenario.characterId === String(characterId || "")
  );
}

export function toPublicDamageScenario(scenario) {
  if (!scenario) return null;
  const { teammates, sources, ...publicScenario } = scenario;
  return {
    ...publicScenario,
    teammates: teammates.map(({ dynamicBuffs, ...teammate }) => teammate),
    sources
  };
}

export function checkDamageScenarioEligibility(character, scenario) {
  if (!character || !scenario) return { eligible: false, reasons: ["scenario-unavailable"] };
  const reasons = [];
  const requirements = scenario.requirements || {};
  if (String(character.id || "") !== scenario.characterId) reasons.push("wrong-character");
  if (Number(character.level || 0) < Number(requirements.characterLevel || 80)) reasons.push("character-level");
  if (Number(character.rank || 0) !== Number(requirements.eidolon || 0)) reasons.push("eidolon");

  const cone = character.light_cone || {};
  if (String(cone.id || "") !== String(requirements.lightCone?.id || "")) reasons.push("light-cone");
  if (Number(cone.rank || 0) !== Number(requirements.lightCone?.superimposition || 1)) reasons.push("superimposition");
  if (Number(cone.level || 0) < Number(requirements.lightCone?.level || 80)) reasons.push("light-cone-level");

  Object.entries(requirements.coreSkillLevels || {}).forEach(([type, level]) => {
    const matching = (character.skills || []).filter((skill) => skill.type === type);
    const current = matching.length ? Math.max(...matching.map((skill) => Number(skill.level) || 0)) : 0;
    if (current < Number(level)) reasons.push(`skill-${type}`);
  });

  return { eligible: reasons.length === 0, reasons };
}
