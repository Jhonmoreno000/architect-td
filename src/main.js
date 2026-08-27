// ============================================
// GAME STATE - Central State Management & Orchestrator
// ============================================

const GameState = {
  selectedLevelId: 1,
  currentLevel: null,
  currentDifficulty: 'staging',
  difficultySettings: null,

  lives: 20,
  maxLives: 20,
  money: 350,
  score: 0,
  shieldCharges: 0,

  selectedTower: null,
  selectedPlacedTower: null,
  gameStarted: false,
  isGameOver: false,
  paused: false,
  engine: null,

  abilityCooldowns: {
    autoscale: 0,
    shield: 0,
    reboot: 0
  },
  activeAbilities: {
    autoscale: 0,
    shield: 0,
    reboot: 0
  },

  init() {
    EventHandlers.hideScreen('intro-screen');
    EventHandlers.hideScreen('level-select-screen');
    EventHandlers.hideScreen('gameover-screen');
    EventHandlers.hideScreen('victory-screen');
    EventHandlers.hideScreen('story-modal');
    EventHandlers.showScreen('game-container', 'flex');

    this.currentLevel = LEVEL_CONFIGS.find(l => l.id === this.selectedLevelId) || LEVEL_CONFIGS[0];
    this.difficultySettings = DIFFICULTY_SETTINGS[this.currentDifficulty] || DIFFICULTY_SETTINGS.staging;

    const canvas = document.getElementById('gameCanvas');
    if (this.engine) {
      this.engine.stop();
    }
    this.engine = new GameEngine(canvas);
    this.engine.loadLevel(this.currentLevel);

    this.engine.onEnemyReached = (e) => CombatSystem.handleEnemyReached(e);
    this.engine.onEnemyKilled = (e) => CombatSystem.handleEnemyKilled(e);

    this.gameStarted = true;
    this.maxLives = GAME_CONFIG.maxLives + (this.difficultySettings.coreHpBonus || 0);
    this.lives = this.maxLives;
    this.money = Math.round(this.currentLevel.startMoney * this.difficultySettings.moneyMultiplier);
    this.score = 0;
    this.shieldCharges = 0;
    this.isGameOver = false;
    this.paused = false;
    this.selectedTower = null;
    this.selectedPlacedTower = null;
    this.statsKills = 0;
    this.statsShieldBlocks = 0;
    this.statsEarlyCalls = 0;
    this.statsTowersPlaced = new Set();
    this.statsCrashedTowers = 0;

    this.abilityCooldowns = { autoscale: 0, shield: 0, reboot: 0 };
    this.activeAbilities = { autoscale: 0, shield: 0, reboot: 0 };

    WaveSystem.reset();
    WaveSystem.maxWaves = this.currentLevel.maxWaves;
    Shop.init();
    HUD.init();

    // Init minimap
    if (typeof MinimapSystem !== 'undefined') {
      MinimapSystem.init();
    }

    // Reset achievements
    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.reset();
    }

    this.updateUI();

    WaveSystem.startWave();
    this.engine.start();
  },

  restart() {
    if (this.engine) this.engine.stop();
    this.init();
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) pauseBtn.textContent = 'PAUSE';
  },

  selectPlacedTower(tower) {
    this.selectedPlacedTower = tower;
    if (tower) {
      this.selectedTower = null;
      Shop.deselectAll();
    }
    this.updateUI();
  },

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      if (this.engine) this.engine.stop();
    } else {
      if (this.engine) this.engine.start();
    }
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) pauseBtn.textContent = this.paused ? 'PLAY' : 'PAUSE';
  },

  triggerGameOver() {
    this.isGameOver = true;
    if (this.engine) this.engine.stop();
    AudioSystem.play('gameover');
    EventHandlers.showGameOver(WaveSystem.wave, this.score);
  },

  victory() {
    this.isGameOver = true;
    if (this.engine) this.engine.stop();
    AudioSystem.play('wave');
    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.check('victory');
      if (!this.statsCrashedTowers || this.statsCrashedTowers === 0) {
        AchievementSystem.check('no_crash');
      }
    }
    EventHandlers.showVictory(this.score);
  },

  updateUI() {
    HUD.update(this);
  },
};

// Initialize event handlers immediately
EventHandlers.init();
