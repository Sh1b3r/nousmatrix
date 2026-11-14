// Rotațiion models per character (kit-accurate damage instances).
// Each instance: { mv, targets, count, phase, actionName, desc }
// mv = motion value (multiplier of scaling stat per hit), targets = how many enemies each hit covers
// (1 = single target, 3 = boss + 2 adds), count = number of repeated hits.
// Scaling stat is resolved by the engine: atk (default) or hp (hpScale).

export const ROTATIONS = {
  // Химеко: Нова (1510) — полный цикл сверхспособности «Starblazer» по реальному киту (4.7)
  "1510": {
    hpScale: false,
    passiveDmgBoost: 20, // Navigator's Semaphore: +20% урона всем союзникам — учитывается как собственный аурный баф
    // Талант «Of Fire and Far Faring» (Territory Starblazer): пока Химеко Нова на поле,
    // её All-Type RES PEN +20% и CRIT DMG +80% — учитываются в личных множителях.
    passiveCritDmg: 80,
    passiveResPen: 20,
    ultLoop: true,
    instances: [
      {
        key: "beams",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — HYPERLUMINAL BEAM",
        phaseEn: "ULTIMATE — HYPERLUMINAL BEAM",
        actionRu: "6 лучей «Гиперсветового ускорителя» (32% AoE каждый, копит Source Energy)",
        actionEn: "6x Hyperluminal Particle Beam (32% AoE each, stacks Source Energy)",
        descRu: "32% ATK по всем врагам, 6 срабатываний. Каждый луч даёт 1 ед. Source Energy (макс. 3).",
        descEn: "32% ATK to all enemies, 6 instances. Each beam grants 1 Source Energy (max 3).",
        mv: 0.32, targets: 3, count: 6
      },
      {
        key: "pulse",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — ORBITAL PULSE",
        phaseEn: "ULTIMATE — ORBITAL ANNIHILATION PULSE",
        actionRu: "3 залпа «Орбитального уничтожения» (20% AoE + 2×60%×SE по случайным целям, след A6: +30% к множителю случайных)",
        actionEn: "3x Orbital Annihilation Pulse (20% AoE + 2x60% per SE randoms, A6 trace: +30% random multiplier)",
        descRu: "20% ATK по всем + 2 случайных удара по 60% ATK (30% базово + 30% от следа A6 при 3 ед. Source Energy). До 140% ATK за залп по боссу.",
        descEn: "20% ATK AoE + 2 random hits of 60% ATK (30% base + 30% from A6 trace at 3 Source Energy). Up to 140% ATK per volley on one target.",
        mv: 1.4, targets: 1, count: 3
      },
      {
        key: "final",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — FINAL HIT",
        phaseEn: "ULTIMATE — FINAL HIT",
        actionRu: "Финальный залп: 3×80% ATK по случайным целям",
        actionEn: "Final Hit: 3x 80% ATK random targets",
        descRu: "Финал цикла Starblazer: 3 инстанса по 80% ATK.",
        descEn: "Starblazer cycle finale: 3 instances of 80% ATK.",
        mv: 0.8, targets: 1, count: 3
      },
      {
        key: "basic",
        phaseRu: "ЗАПОЛНЯЮЩИЕ ХОДЫ",
        phaseEn: "FILLER TURNS",
        actionRu: "2 базовые атаки (100% ATK) + бонус-атака таланта (3×90% ATK)",
        actionEn: "2 Basic ATKs (100% ATK) + Talent FUA (3x 90% ATK)",
        descRu: "Ходы между ультами: базовые атаки и срабатывания таланта «Of Fire and Far Faring».",
        descEn: "Turns between ultimates: basic attacks and Talent procs.",
        mv: 1.0, targets: 1, count: 2
      },
      {
        key: "talent_fua",
        phaseRu: "ТАЛАНТ — БОНУС-АТАКИ",
        phaseEn: "TALENT — FOLLOW-UP",
        actionRu: "Бонус-атаки таланта между действиями союзников",
        actionEn: "Talent follow-up procs between ally actions",
        descRu: "3 срабатывания по 90% ATK (оценка по классу кита).",
        descEn: "3 procs of 90% ATK (kit-class estimate).",
        mv: 0.9, targets: 1, count: 3
      }
    ]
  }
};
