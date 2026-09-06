// ============================================
// UI - Event Handlers & Modal Controllers (Non-Overlapping Modal Manager)
// ============================================

const EventHandlers = {
  init() {
    this._setupCanvas();
    this._setupButtons();
    this._setupKeyboard();
    this._setupModals();
    this._setupGuide();
    this._setupStory();
    this._setupAchievements();
    this._setupBackdropDismiss();
  },

  closeAllModals() {
    this.hideScreen('guide-modal');
    this.hideScreen('codex-modal');
    this.hideScreen('story-modal');
    this.hideScreen('achievements-modal');
    this.hideScreen('incident-modal');
    this.hideScreen('tower-code-modal');
    this.hideScreen('dsa-modal');
    this.hideScreen('iac-modal');
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

  _setupBackdropDismiss() {
    const modalIds = [
      'guide-modal', 'codex-modal', 'achievements-modal', 
      'story-modal', 'incident-modal', 'tower-code-modal', 
      'dsa-modal', 'iac-modal'
    ];
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el) {
            this.hideScreen(id);
            if (!GameState.gameStarted && (id === 'story-modal' || id === 'codex-modal' || id === 'guide-modal')) {
              this.showScreen('intro-screen');
            }
          }
        });
      }
    });
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
        if (typeof AchievementSystem !== 'undefined') {
          AchievementSystem.unlock('focus_target');
        }
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
    // Start Intro -> Level Select (Sandbox Mode)
    document.getElementById('btn-intro-play')?.addEventListener('click', () => {
      AudioSystem.init();
      AudioSystem.startMusic();
      StorySystem.isStoryMode = false;
      this.closeAllModals();
      this.hideScreen('intro-screen');
      this.showLevelSelect();
    });

    // Start Intro -> Story Campaign Mode
    document.getElementById('btn-intro-story')?.addEventListener('click', () => {
      AudioSystem.init();
      AudioSystem.startMusic();
      this.closeAllModals();
      StorySystem.startCampaignChapter(1);
    });

    // Level Select -> Back to Intro
    document.getElementById('btn-level-back')?.addEventListener('click', () => {
      this.hideScreen('level-select-screen');
      this.showScreen('intro-screen');
    });

    // Start Game from Level Select
    document.getElementById('btn-launch-level')?.addEventListener('click', () => {
      this.closeAllModals();
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
      if (StorySystem.isStoryMode && StorySystem.activeChapter && StorySystem.activeChapter.id < STORY_CHAPTERS.length) {
        this.hideScreen('victory-screen');
        StorySystem.startCampaignChapter(StorySystem.activeChapter.id + 1);
      } else {
        this._restart();
      }
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

    // Music Toggle
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

  _setupStory() {
    document.getElementById('btn-story-launch')?.addEventListener('click', () => {
      StorySystem.confirmDecisionAndStart();
    });

    document.getElementById('btn-close-story')?.addEventListener('click', () => {
      this.hideScreen('story-modal');
      if (!GameState.gameStarted) {
        this.showScreen('intro-screen');
      }
    });
  },

  _setupAchievements() {
    document.getElementById('achievement-count')?.parentElement?.addEventListener('click', () => {
      this.closeAllModals();
      if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.showAchievementsModal();
      }
    });

    document.getElementById('btn-close-achievements')?.addEventListener('click', () => {
      if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.closeAchievementsModal();
      }
    });
  },

  _setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!GameState.gameStarted) return;

      if (e.key === 'Escape') {
        Shop.deselectAll();
        GameState.selectPlacedTower(null);
        this.closeAllModals();
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
      this.closeAllModals();
      this.openCodex();
    });
    document.getElementById('btn-intro-codex')?.addEventListener('click', () => {
      this.closeAllModals();
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

    // Tower Code Modal Handlers
    document.getElementById('btn-close-tower-code')?.addEventListener('click', () => {
      if (typeof TowerCodeSystem !== 'undefined') TowerCodeSystem.closeModal();
    });
    document.getElementById('btn-tower-code-compile')?.addEventListener('click', () => {
      if (typeof TowerCodeSystem !== 'undefined') TowerCodeSystem.compileAndApply();
    });
    document.getElementById('btn-tower-code-reset')?.addEventListener('click', () => {
      if (typeof TowerCodeSystem !== 'undefined') TowerCodeSystem.resetDefault();
    });

    // DSA Modal Handlers
    document.getElementById('btn-dsa')?.addEventListener('click', () => {
      this.closeAllModals();
      if (typeof DSAVisualizer !== 'undefined') DSAVisualizer.showModal('queue');
    });
    document.getElementById('btn-close-dsa')?.addEventListener('click', () => {
      if (typeof DSAVisualizer !== 'undefined') DSAVisualizer.closeModal();
    });
    document.getElementById('tab-dsa-queue')?.addEventListener('click', () => {
      if (typeof DSAVisualizer !== 'undefined') DSAVisualizer.setTab('queue');
    });
    document.getElementById('tab-dsa-cache')?.addEventListener('click', () => {
      if (typeof DSAVisualizer !== 'undefined') DSAVisualizer.setTab('cache');
    });
    document.getElementById('tab-dsa-lb')?.addEventListener('click', () => {
      if (typeof DSAVisualizer !== 'undefined') DSAVisualizer.setTab('lb');
    });

    // IaC Modal Handlers
    document.getElementById('btn-iac')?.addEventListener('click', () => {
      this.closeAllModals();
      this.openIaC();
    });
    document.getElementById('btn-close-iac')?.addEventListener('click', () => {
      this.hideScreen('iac-modal');
    });
    document.getElementById('tab-iac-docker')?.addEventListener('click', () => {
      this.renderIaCDocker();
    });
    document.getElementById('tab-iac-k8s')?.addEventListener('click', () => {
      this.renderIaCK8s();
    });
    document.getElementById('btn-copy-iac')?.addEventListener('click', () => {
      const code = document.getElementById('iac-code-content')?.textContent;
      if (code) {
        navigator.clipboard.writeText(code);
        const btn = document.getElementById('btn-copy-iac');
        if (btn) {
          btn.textContent = '¡COPIADO!';
          setTimeout(() => { btn.textContent = 'COPIAR'; }, 1500);
        }
      }
    });
  },

  openIaC() {
    this.closeAllModals();
    this.showScreen('iac-modal', 'flex');
    this.renderIaCDocker();
  },

  renderIaCDocker() {
    document.getElementById('tab-iac-docker')?.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40');
    document.getElementById('tab-iac-k8s')?.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40');
    if (typeof IaCGenerator !== 'undefined') {
      const yaml = IaCGenerator.generateDockerCompose();
      const codeEl = document.getElementById('iac-code-content');
      if (codeEl) codeEl.textContent = yaml;
    }
  },

  renderIaCK8s() {
    document.getElementById('tab-iac-k8s')?.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40');
    document.getElementById('tab-iac-docker')?.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40');
    if (typeof IaCGenerator !== 'undefined') {
      const yaml = IaCGenerator.generateKubernetes();
      const codeEl = document.getElementById('iac-code-content');
      if (codeEl) codeEl.textContent = yaml;
    }
  },

  _setupGuide() {
    document.getElementById('btn-guide')?.addEventListener('click', () => {
      this.closeAllModals();
      this.openGuide();
    });
    document.getElementById('btn-intro-guide')?.addEventListener('click', () => {
      this.closeAllModals();
      this.openGuide();
    });
    document.getElementById('btn-close-guide')?.addEventListener('click', () => {
      this.closeGuide();
    });
  },

  openGuide() {
    this.closeAllModals();
    this.showScreen('guide-modal', 'flex');
    this.renderGuideSection(0);
  },

  closeGuide() {
    this.hideScreen('guide-modal');
    if (!GameState.gameStarted) {
      this.showScreen('intro-screen');
    }
  },

  renderGuideSection(idx) {
    const tabsContainer = document.getElementById('guide-tabs');
    const contentContainer = document.getElementById('guide-content');
    if (!tabsContainer || !contentContainer) return;

    tabsContainer.innerHTML = GUIDE_SECTIONS.map((sec, i) => `
      <button class="w-full text-left p-3 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer ${i === idx ? 'bg-green-600 text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}" data-idx="${i}">
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
    this.closeAllModals();
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
      card.className = `p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'border-green-400 bg-green-950/40 shadow-[0_0_25px_rgba(0,255,65,0.25)] scale-[1.02]' : 'border-white/10 bg-[#080d18] hover:border-cyan-500/40 hover:bg-[#0c1424]'}`;

      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-cyan-400 font-heading tracking-wider">NIVEL ${lvl.id}</span>
          <span class="text-xs px-2.5 py-0.5 rounded-lg font-bold font-code ${lvl.difficultyRating === 'Baja' ? 'bg-green-500/20 text-green-400' : lvl.difficultyRating === 'Media' ? 'bg-cyan-500/20 text-cyan-300' : lvl.difficultyRating === 'Alta' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}">${lvl.difficultyRating}</span>
        </div>
        <div class="text-base font-bold text-white mb-1.5 font-heading tracking-wide">${lvl.name}</div>
        <div class="text-xs text-slate-300 leading-relaxed mb-3">${lvl.description}</div>
        
        <div class="p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-cyan-300 mb-3">
          <div class="font-bold text-cyan-400 mb-0.5">${lvl.mechanicTitle || 'MECÁNICA ESPECIAL'}:</div>
          <div class="text-xs text-slate-300 leading-tight">${lvl.mechanicDesc || 'Defensa 360.'}</div>
        </div>

        <div class="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-code">
          <span class="text-slate-400">Oleadas: <b class="text-white">${lvl.maxWaves}</b></span>
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
      btn.className = `py-2.5 px-5 rounded-xl text-xs font-bold uppercase transition-all border font-heading cursor-pointer ${isSelected ? 'bg-green-500 text-black border-green-400 shadow-lg scale-105 neon-border' : 'bg-[#080d18] text-slate-400 border-white/10 hover:text-white hover:border-white/20'}`;
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
    this.closeAllModals();
    this.showScreen('codex-modal', 'flex');
    this.renderCodexTowers();
  },

  closeCodex() {
    this.hideScreen('codex-modal');
    if (!GameState.gameStarted) {
      this.showScreen('intro-screen');
    }
  },

  renderCodexTowers() {
    document.getElementById('tab-codex-towers')?.classList.add('text-green-400', 'border-b-2', 'border-green-400');
    document.getElementById('tab-codex-threats')?.classList.remove('text-green-400', 'border-b-2', 'border-green-400');

    const container = document.getElementById('codex-content');
    container.innerHTML = CODEX_DATA.towers.map(t => {
      const def = TOWER_CONFIG[t.id];
      return `
        <div class="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-2">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs" style="background:${def.color}20;color:${def.color};border:1.5px solid ${def.color}">${def.icon}</span>
            <div>
              <div class="text-base font-bold text-white font-heading">${t.title}</div>
              <div class="text-xs text-cyan-400 font-code">${t.concept}</div>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${t.desc}</p>
          <div class="text-xs text-yellow-300/90"><span class="text-slate-500 font-medium">Ejemplo Real:</span> ${t.realWorldExample}</div>
          <div class="text-xs text-green-300/90"><span class="text-slate-500 font-medium">Consejo Táctico:</span> ${t.tip}</div>
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
        <div class="p-4 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-white font-heading">${th.name}</span>
            <span class="text-xs px-2.5 py-0.5 rounded-lg font-bold font-code ${th.danger.includes('Jefe') || th.danger.includes('Extremo') ? 'bg-red-500/30 text-red-300' : 'bg-yellow-500/20 text-yellow-400'}">${th.danger}</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${th.desc}</p>
        </div>
      `;
    }).join('');
  },

  _restart() {
    this.closeAllModals();
    this.hideScreen('gameover-screen');
    this.hideScreen('victory-screen');
    this.showScreen('game-container', 'flex');
    GameState.restart();
  },

  showGameOver(wave, score) {
    this.closeAllModals();
    this.hideScreen('game-container');
    this.showScreen('gameover-screen', 'flex');
    document.getElementById('go-wave').textContent = wave;
    document.getElementById('go-score').textContent = score.toLocaleString();
  },

  showVictory(score) {
    this.closeAllModals();
    this.hideScreen('game-container');
    this.showScreen('victory-screen', 'flex');
    document.getElementById('v-score').textContent = score.toLocaleString();

    if (StorySystem.isStoryMode && StorySystem.activeChapter) {
      const nextChapterId = StorySystem.activeChapter.id + 1;
      const vBtn = document.getElementById('btn-levels-v');
      if (vBtn) {
        if (nextChapterId <= STORY_CHAPTERS.length) {
          vBtn.textContent = `SIGUIENTE: CAPÍTULO ${nextChapterId}`;
        } else {
          vBtn.textContent = 'CAMPAÑA COMPLETADA (RANGO S)';
        }
      }
    }
  },
};
