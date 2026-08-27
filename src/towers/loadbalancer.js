// ============================================
// TOWERS - Load Balancer (LB)
// ============================================

class LoadBalancerTower extends Tower {
  constructor(x, y) {
    super(x, y, TOWER_CONFIG.loadbalancer);
    this.slowAmount = 0.45;
    this.slowDuration = 160;
  }

  fire() {
    if (!this.target) return null;
    this.cooldown = this.fireRate;
    this.recoil = 3;

    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    if (GameState.engine) {
      for (const e of GameState.engine.enemies) {
        if (!e.alive || e.reached) continue;
        if (this.distTo(e) <= this.range) {
          const slowPower = this.level === 3 ? 0.65 : this.level === 2 ? 0.55 : this.slowAmount;
          e.slowTimer = this.slowDuration;
          e.slowFactor = slowPower;
          CombatSystem.dealDamage(e, this.damage, this.color, this);
        }
      }

      GameState.engine.addRingShockwave(cx, cy, this.color, this.range);
      AudioSystem.play('laser');
    }

    return null;
  }

  _drawTurret(ctx) {
    const r = this.size / 2 - 4;
    // Radar / Antenna dish
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    // Antenna emitter
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.9, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.9, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Center pivot
    ctx.fillStyle = '#060a12';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LB', 0, 0);
  }
}
