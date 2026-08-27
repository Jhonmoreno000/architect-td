// ============================================
// UI - Event Handlers & Modal Controllers (Guide, Right-Click & Hotkeys)
// ============================================

const EventHandlers = {
  init() {
    this._setupCanvas();
    this._setupButtons();
    this._setupKeyboard();
    this._setupModals();
    this._setupGuide();
  },

  hideScreen(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  },

  showScreen(id, displayType = 'flex') {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      el.style.display = displayType;
    }
  },

  _setupCanvas() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    // Left Click: Placement / Inspection / Loot
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (GameState.engine) {
        GameState.engine.checkLootCollection(x, y);
      }

      const coords = GridSystem.getGridCoords(x, y);
      if (coords) {
        if (GameState.selectedTower) {
          const success = GridSystem.placeTower(GameState.selectedTower, coords.gx, coords.gy);
          if (success && !e.shiftKey) {
            Shop.deselectAll();
          }
        } else {
          const existing = GridSystem.getTowerAt(coords.gx, coords.gy);
          GameState.selectPlacedTower(existing || null);
        }
      }
    });

    // Right Click: Manual Focus Target
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (GameState.engine) {
        GameState.engine.setFocusTarget(x, y);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (GameState.engine) {
        GameState.engine.checkLootCollection(x, y);
        const coords = GridSystem.getGridCoords(x, y);
        GameState.engine.hoveredCell = coords;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (GameState.engine) GameState.engine.hoveredCell = null;
    });
  },

  _setupButtons() {
    // Start Intro -> Level Select
    document.getElementById('btn-intro-play')?.addEventListener('click', () => {
      AudioSystem.init();
      AudioSystem.startMusic();
      this.hideScreen('intro-screen');
      this.showLevelSelect();
    });

    // Level Select -> Back to Intro
    document.getElementById('btn-level-back')?.addEventListener('click', () => {
      this.hideScreen('level-select-screen');
      this.showScreen('intro-screen');
    });

    // Start Game from Level Select
    document.getElementById('btn-launch-level')?.addEventListener('click', () => {
      this.hideScreen('level-select-screen');
      this.showScreen('game-container', 'flex');
      GameState.init();
    });

    // Call wave early
    document.getElementById('btn-call-wave-early')?.addEventListener('click', () => {
      WaveSystem.callWaveEarly();
    });

    // Restart buttons
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this._restart();
    });
    document.getElementById('btn-restart2')?.addEventListener('click', () => {
      this._restart();
    });

    // Level Select from Game Over / Victory
    document.getElementById('btn-levels-go')?.addEventListener('click', () => {
      this.hideScreen('gameover-screen');
      this.showLevelSelect();
    });
    document.getElementById('btn-levels-v')?.addEventListener('click', () => {
      this.hideScreen('victory-screen');
      this.showLevelSelect();
    });

    // Pause / Play
    document.getElementById('btn-pause')?.addEventListener('click', () => {
      GameState.togglePause();
      document.getElementById('btn-pause').textContent = GameState.paused ? 'PLAY' : 'PAUSE';
    });

    // Speed Multiplier Toggle (1x -> 2x -> 4x)
    let speedIdx = 0;
    const speeds = [1, 2, 4];
    document.getElementById('btn-speed')?.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      const speed = speeds[speedIdx];
      document.getElementById('btn-speed').textContent = `${speed}x`;
      if (GameState.engine) GameState.engine.speedMultiplier = speed;
      AudioSystem.play('click');
    });

    // Music & Sound Toggles
    document.getElementById('btn-toggle-music')?.addEventListener('click', () => {
      const isPlaying = AudioSystem.toggleMusic();
      document.getElementById('music-label').textContent = isPlaying ? 'ON' : 'OFF';
      document.getElementById('btn-toggle-music').style.opacity = isPlaying ? '1' : '0.4';
    });

    // DevOps Ability Buttons
    document.getElementById('ability-btn-autoscale')?.addEventListener('click', () => {
      CombatSystem.triggerAbility('autoscale');
    });
    document.getElementById('ability-btn-shield')?.addEventListener('click', () => {
      CombatSystem.triggerAbility('shield');
    });
    document.getElementById('ability-btn-reboot')?.addEventListener('click', () => {
      CombatSystem.triggerAbility('reboot');
    });
  },

  _setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!GameState.gameStarted) return;

      if (e.key === 'Escape') {
        Shop.deselectAll();
        GameState.selectPlacedTower(null);
        this.closeCodex();
        this.closeGuide();
        IncidentSystem.closeModal();
      }

      // Shop numbers 1-9 and 0
      const towerKeys = [
        'loadbalancer',
        'circuitbreaker',
        'apigateway',
        'cache',
        'waf',
        'messagequeue',
        'cdn',
        'database',
        'servicemesh',
        'honeypot'
      ];

      if (e.key === '0') {
        Shop.selectTower(towerKeys[9]);
      } else {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
          Shop.selectTower(towerKeys[num - 1]);
        }
      }

      // DevOps abilities shortcuts
      if (e.key === 'q' || e.key === 'Q') CombatSystem.triggerAbility('autoscale');
      if (e.key === 'w' || e.key === 'W') CombatSystem.triggerAbility('shield');
      if (e.key === 'e' || e.key === 'E') CombatSystem.triggerAbility('reboot');

      // Repair hotkey [R]
      if (e.key === 'r' || e.key === 'R') {
        if (GameState.selectedPlacedTower) {
          GameState.selectedPlacedTower.repair();
          HUD.updateInspector(GameState);
        }
      }

      if (e.key === 'Enter' && WaveSystem.isPrepPhase) {
        WaveSystem.callWaveEarly();
      }

      if (e.key === ' ') {
        e.preventDefault();
        document.getElementById('btn-pause')?.click();
      }
    });
  },

  _setupModals() {
    document.getElementById('btn-codex')?.addEventListener('click', () => {
      this.openCodex();
    });
    document.getElementById('btn-intro-codex')?.addEventListener('click', () => {
      this.openCodex();
    });
    document.getElementById('btn-close-codex')?.addEventListener('click', () => {
      this.closeCodex();
    });

    document.getElementById('tab-codex-towers')?.addEventListener('click', () => {
      this.renderCodexTowers();
    });
    document.getElementById('tab-codex-threats')?.addEventListener('click', () => {
      this.renderCodexThreats();
    });
  },

  _setupGuide() {
    document.getElementById('btn-guide')?.addEventListener('click', () => {
      this.openGuide();
    });
    document.getElementById('btn-intro-guide')?.addEventListener('click', () => {
      this.openGuide();
    });
    document.getElementById('btn-close-guide')?.addEventListener('click', () => {
      this.closeGuide();
    });
  },

  openGuide() {
    this.showScreen('guide-modal', 'flex');
    this.renderGuideSection(0);
  },

  closeGuide() {
    this.hideScreen('guide-modal');
  },

  renderGuideSection(idx) {
    const tabsContainer = document.getElementById('guide-tabs');
    const contentContainer = document.getElementById('guide-content');
    if (!tabsContainer || !contentContainer) return;

    tabsContainer.innerHTML = GUIDE_SECTIONS.map((sec, i) => `
      <button class="w-full text-left p-2.5 rounded-lg text-xs font-bold font-heading transition-all ${i === idx ? 'bg-green-600 text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}" data-idx="${i}">
        ${sec.title}
      </button>
    `).join('');

    contentContainer.innerHTML = GUIDE_SECTIONS[idx].content;

    tabsContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        this.renderGuideSection(i);
      });
    });
  },

  showLevelSelect() {
    this.hideScreen('intro-screen');
    this.hideScreen('game-container');
    this.hideScreen('gameover-screen');
    this.hideScreen('victory-screen');
    this.showScreen('level-select-screen', 'flex');

    this.renderLevelList();
    this.renderDifficultyList();
  },

  renderLevelList() {
    const container = document.getElementById('levels-grid');
    if (!container) return;
    container.innerHTML = '';

    LEVEL_CONFIGS.forEach((lvl) => {
      const isSelected = GameState.selectedLevelId === lvl.id;
      const card = document.createElement('div');
      card.className = `p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-green-400 bg-green-950/40 shadow-[0_0_20px_rgba(0,255,65,0.25)] scale-[1.02]' : 'border-white/10 bg-[#080d18] hover:border-cyan-500/40 hover:bg-[#0c1424]'}`;

      card.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-cyan-400 font-heading">NIVEL ${lvl.id}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-md font-bold font-code ${lvl.difficultyRating === 'Baja' ? 'bg-green-500/20 text-green-400' : lvl.difficultyRating === 'Media' ? 'bg-cyan-500/20 text-cyan-300' : lvl.difficultyRating === 'Alta' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}">${lvl.difficultyRating}</span>
        </div>
        <div class="text-sm font-bold text-white mb-1 font-heading tracking-wide">${lvl.name}</div>
        <div class="text-[11px] text-slate-400 line-clamp-2 leading-tight mb-2">${lvl.description}</div>
        
        <div class="p-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-cyan-300 mb-2">
          <div class="font-bold text-cyan-400">${lvl.mechanicTitle || 'MECÁNICA ESPECIAL'}:</div>
          <div class="text-[9px] text-slate-400 leading-tight">${lvl.mechanicDesc || 'Defensa 360.'}</div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-code">
          <span class="text-slate-500">Oleadas: <b class="text-white">${lvl.maxWaves}</b></span>
          <span class="text-yellow-400 font-bold">$${lvl.startMoney} inicial</span>
        </div>
      `;

      card.addEventListener('click', () => {
        GameState.selectedLevelId = lvl.id;
        AudioSystem.play('click');
        this.renderLevelList();
      });

      container.appendChild(card);
    });
  },

  renderDifficultyList() {
    const container = document.getElementById('difficulty-selector');
    if (!container) return;
    container.innerHTML = '';

    Object.entries(DIFFICULTY_SETTINGS).forEach(([key, diff]) => {
      const isSelected = GameState.currentDifficulty === key;
      const btn = document.createElement('button');
      btn.className = `py-2 px-4 rounded-xl text-xs font-bold uppercase transition-all border font-heading ${isSelected ? 'bg-green-500 text-black border-green-400 shadow-lg scale-105 neon-border' : 'bg-[#080d18] text-slate-400 border-white/10 hover:text-white hover:border-white/20'}`;
      btn.textContent = diff.name;

      btn.addEventListener('click', () => {
        GameState.currentDifficulty = key;
        AudioSystem.play('click');
        this.renderDifficultyList();
      });

      container.appendChild(btn);
    });
  },

  openCodex() {
    this.showScreen('codex-modal', 'flex');
    this.renderCodexTowers();
  },

  closeCodex() {
    this.hideScreen('codex-modal');
  },

  renderCodexTowers() {
    document.getElementById('tab-codex-towers')?.classList.add('text-green-400', 'border-b-2', 'border-green-400');
    document.getElementById('tab-codex-threats')?.classList.remove('text-green-400', 'border-b-2', 'border-green-400');

    const container = document.getElementById('codex-content');
    container.innerHTML = CODEX_DATA.towers.map(t => {
      const def = TOWER_CONFIG[t.id];
      return `
        <div class="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs" style="background:${def.color}20;color:${def.color};border:1px solid ${def.color}">${def.icon}</span>
            <div>
              <div class="text-sm font-bold text-white font-heading">${t.title}</div>
              <div class="text-[11px] text-cyan-400 font-code">${t.concept}</div>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${t.desc}</p>
          <div class="text-[11px] text-yellow-300/90"><span class="text-slate-500 font-medium">💡 Ejemplo Real:</span> ${t.realWorldExample}</div>
          <div class="text-[11px] text-green-300/90"><span class="text-slate-500 font-medium">🎯 Consejo Táctico:</span> ${t.tip}</div>
        </div>
      `;
    }).join('');
  },

  renderCodexThreats() {
    document.getElementById('tab-codex-threats')?.classList.add('text-green-400', 'border-b-2', 'border-green-400');
    document.getElementById('tab-codex-towers')?.classList.remove('text-green-400', 'border-b-2', 'border-green-400');

    const container = document.getElementById('codex-content');
    container.innerHTML = CODEX_DATA.threats.map(th => {
      return `
        <div class="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white font-heading">${th.name}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-md font-bold font-code ${th.danger.includes('Jefe') || th.danger.includes('Extremo') ? 'bg-red-500/30 text-red-300' : 'bg-yellow-500/20 text-yellow-400'}">${th.danger}</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${th.desc}</p>
        </div>
      `;
    }).join('');
  },

  _restart() {
    this.hideScreen('gameover-screen');
    this.hideScreen('victory-screen');
    this.showScreen('game-container', 'flex');
    GameState.restart();
  },

  showGameOver(wave, score) {
    this.hideScreen('game-container');
    this.showScreen('gameover-screen', 'flex');
    document.getElementById('go-wave').textContent = wave;
    document.getElementById('go-score').textContent = score.toLocaleString();
  },

  showVictory(score) {
    this.hideScreen('game-container');
    this.showScreen('victory-screen', 'flex');
    document.getElementById('v-score').textContent = score.toLocaleString();
  },
};
