// ============================================
// TOWERS - API Gateway (AG)
// ============================================

class ApiGatewayTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.apigateway);
  }

  fire() {
    if (!this.target) return null;
    this.cooldown = this.fireRate;
    this.recoil = 3.5;

    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    const proj = new Projectile(cx, cy, this.target, this.damage, this.color, 8.5, 'bullet', 0, this);
    GameState.engine.addProjectile(proj);

    if (this.level === 3 && GameState.engine) {
      for (const e of GameState.engine.enemies) {
        if (e !== this.target && e.alive && this.distTo(e) <= this.range) {
          const secondProj = new Projectile(cx, cy, e, Math.round(this.damage * 0.8), this.color, 8.5, 'bullet', 0, this);
          GameState.engine.addProjectile(secondProj);
          break;
        }
      }
    }

    AudioSystem.play('shoot');
    return null;
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Dual plasma barrels
    ctx.fillStyle = this.color;
    ctx.fillRect(-r * 0.2 - this.recoil, -r * 0.6, r * 1.2, 3);
    ctx.fillRect(-r * 0.2 - this.recoil, r * 0.4, r * 1.2, 3);

    // Core
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
    ctx.fillText('AG', 0, 0);
  }
}
