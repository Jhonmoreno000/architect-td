// ============================================
// CORE - Performance-Optimized Game Engine
// ============================================

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.lastTime = 0;
    this.speedMultiplier = 1;

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.effects = [];
    this.floatingTexts = [];
    this.lootDrops = [];

    this.grid = [];
    this.gridSize = GAME_CONFIG.gridSize;
    this.cols = GAME_CONFIG.gridCols;
    this.rows = GAME_CONFIG.gridRows;
    this.core = { x: 520, y: 320, gx: 13, gy: 8 };
    this.subNodes = [];
    this.auxCores = [];

    this.currentLevelConfig = null;
    this.selectedTower = null;
    this.hoveredCell = null;

    this.focusTarget = null;

    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;
    this.dataPulseTime = 0;

    this.onEnemyReached = null;
    this.onEnemyKilled = null;

    this._frameTime = 0;
    this._cachedBgGradient = null;
    this._cachedBgKey = '';

    this._tmpVec = { x: 0, y: 0 };
  }

  loadLevel(levelConfig) {
    this.currentLevelConfig = levelConfig;
    this.canvas.width = this.cols * this.gridSize;
    this.canvas.height = this.rows * this.gridSize;

    this.towers.length = 0;
    this.enemies.length = 0;
    this.projectiles.length = 0;
    this.enemyProjectiles.length = 0;
    this.particles.length = 0;
    this.effects.length = 0;
    this.floatingTexts.length = 0;
    this.lootDrops.length = 0;
    this.focusTarget = null;
    this._cachedBgGradient = null;

    this._initGrid(levelConfig);
  }

  _initGrid(levelConfig) {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

    const cgx = (levelConfig && levelConfig.core) ? levelConfig.core.gx : 13;
    const cgy = (levelConfig && levelConfig.core) ? levelConfig.core.gy : 8;

    this.core = {
      gx: cgx,
      gy: cgy,
      x: cgx * this.gridSize + this.gridSize / 2,
      y: cgy * this.gridSize + this.gridSize / 2,
    };
    this.grid[cgy][cgx] = 3;

    this.subNodes = [];
    if (levelConfig && levelConfig.subNodes) {
      for (const node of levelConfig.subNodes) {
        if (this.grid[node.gy] && this.grid[node.gy][node.gx] === 0) {
          this.grid[node.gy][node.gx] = 5;
          this.subNodes.push({
            ...node,
            x: node.gx * this.gridSize + this.gridSize / 2,
            y: node.gy * this.gridSize + this.gridSize / 2,
            maxHp: node.hp || 100,
            curHp: node.hp || 100,
            alive: true
          });
        }
      }
    }

    this.auxCores = [];
    if (levelConfig && levelConfig.auxCores) {
      for (const aux of levelConfig.auxCores) {
        this.auxCores.push({
          ...aux,
          x: aux.gx * this.gridSize + this.gridSize / 2,
          y: aux.gy * this.gridSize + this.gridSize / 2
        });
      }
    }
  }

  setFocusTarget(x, y) {
    this.focusTarget = { x, y, timer: 300 };
    AudioSystem.play('zap');
    this.addRingShockwave(x, y, '#ff0055', 40);
    this.addFloatingText(x, y - 20, 'TARGET LOCK ACTIVADO!', '#ff0055', 12, true);
  }

  canPlaceTower(gx, gy) {
    if (gx < 0 || gx >= this.cols || gy < 0 || gy >= this.rows) return false;
    return this.grid[gy][gx] === 0;
  }

  placeTower(tower, gx, gy) {
    tower.gridX = gx;
    tower.gridY = gy;
    tower.x = gx * this.gridSize + (this.gridSize - tower.size) / 2;
    tower.y = gy * this.gridSize + (this.gridSize - tower.size) / 2;
    this.grid[gy][gx] = 2;
    this.towers.push(tower);
  }

  spawnEnemy(type) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    let spawnX, spawnY;

    if (this.currentLevelConfig && this.currentLevelConfig.hasQuantumPortals && Math.random() < 0.25) {
      spawnX = (Math.random() < 0.5 ? 200 : w - 200) + (Math.random() - 0.5) * 80;
      spawnY = (Math.random() < 0.5 ? 150 : h - 150) + (Math.random() - 0.5) * 80;
      this.addRingShockwave(spawnX, spawnY, '#ff79c6', 40);
      this.addFloatingText(spawnX, spawnY - 15, 'QUANTUM BREACH!', '#ff79c6', 10);
    } else {
      const side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: spawnX = Math.random() * w; spawnY = -15; break;
        case 1: spawnX = w + 15; spawnY = Math.random() * h; break;
        case 2: spawnX = Math.random() * w; spawnY = h + 15; break;
        case 3: default: spawnX = -15; spawnY = Math.random() * h; break;
      }
    }

    const enemy = new Request(spawnX, spawnY, { x: this.core.x, y: this.core.y }, type, GameState.currentDifficulty);
    this.enemies.push(enemy);
    return enemy;
  }

  addProjectile(proj) {
    this.projectiles.push(proj);
  }

  addEnemyProjectile(x, y, target, damage, color, type) {
    this.enemyProjectiles.push(new EnemyProjectile(x, y, target, damage, color, type));
  }

  addParticles(x, y, color, count = 8, type = 'spark', size = 3) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = Math.random() * 3.5 + 1;
      this.particles.push(
        new Particle(x, y, color, Math.cos(angle) * speed, Math.sin(angle) * speed, 25 + Math.random() * 15, type, size)
      );
    }
  }

  addRingShockwave(x, y, color, radius = 50) {
    this.particles.push(new Particle(x, y, color, 0, 0, 20, 'ring', 2));
  }

  addFloatingText(x, y, text, color = '#00ff41', size = 11, isCrit = false) {
    this.floatingTexts.push(new FloatingText(x, y, text, color, size, isCrit));
  }

  addLootDrop(x, y, type = 'money') {
    this.lootDrops.push(new LootDrop(x, y, type));
  }

  checkLootCollection(mouseX, mouseY) {
    const r2 = 324;
    for (const drop of this.lootDrops) {
      if (drop.alive) {
        const dx = drop.x - mouseX;
        const dy = drop.y - mouseY;
        if (dx * dx + dy * dy <= r2) {
          drop.collect();
        }
      }
    }
  }

  triggerScreenShake(intensity = 8) {
    this.screenShakeTime = 12;
    this.screenShakeIntensity = intensity;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
  }

  loop() {
    if (!this.running) return;

    try {
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 16.67, 3) * this.speedMultiplier;
      this.lastTime = now;
      this._frameTime = now / 1000;

      this.update(dt);
      this.render();

      if (typeof WaveSystem !== 'undefined') {
        WaveSystem.update(dt);
      }
    } catch (err) {
      console.error('Game loop error protected:', err);
    }

    if (this.running) {
      requestAnimationFrame(() => this.loop());
    }
  }

  update(dt) {
    if (this.focusTarget) {
      this.focusTarget.timer -= dt;
      if (this.focusTarget.timer <= 0) {
        this.focusTarget = null;
      }
    }

    if (this.currentLevelConfig && this.currentLevelConfig.hasSyncLink && this.auxCores.length >= 2) {
      const p1 = this.auxCores[0];
      const p2 = this.auxCores[1];
      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);

      for (const e of this.enemies) {
        if (e.alive && Math.abs(e.y - p1.y) < 16 && e.x > minX && e.x < maxX) {
          CombatSystem.dealDamage(e, 8 * (dt / 30), '#8be9fd');
          if (Math.random() < 0.2) this.addParticles(e.x, e.y, '#8be9fd', 2, 'spark', 2);
        }
      }
    }

    if (GameState.activeAbilities && GameState.activeAbilities.autoscale > 0) {
      GameState.activeAbilities.autoscale -= dt / 60;
      if (GameState.activeAbilities.autoscale < 0) GameState.activeAbilities.autoscale = 0;
    }
    if (GameState.abilityCooldowns) {
      const ac = GameState.abilityCooldowns;
      const dt60 = dt / 60;
      if (ac.autoscale > 0) { ac.autoscale -= dt60; if (ac.autoscale < 0) ac.autoscale = 0; }
      if (ac.shield > 0) { ac.shield -= dt60; if (ac.shield < 0) ac.shield = 0; }
      if (ac.reboot > 0) { ac.reboot -= dt60; if (ac.reboot < 0) ac.reboot = 0; }
    }

    if (CombatSystem.comboTimer > 0) {
      CombatSystem.comboTimer -= dt;
      if (CombatSystem.comboTimer <= 0) {
        CombatSystem.combo = 0;
      }
    }

    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    this.dataPulseTime += dt * 0.05;

    this._updateTowers(dt);
    this._updateEnemies(dt);
    this._updateProjectiles(dt);
    this._updateEnemyProjectiles(dt);
    this._updateParticles(dt);
    this._updateLootDrops(dt);
    this._updateFloatingTexts(dt);

    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.update(dt);
    }
  }

  _updateTowers(dt) {
    const enemies = this.enemies;
    const focus = this.focusTarget;

    for (let ti = 0, tLen = this.towers.length; ti < tLen; ti++) {
      const tower = this.towers[ti];
      tower.updateCooldown(dt);
      if (tower.update) tower.update(dt);

      if (focus) {
        let focusedEnemy = null;
        let minD = 999;
        const fx = focus.x;
        const fy = focus.y;

        for (let ei = 0, eLen = enemies.length; ei < eLen; ei++) {
          const e = enemies[ei];
          if (e.alive && !e.reached) {
            const edx = e.x - fx;
            const edy = e.y - fy;
            if (edx * edx + edy * edy <= 4900) {
              const td = tower.distTo(e);
              if (td <= tower.range && td < minD) {
                minD = td;
                focusedEnemy = e;
              }
            }
          }
        }

        if (focusedEnemy) {
          tower.target = focusedEnemy;
          tower.turretAngle = Math.atan2(focusedEnemy.y - tower.y - tower.size / 2, focusedEnemy.x - tower.x - tower.size / 2);
        } else {
          tower.findTarget(enemies);
        }
      } else {
        tower.findTarget(enemies);
      }

      if (tower.canFire()) {
        tower.fire();
      }
    }
  }

  _updateEnemies(dt) {
    let writeIdx = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      e.update(dt);

      if (e.reached && e.alive) {
        e.alive = false;
        if (this.onEnemyReached) this.onEnemyReached(e);
        this.addParticles(e.x, e.y, '#ff0040', 16, 'spark', 4);
      }

      if (!e.alive && !e.reached) {
        if (this.onEnemyKilled) this.onEnemyKilled(e);
        this.addParticles(e.x, e.y, e.color, 12, 'spark', 3);
      }

      if (e.alive) {
        this.enemies[writeIdx++] = e;
      }
    }
    this.enemies.length = writeIdx;
  }

  _updateProjectiles(dt) {
    let writeIdx = 0;
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      p.update(dt);
      if (p.alive) this.projectiles[writeIdx++] = p;
    }
    this.projectiles.length = writeIdx;
  }

  _updateEnemyProjectiles(dt) {
    let writeIdx = 0;
    for (let i = 0; i < this.enemyProjectiles.length; i++) {
      const ep = this.enemyProjectiles[i];
      ep.update(dt);
      if (ep.alive) this.enemyProjectiles[writeIdx++] = ep;
    }
    this.enemyProjectiles.length = writeIdx;
  }

  _updateParticles(dt) {
    let writeIdx = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.update(dt);
      if (p.alive) this.particles[writeIdx++] = p;
    }
    this.particles.length = writeIdx;
  }

  _updateLootDrops(dt) {
    let writeIdx = 0;
    for (let i = 0; i < this.lootDrops.length; i++) {
      const loot = this.lootDrops[i];
      loot.update(dt);
      if (loot.alive) this.lootDrops[writeIdx++] = loot;
    }
    this.lootDrops.length = writeIdx;
  }

  _updateFloatingTexts(dt) {
    let writeIdx = 0;
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ft.update(dt);
      if (ft.alive) this.floatingTexts[writeIdx++] = ft;
    }
    this.floatingTexts.length = writeIdx;
  }

  render() {
    const { ctx } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    if (this.screenShakeTime > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.screenShakeIntensity,
        (Math.random() - 0.5) * this.screenShakeIntensity
      );
    }

    ctx.clearRect(0, 0, w, h);

    this._drawBackground(ctx, w, h);
    this._drawGrid(ctx);

    if (this.currentLevelConfig && this.currentLevelConfig.hasSyncLink) {
      this._drawLevelMechanics(ctx);
    }

    this._drawPerimeterGateways(ctx, w, h);
    this._drawSynergyCables(ctx);
    this._drawSubNodes(ctx);
    this._drawCore(ctx);

    const towers = this.towers;
    const lootDrops = this.lootDrops;
    const enemies = this.enemies;
    const projectiles = this.projectiles;
    const enemyProjectiles = this.enemyProjectiles;
    const particles = this.particles;
    const floatingTexts = this.floatingTexts;

    for (let i = 0, len = towers.length; i < len; i++) towers[i].draw(ctx);
    for (let i = 0, len = lootDrops.length; i < len; i++) lootDrops[i].draw(ctx);
    for (let i = 0, len = enemies.length; i < len; i++) enemies[i].draw(ctx);
    for (let i = 0, len = projectiles.length; i < len; i++) projectiles[i].draw(ctx);
    for (let i = 0, len = enemyProjectiles.length; i < len; i++) enemyProjectiles[i].draw(ctx);
    for (let i = 0, len = particles.length; i < len; i++) particles[i].draw(ctx);
    for (let i = 0, len = floatingTexts.length; i < len; i++) floatingTexts[i].draw(ctx);

    this._drawFocusTarget(ctx);
    this._drawHoverPreview(ctx);
    this._drawBossHealthBar(ctx);

    if (typeof MinimapSystem !== 'undefined' && MinimapSystem.ctx) {
      MinimapSystem.render(this);
    }

    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.render(ctx, this.canvas.width, this.canvas.height);
    }

    ctx.restore();
  }

  _drawBackground(ctx, w, h) {
    const levelBg = (this.currentLevelConfig && this.currentLevelConfig.bgColor) || '#040814';
    const bgKey = `${this.core.x}_${this.core.y}_${levelBg}_${w}`;

    if (this._cachedBgKey !== bgKey) {
      this._cachedBgKey = bgKey;
      const grad = ctx.createRadialGradient(this.core.x, this.core.y, 80, this.core.x, this.core.y, w);
      grad.addColorStop(0, '#0a1a2e');
      grad.addColorStop(1, levelBg);
      this._cachedBgGradient = grad;
    }

    ctx.fillStyle = this._cachedBgGradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let r = 120; r < w; r += 120) {
      ctx.beginPath();
      ctx.arc(this.core.x, this.core.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  _drawLevelMechanics(ctx) {
    if (this.auxCores.length < 2) return;
    const p1 = this.auxCores[0];
    const p2 = this.auxCores[1];

    ctx.save();
    ctx.strokeStyle = 'rgba(139, 233, 253, 0.7)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#8be9fd';
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -this.dataPulseTime * 20;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }

  _drawFocusTarget(ctx) {
    if (!this.focusTarget) return;
    const { x, y } = this.focusTarget;

    ctx.save();
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ff0055';

    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 32, y); ctx.lineTo(x + 32, y);
    ctx.moveTo(x, y - 32); ctx.lineTo(x, y + 32);
    ctx.stroke();

    ctx.restore();
  }

  _drawPerimeterGateways(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 85, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = 'rgba(255, 0, 85, 0.6)';
    ctx.textAlign = 'center';

    ctx.fillText('INGRESS NORTE: INTERNET GATEWAY', w / 2, 12);
    ctx.fillText('INGRESS SUR: DARKNET & BOTS', w / 2, h - 6);

    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('INGRESS OESTE: COMPROMISED VPN', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(w - 12, h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('INGRESS ESTE: CLOUD EDGE DDOS', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  _drawGrid(ctx) {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
    }
    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
    }
    ctx.stroke();
  }

  _drawSynergyCables(ctx) {
    if (!GameState.selectedPlacedTower) return;
    const selected = GameState.selectedPlacedTower;
    const synergies = selected.getActiveSynergies();

    if (synergies.length === 0) return;

    ctx.save();
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffeb3b';
    ctx.setLineDash([4, 4]);

    const cx1 = selected.x + selected.size / 2;
    const cy1 = selected.y + selected.size / 2;

    ctx.beginPath();
    for (const other of synergies) {
      ctx.moveTo(cx1, cy1);
      ctx.lineTo(other.x + other.size / 2, other.y + other.size / 2);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawSubNodes(ctx) {
    ctx.save();
    for (const node of this.subNodes) {
      if (!node.alive) continue;
      const { x, y } = node;

      ctx.fillStyle = '#0a1628';
      ctx.strokeStyle = '#8be9fd';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#8be9fd';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#8be9fd';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || 'POP', x, y);
    }

    for (const aux of this.auxCores) {
      ctx.fillStyle = '#081a28';
      ctx.strokeStyle = '#8be9fd';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#8be9fd';
      ctx.beginPath();
      ctx.arc(aux.x, aux.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(aux.label || 'NODE', aux.x, aux.y);
    }
    ctx.restore();
  }

  _drawCore(ctx) {
    const { x, y } = this.core;
    const time = this._frameTime;
    const pulse = Math.sin(time * 3) * 0.3 + 0.7;

    ctx.save();
    ctx.shadowBlur = 24 * pulse;
    ctx.shadowColor = '#00ff41';

    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(0, 255, 65, ${0.22 * pulse})`;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    if (GameState.shieldCharges > 0) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#f97316';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORE', x, y);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const a = time * 2 + (Math.PI * 2 / 3) * i;
      ctx.beginPath();
      ctx.arc(x, y, 30, a, a + 0.9);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawBossHealthBar(ctx) {
    let boss = null;
    for (let i = 0, len = this.enemies.length; i < len; i++) {
      if (this.enemies[i].isBoss && this.enemies[i].alive) {
        boss = this.enemies[i];
        break;
      }
    }
    if (!boss) return;

    const bw = 480;
    const bh = 22;
    const bx = (this.canvas.width - bw) / 2;
    const by = 24;
    const pct = Math.max(0, Math.min(1, boss.hp / boss.maxHp));

    ctx.save();
    ctx.fillStyle = 'rgba(6, 12, 24, 0.92)';
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#ff0055';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
    grad.addColorStop(0, '#ff0055');
    grad.addColorStop(1, '#ff9900');
    ctx.fillStyle = grad;
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * pct, bh - 4);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`[INCIDENTE CRITICO] ${boss.name.toUpperCase()} [${Math.round(boss.hp)} / ${boss.maxHp} HP]`, this.canvas.width / 2, by + bh / 2);

    ctx.restore();
  }

  _drawHoverPreview(ctx) {
    if (!this.hoveredCell) return;
    const { gx, gy } = this.hoveredCell;
    const x = gx * this.gridSize;
    const y = gy * this.gridSize;
    const canPlace = this.canPlaceTower(gx, gy);

    ctx.save();
    ctx.fillStyle = canPlace ? 'rgba(0, 255, 65, 0.16)' : 'rgba(255, 0, 64, 0.18)';
    ctx.strokeStyle = canPlace ? '#00ff41' : '#ff0040';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, this.gridSize, this.gridSize);
    ctx.strokeRect(x, y, this.gridSize, this.gridSize);

    if (canPlace && GameState.selectedTower) {
      const def = TOWER_CONFIG[GameState.selectedTower];
      if (def) {
        ctx.strokeStyle = def.color + '70';
        ctx.fillStyle = def.color + '0c';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, def.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
