// ============================================
// TOWERS - In-Memory Cache (CA)
// ============================================

class CacheTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.cache);
    this.auraRadius = this.range;
    this.cubeSpin = 0;
  }

  findTarget(enemies) {
    this.auraRadius = this.range;
    const slowPower = this.level === 3 ? 0.6 : this.level === 2 ? 0.45 : 0.35;

    for (const e of enemies) {
      if (!e.alive || e.reached) continue;
      if (this.distTo(e) <= this.auraRadius && !e.slowImmune) {
        e.slowTimer = Math.max(e.slowTimer, 20);
        e.slowFactor = Math.max(e.slowFactor, slowPower);
      }
    }
    return super.findTarget(enemies);
  }

  fire() {
    if (!this.target) return null;
    this.cooldown = this.fireRate;
    this.recoil = 2;

    CombatSystem.dealDamage(this.target, this.damage, this.color, this);

    if (this.level === 3 && GameState.engine) {
      GameState.engine.addRingShockwave(this.x + this.size / 2, this.y + this.size / 2, this.color, this.auraRadius);
    }

    AudioSystem.play('hit');
    return null;
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Spinning cryogenic memory cube
    const s = r * 0.7;
    ctx.fillStyle = this.color;
    ctx.fillRect(-s / 2, -s / 2, s, s);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-s / 2, -s / 2, s, s);

    // Inner core
    ctx.fillStyle = '#060a12';
    ctx.fillRect(-s * 0.25, -s * 0.25, s * 0.5, s * 0.5);

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CA', 0, 0);
  }
}
