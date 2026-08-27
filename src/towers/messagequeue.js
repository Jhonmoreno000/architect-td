// ============================================
// TOWERS - Kafka Message Queue (MQ)
// ============================================

class MessageQueueTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.messagequeue);
    this.splashRadius = 75;
  }

  fire() {
    if (!this.target) return null;
    this.cooldown = this.fireRate;
    this.recoil = 5;
    this.splashRadius = this.level === 3 ? 110 : this.level === 2 ? 90 : 75;

    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    const proj = new Projectile(
      cx,
      cy,
      this.target,
      this.damage,
      this.color,
      5.5,
      'heavy_packet',
      this.splashRadius,
      this
    );
    GameState.engine.addProjectile(proj);

    if (this.level === 3 && GameState.engine) {
      setTimeout(() => {
        if (this.target && this.target.alive && GameState.engine) {
          const secProj = new Projectile(
            cx,
            cy,
            this.target,
            Math.round(this.damage * 0.6),
            this.color,
            6,
            'heavy_packet',
            this.splashRadius * 0.8,
            this
          );
          GameState.engine.addProjectile(secProj);
        }
      }, 160);
    }

    AudioSystem.play('shoot_heavy');
    return null;
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Triple rocket/mortar silo tubes
    ctx.fillStyle = this.color;
    ctx.fillRect(-r * 0.2 - this.recoil, -r * 0.7, r * 1.1, 3);
    ctx.fillRect(-r * 0.2 - this.recoil, -1.5, r * 1.3, 3);
    ctx.fillRect(-r * 0.2 - this.recoil, r * 0.5, r * 1.1, 3);

    // Silo base
    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MQ', 0, 0);
  }
}
