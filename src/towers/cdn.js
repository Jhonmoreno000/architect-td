// ============================================
// TOWERS - Edge CDN Node Sniper (CDN)
// ============================================

class CdnTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.cdn);
  }

  fire() {
    if (!this.target) return null;
    this.cooldown = this.fireRate;
    this.recoil = 6;

    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    const proj = new Projectile(
      cx,
      cy,
      this.target,
      this.damage,
      this.color,
      14,
      'sniper',
      0,
      this
    );
    GameState.engine.addProjectile(proj);

    if (this.level === 3 && GameState.engine) {
      setTimeout(() => {
        if (this.target && this.target.alive && GameState.engine) {
          GameState.engine.addRingShockwave(this.target.x, this.target.y, '#ffffff', 40);
        }
      }, 100);
    }

    AudioSystem.play('sniper');
    return null;
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Long Railgun barrel
    ctx.fillStyle = this.color;
    ctx.fillRect(-r * 0.4 - this.recoil, -2, r * 1.8, 4);

    // Sniper scope
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(r * 0.4, -4, 2, 0, Math.PI * 2);
    ctx.stroke();

    // Center base
    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CDN', 0, 0);
  }
}
