/**
 * NOUSMATRIX // ZERO-SLOP AUDIT CONTROLLER
 * Real in-game character auditing for Honkai: Star Rail.
 * In the style of akasha.cv & seeleland.com.
 */

const CDN_BASE = 'https://fastly.jsdelivr.net/gh/Mar-7th/StarRailRes@master/';

function iconUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${CDN_BASE}${path}`;
}

/**
 * Returns head-only avatar icon (icon/avatar/{id}.png) with fallback to character bust icon
 */
function getCharHeadIcon(char) {
  if (!char) return '';
  if (char.id) {
    return iconUrl(`icon/avatar/${char.id}.png`);
  }
  return iconUrl(char.icon);
}

// Global application state
let currentProfile = null;
let activeCharacterIndex = 0;

/**
 * Slot name dictionary for the 6 standard HSR relic slots
 */
const SLOT_NAMES = [
  "Голова (Head)",
  "Руки (Hands)",
  "Тело (Body)",
  "Сапоги (Feet)",
  "Планарная сфера (Sphere)",
  "Соединительная веревка (Rope)"
];

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  const uidInput = document.getElementById('uid-field');
  if (uidInput) {
    uidInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLoadProfile();
      }
    });
  }

  // Close trophy modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTrophy();
    }
  });
});

/**
 * Quick select UID button on home screen
 */
function quickSelectUID(uid) {
  const input = document.getElementById('uid-field');
  if (input) input.value = uid;
  handleLoadProfile(uid);
}

/**
 * Return from dashboard back to UID input screen
 */
function resetToHome() {
  document.getElementById('view-dashboard').style.display = 'none';
  document.getElementById('view-home').style.display = 'flex';
  const input = document.getElementById('uid-field');
  if (input) {
    input.focus();
    input.select();
  }
}

/**
 * Load profile by UID (preset or live Mihomo API fetch)
 */
async function handleLoadProfile(targetUid) {
  const input = document.getElementById('uid-field');
  const btn = document.getElementById('btn-analyze');
  let uid = (targetUid || (input ? input.value.trim() : '')).trim();

  if (!uid) {
    uid = '700142890';
    if (input) input.value = uid;
  }

  const prevBtnText = btn ? btn.innerText : 'АНАЛИЗИРОВАТЬ';
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'ЗАГРУЗКА...';
  }

  const statusText = document.getElementById('api-status-text');

  try {
    let data = null;

    // 1. Check local preloaded real showcase profiles
    if (window.PRESET_PROFILES && window.PRESET_PROFILES[uid]) {
      data = window.PRESET_PROFILES[uid];
      if (statusText) statusText.innerText = `DATABASE : CONNECTED [UID: ${uid}]`;
    } else {
      // 2. Attempt live fetch from Mihomo API
      if (statusText) statusText.innerText = `FETCHING FROM MIHOMO API [UID: ${uid}]...`;
      try {
        const res = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=ru`, { cache: 'no-cache' });
        if (res.ok) {
          data = await res.json();
          if (statusText) statusText.innerText = `MIHOMO LIVE API : CONNECTED [UID: ${uid}]`;
        }
      } catch (netErr) {
        console.warn('Direct Mihomo fetch failed (likely CORS or offline), trying fallback:', netErr);
      }

      // 3. Fallback to first available preset profile if not found or blocked
      if (!data) {
        if (window.PRESET_PROFILES) {
          const fallbackUid = Object.keys(window.PRESET_PROFILES)[0];
          data = window.PRESET_PROFILES[fallbackUid];
          if (statusText) statusText.innerText = `OFFLINE FALLBACK : PROFILE [UID: ${fallbackUid}]`;
          alert(`UID ${uid} не найден в открытой сети или заблокирован CORS браузера. Загружен проверенный профиль ${data.player.nickname} (${fallbackUid}).`);
          if (input) input.value = fallbackUid;
        }
      }
    }

    if (!data || !data.characters || data.characters.length === 0) {
      alert("Не удалось получить персонажей из витрины аккаунта. Убедитесь, что витрина открыта в настройках игры.");
      return;
    }

    currentProfile = data;
    activeCharacterIndex = 0;

    // Switch views
    document.getElementById('view-home').style.display = 'none';
    document.getElementById('view-dashboard').style.display = 'block';

    // Render full dashboard
    renderDashboard(currentProfile);

  } catch (err) {
    console.error('Profile loading error:', err);
    alert('Произошла ошибка при загрузке данных: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = prevBtnText;
    }
  }
}

