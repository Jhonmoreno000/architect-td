// ============================================
// ENTITIES - Hostile Enemy Attacks & Corrupted Projectiles
// ============================================

class EnemyProjectile extends Entity {
  constructor(x, y, target, damage = 8, color = '#ff0055', type = 'bullet') {
    super(x, y);
    this.target = target; // Tower or Core
    this.damage = damage;
    this.color = color;
    this.type = type; // 'bullet', 'bomb', 'beam', 'virus'
    this.speed = 3.8;
    this.alive = true;
    this.radius = type === 'bomb' ? 6 : 4;
  }

  update(dt) {
    if (!this.alive) return;

    if (!this.target || (this.target.isCrashed && !this.target.isCore)) {
      this.alive = false;
      return;
    }

    const tx = this.target.isCore ? this.target.x : (this.target.x + this.target.size / 2);
    const ty = this.target.isCore ? this.target.y : (this.target.y + this.target.size / 2);

    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) {
      this.hitTarget();
      return;
    }

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
  }

  hitTarget() {
    this.alive = false;

    if (this.target.isCore) {
      // Core damage
      if (GameState.shieldCharges > 0) {
        GameState.shieldCharges--;
        AudioSystem.play('zap');
        if (GameState.engine) {
          GameState.engine.addFloatingText(this.target.x, this.target.y - 25, 'ESCUDO BLOQUEÓ ATAQUE', '#00f0ff', 11, true);
        }
      } else {
        GameState.lives -= Math.max(1, Math.round(this.damage / 8));
        AudioSystem.play('error');
        if (GameState.engine) {
          GameState.engine.triggerScreenShake(5);
        }
        if (GameState.lives <= 0) GameState.triggerGameOver();
      }
      GameState.updateUI();
    } else if (typeof this.target.takeDamage === 'function') {
      // Tower damage
      this.target.takeDamage(this.damage);
    }

    if (GameState.engine) {
      GameState.engine.addParticles(this.x, this.y, this.color, 6, 'spark', 2.5);
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
