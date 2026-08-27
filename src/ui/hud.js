// ============================================
// UI - HUD, Live Observability Telemetry & Inspector with Server Repair
// ============================================

const HUD = {
  livesFill: null,
  livesText: null,
  shieldBadge: null,
  moneyText: null,
  waveText: null,
  scoreText: null,
  comboText: null,
  levelTitle: null,
  towerInfoPanel: null,
  abilitiesPanel: null,
  callWaveBtn: null,

  init() {
    this.livesFill = document.getElementById('lives-fill');
    this.livesText = document.getElementById('lives-text');
    this.shieldBadge = document.getElementById('shield-badge');
    this.moneyText = document.getElementById('money-text');
    this.waveText = document.getElementById('wave-text');
    this.scoreText = document.getElementById('score-text');
    this.comboText = document.getElementById('combo-text');
    this.levelTitle = document.getElementById('hud-level-title');
    this.towerInfoPanel = document.getElementById('tower-inspector');
    this.abilitiesPanel = document.getElementById('abilities-bar');
    this.callWaveBtn = document.getElementById('btn-call-wave-early');
  },

  update(state) {
    if (!this.livesText) this.init();

    // Level Header
    if (this.levelTitle && state.currentLevel) {
      this.levelTitle.textContent = `${state.currentLevel.name} [${state.currentDifficulty.toUpperCase()}]`;
    }

    // Lives
    const livesPct = Math.max(0, Math.min(1, state.lives / state.maxLives));
    if (this.livesText) {
      this.livesText.textContent = `${Math.max(0, state.lives)}/${state.maxLives}`;
    }
    if (this.livesFill) {
      this.livesFill.style.width = `${livesPct * 100}%`;
      this.livesFill.style.backgroundColor = livesPct > 0.5 ? '#00ff41' : livesPct > 0.25 ? '#ffcc00' : '#ff0055';
    }

    // Shield Badge
    if (this.shieldBadge) {
      if (state.shieldCharges > 0) {
        this.shieldBadge.classList.remove('hidden');
        this.shieldBadge.textContent = `🛡️ ESCUDO: ${state.shieldCharges}`;
      } else {
        this.shieldBadge.classList.add('hidden');
      }
    }

    // Money
    if (this.moneyText) {
      this.moneyText.textContent = `$${state.money}`;
      this.moneyText.className = 'font-bold text-base font-code tracking-wide ' + (state.money > 150 ? 'text-yellow-400' : state.money > 50 ? 'text-yellow-200' : 'text-red-400');
    }

    // Wave
    if (this.waveText) {
      const isEndless = state.difficultySettings && state.difficultySettings.isEndless;
      this.waveText.textContent = `${WaveSystem.wave}/${isEndless ? '∞' : WaveSystem.maxWaves}`;
    }

    // Early Wave Button during prep phase
    if (this.callWaveBtn) {
      if (WaveSystem.isPrepPhase) {
        this.callWaveBtn.classList.remove('hidden');
        const bonus = Math.round(WaveSystem.prepTimer * 10);
        this.callWaveBtn.innerHTML = `<span>🚀 LLAMAR OLEADA</span> <span class="text-yellow-400 font-code font-bold">(+$${bonus}) [${Math.ceil(WaveSystem.prepTimer)}s]</span>`;
      } else {
        this.callWaveBtn.classList.add('hidden');
      }
    }

    // Score & Combo
    if (this.scoreText) {
      this.scoreText.textContent = state.score.toLocaleString();
    }
    if (this.comboText) {
      if (CombatSystem.combo > 1) {
        this.comboText.classList.remove('hidden');
        this.comboText.textContent = `x${CombatSystem.combo}`;
      } else {
        this.comboText.classList.add('hidden');
      }
    }

    // Wave Progress Indicator
    const waveProgressFill = document.getElementById('wave-progress-fill');
    const waveEnemiesText = document.getElementById('wave-enemies-text');
    if (waveProgressFill && waveEnemiesText && state.engine) {
      const totalEnemies = WaveSystem.enemiesPerWave || 0;
      const remaining = state.engine.enemies.length + (WaveSystem.waveQueue ? WaveSystem.waveQueue.length : 0);
      const pct = totalEnemies > 0 ? Math.max(0, Math.min(100, ((totalEnemies - remaining) / totalEnemies) * 100)) : 0;
      waveProgressFill.style.width = `${pct}%`;
      waveEnemiesText.textContent = remaining;
      if (remaining === 0 && !WaveSystem.waveActive) {
        waveProgressFill.style.width = '100%';
        waveProgressFill.style.backgroundColor = '#00ff41';
      } else {
        waveProgressFill.style.backgroundColor = '#ef4444';
      }
    }

    // Achievement Counter
    const achCountEl = document.getElementById('achievement-count');
    if (achCountEl && typeof AchievementSystem !== 'undefined') {
      achCountEl.textContent = `${AchievementSystem.getCount()}/${AchievementSystem.getTotal()}`;
    }

    // Update Tower Shop button states
    document.querySelectorAll('.tower-btn').forEach(btn => {
      const type = btn.dataset.type;
      const def = TOWER_CONFIG[type];
      if (def) {
        btn.style.opacity = state.money >= def.cost ? '1' : '0.45';
      }
    });

    this.updateAbilities(state);
    this.updateInspector(state);
  },

  updateAbilities(state) {
    if (!this.abilitiesPanel) return;

    for (const [key, ability] of Object.entries(DEVOPS_ABILITIES)) {
      const btn = document.getElementById(`ability-btn-${key}`);
      const cdEl = document.getElementById(`ability-cd-${key}`);
      if (!btn || !cdEl) continue;

      const cd = (state.abilityCooldowns && state.abilityCooldowns[key]) || 0;
      const active = (state.activeAbilities && state.activeAbilities[key]) || 0;

      if (active > 0) {
        btn.classList.add('neon-border');
        cdEl.textContent = `${Math.ceil(active)}s ACTIVO`;
        cdEl.className = 'text-[10px] font-bold text-yellow-300 font-code';
      } else if (cd > 0) {
        btn.classList.remove('neon-border');
        btn.style.opacity = '0.45';
        cdEl.textContent = `${Math.ceil(cd)}s`;
        cdEl.className = 'text-[10px] font-code text-red-400 font-bold';
      } else {
        btn.classList.remove('neon-border');
        btn.style.opacity = '1';
        cdEl.textContent = 'LISTO';
        cdEl.className = 'text-[10px] font-bold text-green-400 font-code';
      }
    }
  },

  updateInspector(state) {
    if (!this.towerInfoPanel) return;
    const tower = state.selectedPlacedTower;

    if (!tower) {
      this.towerInfoPanel.classList.add('hidden');
      return;
    }

    this.towerInfoPanel.classList.remove('hidden');

    const config = TOWER_CONFIG[tower.type];
    const upgradeCost = tower.getUpgradeCost();
    const sellValue = tower.getSellValue();
    const canUpgrade = tower.canUpgrade();
    const synergies = tower.getActiveSynergies();
    const repairCost = tower.getRepairCost();
    const needsRepair = tower.hp < tower.maxHp || tower.isCrashed || tower.isRansomed;

    const dps = tower.fireRate > 0 ? ((tower.damage / (tower.fireRate / 60))).toFixed(1) : (tower.damage || 0);

    const statusText = tower.isCrashed ? '🚨 OFFLINE (CAÍDO)' : tower.isRansomed ? '🔒 ENCRIPTADO (RANSOM)' : '✓ ACTIVO (200 OK)';
    const statusColor = tower.isCrashed ? 'text-red-400' : tower.isRansomed ? 'text-pink-400' : 'text-green-400';

    this.towerInfoPanel.innerHTML = `
      <div class="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0" style="background:${tower.color}25;color:${tower.color};border:1px solid ${tower.color}">${tower.icon}</span>
          <div>
            <div class="text-xs font-bold text-white font-heading">${tower.name}</div>
            <div class="text-[10px] font-code ${statusColor}">${statusText}</div>
          </div>
        </div>
        <button id="btn-close-inspector" class="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10">✕</button>
      </div>

      <!-- Health & Durability Bar -->
      <div class="mb-2 bg-black/50 p-2 rounded-lg border border-white/5">
        <div class="flex items-center justify-between text-[10px] mb-1 font-heading">
          <span class="text-slate-400">SALUD DEL SERVIDOR:</span>
          <span class="font-code font-bold ${tower.hp > tower.maxHp * 0.5 ? 'text-green-400' : 'text-red-400'}">${Math.round(tower.hp)} / ${tower.maxHp} HP</span>
        </div>
        <div class="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
          <div class="h-full transition-all ${tower.hp > tower.maxHp * 0.5 ? 'bg-green-500' : 'bg-red-500'}" style="width: ${(tower.hp / tower.maxHp) * 100}%;"></div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-1 text-[11px] text-gray-300 mb-2 bg-black/40 p-2 rounded-lg border border-white/5">
        <div><span class="text-gray-500">Daño:</span> <span class="font-bold text-white font-code">${tower.damage}</span></div>
        <div><span class="text-gray-500">Rango:</span> <span class="font-bold text-white font-code">${tower.range}px</span></div>
        <div><span class="text-gray-500">Cadencia:</span> <span class="font-bold text-white font-code">${tower.fireRate > 0 ? (tower.fireRate / 60).toFixed(2) + 's' : 'N/A'}</span></div>
        <div><span class="text-gray-500">DPS:</span> <span class="font-bold text-yellow-400 font-code">${dps}</span></div>
        <div class="col-span-2 text-[10px] text-gray-400 mt-0.5 pt-0.5 border-t border-white/5">
          Daño total: <span class="text-green-400 font-code font-bold">${Math.round(tower.damageDealt)}</span>
        </div>
      </div>

      <!-- Active Synergies Card -->
      <div class="p-2 rounded-lg bg-yellow-950/20 border border-yellow-500/20 text-[10px] text-slate-300 mb-2">
        <div class="flex items-center justify-between text-yellow-400 font-bold mb-0.5">
          <span>🔗 SINERGIA DE RED</span>
          <span class="font-code">${synergies.length > 0 ? '✓ ACTIVA' : 'INACTIVA'}</span>
        </div>
        <div class="text-[9px] text-slate-400">${config.synergyDesc || 'Coloca módulos compatibles en el perímetro.'}</div>
      </div>

      <!-- Repair & Action Buttons -->
      <div class="space-y-1.5 mb-2">
        ${needsRepair ? `
          <button id="btn-repair-tower" class="w-full py-1.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between bg-cyan-600 hover:bg-cyan-500 text-black shadow-md hover:scale-[1.01] font-heading">
            <span>🔧 Reparar Servidor [R]</span>
            <span class="font-code font-bold">$${repairCost}</span>
          </button>
        ` : ''}

        <!-- Target Priority Mode Button -->
        <button id="btn-cycle-target" class="w-full py-1 px-2.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-[11px] font-bold uppercase tracking-wider hover:bg-cyan-900/50 transition-colors flex items-center justify-between font-heading">
          <span>Objetivo:</span>
          <span class="text-white bg-black/60 px-1.5 py-0.5 rounded font-code">[${tower.targetMode.toUpperCase()}]</span>
        </button>

        ${tower.level < 3 ? `
          <button id="btn-upgrade-tower" class="w-full py-1.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between ${canUpgrade ? 'bg-green-600 hover:bg-green-500 text-black shadow-md hover:scale-[1.01]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} font-heading">
            <span>Mejorar a Tier ${tower.level + 1}</span>
            <span class="font-code font-bold">$${upgradeCost}</span>
          </button>
        ` : `
          <div class="w-full py-1 text-center text-xs text-yellow-400 font-bold bg-yellow-950/30 border border-yellow-500/30 rounded-lg font-heading">
            ★ NIVEL MÁXIMO (TIER 3) ★
          </div>
        `}

        <button id="btn-sell-tower" class="w-full py-1 px-3 rounded-lg border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-900/40 text-[11px] uppercase font-bold tracking-wider transition-colors flex items-center justify-between font-heading">
          <span>Vender Servidor</span>
          <span class="text-yellow-400 font-code font-bold">+$${sellValue}</span>
        </button>
      </div>
    `;

    document.getElementById('btn-close-inspector')?.addEventListener('click', () => {
      GameState.selectPlacedTower(null);
    });

    document.getElementById('btn-repair-tower')?.addEventListener('click', () => {
      tower.repair();
      this.updateInspector(state);
    });

    document.getElementById('btn-cycle-target')?.addEventListener('click', () => {
      tower.cycleTargetMode();
      this.updateInspector(state);
    });

    document.getElementById('btn-upgrade-tower')?.addEventListener('click', () => {
      GridSystem.upgradeTower(tower);
      this.updateInspector(state);
    });

    document.getElementById('btn-sell-tower')?.addEventListener('click', () => {
      GridSystem.sellTower(tower);
    });
  }
};