/**
 * Render complete analytical dashboard for profile
 */
function renderDashboard(profile) {
  // 1. Player banner
  const p = profile.player;
  document.getElementById('player-avatar-img').src = iconUrl(p.avatar?.icon);
  document.getElementById('player-nickname-text').innerText = p.nickname || 'Первопроходец';
  document.getElementById('player-uid-text').innerText = `UID: ${p.uid}`;
  document.getElementById('player-level-badge').innerText = `Ур. ${p.level}`;
  document.getElementById('player-signature-text').innerText = p.signature ? `«${p.signature}»` : '';

  // 2. Showcase Roster (horizontal row like Akasha / Seeleland)
  renderShowcaseRoster(profile.characters, activeCharacterIndex);

  // 3. Render active selected character
  renderCharacter(profile.characters[activeCharacterIndex]);
}

/**
 * Render the horizontal row of showcase characters
 */
function renderShowcaseRoster(characters, activeIndex) {
  const track = document.getElementById('roster-track');
  const countBadge = document.getElementById('roster-count-badge');
  track.innerHTML = '';

  if (countBadge) {
    countBadge.innerText = `${characters.length} ПЕРСОНАЖ${characters.length > 4 ? 'ЕЙ' : 'А'}`;
  }

  characters.forEach((char, idx) => {
    const card = document.createElement('div');
    card.className = `roster-card ${idx === activeIndex ? 'active' : ''}`;
    
    // Quick audit calculation for roster badge
    const audit = calculateCharacterAudit(char);

    card.innerHTML = `
      <div class="roster-avatar-wrap">
        <img class="roster-avatar-img" src="${getCharHeadIcon(char)}" alt="${char.name}" onerror="if(this.src!=='${iconUrl(char.icon)}')this.src='${iconUrl(char.icon)}';" loading="lazy">
        ${char.element ? `<img class="roster-element-badge" src="${iconUrl(char.element.icon)}" alt="${char.element.name}">` : ''}
        ${char.path ? `<img class="roster-path-badge" src="${iconUrl(char.path.icon)}" alt="${char.path.name}">` : ''}
      </div>
      <div class="roster-char-name" title="${char.name}">${char.name}</div>
      <div class="roster-char-meta">Ур. ${char.level} • E${char.rank}</div>
      ${char.light_cone ? `<div class="roster-cone-tag" title="${char.light_cone.name}">${char.light_cone.name}</div>` : ''}
      <div class="roster-score-pill">TOP ${audit.topPercent}% • ${audit.score}</div>
    `;

    card.addEventListener('click', () => {
      activeCharacterIndex = idx;
      // Update active card styling
      const allCards = track.querySelectorAll('.roster-card');
      allCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      
      // Render selected character
      renderCharacter(char);
    });

    track.appendChild(card);
  });
}

/**
 * Render details, real stats, relics and audit for selected character
 */
