// ============================================
// SYSTEMS - Dynamic & Unpredictable 360° Wave Orchestrator
// ============================================

const WaveSystem = {
  wave: 0,
  maxWaves: 20,
  waveActive: false,
  isPrepPhase: false,
  prepTimer: 0,
  enemiesSpawned: 0,
  enemiesPerWave: 0,
  spawnTimer: 0,
  waveQueue: [],
  isBossWave: false,
  bossType: null,

  startWave() {
    this.isPrepPhase = false;
    this.prepTimer = 0;
    this.wave++;
    this.waveActive = true;
    this.enemiesSpawned = 0;
    this.isBossWave = (this.wave % 5 === 0);

    if (this.isBossWave) {
      if (this.wave === 5) this.bossType = 'boss_syn';
      else if (this.wave === 10) this.bossType = 'boss_memory';
      else if (this.wave === 15) this.bossType = 'boss_botnet';
      else this.bossType = 'boss_apex';

      AudioSystem.play('boss_alert');
      if (GameState.engine) {
        GameState.engine.triggerScreenShake(14);
        GameState.engine.addFloatingText(
          GameState.engine.canvas.width / 2,
          50,
          `🚨 ${ENEMY_CONFIG[this.bossType].bossTitle}`,
          '#ff0055',
          14,
          true
        );
      }
    } else {
      AudioSystem.play('wave');
    }

    this._generateTacticalWave();
    this.enemiesPerWave = this.waveQueue.length;
    this.spawnTimer = 0;

    GameState.updateUI();
  },

  _generateTacticalWave() {
    this.waveQueue = [];
    const w = this.wave;
    const baseSquadCount = 4 + Math.floor(w * 1.2);

    const squadArchetypes = ['swarm', 'mixed', 'heavy_assault', 'stealth_rush', 'crypted_convoy'];

    for (let s = 0; s < baseSquadCount; s++) {
      const type = squadArchetypes[Math.floor(Math.random() * squadArchetypes.length)];

      if (type === 'swarm') {
        const count = 4 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
          this.waveQueue.push({
            type: Math.random() < 0.6 ? 'botnet' : 'fast',
            delay: 18 + Math.floor(Math.random() * 12)
          });
        }
      } else if (type === 'heavy_assault') {
        this.waveQueue.push({ type: 'heavy', delay: 40 });
        if (w >= 3) {
          this.waveQueue.push({ type: 'malicious', delay: 25 });
        }
        this.waveQueue.push({ type: 'normal', delay: 20 });
      } else if (type === 'stealth_rush' && w >= 5) {
        this.waveQueue.push({ type: 'zeroday', delay: 30 });
        this.waveQueue.push({ type: 'fast', delay: 20 });
      } else if (type === 'crypted_convoy' && w >= 7) {
        this.waveQueue.push({ type: 'ransomware', delay: 35 });
        this.waveQueue.push({ type: 'heavy', delay: 20 });
        this.waveQueue.push({ type: 'botnet', delay: 18 });
      } else {
        this.waveQueue.push({ type: 'normal', delay: 24 });
        this.waveQueue.push({ type: 'fast', delay: 20 });
        if (w >= 3) this.waveQueue.push({ type: 'heavy', delay: 30 });
      }
    }

    if (this.isBossWave && this.bossType) {
      const insertIdx = Math.floor(this.waveQueue.length / 2);
      this.waveQueue.splice(insertIdx, 0, { type: this.bossType, delay: 50 });
    }
  },

  callWaveEarly() {
    if (!this.isPrepPhase || this.waveActive) return;
    const earlyBonus = Math.round(this.prepTimer * 10);
    GameState.money += earlyBonus;
    GameState.score += earlyBonus * 2;
    if (GameState.engine) {
      GameState.engine.addFloatingText(GameState.engine.canvas.width / 2, 90, `🚀 OLEADA LLAMADA! (+$${earlyBonus} BONUS)`, '#ffeb3b', 14, true);
    }
    this.startWave();
  },

  update(dt) {
    if (GameState.paused) return;

    if (typeof TelemetrySystem !== 'undefined') {
      TelemetrySystem.update(dt);
    }

    // Preparation countdown
    if (this.isPrepPhase) {
      this.prepTimer -= dt / 60;
      if (this.prepTimer <= 0) {
        this.startWave();
      }
      return;
    }

    if (!this.waveActive) return;

    this.spawnTimer += dt;

    if (this.waveQueue.length > 0) {
      const nextEnemy = this.waveQueue[0];
      const targetDelay = nextEnemy.delay || 30;

      if (this.spawnTimer >= targetDelay) {
        this.spawnTimer = 0;
        const item = this.waveQueue.shift();
        GameState.engine.spawnEnemy(item.type);
        this.enemiesSpawned++;
      }
    }

    // Check wave completion
    if (this.waveQueue.length === 0 && GameState.engine.enemies.length === 0) {
      this.waveActive = false;

      const isEndless = GameState.difficultySettings && GameState.difficultySettings.isEndless;

      if (!isEndless && this.wave >= this.maxWaves) {
        GameState.victory();
      } else {
        const bonus = 80 + this.wave * 20;
        GameState.money += bonus;
        GameState.score += bonus * 2;
        if (GameState.engine) {
          GameState.engine.addFloatingText(
            GameState.engine.canvas.width / 2,
            110,
            `✓ OLEADA ${this.wave} COMPLETADA (+$$${bonus})`,
            '#00ff41',
            14,
            true
          );
        }
        GameState.updateUI();

        // Trigger educational incident quiz every 3 waves
        if (this.wave % 3 === 0 && typeof IncidentSystem !== 'undefined') {
          IncidentSystem.triggerRandomIncident();
        }

        // Enter prep phase (12s countdown)
        this.isPrepPhase = true;
        this.prepTimer = GAME_CONFIG.prepTime || 12;
        GameState.updateUI();
      }
    }
  },

  reset() {
    this.wave = 0;
    this.waveActive = false;
    this.isPrepPhase = false;
    this.prepTimer = 0;
    this.enemiesSpawned = 0;
    this.waveQueue = [];
    this.isBossWave = false;
  }
};
