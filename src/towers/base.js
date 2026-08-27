// ============================================
// TOWERS - Base Tower Class with Durability, Damage & Repair Engine
// ============================================

class Tower extends Entity {
  constructor(x, y, config) {
    super(x, y);
    this.type = config.type;
    this.name = config.name;
    this.baseCost = config.cost;
    this.cost = config.cost;
    this.totalInvested = config.cost;
    this.range = config.range;
    this.baseRange = config.range;
    this.fireRate = config.fireRate;
    this.baseFireRate = config.fireRate;
    this.damage = config.damage;
    this.baseDamage = config.damage;
    this.color = config.color;
    this.icon = config.icon;
    this.category = config.category || 'General';
    this.description = config.description;
    this.synergiesWith = config.synergiesWith || [];
    this.synergyDesc = config.synergyDesc || '';

    // Durability & Health
    this.maxHp = config.maxHp || 120;
    this.hp = this.maxHp;
    this.isCrashed = false;
    this.isRansomed = false;
    this.ransomedTimer = 0;
    this.meshBuffTimer = 0;

    this.level = 1;
    this.maxLevel = 3;
    this.cooldown = 0;
    this.target = null;
    this.size = 36;
    this.gridX = 0;
    this.gridY = 0;
    this.targetMode = 'first';
    this.kills = 0;
    this.damageDealt = 0;
    this.showRange = false;

    // Turret aiming & Overclock
    this.turretAngle = 0;
    this.recoil = 0;
    this.overclockTimer = 0;
    this.smokeTimer = 0;
  }