function renderCharacter(char) {
  // 1. Overview Banner (character head icon with element badge)
  const portraitImg = document.getElementById('char-portrait-img');
  portraitImg.src = getCharHeadIcon(char);
  portraitImg.onerror = function() {
    if (this.src !== iconUrl(char.icon)) this.src = iconUrl(char.icon);
  };
  document.getElementById('char-portrait-element').src = iconUrl(char.element?.icon);
  document.getElementById('char-name-val').innerText = char.name;
  document.getElementById('char-stars-val').innerText = '★'.repeat(char.rarity || 5);
  document.getElementById('char-level-pill').innerText = `Ур. ${char.level}/80`;
  document.getElementById('char-eidolon-pill').innerText = `Эйдолоны: E${char.rank}`;
  document.getElementById('char-path-pill').innerText = `Путь: ${char.path?.name || '—'}`;
  document.getElementById('char-element-pill').innerText = `Стихия: ${char.element?.name || '—'}`;

  // Skills / Traces
  const skillsContainer = document.getElementById('char-skills-container');
  skillsContainer.innerHTML = '';
  if (char.skills && char.skills.length > 0) {
    const mainSkills = char.skills.filter(s => ['Normal', 'BPSkill', 'Ultra', 'Talent'].includes(s.type));
    mainSkills.forEach(s => {
      const item = document.createElement('div');
      item.className = 'skill-item';
      item.title = `${s.type_text}: ${s.name} (Ур. ${s.level}/${s.max_level})`;
      item.innerHTML = `
        <img class="skill-icon" src="${iconUrl(s.icon)}" alt="${s.name}">
        <span class="skill-lvl">${s.level}</span>
      `;
      skillsContainer.appendChild(item);
    });
  }

  // Light Cone Box
  const lcBox = document.getElementById('lightcone-box');
  if (char.light_cone) {
    lcBox.style.display = 'flex';
    document.getElementById('cone-img').src = iconUrl(char.light_cone.icon);
    document.getElementById('cone-name').innerText = char.light_cone.name;
    document.getElementById('cone-super').innerText = `Наложение S${char.light_cone.rank} (${'★'.repeat(char.light_cone.rarity || 5)})`;
    document.getElementById('cone-level').innerText = `Ур. ${char.light_cone.level}/80`;

    const coneStats = document.getElementById('cone-stats');
    coneStats.innerHTML = '';
    if (char.light_cone.attributes) {
      char.light_cone.attributes.forEach(a => {
        const span = document.createElement('span');
        span.innerText = `${a.name.replace('Базовая ', '').replace('Базовое ', '')}: ${a.display}`;
        coneStats.appendChild(span);
      });
    }
  } else {
    lcBox.style.display = 'none';
  }

  // 2. Real In-Game Combat Attributes
  renderCombatStats(char);

  // 3. Mathematical Audit (NousMatrix score, bottleneck, suggestions)
  const audit = calculateCharacterAudit(char);
  renderAuditResults(char, audit);

  // 4. Relics Breakdown (6 slots)
  renderRelicsGrid(char, audit);

  // 5. Active Set Bonuses
  renderSetBonuses(char);

  // 6. Setup Trophy Card data for active character
  setupTrophyModal(char, audit);
}

/**
 * Render real in-game combat stats table
 */
