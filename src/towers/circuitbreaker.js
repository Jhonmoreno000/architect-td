// ============================================
// TOWERS - Circuit Breaker (CB)
// ============================================

class CircuitBreakerTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.circuitbreaker);
    this.stunDuration = 140;
    this.heatLevel = 0;
    this.maxHeat = 100;
    this.cooldownTime = 220;
    this.isBroken = false;
    this.breakTimer = 0;
  }

  update(dt) {
    if (this.isBroken) {
      this.breakTimer -= dt;
      if (this.breakTimer <= 0) {
        this.isBroken = false;
        this.heatLevel = 0;
        if (GameState.engine) {
          GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 10, 'CB CLOSED', '#00ff41', 10);
        }
      }
    } else if (this.heatLevel > 0) {
      this.heatLevel -= (this.level === 3 ? 0.6 : this.level === 2 ? 0.45 : 0.35) * dt;
      if (this.heatLevel < 0) this.heatLevel = 0;
    }
  }

  canFire() {
    return !this.isBroken && this.cooldown <= 0 && this.target && this.target.alive;
  }

  fire() {
    if (!this.target) return null;
    this.cooldown = this.fireRate;
    this.heatLevel += 22;
    this.recoil = 4;

    if (this.heatLevel >= this.maxHeat) {
      this.isBroken = true;
      this.breakTimer = this.level >= 2 ? 150 : this.cooldownTime;
      AudioSystem.play('error');
      if (GameState.engine) {
        GameState.engine.addFloatingText(this.x + this.size / 2, this.y - 10, 'TRIPPED!', '#ff0055', 12, true);
        GameState.engine.addParticles(this.x + this.size / 2, this.y + this.size / 2, '#ff3366', 10, 'spark', 3);
      }
    }

    const stunTime = this.level === 3 ? 200 : this.stunDuration;
    this.target.stunTimer = stunTime;
    CombatSystem.dealDamage(this.target, this.damage, this.color, this);

    if (this.level === 3 && GameState.engine) {
      let chained = 0;
      for (const e of GameState.engine.enemies) {
        if (e !== this.target && e.alive && this.distTo(e) <= this.range && chained < 2) {
          e.stunTimer = stunTime * 0.7;
          CombatSystem.dealDamage(e, Math.round(this.damage * 0.5), this.color, this);
          GameState.engine.addParticles(e.x, e.y, this.color, 4, 'spark', 2);
          chained++;
        }
      }
    }

    AudioSystem.play('zap');
    return null;
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Tesla coil discharge poles
    ctx.strokeStyle = this.isBroken ? '#ff0033' : this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.6);
    ctx.lineTo(r * 0.9, -r * 0.2);
    ctx.moveTo(-r * 0.3, r * 0.6);
    ctx.lineTo(r * 0.9, r * 0.2);
    ctx.stroke();

    // Center Tesla sphere
    ctx.fillStyle = this.isBroken ? '#ff0033' : this.color;
    ctx.beginPath();
    ctx.arc(r * 0.4, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Center base
    ctx.fillStyle = '#060a12';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CB', 0, 0);

    if (this.isBroken) {
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-r, -r); ctx.lineTo(r, r);
      ctx.moveTo(-r, r); ctx.lineTo(r, -r);
      ctx.stroke();
    }
  }
}
