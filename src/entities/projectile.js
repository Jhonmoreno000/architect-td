// ============================================
// ENTITIES - Projectile System
// ============================================

class Projectile extends Entity {
  constructor(x, y, target, damage, color, speed = 6, type = 'bullet', splashRadius = 0, sourceTower = null) {
    super(x, y);
    this.target = target;
    this.damage = damage;
    this.color = color;
    this.speed = speed;
    this.type = type;
    this.splashRadius = splashRadius;
    this.sourceTower = sourceTower;
    this.radius = type === 'sniper' ? 4 : type === 'heavy_packet' ? 5 : 3;
    this.trail = [];
    this.lastTargetPos = target ? { x: target.x, y: target.y } : { x, y };
  }

  update(dt) {
    if (!this.alive) return;

    if (this.target && this.target.alive) {
      this.lastTargetPos = { x: this.target.x, y: this.target.y };
    }

    const dx = this.lastTargetPos.x - this.x;
    const dy = this.lastTargetPos.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Hit detection
    const hitThreshold = this.target ? (this.speed * dt + this.target.radius) : (this.speed * dt + 5);
    if (dist < hitThreshold || dist < 6) {
      this.onHit();
      this.alive = false;
      return;
    }

    // Save trail
    this.trail.push({ x: this.x, y: this.y, alpha: 0.7 });
    if (this.trail.length > (this.type === 'sniper' ? 12 : 6)) {
      this.trail.shift();
    }

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
  }

  onHit() {
    if (this.splashRadius > 0 && GameState.engine) {
      // Area of effect damage (e.g. Message Queue or DB shockwave)
      CombatSystem.applyAreaDamage(this.x, this.y, this.splashRadius, this.damage, this.color);
      GameState.engine.addRingShockwave(this.x, this.y, this.color, this.splashRadius);
      GameState.engine.addParticles(this.x, this.y, this.color, 14, 'spark', 4);
    } else if (this.target && this.target.alive) {
      // Single target damage with damage calculation
      CombatSystem.dealDamage(this.target, this.damage, this.color, this.sourceTower);
      GameState.engine.addParticles(this.x, this.y, this.color, 6, 'spark', 2.5);
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();

    // Draw trail
    this.trail.forEach((t, i) => {
      ctx.globalAlpha = t.alpha * (i / this.trail.length) * 0.6;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, Math.max(1, this.radius * (i / this.trail.length)), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