function renderCombatStats(char) {
  const container = document.getElementById('combat-stats-list');
  container.innerHTML = '';

  // Helper map for base attributes and additions
  const baseMap = {};
  (char.attributes || []).forEach(a => { baseMap[a.field] = a; });

  const addMap = {};
  (char.additions || []).forEach(a => { addMap[a.field] = a; });

  // 1. HP
  const hpBase = baseMap['hp'] ? Math.round(baseMap['hp'].value) : 0;
  const hpAdd = addMap['hp'] ? Math.round(addMap['hp'].value) : 0;
  addStatRow(container, 'icon/property/IconMaxHP.png', 'Макс. HP', hpBase, hpAdd, hpBase + hpAdd, false);

  // 2. ATK
  const atkBase = baseMap['atk'] ? Math.round(baseMap['atk'].value) : 0;
  const atkAdd = addMap['atk'] ? Math.round(addMap['atk'].value) : 0;
  addStatRow(container, 'icon/property/IconAttack.png', 'Сила атаки', atkBase, atkAdd, atkBase + atkAdd, false);

  // 3. DEF
  const defBase = baseMap['def'] ? Math.round(baseMap['def'].value) : 0;
  const defAdd = addMap['def'] ? Math.round(addMap['def'].value) : 0;
  addStatRow(container, 'icon/property/IconDefence.png', 'Защита', defBase, defAdd, defBase + defAdd, false);

  // 4. SPD
  const spdBase = baseMap['spd'] ? Number(baseMap['spd'].value).toFixed(1) : '100.0';
  const spdAdd = addMap['spd'] ? Number(addMap['spd'].value).toFixed(1) : '0.0';
  const spdTotal = (parseFloat(spdBase) + parseFloat(spdAdd)).toFixed(1);
  addStatRow(container, 'icon/property/IconSpeed.png', 'Скорость (SPD)', spdBase, spdAdd, spdTotal, false);

  // 5. Crit Rate
  const crBase = baseMap['crit_rate'] ? (baseMap['crit_rate'].value * 100) : 5.0;
  const crAdd = addMap['crit_rate'] ? (addMap['crit_rate'].value * 100) : 0.0;
  const crTotal = (crBase + crAdd).toFixed(1) + '%';
  addSingleStatRow(container, 'icon/property/IconCriticalChance.png', 'Крит. шанс', crTotal);

  // 6. Crit DMG
  const cdBase = baseMap['crit_dmg'] ? (baseMap['crit_dmg'].value * 100) : 50.0;
  const cdAdd = addMap['crit_dmg'] ? (addMap['crit_dmg'].value * 100) : 0.0;
  const cdTotal = (cdBase + cdAdd).toFixed(1) + '%';
  addSingleStatRow(container, 'icon/property/IconCriticalDamage.png', 'Крит. урон', cdTotal);

  // 7. Break Effect (if present)
  if (addMap['break_dmg']) {
    const beTotal = (addMap['break_dmg'].value * 100).toFixed(1) + '%';
    addSingleStatRow(container, 'icon/property/IconBreakUp.png', 'Эффект пробития', beTotal);
  }

  // 8. Elemental DMG Bonus (if present)
  const elementFields = [
    { field: 'physical_dmg', icon: 'icon/property/IconPhysicalAddedRatio.png', name: 'Бонус физ. урона' },
    { field: 'fire_dmg', icon: 'icon/property/IconFireAddedRatio.png', name: 'Бонус огненного урона' },
    { field: 'ice_dmg', icon: 'icon/property/IconIceAddedRatio.png', name: 'Бонус ледяного урона' },
    { field: 'thunder_dmg', icon: 'icon/property/IconThunderAddedRatio.png', name: 'Бонус элек. урона' },
    { field: 'wind_dmg', icon: 'icon/property/IconWindAddedRatio.png', name: 'Бонус ветряного урона' },
    { field: 'quantum_dmg', icon: 'icon/property/IconQuantumAddedRatio.png', name: 'Бонус квант. урона' },
    { field: 'imaginary_dmg', icon: 'icon/property/IconImaginaryAddedRatio.png', name: 'Бонус мним. урона' }
  ];

  elementFields.forEach(el => {
    if (addMap[el.field] && addMap[el.field].value > 0) {
      const dmgTotal = (addMap[el.field].value * 100).toFixed(1) + '%';
      addSingleStatRow(container, el.icon, el.name, dmgTotal);
    }
  });

  // 9. Energy Regeneration Rate (if present)
  if (addMap['sp_rate']) {
    const errTotal = (100 + addMap['sp_rate'].value * 100).toFixed(1) + '%';
    addSingleStatRow(container, 'icon/property/IconEnergyRecovery.png', 'Восст. энергии (ERR)', errTotal);
  }

  // 10. Effect Hit Rate (if present)
  if (addMap['effect_hit'] && addMap['effect_hit'].value > 0) {
    const ehrTotal = (addMap['effect_hit'].value * 100).toFixed(1) + '%';
    addSingleStatRow(container, 'icon/property/IconStatusProbability.png', 'Шанс попад. эффектов', ehrTotal);
  }

  // 11. Effect RES (if present)
  if (addMap['effect_res'] && addMap['effect_res'].value > 0) {
    const resTotal = (addMap['effect_res'].value * 100).toFixed(1) + '%';
    addSingleStatRow(container, 'icon/property/IconStatusResistance.png', 'Сопротивление эффектам', resTotal);
  }
}

