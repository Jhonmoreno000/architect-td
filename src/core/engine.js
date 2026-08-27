// ============================================
// CORE - Robust Game Engine with Manual Focus Target & Level Mechanics
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
    this.gridSize = GAME_CONFIG.gridSize; // 40
    this.cols = GAME_CONFIG.gridCols; // 26
    this.rows = GAME_CONFIG.gridRows; // 16
    this.core = { x: 520, y: 320, gx: 13, gy: 8 };
    this.subNodes = [];
    this.auxCores = [];

    this.currentLevelConfig = null;
    this.selectedTower = null;
    this.hoveredCell = null;

    // Manual Target Focus (Right-Click)
    this.focusTarget = null; // { x, y, timer: 300 }

    // Visual FX
    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;
    this.dataPulseTime = 0;

    this.onEnemyReached = null;
    this.onEnemyKilled = null;
  }

  loadLevel(levelConfig) {
    this.currentLevelConfig = levelConfig;
    this.canvas.width = this.cols * this.gridSize;
    this.canvas.height = this.rows * this.gridSize;

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.effects = [];
    this.floatingTexts = [];
    this.lootDrops = [];
    this.focusTarget = null;

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
    this.grid[cgy][cgx] = 3; // 3 = Core

    // Sub-Nodes
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

    // Aux Cores
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
    this.focusTarget = { x, y, timer: 300 }; // 5 seconds
    AudioSystem.play('zap');
    this.addRingShockwave(x, y, '#ff0055', 40);
    this.addFloatingText(x, y - 20, '🎯 TARGET LOCK ACTIVADO!', '#ff0055', 12, true);
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
    this.grid[gy][gx] = 2; // 2 = Tower
    this.towers.push(tower);
  }

  spawnEnemy(type) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    let spawnX, spawnY;

    // Special Level 5: Quantum Portal spawn
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
    for (const drop of this.lootDrops) {
      if (drop.alive && Math.hypot(drop.x - mouseX, drop.y - mouseY) <= drop.radius + 18) {
        drop.collect();
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

    // Level 2 Active-Active Sync Laser Mechanic
    if (this.currentLevelConfig && this.currentLevelConfig.hasSyncLink && this.auxCores.length >= 2) {
      const p1 = this.auxCores[0];
      const p2 = this.auxCores[1];

      for (const e of this.enemies) {
        if (e.alive && Math.abs(e.y - p1.y) < 16 && e.x > Math.min(p1.x, p2.x) && e.x < Math.max(p1.x, p2.x)) {
          CombatSystem.dealDamage(e, 8 * (dt / 30), '#8be9fd');
          if (Math.random() < 0.2) this.addParticles(e.x, e.y, '#8be9fd', 2, 'spark', 2);
        }
      }
    }

    if (GameState.activeAbilities) {
      if (GameState.activeAbilities.autoscale > 0) {
        GameState.activeAbilities.autoscale -= dt / 60;
        if (GameState.activeAbilities.autoscale < 0) GameState.activeAbilities.autoscale = 0;
      }
    }
    if (GameState.abilityCooldowns) {
      for (const k of Object.keys(GameState.abilityCooldowns)) {
        if (GameState.abilityCooldowns[k] > 0) {
          GameState.abilityCooldowns[k] -= dt / 60;
          if (GameState.abilityCooldowns[k] < 0) GameState.abilityCooldowns[k] = 0;
        }
      }
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
    for (const tower of this.towers) {
      tower.updateCooldown(dt);
      if (typeof tower.update === 'function') {
        tower.update(dt);
      }

      // Priority targeting with Manual Focus Target
      if (this.focusTarget) {
        let focusedEnemy = null;
        let minD = 999;
        for (const e of this.enemies) {
          if (e.alive && !e.reached && Math.hypot(e.x - this.focusTarget.x, e.y - this.focusTarget.y) <= 70) {
            const td = tower.distTo(e);
            if (td <= tower.range && td < minD) {
              minD = td;
              focusedEnemy = e;
            }
          }
        }
        if (focusedEnemy) {
          tower.target = focusedEnemy;
          const cx = tower.x + tower.size / 2;
          const cy = tower.y + tower.size / 2;
          tower.turretAngle = Math.atan2(focusedEnemy.y - cy, focusedEnemy.x - cx);
        } else {
          tower.findTarget(this.enemies);
        }
      } else {
        tower.findTarget(this.enemies);
      }

      if (tower.canFire()) {
        tower.fire();
      }
    }
  }

  _updateEnemies(dt) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
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

      if (!e.alive) {
        this.enemies.splice(i, 1);
      }
    }
  }

  _updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt);
      if (!p.alive) this.projectiles.splice(i, 1);
    }
  }

  _updateEnemyProjectiles(dt) {
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.update(dt);
      if (!ep.alive) this.enemyProjectiles.splice(i, 1);
    }
  }

  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].alive) this.particles.splice(i, 1);
    }
  }

  _updateLootDrops(dt) {
    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const loot = this.lootDrops[i];
      loot.update(dt);
      if (!loot.alive) this.lootDrops.splice(i, 1);
    }
  }

  _updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update(dt);
      if (!this.floatingTexts[i].alive) this.floatingTexts.splice(i, 1);
    }
  }

  render() {
    const { ctx } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    if (this.screenShakeTime > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    ctx.clearRect(0, 0, w, h);

    this._drawBackground(ctx, w, h);
    this._drawLevelMechanics(ctx);
    this._drawPerimeterGateways(ctx, w, h);
    this._drawGrid(ctx);
    this._drawSynergyCables(ctx);
    this._drawSubNodes(ctx);
    this._drawCore(ctx);

    for (const tower of this.towers) tower.draw(ctx);
    for (const loot of this.lootDrops) loot.draw(ctx);
    for (const enemy of this.enemies) enemy.draw(ctx);
    for (const proj of this.projectiles) proj.draw(ctx);
    for (const ep of this.enemyProjectiles) ep.draw(ctx);
    for (const part of this.particles) part.draw(ctx);
    for (const ftext of this.floatingTexts) ftext.draw(ctx);

    this._drawFocusTarget(ctx);
    this._drawHoverPreview(ctx);
    this._drawBossHealthBar(ctx);

    // Minimap
    if (typeof MinimapSystem !== 'undefined' && MinimapSystem.ctx) {
      MinimapSystem.render(this);
    }

    // Achievements
    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.render(ctx, this.canvas.width, this.canvas.height);
    }

    ctx.restore();
  }

  _drawBackground(ctx, w, h) {
    const levelBg = (this.currentLevelConfig && this.currentLevelConfig.bgColor) || '#040814';
    const grad = ctx.createRadialGradient(this.core.x, this.core.y, 80, this.core.x, this.core.y, w);
    grad.addColorStop(0, '#0a1a2e');
    grad.addColorStop(1, levelBg);
    ctx.fillStyle = grad;
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
    // Level 2 Active-Active Sync Laser
    if (this.currentLevelConfig && this.currentLevelConfig.hasSyncLink && this.auxCores.length >= 2) {
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
  }

  _drawFocusTarget(ctx) {
    if (!this.focusTarget) return;
    const { x, y } = this.focusTarget;
    const time = performance.now() / 1000;

    ctx.save();
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ff0055';

    // Target reticle
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
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
    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  _drawSynergyCables(ctx) {
    if (!GameState.selectedPlacedTower) return;
    const selected = GameState.selectedPlacedTower;
    const synergies = selected.getActiveSynergies();

    for (const other of synergies) {
      const cx1 = selected.x + selected.size / 2;
      const cy1 = selected.y + selected.size / 2;
      const cx2 = other.x + other.size / 2;
      const cy2 = other.y + other.size / 2;

      ctx.save();
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffeb3b';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.lineTo(cx2, cy2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawSubNodes(ctx) {
    for (const node of this.subNodes) {
      if (!node.alive) continue;
      const { x, y } = node;

      ctx.save();
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

      ctx.restore();
    }

    for (const aux of this.auxCores) {
      ctx.save();
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
      ctx.restore();
    }
  }

  _drawCore(ctx) {
    const { x, y } = this.core;
    const time = performance.now() / 1000;
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
    const boss = this.enemies.find(e => e.isBoss && e.alive);
    if (!boss) return;

    const w = 480;
    const h = 22;
    const x = (this.canvas.width - w) / 2;
    const y = 24;
    const pct = Math.max(0, Math.min(1, boss.hp / boss.maxHp));

    ctx.save();
    ctx.fillStyle = 'rgba(6, 12, 24, 0.92)';
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#ff0055';
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, '#ff0055');
    grad.addColorStop(1, '#ff9900');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, y + 2, (w - 4) * pct, h - 4);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`[INCIDENTE CRITICO] ${boss.name.toUpperCase()} [${Math.round(boss.hp)} / ${boss.maxHp} HP]`, this.canvas.width / 2, y + h / 2);

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
