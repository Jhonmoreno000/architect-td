// ============================================
// TOWERS - Web Application Firewall (WAF)
// ============================================

class WafTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.waf);
  }

  fire() {
    if (!this.target || !this.target.alive) {
      return null;
    }

    this.cooldown = this.fireRate;

    let dmg = this.damage;
    if (this.target.type === 'malicious' || this.target.type === 'botnet') {
      dmg *= 2.0;
    }
    if (this.target.hasShield) {
      dmg *= 2.5;
    }

    CombatSystem.dealDamage(this.target, dmg, this.color, this);

    this.target.burnTimer = 40;
    this.target.burnDamage = this.level === 3 ? 12 : this.level === 2 ? 8 : 4;

    if (GameState.engine) {
      GameState.engine.addParticles(this.target.x, this.target.y, this.color, 2, 'spark', 1.5);
    }

    AudioSystem.play('laser_tick');
    return null;
  }

  draw(ctx) {
    super.draw(ctx);

    // Continuous Laser Beam when targeting
    if (this.target && this.target.alive && this.cooldown < this.fireRate * 0.85) {
      const cx = this.x + this.size / 2;
      const cy = this.y + this.size / 2;

      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.level === 3 ? 3.5 : this.level === 2 ? 2.5 : 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(this.target.x, this.target.y);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(this.target.x, this.target.y);
      ctx.stroke();

      ctx.restore();
    }
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Optical laser emitter shroud
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(r * 0.9, 0);
    ctx.lineTo(-r * 0.3, -r * 0.6);
    ctx.lineTo(-r * 0.3, r * 0.6);
    ctx.closePath();
    ctx.fill();

    // Core lens
    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WAF', 0, 0);
  }
}