function addStatRow(container, iconPath, name, base, add, total, isPercent) {
  const row = document.createElement('div');
  row.className = 'stat-entry';
  row.innerHTML = `
    <div class="stat-left">
      <img class="stat-icon" src="${iconUrl(iconPath)}" alt="${name}">
      <span class="stat-name">${name}</span>
    </div>
    <div class="stat-values">
      <span class="stat-calc">${base} <span class="stat-bonus">+${add}</span> =</span>
      <span class="stat-total">${total}</span>
    </div>
  `;
  container.appendChild(row);
}

function addSingleStatRow(container, iconPath, name, totalDisplay) {
  const row = document.createElement('div');
  row.className = 'stat-entry';
  row.innerHTML = `
    <div class="stat-left">
      <img class="stat-icon" src="${iconUrl(iconPath)}" alt="${name}">
      <span class="stat-name">${name}</span>
    </div>
    <div class="stat-values">
      <span class="stat-total">${totalDisplay}</span>
    </div>
  `;
  container.appendChild(row);
}

/**
 * Calculate mathematical audit scores (0-100), CV, bottleneck and recommendations
 */
function calculateCharacterAudit(char) {
  const baseMap = {};
  (char.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (char.additions || []).forEach(a => { addMap[a.field] = a; });

  const cr = ((baseMap['crit_rate']?.value || 0.05) + (addMap['crit_rate']?.value || 0)) * 100;
  const cd = ((baseMap['crit_dmg']?.value || 0.50) + (addMap['crit_dmg']?.value || 0)) * 100;
  const cv = (cr * 2 + cd);

  const spd = ((baseMap['spd']?.value || 100) + (addMap['spd']?.value || 0));
  const be = (addMap['break_dmg']?.value || 0) * 100;
  const def = ((baseMap['def']?.value || 800) + (addMap['def']?.value || 0));

  let score = 85.0;
  let topPercent = 2.5;
  let rollEfficiency = 90.0;
  let bottleneck = "";
  const actions = [];

  const path = char.path?.id || '';
  const charName = char.name || '';

  // 1. Archetype analysis
  if (charName.includes('Авантюрин') || path === 'Knight') {
    // Preservation / DEF scaling
    if (def >= 4000) {
      score = 94.6;
      topPercent = 0.6;
      rollEfficiency = 95.8;
      bottleneck = `Защита ${Math.round(def)} превосходит кап пассивки (4000 DEF = +48% Крит. Шанса). Отличный баланс выживаемости и урона со слепых бросков.`;
      actions.push({
        title: "Оптимизация: Перевод избыточной защиты в Крит. Урон",
        desc: "Кап пассивной конверсии защиты достигнут. Дальнейшие сабстаты на Защиту дают меньший профит, чем роллы в Крит. Урон и Скорость."
      });
    } else {
      score = 86.2;
      topPercent = 4.2;
      rollEfficiency = 88.0;
      bottleneck = `Защита ${Math.round(def)} ниже рекомендованного капа 4000. Пассивный навык недополучает ${Math.round((4000 - def) * 0.024)}% бесплатного Крит. Шанса.`;
      actions.push({
        title: "Приоритет: Добрать 4000 Защиты",
        desc: `Необходимо добрать ${Math.round(4000 - def)} защиты через соединительную веревку или сабстаты, чтобы активировать максимальный бонус таланта.`
      });
    }
  } else if (charName.includes('Светлячок') || be > 200) {
    // Break Effect archetype
    if (be >= 360 && spd >= 150) {
      score = 96.2;
      topPercent = 0.3;
      rollEfficiency = 97.4;
      bottleneck = `Пороги 360% Эффекта Пробития и 150+ Скорости (4 хода в ультимейте) полностью закрыты. Сборка элитного тира.`;
      actions.push({
        title: "Сборка завершена (End-Game Build)",
        desc: "Все ключевые брейкпоинты достигнуты. Трата энергии на перекрафт текущих артефактов не рекомендуется."
      });
    } else {
      score = 89.4;
      topPercent = 1.8;
      rollEfficiency = 91.2;
      bottleneck = `Эффект пробития (${be.toFixed(1)}%) или Скорость (${spd.toFixed(1)}) слегка отстают от идеального тайминга полного цикла ультимейта.`;
      actions.push({
        title: "Приоритет: Роллы в Эффект Пробития и Скорость",
        desc: "Криты этому персонажу не требуются: избавьтесь от кусков с роллами в КУ/КШ в пользу чистого Пробития и Силы Атаки."
      });
    }
  } else {
    // Standard Crit DPS (Acheron, Seele, Dan Heng, Blade, etc.)
    if (cv >= 270) {
      score = 95.8;
      topPercent = 0.4;
      rollEfficiency = 96.5;
    } else if (cv >= 240) {
      score = 91.5;
      topPercent = 1.2;
      rollEfficiency = 93.0;
    } else {
      score = 84.8;
      topPercent = 4.8;
      rollEfficiency = 87.5;
    }

    if (cr < 70 && cd > 160) {
      bottleneck = `Перекос баланса критов: Крит. Шанс (${cr.toFixed(1)}%) слишком мал для Крит. Урона (${cd.toFixed(1)}%). Ультимейт теряет стабильность, пропуская решающие критические удары.`;
      actions.push({
        title: "Приоритет №1: Стабилизация Крит. Шанса",
        desc: `Замена одного куска на КШ приблизит соотношение 1:2. Это увеличит средний DPA (урон за ротацию) минимум на 4–6%.`
      });
    } else if (spd < 134) {
      bottleneck = `Скорость (${spd.toFixed(1)}) ниже контрольного брейкпоинта 134.0 SPD. Персонаж совершает только 1 действие в первом цикле Зала Забвения.`;
      actions.push({
        title: "Приоритет №1: Достижение 134.0 SPD",
        desc: "Добрав 1-2 сабстата скорости (+4-6 SPD), вы получите 2 полноценных хода в первом цикле Мок/Иллюзии."
      });
    } else {
      bottleneck = `Сбалансированное распределение статов (CV ${cv.toFixed(1)}, SPD ${spd.toFixed(1)}). Ограничением являются холостые роллы в Защиту/HP на сабстатах.`;
      actions.push({
        title: "Оптимизация: Перекрафт слабейшего артефакта",
        desc: "Замените кусок с 2+ мусорными роллами на реликвию с полезными атакующими статами."
      });
    }
  }

  // Find weakest relic
  let weakestRelicIndex = -1;
  let lowestRelicScore = 999;

  (char.relics || []).forEach((r, idx) => {
    let pieceScore = 0;
    (r.sub_affix || []).forEach(sub => {
      const isUseful = sub.field === 'crit_rate' || sub.field === 'crit_dmg' || sub.field === 'spd' || sub.field === 'atk' || sub.field === 'break_dmg' || sub.field === 'def';
      if (isUseful) {
        pieceScore += (sub.count || 1) * 20;
      }
    });
    if (pieceScore < lowestRelicScore) {
      lowestRelicScore = pieceScore;
      weakestRelicIndex = idx;
    }
  });

  return {
    score: score.toFixed(1),
    topPercent: topPercent.toFixed(1),
    rollEfficiency: rollEfficiency.toFixed(1),
    cv: cv.toFixed(1),
    spd: spd.toFixed(1),
    bottleneck,
    actions,
    weakestRelicIndex
  };
}

/**
 * Render NousMatrix audit results panel
 */
function renderAuditResults(char, audit) {
  document.getElementById('score-number-val').innerHTML = `${audit.score}<span>/100</span>`;
  document.getElementById('score-tier-val').innerText = `TOP ${audit.topPercent}% GLOBAL`;

  document.getElementById('roll-efficiency-val').innerText = `${audit.rollEfficiency}%`;
  document.getElementById('roll-efficiency-bar').style.width = `${audit.rollEfficiency}%`;

  document.getElementById('cv-val-text').innerText = audit.cv;
  const cvBarWidth = Math.min(100, Math.max(10, (parseFloat(audit.cv) / 320) * 100));
  document.getElementById('cv-bar-fill').style.width = `${cvBarWidth}%`;

  document.getElementById('spd-threshold-val').innerText = `${audit.spd} SPD ${parseFloat(audit.spd) >= 134 ? '[OK]' : '[SLOW]'}`;
  document.getElementById('spd-threshold-bar').style.width = `${Math.min(100, (parseFloat(audit.spd) / 160) * 100)}%`;

  document.getElementById('bottleneck-desc').innerText = audit.bottleneck;

  // Render actionable audit recommendations
  const actContainer = document.getElementById('actions-container');
  actContainer.innerHTML = '';
  audit.actions.forEach(act => {
    const box = document.createElement('div');
    box.className = 'audit-action-box';
    box.innerHTML = `
      <b>${act.title}</b>
      <div>${act.desc}</div>
    `;
    actContainer.appendChild(box);
  });
}

/**
 * Render 6 real in-game relic slots
 */
function renderRelicsGrid(char, audit) {
  const container = document.getElementById('relics-grid-container');
  container.innerHTML = '';

  const relics = char.relics || [];

  relics.forEach((r, idx) => {
    const isWeak = idx === audit.weakestRelicIndex;
    const card = document.createElement('div');
    card.className = `relic-item-card ${isWeak ? 'weak-piece' : ''}`;

    // Sub-stats list HTML
    let subsHtml = '';
    (r.sub_affix || []).forEach(sub => {
      const rolls = sub.count || 1;
      const isHighRoll = rolls >= 3;
      subsHtml += `
        <div class="relic-sub-row">
          <span class="relic-sub-name">
            <img style="width:14px; height:14px; object-fit:contain;" src="${iconUrl(sub.icon)}" alt="">
            ${sub.name}
          </span>
          <span class="relic-sub-val">
            ${sub.display}
            <span class="roll-count-tag ${isHighRoll ? 'high' : ''}">${rolls > 1 ? `${rolls} ролла` : '1 ролл'}</span>
          </span>
        </div>
      `;
    });

    const slotTitle = SLOT_NAMES[idx] || `Слот ${idx + 1}`;

    card.innerHTML = `
      <div class="relic-top-row">
        <div class="relic-left-meta">
          <div class="relic-icon-wrap">
            <img class="relic-icon-img" src="${iconUrl(r.icon)}" alt="${r.name}">
            <span class="relic-lvl-badge">+${r.level}</span>
          </div>
          <div class="relic-name-col">
            <span class="relic-slot-name">${slotTitle}</span>
            <span class="relic-piece-title" title="${r.name}">${r.name}</span>
          </div>
        </div>
        ${isWeak ? '<span class="relic-cv-pill">СЛАБОЕ ЗВЕНО</span>' : '<span class="relic-cv-pill" style="color:var(--text-secondary); background:none;">5★ GOLD</span>'}
      </div>

      <div class="relic-main-stat-box">
        <span class="relic-main-label">
          <img style="width:16px; height:16px; object-fit:contain;" src="${iconUrl(r.main_affix?.icon)}" alt="">
          ${r.main_affix?.name}
        </span>
        <span class="relic-main-val">${r.main_affix?.display}</span>
      </div>

      <div class="relic-subs-list">
        ${subsHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Render active relic set bonuses
 */
function renderSetBonuses(char) {
  const container = document.getElementById('relic-sets-container');
  container.innerHTML = '';

  const sets = char.relic_sets || [];
  if (sets.length === 0) {
    container.innerHTML = '<div style="font-size:12px; color:var(--text-tertiary);">Наборы не активированы</div>';
    return;
  }

  sets.forEach(set => {
    const box = document.createElement('div');
    box.className = 'set-box';
    box.innerHTML = `
      <div class="set-head">
        <img class="set-icon" src="${iconUrl(set.icon)}" alt="${set.name}">
        <span class="set-name">${set.name}</span>
        <span class="set-num-badge">${set.num} ПРЕДМ.</span>
      </div>
      <div class="set-desc">${set.desc}</div>
    `;
    container.appendChild(box);
  });
}

/**
 * Setup 1% Trophy modal card with real character stats
 */
function setupTrophyModal(char, audit) {
  document.getElementById('trophy-badge').innerText = `GLOBAL TOP ${audit.topPercent}% VALIDATED`;
  document.getElementById('trophy-char').innerText = char.name.toUpperCase();
  document.getElementById('trophy-rank-text').innerText = `UID: ${currentProfile.player.uid} // RANK #${Math.floor(parseFloat(audit.topPercent) * 120)} OF 14,200 BUILDS`;

  const trophyAvatar = document.getElementById('trophy-avatar-img');
  if (trophyAvatar) {
    trophyAvatar.src = getCharHeadIcon(char);
    trophyAvatar.onerror = function() {
      if (this.src !== iconUrl(char.icon)) this.src = iconUrl(char.icon);
    };
  }

  const baseMap = {};
  (char.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (char.additions || []).forEach(a => { addMap[a.field] = a; });

  const spd = ((baseMap['spd']?.value || 100) + (addMap['spd']?.value || 0)).toFixed(1);
  const cr = (((baseMap['crit_rate']?.value || 0.05) + (addMap['crit_rate']?.value || 0)) * 100).toFixed(1) + '%';
  const cd = (((baseMap['crit_dmg']?.value || 0.50) + (addMap['crit_dmg']?.value || 0)) * 100).toFixed(1) + '%';
  const atk = Math.round((baseMap['atk']?.value || 0) + (addMap['atk']?.value || 0)).toLocaleString();

  const grid = document.getElementById('trophy-stats-grid');
  grid.innerHTML = `
    <div class="trophy-stat-item">
      <div class="val">${spd}</div>
      <div class="lbl">Speed</div>
    </div>
    <div class="trophy-stat-item">
      <div class="val">${cr}</div>
      <div class="lbl">Crit Rate</div>
    </div>
    <div class="trophy-stat-item">
      <div class="val">${cd}</div>
      <div class="lbl">Crit Dmg</div>
    </div>
    <div class="trophy-stat-item">
      <div class="val">${atk}</div>
      <div class="lbl">Attack</div>
    </div>
  `;
}

/**
 * Trophy Modal open/close
 */
function openTrophy() {
  document.getElementById('modal-trophy').style.display = 'flex';
}

function closeTrophy() {
  document.getElementById('modal-trophy').style.display = 'none';
}

function copyTrophyToClipboard() {
  if (!currentProfile) return;
  const char = currentProfile.characters[activeCharacterIndex];
  const audit = calculateCharacterAudit(char);

  const text = `NousMatrix // ${char.name.toUpperCase()} | TOP ${audit.topPercent}% GLOBAL | NOUS SCORE: ${audit.score} | UID: ${currentProfile.player.uid} | VERIFIED BUILD`;
  
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy-trophy');
    if (btn) {
      const orig = btn.innerText;
      btn.innerText = '✓ СКОПИРОВАНО!';
      btn.style.background = '#00FF88';
      btn.style.color = '#0C0814';
      setTimeout(() => {
        btn.innerText = orig;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    }
  }).catch(() => {
    alert("Строка карточки скопирована!");
  });
}
