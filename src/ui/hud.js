// ============================================
// UI - HUD, Live Observability Telemetry & Inspector (High Readability)
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
        this.shieldBadge.innerHTML = `
          <span class="flex items-center gap-1 font-heading font-bold text-xs">
            <svg class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>ESCUDO: ${state.shieldCharges}</span>
          </span>
        `;
      } else {
        this.shieldBadge.classList.add('hidden');
      }
    }

    // Money
    if (this.moneyText) {
      this.moneyText.textContent = `$${state.money}`;
      this.moneyText.className = 'font-bold text-lg font-code tracking-wide ' + (state.money > 150 ? 'text-yellow-400' : state.money > 50 ? 'text-yellow-200' : 'text-red-400');
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
        this.callWaveBtn.innerHTML = `
          <span class="flex items-center gap-1.5 font-heading">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M13 6v12l8.5-6M4 6v12l8.5-6"/></svg>
            <span>INICIAR OLEADA</span>
            <span class="text-yellow-400 font-code font-bold">(+$${bonus}) [${Math.ceil(WaveSystem.prepTimer)}s]</span>
          </span>
        `;
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
      const total = Object.keys(AchievementSystem.definitions || {}).length || 18;
      const unlocked = AchievementSystem.unlocked ? AchievementSystem.unlocked.size : 0;
      achCountEl.textContent = `${unlocked}/${total}`;
    }

    // Update Tower Shop button states
    document.querySelectorAll('.tower-btn').forEach(btn => {
      const type = btn.dataset.type;
      const def = TOWER_CONFIG[type];
      if (def) {
        btn.style.opacity = state.money >= def.cost ? '1' : '0.4';
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
        cdEl.className = 'text-xs font-bold text-yellow-300 font-code';
      } else if (cd > 0) {
        btn.classList.remove('neon-border');
        btn.style.opacity = '0.45';
        cdEl.textContent = `${Math.ceil(cd)}s`;
        cdEl.className = 'text-xs font-code text-red-400 font-bold';
      } else {
        btn.classList.remove('neon-border');
        btn.style.opacity = '1';
        cdEl.textContent = 'LISTO';
        cdEl.className = 'text-xs font-bold text-green-400 font-code';
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

    const statusText = tower.isCrashed ? '[ERROR 500] SERVIDOR CAÍDO' : tower.isRansomed ? '[LOCK] ENCRIPTADO' : '[200 OK] SERVIDOR ACTIVO';
    const statusColor = tower.isCrashed ? 'text-red-400' : tower.isRansomed ? 'text-pink-400' : 'text-green-400';

    this.towerInfoPanel.innerHTML = `
      <div class="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style="background:${tower.color}25;color:${tower.color};border:1.5px solid ${tower.color}">${tower.icon}</span>
          <div>
            <div class="text-sm font-bold text-white font-heading">${tower.name}</div>
            <div class="text-xs font-code font-bold ${statusColor}">${statusText}</div>
          </div>
        </div>
        <button id="btn-close-inspector" class="text-slate-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 font-bold">✕</button>
      </div>

      <!-- Health & Durability Bar -->
      <div class="mb-3 bg-black/60 p-2.5 rounded-xl border border-white/10">
        <div class="flex items-center justify-between text-xs mb-1.5 font-heading">
          <span class="text-slate-300 font-bold">SALUD DEL SERVIDOR:</span>
          <span class="font-code font-bold ${tower.hp > tower.maxHp * 0.5 ? 'text-green-400' : 'text-red-400'}">${Math.round(tower.hp)} / ${tower.maxHp} HP</span>
        </div>
        <div class="w-full h-2.5 bg-black/70 rounded-full overflow-hidden border border-white/15">
          <div class="h-full transition-all ${tower.hp > tower.maxHp * 0.5 ? 'bg-green-500' : 'bg-red-500'}" style="width: ${(tower.hp / tower.maxHp) * 100}%;"></div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-2 text-xs text-slate-200 mb-3 bg-black/50 p-2.5 rounded-xl border border-white/10">
        <div><span class="text-slate-400 font-medium">Daño:</span> <span class="font-bold text-white font-code text-sm">${tower.damage}</span></div>
        <div><span class="text-slate-400 font-medium">Rango:</span> <span class="font-bold text-white font-code text-sm">${tower.range}px</span></div>
        <div><span class="text-slate-400 font-medium">Cadencia:</span> <span class="font-bold text-white font-code text-sm">${tower.fireRate > 0 ? (tower.fireRate / 60).toFixed(2) + 's' : 'N/A'}</span></div>
        <div><span class="text-slate-400 font-medium">DPS:</span> <span class="font-bold text-yellow-400 font-code text-sm">${dps}</span></div>
        <div class="col-span-2 text-xs text-slate-300 mt-1 pt-1.5 border-t border-white/10 flex items-center justify-between">
          <span class="text-slate-400">Daño acumulado:</span>
          <span class="text-green-400 font-code font-bold">${Math.round(tower.damageDealt)}</span>
        </div>
      </div>

      <!-- Active Synergies Card -->
      <div class="p-2.5 rounded-xl bg-yellow-950/30 border border-yellow-500/30 text-xs text-slate-200 mb-3">
        <div class="flex items-center justify-between text-yellow-400 font-bold mb-1 font-heading">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5 stroke-current" fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <span>SINERGIA DE RED</span>
          </span>
          <span class="font-code text-[11px]">${synergies.length > 0 ? '✓ ACTIVA' : 'INACTIVA'}</span>
        </div>
        <div class="text-slate-300 leading-relaxed text-[11px]">${config.synergyDesc || 'Coloca módulos compatibles en el perímetro.'}</div>
      </div>

      <!-- Repair & Action Buttons -->
      <div class="space-y-2 mb-2">
        ${needsRepair ? `
          <button id="btn-repair-tower" class="w-full py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between bg-cyan-600 hover:bg-cyan-500 text-black shadow-md hover:scale-[1.01] font-heading cursor-pointer">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              <span>Reparar Servidor [R]</span>
            </span>
            <span class="font-code font-bold text-sm">$${repairCost}</span>
          </button>
        ` : ''}

        <!-- Program Algorithm Button -->
        <button id="btn-program-tower" class="w-full py-2 px-3 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-wider hover:bg-purple-900/60 transition-all flex items-center justify-between font-heading cursor-pointer shadow-md">
          <span class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 stroke-current" fill="none" stroke-width="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span>Programar Algoritmo</span>
          </span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${tower.isScriptActive ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-purple-500/20 text-purple-300'}">
            ${tower.isScriptActive ? '✓ ACTIVO (+30%)' : 'CUSTOM JS'}
          </span>
        </button>

        <!-- Target Priority Mode Button -->
        <button id="btn-cycle-target" class="w-full py-1.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-bold uppercase tracking-wider hover:bg-cyan-900/50 transition-colors flex items-center justify-between font-heading cursor-pointer">
          <span>Prioridad Objetivo:</span>
          <span class="text-white bg-black/60 px-2 py-0.5 rounded font-code">[${tower.targetMode.toUpperCase()}]</span>
        </button>

        ${tower.level < 3 ? `
          <button id="btn-upgrade-tower" class="w-full py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-between ${canUpgrade ? 'bg-green-600 hover:bg-green-500 text-black shadow-md hover:scale-[1.01] cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} font-heading">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              <span>Mejorar a Tier ${tower.level + 1}</span>
            </span>
            <span class="font-code font-bold text-sm">$${upgradeCost}</span>
          </button>
        ` : `
          <div class="w-full py-2 text-center text-xs text-yellow-400 font-bold bg-yellow-950/40 border border-yellow-500/40 rounded-xl font-heading">
            ★ NIVEL MÁXIMO (TIER 3) ★
          </div>
        `}

        <button id="btn-sell-tower" class="w-full py-1.5 px-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-900/40 text-xs uppercase font-bold tracking-wider transition-colors flex items-center justify-between font-heading cursor-pointer">
          <span class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 stroke-current" fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Vender Servidor</span>
          </span>
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

    document.getElementById('btn-program-tower')?.addEventListener('click', () => {
      if (typeof TowerCodeSystem !== 'undefined') {
        TowerCodeSystem.openEditor(tower);
      }
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