  takeDamage(amount) {
    if (this.isCrashed) return;

    this.hp -= amount;

    if (GameState.engine) {
      GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 8, `-${Math.round(amount)} HP`, '#ff0055', 9);
      GameState.engine.addParticles(this.x + this.size / 2, this.y + this.size / 2, '#ff0055', 4, 'spark', 2);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isCrashed = true;
      GameState.statsCrashedTowers = (GameState.statsCrashedTowers || 0) + 1;
      AudioSystem.play('error');
      if (GameState.engine) {
        GameState.engine.triggerScreenShake(7);
        GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 15, '🚨 SERVIDOR 500 CAÍDO!', '#ff0055', 11, true);
        GameState.engine.addParticles(this.x + this.size / 2, this.y + this.size / 2, '#ffffff', 12, 'spark', 3);
      }
    }
  }

  getRepairCost() {
    if (this.hp >= this.maxHp) return 0;
    const missingHp = this.maxHp - this.hp;
    return Math.max(15, Math.round(missingHp * (GAME_CONFIG.repairCostPerHp || 0.25)));
  }

  repair() {
    if (this.hp >= this.maxHp) return false;
    const cost = this.getRepairCost();
    if (GameState.money < cost) {
      AudioSystem.play('error');
      if (GameState.engine) {
        GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 12, 'FONDOS INSUFICIENTES', '#ff0055', 9);
      }
      return false;
    }

    GameState.money -= cost;
    this.hp = this.maxHp;
    this.isCrashed = false;
    this.isRansomed = false;

    AudioSystem.play('build');
    if (GameState.engine) {
      GameState.engine.addRingShockwave(this.x + this.size / 2, this.y + this.size / 2, '#00ff41', 35);
      GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 12, '✓ SERVIDOR REPARADO!', '#00ff41', 11, true);
    }
    GameState.updateUI();
    return true;
  }

  findTarget(enemies) {
    if (this.isCrashed || this.isRansomed) {
      this.target = null;
      return null;
    }

    let validEnemies = [];
    for (const e of enemies) {
      if (!e.alive || e.reached || (e.isCloaked)) continue;
      const d = this.distTo(e);
      if (d <= this.range) {
        validEnemies.push({ enemy: e, dist: d });
      }
    }

    if (validEnemies.length === 0) {
      this.target = null;
      return null;
    }

    switch (this.targetMode) {
      case 'last':
        validEnemies.sort((a, b) => a.dist - b.dist);
        break;
      case 'strongest':
        validEnemies.sort((a, b) => b.enemy.hp - a.enemy.hp);
        break;
      case 'weakest':
        validEnemies.sort((a, b) => a.enemy.hp - b.enemy.hp);
        break;
      case 'closest':
        validEnemies.sort((a, b) => a.dist - b.dist);
        break;
      case 'first':
      default:
        validEnemies.sort((a, b) => a.dist - b.dist);
        break;
    }

    this.target = validEnemies[0].enemy;

    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;
    this.turretAngle = Math.atan2(this.target.y - cy, this.target.x - cx);

    return this.target;
  }

  updateCooldown(dt) {
    if (this.meshBuffTimer > 0) this.meshBuffTimer -= dt;

    if (this.isRansomed) {
      this.ransomedTimer -= dt;
      if (this.ransomedTimer <= 0) {
        this.isRansomed = false;
      }
    }

    if (this.isCrashed) {
      this.smokeTimer += dt;
      if (this.smokeTimer > 15 && GameState.engine) {
        GameState.engine.addParticles(this.x + this.size / 2, this.y + this.size / 2, '#64748b', 1, 'spark', 2);
        this.smokeTimer = 0;
      }
      return;
    }

    let multiplier = 1.0;
    if (GameState.activeAbilities && GameState.activeAbilities.autoscale > 0) multiplier *= 2.0;
    if (this.meshBuffTimer > 0) multiplier *= 1.25;

    if (this.overclockTimer > 0) {
      multiplier *= 1.8;
      this.overclockTimer -= dt;
      if (Math.random() < 0.2 && GameState.engine) {
        GameState.engine.addParticles(this.x + this.size / 2, this.y + this.size / 2, '#00f0ff', 1, 'spark', 1.5);
      }
    }

    if (this.cooldown > 0) {
      this.cooldown -= dt * multiplier;
    }
    if (this.recoil > 0) {
      this.recoil -= dt * 0.25;
      if (this.recoil < 0) this.recoil = 0;
    }
  }

  canFire() {
    return !this.isCrashed && !this.isRansomed && this.cooldown <= 0 && this.target && this.target.alive;
  }

  fire() {
    this.cooldown = this.fireRate;
    this.recoil = 4;
    return null;
  }

  canUpgrade() {
    if (this.level >= this.maxLevel) return false;
    const config = TOWER_CONFIG[this.type];
    if (!config || !config.upgrades) return false;
    const nextUpgrade = config.upgrades.find(u => u.level === this.level + 1);
    return nextUpgrade && GameState.money >= nextUpgrade.cost;
  }

  getUpgradeCost() {
    if (this.level >= this.maxLevel) return null;
    const config = TOWER_CONFIG[this.type];
    if (!config || !config.upgrades) return null;
    const nextUpgrade = config.upgrades.find(u => u.level === this.level + 1);
    return nextUpgrade ? nextUpgrade.cost : null;
  }

  getSellValue() {
    return Math.floor(this.totalInvested * GAME_CONFIG.sellRefundRate);
  }

  upgrade() {
    if (this.level >= this.maxLevel) return false;
    const config = TOWER_CONFIG[this.type];
    const nextUpgrade = config.upgrades.find(u => u.level === this.level + 1);
    if (!nextUpgrade || GameState.money < nextUpgrade.cost) return false;

    GameState.money -= nextUpgrade.cost;
    this.totalInvested += nextUpgrade.cost;
    this.level++;

    // Upgrades completely heal and restore server
    this.maxHp = Math.round(this.maxHp * 1.4);
    this.hp = this.maxHp;
    this.isCrashed = false;
    this.isRansomed = false;

    this.damage += nextUpgrade.damageBonus || 0;
    this.range += nextUpgrade.rangeBonus || 0;
    if (nextUpgrade.fireRateMult) {
      this.fireRate = Math.round(this.fireRate * nextUpgrade.fireRateMult);
    }

    AudioSystem.play('build');
    if (GameState.engine) {
      GameState.engine.addParticles(this.x + this.size / 2, this.y + this.size / 2, this.color, 16, 'spark', 4);
      GameState.engine.addRingShockwave(this.x + this.size / 2, this.y + this.size / 2, this.color, this.range);
      GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 12, `TIER ${this.level} SERVIDOR REPARADO & MEJORADO!`, this.color, 12, true);
    }
    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.check('tower_upgrade');
      if (this.level >= 3) AchievementSystem.check('tower_max');
    }
    GameState.updateUI();
    return true;
  }

  cycleTargetMode() {
    const modes = ['first', 'last', 'strongest', 'weakest', 'closest'];
    const idx = modes.indexOf(this.targetMode);
    this.targetMode = modes[(idx + 1) % modes.length];
    AudioSystem.play('click');
  }

  getActiveSynergies() {
    if (!GameState.engine) return [];
    const synergies = [];
    for (const other of GameState.engine.towers) {
      if (other !== this && this.synergiesWith.includes(other.type) && this.distTo(other) < 160) {
        synergies.push(other);
      }
    }
    return synergies;
  }

  draw(ctx) {
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    // Range circle
    if (this.showRange || (GameState.selectedPlacedTower === this)) {
      ctx.save();
      ctx.strokeStyle = this.color + '70';
      ctx.fillStyle = this.color + '0c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, this.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.save();

    // Overclock or Auto-Scale Glow
    if (this.overclockTimer > 0 || (GameState.activeAbilities && GameState.activeAbilities.autoscale > 0)) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#00f0ff';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 2, this.y - 2, this.size + 4, this.size + 4);
    }

    // Selected highlight
    if (GameState.selectedPlacedTower === this) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 3, this.y - 3, this.size + 6, this.size + 6);
    }

    // Tower base platform
    ctx.fillStyle = this.isCrashed ? '#1e293b' : '#0a101d';
    ctx.strokeStyle = this.isCrashed ? '#ef4444' : this.color;
    ctx.lineWidth = this.level === 3 ? 2.5 : this.level === 2 ? 2 : 1.5;
    ctx.shadowBlur = this.isCrashed ? 4 : this.level === 3 ? 12 : 6;
    ctx.shadowColor = this.isCrashed ? '#ef4444' : this.color;

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.size, this.size, 6);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Ransomware Cryptographic Lock Overlay
    if (this.isRansomed) {
      ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', cx, cy);
    } else if (this.isCrashed) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OFFLINE', cx, cy);
    } else {
      // Rotating Aim Turret
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.turretAngle);
      this._drawTurret(ctx);
      ctx.restore();
    }

    // Level Badges / Pips
    for (let i = 0; i < this.level; i++) {
      const pipX = this.x + 6 + i * 7;
      const pipY = this.y + 6;
      ctx.fillStyle = this.level === 3 ? '#ffeb3b' : this.color;
      ctx.beginPath();
      ctx.arc(pipX, pipY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar (Drawn when damaged)
    if (this.hp < this.maxHp) {
      const barW = this.size;
      const barH = 3;
      const barX = this.x;
      const barY = this.y - 6;
      const hpPct = Math.max(0, this.hp / this.maxHp);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = hpPct > 0.5 ? '#00ff41' : hpPct > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(barX, barY, barW * hpPct, barH);
    }

    ctx.restore();
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 6;
    ctx.fillStyle = this.color;
    ctx.fillRect(-r * 0.4 - this.recoil, -r * 0.7, r * 1.5, r * 0.4);
    ctx.fillRect(-r * 0.4 - this.recoil, r * 0.3, r * 1.5, r * 0.4);

    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 0);
  }
}
